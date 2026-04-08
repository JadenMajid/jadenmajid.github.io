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

if [ -f "template.md" ]; then
    # Use template.md as source, replacing title and date
    sed "s/title: \"Template Post Title\"/title: \"$TITLE\"/" template.md | \
    sed "s/date: YYYY-MM-DD/date: $DATE/" > "$FILENAME"
else
    # Fallback if template is missing
    cat <<EOF > "$FILENAME"
---
layout: post
title: "$TITLE"
date: $DATE
thumbnail: "/images/icon.png"
repo: ""
tags: []
math: false
---

Write your content here...
EOF
fi

echo "Created new post: $FILENAME"
