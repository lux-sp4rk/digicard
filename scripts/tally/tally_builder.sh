#!/usr/bin/env bash
set -euo pipefail

# Tally Form Builder
# Generate a Tally form from a JSONL spec
# Usage: tally_builder.sh <form_id> <spec.jsonl>

if [[ $# -lt 2 ]]; then
	echo "Usage: $0 <form_id> <spec.jsonl>"
	echo ""
	echo "Spec format:"
	echo '  {"type": "FORM_TITLE", "payload": {"title": "My Form"}}'
	echo '  {"type": "INPUT_TEXT"}'
	echo '  {"type": "DROPDOWN", "options": [{"label": "Option 1"}]}'
	exit 1
fi

FORM_ID="$1"
SPEC_FILE="$2"
API_KEY="${TALLY_API_KEY:-}"

if [[ -z "$API_KEY" ]]; then
	echo "Error: TALLY_API_KEY not set" >&2
	exit 1
fi

# Convert spec to blocks JSON
blocks_json=$(
	python3 <<'PYTHON'
import sys
import json
import uuid as uuid_lib

spec_file = sys.argv[1]
blocks = []

with open(spec_file, 'r') as f:
    idx = 0
    for line in f:
        line = line.strip()
        if not line:
            continue
        
        spec = json.loads(line)
        block_type = spec.get('type')
        payload = spec.get('payload', {})
        options = spec.get('options', [])
        
        # Generate UUIDs
        block_uuid = str(uuid_lib.uuid4())
        group_uuid = str(uuid_lib.uuid4())
        
        block = {
            'uuid': block_uuid,
            'type': block_type,
            'groupUuid': group_uuid,
            'groupType': block_type if block_type != 'FORM_TITLE' else 'TEXT',
            'payload': payload
        }
        
        # Add options if dropdown/multi-select
        if options and 'options' not in payload:
            block['payload']['options'] = options
        
        blocks.append(block)
        idx += 1

print(json.dumps({'blocks': blocks}))
PYTHON
	'''python3' "$SPEC_FILE"
)

# PATCH form
response=$(curl -s -X PATCH "https://api.tally.so/forms/$FORM_ID" \
	-H "Authorization: Bearer $API_KEY" \
	-H "Content-Type: application/json" \
	-d "$blocks_json")

# Check for errors
if echo "$response" | jq -e '.errorType' &>/dev/null; then
	echo "Error: $(echo "$response" | jq -r '.message')" >&2
	exit 1
fi

# Success
block_count=$(echo "$response" | jq '.blocks | length')
echo "✅ Form $FORM_ID updated with $(echo "$blocks_json" | jq '.blocks | length') fields"
echo "📋 https://tally.so/forms/$FORM_ID"
