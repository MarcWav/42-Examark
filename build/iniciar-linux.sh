#!/bin/sh
set -eu
app_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if [ "$(id -u)" -eq 0 ]; then
    printf '%s\n' 'Abra o 42 Examark com seu usuário normal, sem sudo.' >&2
    exit 1
fi
exec "$app_dir/42-exam-trainer" "$@"
