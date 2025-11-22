#!/bin/bash

# Script de verificación post-despliegue
# Uso: ./verify-deployment.sh usuario@servidor.com /ruta/destino

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ $# -lt 2 ]; then
    echo -e "${RED}Uso: $0 usuario@servidor.com /ruta/destino${NC}"
    exit 1
fi

REMOTE_HOST=$1
DEPLOY_PATH=$2

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Verificación de Despliegue cronweb   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Función para verificar
check() {
    local name=$1
    local command=$2
    
    echo -n "Verificando $name... "
    if ssh "$REMOTE_HOST" "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

# Función para obtener info
info() {
    local name=$1
    local command=$2
    
    echo -n "$name: "
    ssh "$REMOTE_HOST" "$command" 2>/dev/null || echo "N/A"
}

# Verificaciones
echo -e "${YELLOW}[Servicios]${NC}"
check "Apache" "sudo systemctl is-active apache2"
check "PHP" "php -v > /dev/null"

echo ""
echo -e "${YELLOW}[Archivos]${NC}"
check "Directorio destino" "test -d $DEPLOY_PATH"
check "index.html" "test -f $DEPLOY_PATH/public/index.html"
check "cron_manager.php" "test -f $DEPLOY_PATH/public/cron_manager.php"
check ".htaccess" "test -f $DEPLOY_PATH/public/.htaccess"

echo ""
echo -e "${YELLOW}[Permisos]${NC}"
check "Permisos www-data" "test -O $DEPLOY_PATH/public || sudo test -O $DEPLOY_PATH/public"

echo ""
echo -e "${YELLOW}[Módulos Apache]${NC}"
check "mod_rewrite" "sudo apache2ctl -M | grep rewrite"
check "mod_deflate" "sudo apache2ctl -M | grep deflate"

echo ""
echo -e "${YELLOW}[Información del Sistema]${NC}"
info "IP del servidor" "hostname -I | awk '{print \$1}'"
info "Versión PHP" "php -v | head -1"
info "Versión Apache" "apache2 -v | head -1"
info "Espacio disponible" "df -h $DEPLOY_PATH | tail -1 | awk '{print \$4}'"

echo ""
echo -e "${YELLOW}[Prueba de Conectividad]${NC}"
SERVER_IP=$(ssh "$REMOTE_HOST" "hostname -I | awk '{print \$1}'")
echo "Servidor: $SERVER_IP"

echo ""
echo -e "${GREEN}✓ Verificación completada${NC}"
echo ""
echo -e "${BLUE}Acceso a la aplicación:${NC}"
echo "  • URL: http://$SERVER_IP/cronweb"
echo "  • O configura DNS para: cronweb.local"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  • Error: ssh $REMOTE_HOST 'sudo tail -20 /var/log/apache2/cronweb-error.log'"
echo "  • Access: ssh $REMOTE_HOST 'sudo tail -20 /var/log/apache2/cronweb-access.log'"
echo ""
