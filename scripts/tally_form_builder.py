#!/usr/bin/env python3
"""
Tally Form Builder — API automation for form creation/updates.
Converts a simple JSON spec into Tally-compatible block structures.

Usage:
  ./tally_form_builder.py <spec_file> [--form-id ID] [--publish]

Spec format (JSONL):
  {"type": "FORM_TITLE", "payload": {"title": "My Form"}}
  {"type": "LABEL", "payload": {"text": "Question?"}}
  {"type": "INPUT_TEXT", "payload": {}}
  {"type": "INPUT_EMAIL", "payload": {}}
  {"type": "DROPDOWN", "payload": {"options": ["Option 1", "Option 2"]}}
  {"type": "TEXTAREA", "payload": {}}
"""

import json
import sys
import uuid
import os
import requests
from pathlib import Path

# Load API key from env
TALLY_API_KEY = os.getenv("TALLY_API_KEY")
if not TALLY_API_KEY:
    # Try .env file
    env_file = Path.home() / ".openclaw" / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.startswith("TALLY_API_KEY="):
                    TALLY_API_KEY = line.split('"')[1]
                    break

if not TALLY_API_KEY:
    print("❌ TALLY_API_KEY not found. Set via env or ~/.openclaw/.env", file=sys.stderr)
    sys.exit(1)

TALLY_API_BASE = "https://api.tally.so"
TALLY_HEADERS = {
    "Authorization": f"Bearer {TALLY_API_KEY}",
    "Content-Type": "application/json"
}


def generate_uuid():
    """Generate a UUID string."""
    return str(uuid.uuid4())


def generate_group_uuid():
    """Generate a groupUuid."""
    return str(uuid.uuid4())


def safe_html_schema(text):
    """Convert plain text to Tally's safeHTMLSchema format."""
    return [[text]]


def build_label_block(text):
    """Create a LABEL block for field labels."""
    return {
        "uuid": generate_uuid(),
        "type": "LABEL",
        "groupUuid": generate_group_uuid(),
        "groupType": "LABEL",
        "payload": {
            "safeHTMLSchema": safe_html_schema(text)
        }
    }


def build_form_title_block(title):
    """Create a FORM_TITLE block."""
    return {
        "uuid": generate_uuid(),
        "type": "FORM_TITLE",
        "groupUuid": generate_group_uuid(),
        "groupType": "FORM_TITLE",
        "payload": {
            "title": title,
            "safeHTMLSchema": safe_html_schema(title)
        }
    }


def build_input_text_block(placeholder=""):
    """Create an INPUT_TEXT block."""
    return {
        "uuid": generate_uuid(),
        "type": "INPUT_TEXT",
        "groupUuid": generate_group_uuid(),
        "groupType": "INPUT_TEXT",
        "payload": {
            "placeholder": placeholder
        }
    }


def build_input_email_block(placeholder=""):
    """Create an INPUT_EMAIL block."""
    return {
        "uuid": generate_uuid(),
        "type": "INPUT_EMAIL",
        "groupUuid": generate_group_uuid(),
        "groupType": "INPUT_EMAIL",
        "payload": {
            "placeholder": placeholder
        }
    }


def build_dropdown_option_blocks(options):
    """Create DROPDOWN_OPTION blocks for each option (all share same groupUuid)."""
    group_uuid = generate_group_uuid()
    blocks = []
    for index, option in enumerate(options):
        blocks.append({
            "uuid": generate_uuid(),
            "type": "DROPDOWN_OPTION",
            "groupUuid": group_uuid,
            "groupType": "DROPDOWN",
            "payload": {
                "index": index,
                "text": option
            }
        })
    return blocks


def build_textarea_block(placeholder=""):
    """Create a TEXTAREA block."""
    return {
        "uuid": generate_uuid(),
        "type": "TEXTAREA",
        "groupUuid": generate_group_uuid(),
        "groupType": "TEXTAREA",
        "payload": {
            "placeholder": placeholder
        }
    }


def spec_to_blocks(spec_file):
    """Convert spec file to Tally blocks."""
    blocks = []
    
    with open(spec_file) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            item = json.loads(line)
            item_type = item.get("type")
            payload = item.get("payload", {})
            
            if item_type == "FORM_TITLE":
                blocks.append(build_form_title_block(payload.get("title", "Untitled")))
            elif item_type == "LABEL":
                blocks.append(build_label_block(payload.get("text", "")))
            elif item_type == "INPUT_TEXT":
                blocks.append(build_input_text_block(payload.get("placeholder", "")))
            elif item_type == "INPUT_EMAIL":
                blocks.append(build_input_email_block(payload.get("placeholder", "")))
            elif item_type == "DROPDOWN":
                blocks.extend(build_dropdown_option_blocks(payload.get("options", [])))
            elif item_type == "TEXTAREA":
                blocks.append(build_textarea_block(payload.get("placeholder", "")))
            else:
                print(f"⚠️  Unknown block type: {item_type}", file=sys.stderr)
    
    return blocks


def create_form(name, blocks):
    """Create a new form on Tally."""
    url = f"{TALLY_API_BASE}/forms"
    payload = {
        "name": name,
        "blocks": blocks
    }
    
    resp = requests.post(url, headers=TALLY_HEADERS, json=payload)
    if resp.status_code != 201:
        print(f"❌ Create failed: {resp.status_code}", file=sys.stderr)
        print(resp.json(), file=sys.stderr)
        return None
    
    form = resp.json()
    return form.get("id")


def update_form(form_id, blocks):
    """Update an existing form."""
    url = f"{TALLY_API_BASE}/forms/{form_id}"
    payload = {"blocks": blocks}
    
    resp = requests.patch(url, headers=TALLY_HEADERS, json=payload)
    if resp.status_code != 200:
        print(f"❌ Update failed: {resp.status_code}", file=sys.stderr)
        print(resp.json(), file=sys.stderr)
        return False
    
    return True


def publish_form(form_id):
    """Publish a draft form."""
    url = f"{TALLY_API_BASE}/forms/{form_id}/publish"
    resp = requests.post(url, headers=TALLY_HEADERS)
    
    if resp.status_code != 200:
        print(f"❌ Publish failed: {resp.status_code}", file=sys.stderr)
        print(resp.json(), file=sys.stderr)
        return False
    
    return True


def main():
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(1)
    
    spec_file = sys.argv[1]
    form_id = None
    publish = False
    
    # Parse args
    for i, arg in enumerate(sys.argv[2:], start=2):
        if arg == "--form-id" and i + 1 < len(sys.argv):
            form_id = sys.argv[i + 1]
        elif arg == "--publish":
            publish = True
    
    if not Path(spec_file).exists():
        print(f"❌ Spec file not found: {spec_file}", file=sys.stderr)
        sys.exit(1)
    
    print(f"📋 Building form from {spec_file}...")
    blocks = spec_to_blocks(spec_file)
    print(f"✅ Generated {len(blocks)} blocks")
    
    if form_id:
        print(f"📤 Updating form {form_id}...")
        if update_form(form_id, blocks):
            print(f"✅ Form updated: {form_id}")
        else:
            sys.exit(1)
    else:
        # Extract form name from first line
        with open(spec_file) as f:
            first = json.loads(f.readline())
            form_name = first.get("payload", {}).get("title", "Untitled Form")
        
        print(f"📤 Creating new form: {form_name}...")
        form_id = create_form(form_name, blocks)
        if form_id:
            print(f"✅ Form created: {form_id}")
        else:
            sys.exit(1)
    
    if publish:
        print(f"🚀 Publishing form...")
        if publish_form(form_id):
            print(f"✅ Form published: {form_id}")
        else:
            sys.exit(1)
    
    print(f"\n📊 Form ready: https://tally.so/r/{form_id}")


if __name__ == "__main__":
    main()
