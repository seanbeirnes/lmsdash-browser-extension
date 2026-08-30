#!/usr/bin/env bash

set -euo pipefail

setup_command='git config --local gitleaks.path /path/to/gitleaks'
gitleaks_path="$(git config --local --get gitleaks.path || true)"

if [[ -z "$gitleaks_path" ]]; then
	gitleaks_path="$(command -v gitleaks || true)"
fi

if [[ -z "$gitleaks_path" ]]; then
	printf 'Gitleaks was not found. Enter the Nix development shell, install Gitleaks, or configure it with:\n  %s\n' "$setup_command" >&2
	exit 1
fi

if [[ ! -x "$gitleaks_path" ]]; then
	printf 'Configured Gitleaks path is missing or not executable: %s\nSet it with:\n  %s\n' "$gitleaks_path" "$setup_command" >&2
	exit 1
fi

scan_args=(git --redact --no-banner --verbose .)

# A full scan re-reads every commit, which grows without bound. Default to the
# commits that are about to be pushed and fall back to full history only when
# there is no upstream to compare against.
full_scan="${GITLEAKS_FULL_SCAN:-0}"
if [[ "${1:-}" == "--all" ]]; then
	full_scan=1
fi

if [[ "$full_scan" == "1" ]]; then
	printf 'Scanning full repository history for secrets.\n'
	exec "$gitleaks_path" "${scan_args[@]}"
fi

upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"

if [[ -z "$upstream" ]]; then
	printf 'No upstream branch is configured. Scanning full repository history for secrets.\n'
	exec "$gitleaks_path" "${scan_args[@]}"
fi

commit_range="${upstream}..HEAD"
commit_count="$(git rev-list --count "$commit_range" 2>/dev/null || echo 0)"

if [[ "$commit_count" -eq 0 ]]; then
	printf 'No new commits versus %s. Skipping secret scan.\n' "$upstream"
	exit 0
fi

printf 'Scanning %s commit(s) in %s for secrets.\n' "$commit_count" "$commit_range"
exec "$gitleaks_path" "${scan_args[@]}" --log-opts="$commit_range"
