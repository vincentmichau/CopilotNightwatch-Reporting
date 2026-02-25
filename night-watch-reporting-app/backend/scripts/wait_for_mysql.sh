#!/usr/bin/env bash
set -euo pipefail

# wait_for_mysql.sh
# Attendre que MySQL soit disponible soit via docker inspect health, soit via mysqladmin ping

: ${DB_HOST:=localhost}
: ${DB_PORT:=3306}
: ${DB_USER:=root}
: ${DB_PASSWORD:=}
: ${RETRIES:=30}
: ${SLEEP:=2}

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT} (up to $((RETRIES * SLEEP))s)"

try_mysqladmin() {
  if command -v mysqladmin >/dev/null 2>&1; then
    if [ -n "${DB_PASSWORD}" ]; then
      mysqladmin -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" ping >/dev/null 2>&1 && return 0 || return 1
    else
      mysqladmin -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" ping >/dev/null 2>&1 && return 0 || return 1
    fi
  fi
  return 1
}

try_docker_inspect() {
  if command -v docker >/dev/null 2>&1; then
    # tenter de trouver un conteneur MySQL qui expose le port
    cid=$(docker ps -q --filter "ancestor=mysql" --filter "publish=${DB_PORT}") || true
    if [ -n "${cid}" ]; then
      status=$(docker inspect --format='{{.State.Health.Status}}' "${cid}" 2>/dev/null || true)
      if [ "${status}" = "healthy" ]; then
        return 0
      fi
    fi
  fi
  return 1
}

count=0
while [ $count -lt ${RETRIES} ]; do
  if try_mysqladmin; then
    echo "MySQL reachable via mysqladmin"
    exit 0
  fi

  if try_docker_inspect; then
    echo "MySQL container is healthy"
    exit 0
  fi

  count=$((count + 1))
  echo "Waiting... (${count}/${RETRIES})"
  sleep ${SLEEP}
done

echo "Timed out waiting for MySQL at ${DB_HOST}:${DB_PORT}"
exit 1
