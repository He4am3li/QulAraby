#!/usr/bin/env bash
set -euo pipefail
input="$1"
output="$2"
mkdir -p "$output"
total="$(find "$input" -maxdepth 1 -name '*.ora' -type f | wc -l)"
if [ "$total" -ne 43 ]; then
  echo "Expected 43 ORA files; found $total"
  exit 1
fi
counter=0
while IFS= read -r -d '' ora; do
  base="$(basename "$ora" .ora)"
  outputfile="$output/$base.psd"
  echo "Converting $base to editable Photoshop PSD"
  timeout 100s xvfb-run -a -s "-screen 0 1600x900x24" \
    krita "$ora" --nosplash --export --export-filename "$outputfile"
  test -s "$outputfile" || { echo "PSD export missing: $outputfile"; exit 1; }
  counter=$((counter+1))
  echo "$counter/43 $base PSD exported"
done < <(find "$input" -maxdepth 1 -name '*.ora' -type f -print0 | sort -z)
python scripts/audit-character-psds.py --ora "$input" --psd "$output" --expected 43
