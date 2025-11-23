# CronWeb Amatores - Guía Rápida

## 🚀 Inicio Rápido

### Acceso
1. Abrir navegador: **http://192.168.80.143/login.php**
2. Ingresar credenciales:
   - Usuario: `melvin` | Contraseña: `Soloyolase01`
   - Usuario: `raul` | Contraseña: `Soloyolase02`
   - Usuario: `admin` | Contraseña: `admin123`

### Crear una Tarea
1. Click en **"Nueva Tarea"**
2. Llenar formulario:
   - Comando: `echo "Hola mundo"`
   - Descripción: `Mi primera tarea`
   - Programación: `0 9 * * *` (diario a las 9 AM)
3. Click en **"Guardar"**

### Ejecutar una Tarea
1. Ir a **"Listar Tareas"**
2. Click en botón **▶️** (Ejecutar)
3. Ver resultado en alerta

### Ver Logs
1. Ir a **"Logs"**
2. Ver historial de ejecuciones

---

## 📋 Comandos Esenciales

### Ver Crontab en el Servidor
```bash
# Como melvin
crontab -l

# Como raul
sudo crontab -u raul -l
```

### Gestión de Backups
```bash
# Crear backup
sudo /home/melvin/cronweb_manager.sh backup

# Restaurar backup
sudo /home/melvin/cronweb_manager.sh rollback cronweb_backup_YYYYMMDD_HHMMSS
```

### Solución Rápida de Problemas
```bash
# Si los botones no funcionan
sudo chmod 666 /var/www/cronweb/public/cron_jobs_*.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_*.json

# Reiniciar Apache
sudo systemctl restart apache2
```

---

## 🎯 Plantillas de Cron

| Descripción | Expresión Cron | Ejemplo |
|-------------|----------------|---------|
| Cada minuto | `* * * * *` | Monitoreo continuo |
| Cada hora | `0 * * * *` | Limpieza de logs |
| Diario a las 9 AM | `0 9 * * *` | Reporte diario |
| Cada lunes a las 9 AM | `0 9 * * 1` | Reporte semanal |
| Primer día del mes | `0 9 1 * *` | Reporte mensual |
| Cada 15 minutos | `*/15 * * * *` | Sincronización |
| Cada 2 horas | `0 */2 * * *` | Backup incremental |

---

## 🔑 Credenciales

| Usuario | Contraseña | Acceso |
|---------|------------|--------|
| admin | admin123 | melvin, raul |
| melvin | Soloyolase01 | melvin |
| raul | Soloyolase02 | raul |

---

## 📞 Ayuda Rápida

**Documentación completa:** Ver `DOCUMENTACION.md`  
**Repositorio:** https://github.com/kuibert/cronweb-Amatores-  
**Backup estable:** `cronweb_backup_20251123_035353`
