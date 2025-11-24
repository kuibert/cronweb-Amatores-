# CronWeb Scripts

Este directorio contiene los scripts esenciales para el funcionamiento de CronWeb Amatores.

## Archivos

### wrapper_cron.sh
Script wrapper que ejecuta comandos cron y registra los resultados.
- **Uso:** Llamado automáticamente por el crontab
- **Función:** Ejecuta comandos y registra logs

### cron_logger.php
Script PHP que registra las ejecuciones en los archivos de logs.
- **Uso:** Llamado por wrapper_cron.sh
- **Función:** Escribe logs en execution_logs_{user}.json

### cronweb_manager.sh
Script de gestión del proyecto.
- **Comandos:**
  - `backup` - Crear backup manual
  - `deploy` - Desplegar desde Git (con backup automático)
  - `rollback` - Restaurar un backup
  - `status` - Ver estado del sistema

## Ubicación
Los scripts están en `/home/melvin/cronweb_scripts/` con enlaces simbólicos en `/home/melvin/` para compatibilidad.
