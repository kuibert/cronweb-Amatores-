#!/bin/bash
# CronWeb Manager - Sistema de backup y actualización

PROJECT_DIR="/home/melvin/cronweb_project"
WEB_DIR="/var/www/cronweb"
BACKUP_DIR="/home/melvin/cronweb_backups"

# Función para crear backup
backup_cronweb() {
    local DATE=$(date +%Y%m%d_%H%M%S)
    local BACKUP_NAME="cronweb_backup_$DATE"
    
    echo "🔄 Creando backup: $BACKUP_NAME"
    cp -r "$WEB_DIR" "$BACKUP_DIR/$BACKUP_NAME"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup creado exitosamente: $BACKUP_DIR/$BACKUP_NAME"
        return 0
    else
        echo "❌ Error al crear backup"
        return 1
    fi
}

# Función para hacer commit en Git
git_commit() {
    local MESSAGE="$1"
    cd "$PROJECT_DIR"
    
    echo "🔄 Sincronizando con versión web actual..."
    rsync -av --delete "$WEB_DIR/" "$PROJECT_DIR/" --exclude='.git'
    
    echo "🔄 Haciendo commit en Git..."
    git add .
    git commit -m "$MESSAGE"
    
    if [ $? -eq 0 ]; then
        echo "✅ Commit realizado: $MESSAGE"
        return 0
    else
        echo "ℹ️  No hay cambios para commitear"
        return 0
    fi
}

# Función para actualizar la web desde Git
deploy_to_web() {
    echo "🔄 Desplegando desde Git a web..."
    
    # Crear backup antes de desplegar
    backup_cronweb
    
    # Copiar archivos (excluyendo .git y archivos temporales)
    rsync -av --delete "$PROJECT_DIR/" "$WEB_DIR/" --exclude='.git' --exclude='*.log' --exclude='*.tmp'
    
    if [ $? -eq 0 ]; then
        echo "✅ Despliegue completado exitosamente"
        return 0
    else
        echo "❌ Error en el despliegue"
        return 1
    fi
}

# Función para revertir al último backup
rollback() {
    local LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        echo "❌ No hay backups disponibles"
        return 1
    fi
    
    echo "🔄 Revirtiendo al backup: $LATEST_BACKUP"
    rm -rf "$WEB_DIR"
    cp -r "$BACKUP_DIR/$LATEST_BACKUP" "$WEB_DIR"
    
    if [ $? -eq 0 ]; then
        echo "✅ Rollback completado exitosamente"
        return 0
    else
        echo "❌ Error en el rollback"
        return 1
    fi
}

# Función para mostrar ayuda
show_help() {
    echo "CronWeb Manager - Sistema de backup y versionado"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  backup          - Crear backup manual"
    echo "  commit [msg]    - Hacer commit con mensaje"
    echo "  deploy          - Desplegar desde Git a web"
    echo "  rollback        - Revertir al último backup"
    echo "  status          - Ver estado del proyecto"
    echo "  help            - Mostrar esta ayuda"
}

# Función para mostrar estado
show_status() {
    echo "📊 Estado del proyecto CronWeb:"
    echo ""
    echo "📁 Directorio web: $WEB_DIR"
    echo "📁 Directorio Git: $PROJECT_DIR"
    echo "📁 Directorio backups: $BACKUP_DIR"
    echo ""
    
    echo "📦 Backups disponibles:"
    ls -la "$BACKUP_DIR" 2>/dev/null | tail -5 || echo "  No hay backups"
    echo ""
    
    echo "🔀 Estado Git:"
    cd "$PROJECT_DIR"
    git log --oneline -5 2>/dev/null || echo "  No hay commits"
}

# Procesar comando
case "$1" in
    "backup")
        backup_cronweb
        ;;
    "commit")
        MESSAGE="${2:-Actualización automática $(date)}"
        git_commit "$MESSAGE"
        ;;
    "deploy")
        deploy_to_web
        ;;
    "rollback")
        rollback
        ;;
    "status")
        show_status
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Comando no reconocido: $1"
        show_help
        exit 1
        ;;
esac