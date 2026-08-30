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
zero_sha='0000000000000000000000000000000000000000'

# A full scan re-reads every commit, which grows without bound. Default to
# scanning only the commits that are about to be pushed.
full_scan="${GITLEAKS_FULL_SCAN:-0}"
pre_push=0
if [[ "${1:-}" == "--all" ]]; then
	full_scan=1
elif [[ "${1:-}" == "--pre-push" ]]; then
	pre_push=1
fi

if [[ "$full_scan" == "1" ]]; then
	printf 'Scanning full repository history for secrets.\n'
	exec "$gitleaks_path" "${scan_args[@]}"
fi

# Turn a list of revision specs into the exact set of commits to scan,
# excluding anything already on a remote, then run one scan over that set.
scan_revs() {
	local revs=("$@")
	local commit_count
	commit_count="$(git rev-list --count "${revs[@]}" --not --remotes 2>/dev/null || echo 0)"

	if [[ "$commit_count" -eq 0 ]]; then
		printf 'No unpushed commits to scan. Skipping secret scan.\n'
		exit 0
	fi

	printf 'Scanning %s unpushed commit(s) for secrets.\n' "$commit_count"
	exec "$gitleaks_path" "${scan_args[@]}" --log-opts="${revs[*]} --not --remotes"
}

if [[ "$pre_push" == "1" ]]; then
	# Invoked by the pre-push hook: Git supplies the exact refs being pushed
	# on stdin as "<local ref> <local sha> <remote ref> <remote sha>" lines.
	revs=()
	while read -r _local_ref local_sha _remote_ref _remote_sha; do
		[[ -z "$local_sha" || "$local_sha" == "$zero_sha" ]] && continue # branch deletion
		revs+=("$local_sha")
	done

	if [[ ${#revs[@]} -eq 0 ]]; then
		printf 'Nothing being pushed. Skipping secret scan.\n'
		exit 0
	fi

	scan_revs "${revs[@]}"
fi

# Manual invocation: scan the commits on HEAD that no remote has yet.
if ! git rev-parse --verify --quiet HEAD >/dev/null; then
	printf 'Repository has no commits. Skipping secret scan.\n'
	exit 0
fi

if [[ -z "$(git remote)" ]]; then
	printf 'No remotes are configured. Scanning full repository history for secrets.\n'
	exec "$gitleaks_path" "${scan_args[@]}"
fi

scan_revs HEAD
