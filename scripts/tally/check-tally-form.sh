#!/bin/bash

# Load API key
source ~/.openclaw/.env

FORM_ID="gD5QY1"

echo "Fetching Tally form schema for: $FORM_ID"
echo ""

curl -s -H "Authorization: Bearer $TALLY_API_KEY" \
  "https://api.tally.so/forms/$FORM_ID" | jq '.fields[] | {id, key, title, type}'
