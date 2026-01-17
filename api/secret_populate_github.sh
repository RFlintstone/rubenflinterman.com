#!/usr/bin/env bash
set -euo pipefail

# Ensure gh is authenticated
if ! gh auth status >/dev/null 2>&1; then
  echo "gh CLI not authenticated. Run \`gh auth login\` first." >&2
  exit 1
fi

# Determine repo (owner/repo) from origin, robustly strip \`.git\`
remote=$(git remote get-url origin 2>/dev/null || true)
if [[ -z "$remote" ]]; then
  # fallback to gh if no remote found
  repo=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)
  if [[ -z "$repo" ]]; then
    echo "No git remote 'origin' found and unable to determine repo via gh." >&2
    exit 1
  fi
else
  if [[ $remote =~ github\.com[:/](.+) ]]; then
    repo="${BASH_REMATCH[1]}"
    # strip trailing .git if present
    repo="${repo%.git}"
  else
    # fallback to gh if parsing fails
    repo=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)
    if [[ -z "$repo" ]]; then
      echo "Unable to parse GitHub repo from origin url: $remote" >&2
      exit 1
    fi
  fi
fi

echo "Using repo: $repo"

secrets_dir="./secrets"
if [ ! -d "$secrets_dir" ]; then
  echo "Directory \`$secrets_dir\` not found." >&2
  exit 1
fi

# helper: portable base64 (no line breaks)
encode_b64() {
  local file="$1"
  if command -v openssl >/dev/null 2>&1; then
    openssl base64 -A -in "$file"
    return
  fi
  if base64 --wrap=0 "$file" >/dev/null 2>&1; then
    base64 --wrap=0 "$file"
    return
  fi
  if base64 -w0 "$file" >/dev/null 2>&1; then
    base64 -w0 "$file"
    return
  fi
  base64 "$file" | tr -d '\n'
}

declare -A map=(
  [PG_USER]="$secrets_dir/pg_user"
  [PG_NAME]="$secrets_dir/pg_name"
  [PG_PASSWORD]="$secrets_dir/pg_password"
  [JWT_SECRET]="$secrets_dir/jwt_secret"
  [ENCRYPTION_KEY]="$secrets_dir/encryption_key"
  [CERT_PASSWORD]="$secrets_dir/cert_password"
  [JWT_ISSUER]="$secrets_dir/jwt_issuer"
  [JWT_AUDIENCE]="$secrets_dir/jwt_audience"
  [PG_CONNECTION_STRING]="$secrets_dir/pg_connection_string"
)

for name in "${!map[@]}"; do
  path="${map[$name]}"
  if [ -f "$path" ]; then
    gh secret set "$name" --repo "$repo" --body - < "$path" >/dev/null
    echo "Set secret $name"
  else
    echo "Skipping $name (file missing: $path)"
  fi
done

# certificate.pfx -> CERTIFICATE_PFX_B64
pfx="$secrets_dir/certificate.pfx"
if [ -f "$pfx" ]; then
  b64=$(encode_b64 "$pfx")
  printf '%s' "$b64" | gh secret set CERTIFICATE_PFX_B64 --repo "$repo" --body - >/dev/null
  echo "Set secret CERTIFICATE_PFX_B64"
else
  echo "Skipping CERTIFICATE_PFX_B64 (file missing: $pfx)"
fi

echo "Done."
