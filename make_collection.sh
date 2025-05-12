#!/bin/bash

# Set your Typesense API key and host
API_KEY="xyz"
TYPESENSE_HOST="localhost:8108"  # e.g., localhost:8108

# Create the collection
curl -X POST "${TYPESENSE_HOST}/collections" \
  -H "X-TYPESENSE-API-KEY: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "memes",
    "fields": [
      { "name": "imageDescription", "type": "string" },
      { "name": "embedding", "type": "string" },
      { "name": "imageAudioTranscribed", "type": "string" },
      { "name": "fileName", "type": "string" },
      { "name": "imagePath", "type": "string" }
    ]
  }'

echo "Collection 'memes' creation request sent."
