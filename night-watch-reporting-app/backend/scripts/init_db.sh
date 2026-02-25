#!/usr/bin/env bash
set -euo pipefail

# Script d'initialisation MySQL pour la base `night_watch_reporting`.
# Utilise les variables d'environnement suivantes (ou valeurs par défaut):
# DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

: ${DB_HOST:=localhost}
: ${DB_USER:=root}
: ${DB_PASSWORD:=}
: ${DB_NAME:=night_watch_reporting}

echo "Initialisation de la base de données ${DB_NAME} sur ${DB_HOST}"

MYSQL_CMD="mysql -h ${DB_HOST} -u ${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
  MYSQL_CMD+=" -p${DB_PASSWORD}"
fi

${MYSQL_CMD} -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
${MYSQL_CMD} ${DB_NAME} < "$(dirname "$0")/../../database/schema.sql"

echo "Import terminé."
