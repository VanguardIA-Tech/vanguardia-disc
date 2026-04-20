#!/bin/bash
# Script para manter o banco de dados ativo (anti-sleep)
# Execute: chmod +x keep_alive.sh && ./keep_alive.sh &
# Ou adicione ao cron: */5 * * * * /caminho/para/keep_alive.sh

DB_URL="postgresql://postgres:SUA_SENHA_POSTGRES@127.0.0.1:5432/postgres"
LOG="/var/log/disc_keepalive.log"

ping_db() {
    result=$(psql "$DB_URL" -c "SELECT COUNT(*) FROM public.disc_assessments;" -t 2>&1)
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Ping: $result" >> "$LOG"
}

# Modo daemon: pinga a cada 5 minutos
if [ "$1" = "--daemon" ]; then
    echo "Keep-alive daemon iniciado (a cada 5 min)"
    while true; do
        ping_db
        sleep 300
    done
else
    # Execução única (para cron)
    ping_db
fi
