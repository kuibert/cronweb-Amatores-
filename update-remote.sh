#!/bin/bash

# Script para actualizar la aplicación en servidor remoto
# Uso: ./update-remote.sh usuario@servidor.com /ruta/destino

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ $# -lt 2 ]; then
    echo -e "${RED}Uso: $0 usuario@servidor.com /ruta/destino${NC}"
    exit 1
fi

REMOTE_HOST=$1
DEPLOY_PATH=$2
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}=== Actualización Remota cronweb-Amatores ===${NC}"
echo "Host: $REMOTE_HOST"
echo "Ruta: $DEPLOY_PATH"
echo ""

# Backup
echo -e "${YELLOW}[1/4] Creando backup...${NC}"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
ssh "$REMOTE_HOST" "cd $DEPLOY_PATH && tar -czf backup_$BACKUP_DATE.tar.gz public/cron_jobs.json public/execution_logs.json 2>/dev/null || true"
echo "Backup creado: backup_$BACKUP_DATE.tar.gz"

# Actualizar archivos
echo -e "${YELLOW}[2/4] Sincronizando archivos...${NC}"
rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.qodo' \
    --exclude='cron_jobs.json' \
    --exclude='execution_logs.json' \
    --exclude='current_crontab.txt' \
    --exclude='backup_*.tar.gz' \
    "$LOCAL_DIR/" "$REMOTE_HOST:$DEPLOY_PATH/"

# Permisos
echo -e "${YELLOW}[3/4] Configurando permisos...${NC}"
ssh "$REMOTE_HOST" << EOF
sudo chown -R www-data:www-data $DEPLOY_PATH/public
sudo chmod -R 755 $DEPLOY_PATH/public
sudo chmod -R 775 $DEPLOY_PATH/public/cron_jobs.json $DEPLOY_PATH/public/execution_logs.json 2>/dev/null || true
EOF

# Reiniciar Apache
echo -e "${YELLOW}[4/4] Reiniciando Apache...${NC}"
ssh "$REMOTE_HOST" "sudo systemctl restart apache2"

echo ""
echo -e "${GREEN}✓ Actualización completada exitosamente${NC}"
echo ""
echo "Backup disponible en: $DEPLOY_PATH/backup_$BACKUP_DATE.tar.gz"
echo ""
