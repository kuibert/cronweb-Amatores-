/**
 * Plantillas predefinidas de tareas cron
 */

const CronTemplates = {
    
    templates: {
        daily: {
            name: 'Tarea Diaria',
            command: 'echo "Tarea diaria ejecutada"',
            minute: '0',
            hour: '9',
            day: '*',
            month: '*',
            weekday: '*',
            description: 'Tarea diaria a las 9:00 AM'
        },
        
        weekly: {
            name: 'Tarea Semanal',
            command: 'echo "Tarea semanal ejecutada"',
            minute: '0',
            hour: '9',
            day: '*',
            month: '*',
            weekday: '1',
            description: 'Tarea semanal los lunes a las 9:00 AM'
        },
        
        monthly: {
            name: 'Tarea Mensual',
            command: 'echo "Tarea mensual ejecutada"',
            minute: '0',
            hour: '9',
            day: '1',
            month: '*',
            weekday: '*',
            description: 'Tarea mensual el día 1 a las 9:00 AM'
        },
        
        hourly: {
            name: 'Tarea Cada Hora',
            command: 'echo "Tarea horaria ejecutada"',
            minute: '0',
            hour: '*',
            day: '*',
            month: '*',
            weekday: '*',
            description: 'Tarea cada hora en punto'
        },
        
        every5min: {
            name: 'Cada 5 Minutos',
            command: 'echo "Tarea cada 5 minutos"',
            minute: '*/5',
            hour: '*',
            day: '*',
            month: '*',
            weekday: '*',
            description: 'Tarea cada 5 minutos'
        },
        
        backup: {
            name: 'Backup Nocturno',
            command: 'tar -czf /backup/backup_$(date +%Y%m%d).tar.gz /home',
            minute: '0',
            hour: '2',
            day: '*',
            month: '*',
            weekday: '*',
            description: 'Backup automático a las 2:00 AM'
        },
        
        cleanup: {
            name: 'Limpieza de Temporales',
            command: 'find /tmp -type f -mtime +7 -delete',
            minute: '0',
            hour: '3',
            day: '*',
            month: '*',
            weekday: '0',
            description: 'Limpiar archivos temporales cada domingo'
        },
        
        monitoring: {
            name: 'Monitoreo de Sistema',
            command: 'df -h > /var/log/disk_usage.log',
            minute: '*/30',
            hour: '*',
            day: '*',
            month: '*',
            weekday: '*',
            description: 'Verificar uso de disco cada 30 minutos'
        }
    },
    
    getTemplate(name) {
        return this.templates[name] || null;
    },
    
    getAllTemplates() {
        return Object.entries(this.templates).map(([key, template]) => ({
            key,
            ...template
        }));
    },
    
    applyTemplate(name, formPrefix = 'cron') {
        const template = this.getTemplate(name);
        if (!template) return false;
        
        const fields = {
            command: document.getElementById(`${formPrefix}Command`),
            description: document.getElementById(`${formPrefix}Description`),
            minute: document.getElementById(`${formPrefix}Minute`),
            hour: document.getElementById(`${formPrefix}Hour`),
            day: document.getElementById(`${formPrefix}Day`),
            month: document.getElementById(`${formPrefix}Month`),
            weekday: document.getElementById(`${formPrefix}Weekday`)
        };
        
        for (const [key, element] of Object.entries(fields)) {
            if (element && template[key]) {
                element.value = template[key];
            }
        }
        
        return true;
    },
    
    createTemplateSelector(containerId, onSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const select = document.createElement('select');
        select.className = 'form-select';
        select.innerHTML = '<option value="">-- Seleccionar plantilla --</option>';
        
        this.getAllTemplates().forEach(template => {
            const option = document.createElement('option');
            option.value = template.key;
            option.textContent = template.name;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            if (e.target.value) {
                onSelect(e.target.value);
            }
        });
        
        container.appendChild(select);
    }
};

window.CronTemplates = CronTemplates;
