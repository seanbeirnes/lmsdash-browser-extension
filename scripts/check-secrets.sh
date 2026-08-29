#!/usr/bin/env bash

set -euo pipefail

setup_command='git config --local gitleaks.path /path/to/gitleaks'
gitleaks_path="$(git config --local --get gitleaks.path || true)"

if [[ -z "$gitleaks_path" ]]; then
	printf 'Gitleaks path is not configured. Set it with:\n  %s\n' "$setup_command" >&2
	exit 1
fi

if [[ ! -x "$gitleaks_path" ]]; then
	printf 'Configured Gitleaks path is missing or not executable: %s\nSet it with:\n  %s\n' "$gitleaks_path" "$setup_command" >&2
	exit 1
fi

exec "$gitleaks_path" git --redact --no-banner --verbose .
