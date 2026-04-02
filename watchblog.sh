#!/bin/bash
# watchblog.sh: Serve the Jekyll site with live reload.

echo "Starting Jekyll server..."
bundle exec jekyll serve --livereload
