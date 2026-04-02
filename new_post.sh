#!/bin/bash
# new_post.sh: Create a new Jekyll post.
# Usage: ./new_post.sh "Post Title"

if [ -z "$1" ]; then
    echo "Usage: $0 \"Post Title\""
    exit 1
fi

TITLE="$1"
# Slugify title (lower case, replace spaces with hyphens)
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')
DATE=$(date +"%Y-%m-%d")
FILENAME="_posts/$DATE-$SLUG.md"

if [ -f "$FILENAME" ]; then
    echo "Error: $FILENAME already exists."
    exit 1
fi

cat <<EOF > "$FILENAME"
---
layout: post
title: "$TITLE"
date: $DATE
thumbnail: "/images/icon.png"
tags: []
---

Write your content here...
EOF

echo "Created new post: $FILENAME"
