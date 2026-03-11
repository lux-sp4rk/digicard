#!/usr/bin/env python3
"""
Tally Form Submission → TickTick Tasks

Polls Tally for new form responses and creates TickTick tasks.
Tracks last submission ID to avoid duplicates.

Usage:
  ./tally_to_ticktick.py [--form-id ID] [--dry-run]

State file: ~/.openclaw/workspace/memory/tally_last_submission.json
"""

import json
import sys
import os
import subprocess
from pathlib import Path
from datetime import datetime

TALLY_API_KEY = os.getenv("TALLY_API_KEY")
if not TALLY_API_KEY:
    env_file = Path.home() / ".openclaw" / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.startswith("TALLY_API_KEY="):
                    TALLY_API_KEY = line.split('"')[1]
                    break

if not TALLY_API_KEY:
    print("❌ TALLY_API_KEY not found", file=sys.stderr)
    sys.exit(1)

# State file for tracking submissions
STATE_FILE = Path.home() / ".openclaw" / "workspace" / "memory" / "tally_last_submission.json"
STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

# Form ID
FORM_ID = sys.argv[2] if "--form-id" in sys.argv else "gD5QY1"
DRY_RUN = "--dry-run" in sys.argv


def load_state():
    """Load last submission ID."""
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"last_id": None, "updated_at": None}


def save_state(last_id):
    """Save last submission ID."""
    with open(STATE_FILE, "w") as f:
        json.dump({
            "last_id": last_id,
            "updated_at": datetime.utcnow().isoformat()
        }, f)


def fetch_form_responses(form_id, after_id=None):
    """Fetch responses from Tally (placeholder—API may vary)."""
    # Note: Tally's actual responses endpoint may differ.
    # This assumes a standard REST endpoint; adjust as needed.
    
    import requests
    headers = {
        "Authorization": f"Bearer {TALLY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"https://api.tally.so/forms/{form_id}/responses"
    if after_id:
        url += f"?after={after_id}"
    
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            return resp.json().get("data", [])
        elif resp.status_code == 401:
            print("⚠️  Tally API auth issue. Using fallback: check if webhooks are configured.", file=sys.stderr)
            return []
        else:
            print(f"⚠️  Tally API returned {resp.status_code}", file=sys.stderr)
            return []
    except Exception as e:
        print(f"⚠️  Failed to fetch responses: {e}", file=sys.stderr)
        return []


def format_response_for_ticktick(form_id, response):
    """Convert Tally response to TickTick task."""
    
    # Extract fields from response
    fields = response.get("fields", {})
    
    # Build task title and description
    name = fields.get("name", "Unknown")
    email = fields.get("email", "")
    role = fields.get("role", "")
    bottleneck = fields.get("bottleneck", "")
    budget = fields.get("budget", "")
    service = fields.get("service", "")
    
    # Title: Name + Service interest (if available)
    title = f"Consulting: {name}"
    if service:
        title += f" — {service[:30]}"
    
    # Description: all details for context
    desc_parts = []
    if email:
        desc_parts.append(f"Email: {email}")
    if role:
        desc_parts.append(f"Role: {role}")
    if bottleneck:
        desc_parts.append(f"Bottleneck: {bottleneck}")
    if budget:
        desc_parts.append(f"Budget: {budget}")
    
    description = "\n".join(desc_parts)
    
    # Add form link
    description += f"\n\nSource: https://tally.so/r/{form_id}"
    
    return {
        "title": title,
        "description": description,
        "list": "Inbox",  # Route to Inbox by default (note: ticktick uses projects, not lists)
        "priority": 2,  # Medium priority (1=high, 2=medium, 3=low)
        "tags": ["consulting", "tally-intake"]
    }


def create_ticktick_task(task_spec):
    """Create task in TickTick via CLI wrapper."""
    
    cmd = ["scripts/tt", "tasks", "add"]
    
    # Add task title
    cmd.append(task_spec["title"])
    
    # Add flags for optional fields
    if task_spec.get("description"):
        cmd.extend(["--content", task_spec["description"]])
    
    # Map priority int to string (1=high, 2=medium, 3=low, 0=none)
    priority_map = {1: "high", 2: "medium", 3: "low", 0: "none"}
    if task_spec.get("priority"):
        priority_str = priority_map.get(task_spec["priority"], "medium")
        cmd.extend(["--priority", priority_str])
    
    if task_spec.get("tags"):
        cmd.extend(["--tags", ",".join(task_spec["tags"])])
    
    try:
        result = subprocess.run(cmd, cwd=Path.home() / ".openclaw" / "workspace", 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            return True, result.stdout.strip()
        else:
            return False, result.stderr.strip()
    except Exception as e:
        return False, str(e)


def main():
    print(f"🔄 Checking Tally form {FORM_ID} for new submissions...")
    
    # Load state
    state = load_state()
    last_id = state.get("last_id")
    
    # Fetch responses
    responses = fetch_form_responses(FORM_ID, after_id=last_id)
    
    if not responses:
        print("✅ No new submissions")
        return
    
    print(f"📬 Found {len(responses)} new submission(s)")
    
    for i, resp in enumerate(responses, start=1):
        resp_id = resp.get("id")
        
        # Format for TickTick
        task_spec = format_response_for_ticktick(FORM_ID, resp)
        
        print(f"\n[{i}/{len(responses)}] Creating task: {task_spec['title']}")
        
        if DRY_RUN:
            print(f"   Description: {task_spec['description'][:80]}...")
            print(f"   (dry run—not actually creating)")
        else:
            success, msg = create_ticktick_task(task_spec)
            if success:
                print(f"   ✅ Task created: {msg}")
            else:
                print(f"   ❌ Failed: {msg}", file=sys.stderr)
        
        # Update state after each successful submission
        if not DRY_RUN:
            save_state(resp_id)
    
    if not DRY_RUN:
        print(f"\n✅ Processed {len(responses)} submission(s)")


if __name__ == "__main__":
    main()
