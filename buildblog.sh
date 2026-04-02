#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Rebuilding Jekyll site from $SCRIPT_DIR"

jekyll_args=()
if [[ -f "_config.yml" ]]; then
  jekyll_args+=(--config _config.yml)
fi

if [[ -f "Gemfile" ]] && command -v bundle >/dev/null 2>&1; then
  echo "Using: bundle exec jekyll build ${jekyll_args[*]}"
  bundle exec jekyll build "${jekyll_args[@]}"
elif command -v jekyll >/dev/null 2>&1; then
  echo "Using: jekyll build ${jekyll_args[*]}"
  jekyll build "${jekyll_args[@]}"
elif command -v ruby >/dev/null 2>&1; then
  GEM_USER_BIN="$(ruby -e 'print Gem.user_dir' 2>/dev/null)/bin/jekyll"
  if [[ -x "$GEM_USER_BIN" ]]; then
    echo "Using: $GEM_USER_BIN build ${jekyll_args[*]}"
    "$GEM_USER_BIN" build "${jekyll_args[@]}"
  else
    echo "Error: Jekyll is not installed or not on PATH."
    echo "Install it with: gem install jekyll bundler"
    exit 1
  fi
else
  echo "Error: Jekyll is not installed or not on PATH."
  echo "Install it with: gem install jekyll bundler"
  exit 1
fi

echo "Done. Built site is in ./_site"
