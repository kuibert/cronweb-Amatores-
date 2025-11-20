#!/bin/bash
# Script de deploy para servidor Linux
# Uso: ./deploy-server.sh <usuario@servidor> [puerto_ssh]

set -e

REMOTE_USER_HOST="${1:-ubuntu@your-server.com}"
SSH_PORT="${2:-22}"
REPO_URL="https://github.com/kuibert/cronweb-Amatores-.git"
BRANCH="devMelvin"
DEPLOY_DIR="/var/www/html/cronweb-amatores"

echo "🚀 Iniciando deploy en $REMOTE_USER_HOST"
echo "================================================"

# Conectar y ejecutar instalación
ssh -p $SSH_PORT $REMOTE_USER_HOST << 'EOF'
set -e

echo "📥 Clonando repositorio..."
cd /tmp
rm -rf cronweb-Amatores-
git clone -b devMelvin https://github.com/kuibert/cronweb-Amatores-.git

echo "📁 Configurando directorio..."
sudo mkdir -p /var/www/html/cronweb-amatores
cd cronweb-Amatores-

echo "🔧 Ejecutando instalación..."
chmod +x ubuntu24-install.sh
sudo ./ubuntu24-install.sh

echo "✅ Deploy completado"
EOF

echo ""
echo "✅ ¡Deploy exitoso!"
echo "🌐 Accede a: http://$REMOTE_USER_HOST/cronweb-amatores"
