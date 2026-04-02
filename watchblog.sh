#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting Jekyll watch server from $SCRIPT_DIR"

default_args=(serve --watch --livereload --host 127.0.0.1 --port 4000)
user_args=("$@")

jekyll_args=()
if [[ -f "_config.yml" ]]; then
  jekyll_args+=(--config _config.yml)
fi

if [[ ${#user_args[@]} -gt 0 ]]; then
  run_args=("${user_args[@]}" "${jekyll_args[@]}")
else
  run_args=("${default_args[@]}" "${jekyll_args[@]}")
fi

if [[ -f "Gemfile" ]] && command -v bundle >/dev/null 2>&1; then
  echo "Using: bundle exec jekyll ${run_args[*]}"
  bundle exec jekyll "${run_args[@]}"
elif command -v jekyll >/dev/null 2>&1; then
  echo "Using: jekyll ${run_args[*]}"
  jekyll "${run_args[@]}"
elif command -v ruby >/dev/null 2>&1; then
  GEM_USER_BIN="$(ruby -e 'print Gem.user_dir' 2>/dev/null)/bin/jekyll"
  if [[ -x "$GEM_USER_BIN" ]]; then
    echo "Using: $GEM_USER_BIN ${run_args[*]}"
    "$GEM_USER_BIN" "${run_args[@]}"
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
