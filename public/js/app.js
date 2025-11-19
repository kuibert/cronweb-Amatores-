// JavaScript para Amatores Cron Manager - Versión Avanzada

// Variables globales
let currentJobs = [];
let filteredJobs = [];

// Plantillas predefinidas
const cronTemplates = {
    daily: { 
        command: 'echo "Tarea diaria ejecutada: $(date)" >> /tmp/daily.log',
        minute: '0', hour: '9', day: '*', month: '*', weekday: '*', 
        description: 'Tarea diaria a las 9:00 AM' 
    },
    weekly: { 
        command: 'echo "Tarea semanal ejecutada: $(date)" >> /tmp/weekly.log',
        minute: '0', hour: '9', day: '*', month: '*', weekday: '1', 
        description: 'Tarea semanal los lunes a las 9:00 AM' 
    },
    monthly: { 
        command: 'echo "Tarea mensual ejecutada: $(date)" >> /tmp/monthly.log',
        minute: '0', hour: '9', day: '1', month: '*', weekday: '*', 
        description: 'Tarea mensual el día 1 a las 9:00 AM' 
    },
    backup: { 
        command: 'tar -czf /tmp/backup_$(date +%Y%m%d).tar.gz /home',
        minute: '0', hour: '2', day: '*', month: '*', weekday: '*', 
        description: 'Backup automático a las 2:00 AM' 
    }
};

// Cargar tareas al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    loadCronJobs();
    updateDashboard();
    setupCronValidators();
    loadConfig();
});

// Configurar validadores de cron
function setupCronValidators() {
    const cronFields = ['cronMinute', 'cronHour', 'cronDay', 'cronMonth', 'cronWeekday'];
    cronFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', () => updateCronPreview('cron'));
        }
    });
    
    const editCronFields = ['editCronMinute', 'editCronHour', 'editCronDay', 'editCronMonth', 'editCronWeekday'];
    editCronFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', () => updateCronPreview('editCron'));
        }
    });
}

// Usar plantilla predefinida
function useTemplate(templateName) {
    const template = cronTemplates[templateName];
    if (!template) return;
    
    document.getElementById('cronCommand').value = template.command;
    document.getElementById('cronMinute').value = template.minute;
    document.getElementById('cronHour').value = template.hour;
    document.getElementById('cronDay').value = template.day;
    document.getElementById('cronMonth').value = template.month;
    document.getElementById('cronWeekday').value = template.weekday;
    document.getElementById('cronDescription').value = template.description;
    
    updateCronPreview('cron');
    openNewTaskModal();
}

// Filtrar tareas
function filterTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredJobs = currentJobs.filter(job => {
        const matchesSearch = job.command.toLowerCase().includes(searchTerm) || 
                            (job.description && job.description.toLowerCase().includes(searchTerm));
        
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && job.enabled) ||
                            (statusFilter === 'inactive' && !job.enabled);
        
        return matchesSearch && matchesStatus;
    });
    
    displayCronJobs(filteredJobs);
}

// Actualizar preview de expresión cron
function updateCronPreview(prefix) {
    const minuteEl = document.getElementById(prefix + 'Minute');
    const hourEl = document.getElementById(prefix + 'Hour');
    const dayEl = document.getElementById(prefix + 'Day');
    const monthEl = document.getElementById(prefix + 'Month');
    const weekdayEl = document.getElementById(prefix + 'Weekday');
    
    if (!minuteEl || !hourEl || !dayEl || !monthEl || !weekdayEl) return;
    
    const minute = minuteEl.value || '*';
    const hour = hourEl.value || '*';
    const day = dayEl.value || '*';
    const month = monthEl.value || '*';
    const weekday = weekdayEl.value || '*';
    
    const cronExpression = `${minute} ${hour} ${day} ${month} ${weekday}`;
    const description = describeCronExpression(cronExpression);
    
    const previewId = prefix === 'cron' ? 'cronPreview' : 'editCronPreview';
    const descriptionId = prefix === 'cron' ? 'cronDescription' : 'editCronDescription';
    
    const previewEl = document.getElementById(previewId);
    const descriptionEl = document.getElementById(descriptionId);
    
    if (previewEl && descriptionEl) {
        previewEl.style.display = 'block';
        descriptionEl.textContent = description;
    }
}

// Describir expresión cron en lenguaje natural
function describeCronExpression(cronExpr) {
    const parts = cronExpr.split(' ');
    const [min, hour, day, month, weekday] = parts;
    
    if (min === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
        return '⚠️ Ejecutar cada minuto (muy frecuente)';
    }
    
    if (min !== '*' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
        return `✅ Ejecutar diariamente a las ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    }
    
    if (min !== '*' && hour !== '*' && day !== '*' && month === '*' && weekday === '*') {
        return `✅ Ejecutar el día ${day} de cada mes a las ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    }
    
    if (min !== '*' && hour !== '*' && day === '*' && month === '*' && weekday !== '*') {
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const dayName = days[parseInt(weekday)] || `día ${weekday}`;
        return `✅ Ejecutar cada ${dayName} a las ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    }
    
    if (min.startsWith('*/')) {
        const interval = min.substring(2);
        return `✅ Ejecutar cada ${interval} minutos`;
    }
    
    if (hour.startsWith('*/')) {
        const interval = hour.substring(2);
        return `✅ Ejecutar cada ${interval} horas`;
    }
    
    return `ℹ️ Expresión personalizada: ${cronExpr}`;
}

// Función para mostrar secciones
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionName + '-section').style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (sectionName === 'crontab') {
        loadCrontabContent();
    } else if (sectionName === 'tasks') {
        loadCronJobs();
    } else if (sectionName === 'logs') {
        loadLogs();
    }
}

// Función para abrir modal de nueva tarea
function openNewTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('newTaskModal'));
    modal.show();
}

// Función para actualizar dashboard
function updateDashboard() {
    fetch('cron_manager.php?action=list')
        .then(response => response.json())
        .then(data => {
            const total = data.length;
            const active = data.filter(job => job.enabled).length;
            const inactive = total - active;
            
            document.getElementById('totalTasks').textContent = total;
            document.getElementById('activeTasks').textContent = active;
            document.getElementById('inactiveTasks').textContent = inactive;
        })
        .catch(error => console.error('Error:', error));
}

// Función para cargar contenido del crontab
function loadCrontabContent() {
    fetch('cron_manager.php?action=crontab')
        .then(response => response.text())
        .then(data => {
            document.getElementById('crontabContent').textContent = data || 'No hay tareas en el crontab';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('crontabContent').textContent = 'Error al cargar el crontab';
        });
}

// Función para refrescar crontab después de cambios
function refreshCrontabIfVisible() {
    const crontabSection = document.getElementById('crontab-section');
    if (crontabSection && crontabSection.style.display !== 'none') {
        setTimeout(() => loadCrontabContent(), 500);
    }
}

// Función para cargar las tareas cron
function loadCronJobs() {
    fetch('cron_manager.php?action=list')
        .then(response => response.json())
        .then(data => {
            currentJobs = data;
            filteredJobs = data;
            displayCronJobs(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error al cargar las tareas', 'danger');
        });
}

// Función para mostrar las tareas en la tabla
function displayCronJobs(jobs) {
    const tbody = document.getElementById('cronTableBody');
    tbody.innerHTML = '';

    if (jobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tareas programadas</td></tr>';
        return;
    }

    jobs.forEach((job, index) => {
        const originalIndex = currentJobs.indexOf(job);
        const lastExecution = job.last_execution || 'Nunca';
        const executionStatus = job.last_status || 'pending';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="badge ${job.enabled ? 'bg-success' : 'bg-secondary'}">
                    ${job.enabled ? 'Activa' : 'Inactiva'}
                </span>
            </td>
            <td><code>${job.command}</code></td>
            <td><span class="cron-expression">${job.schedule}</span></td>
            <td>${job.description || 'Sin descripción'}</td>
            <td>
                <small class="text-muted">${lastExecution}</small><br>
                <span class="badge bg-${executionStatus === 'success' ? 'success' : executionStatus === 'error' ? 'danger' : 'secondary'}">
                    ${executionStatus === 'success' ? 'Éxito' : executionStatus === 'error' ? 'Error' : 'Pendiente'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-info" onclick="runTaskNow(${originalIndex})" title="Ejecutar Ahora">
                        <i class="bi bi-play-fill"></i>
                    </button>
                    <button class="btn btn-outline-primary" onclick="editCronJob(${originalIndex})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-${job.enabled ? 'warning' : 'success'}" 
                            onclick="toggleCronJob(${originalIndex})" title="${job.enabled ? 'Desactivar' : 'Activar'}">
                        <i class="bi bi-${job.enabled ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteCronJob(${originalIndex})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Ejecutar tarea manualmente
function runTaskNow(index) {
    const job = currentJobs[index];
    if (!job) return;
    
    if (confirm(`¿Ejecutar la tarea ahora?\n\nComando: ${job.command}`)) {
        const formData = new FormData();
        formData.append('action', 'run');
        formData.append('index', index);

        fetch('cron_manager.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Tarea ejecutada. Resultado: ' + (data.output || 'Sin salida'), 'success');
                loadCronJobs();
                loadLogs();
            } else {
                showAlert('Error al ejecutar la tarea: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error al ejecutar la tarea', 'danger');
        });
    }
}

// Cargar logs
function loadLogs() {
    fetch('cron_manager.php?action=logs')
        .then(response => response.json())
        .then(data => {
            displayLogs(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error al cargar los logs', 'danger');
        });
}

// Mostrar logs
function displayLogs(logs) {
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = '';

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay logs disponibles</td></tr>';
        return;
    }

    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><small>${log.timestamp}</small></td>
            <td><code>${log.command}</code></td>
            <td>
                <span class="badge bg-${log.status === 'success' ? 'success' : 'danger'}">
                    ${log.status === 'success' ? 'Éxito' : 'Error'}
                </span>
            </td>
            <td><small>${log.output || 'Sin salida'}</small></td>
        `;
        tbody.appendChild(row);
    });
}

// Limpiar logs
function clearLogs() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
        fetch('cron_manager.php?action=clear_logs', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Logs limpiados exitosamente', 'success');
                    loadLogs();
                } else {
                    showAlert('Error al limpiar los logs', 'danger');
                }
            });
    }
}

// Exportar tareas
function exportTasks() {
    fetch('cron_manager.php?action=export')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cron_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showAlert('Tareas exportadas exitosamente', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error al exportar las tareas', 'danger');
        });
}

// Manejar importación
function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const tasks = JSON.parse(e.target.result);
            
            const formData = new FormData();
            formData.append('action', 'import');
            formData.append('data', JSON.stringify(tasks));

            fetch('cron_manager.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Tareas importadas exitosamente', 'success');
                    loadCronJobs();
                    updateDashboard();
                } else {
                    showAlert('Error al importar las tareas: ' + data.message, 'danger');
                }
            });
        } catch (error) {
            showAlert('Error: Archivo JSON inválido', 'danger');
        }
    };
    reader.readAsText(file);
}

// Cargar configuración
function loadConfig() {
    const savedConfig = localStorage.getItem('cronManagerConfig');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
}

// Guardar configuración
function saveConfig() {
    const config = {
        timezone: document.getElementById('timezone').value,
        theme: document.getElementById('theme').value
    };
    
    localStorage.setItem('cronManagerConfig', JSON.stringify(config));
    
    if (config.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    showAlert('Configuración guardada exitosamente', 'success');
}

// Resto de funciones existentes...
function saveCronJob() {
    const cronData = {
        command: document.getElementById('cronCommand').value,
        description: document.getElementById('cronDescription').value,
        minute: document.getElementById('cronMinute').value,
        hour: document.getElementById('cronHour').value,
        day: document.getElementById('cronDay').value,
        month: document.getElementById('cronMonth').value,
        weekday: document.getElementById('cronWeekday').value
    };
    
    if (!cronData.command.trim()) {
        showAlert('El comando es requerido', 'danger');
        return;
    }

    const formData = new FormData();
    formData.append('action', 'add');
    formData.append('data', JSON.stringify(cronData));
    
    fetch('cron_manager.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Tarea creada exitosamente', 'success');
            loadCronJobs();
            updateDashboard();
            refreshCrontabIfVisible();
            document.getElementById('cronForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('newTaskModal')).hide();
        } else {
            showAlert('Error al crear la tarea: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error al crear la tarea', 'danger');
    });
}

function toggleCronJob(index) {
    const formData = new FormData();
    formData.append('action', 'toggle');
    formData.append('index', index);

    fetch('cron_manager.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Estado de la tarea actualizado', 'success');
            loadCronJobs();
            updateDashboard();
            refreshCrontabIfVisible();
        } else {
            showAlert('Error al actualizar la tarea', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error al actualizar la tarea', 'danger');
    });
}

function editCronJob(index) {
    const job = currentJobs[index];
    if (!job) return;

    const cronParts = job.schedule.split(' ');
    
    document.getElementById('editTaskIndex').value = index;
    document.getElementById('editCronCommand').value = job.command;
    document.getElementById('editCronDescription').value = job.description || '';
    document.getElementById('editCronMinute').value = cronParts[0] || '*';
    document.getElementById('editCronHour').value = cronParts[1] || '*';
    document.getElementById('editCronDay').value = cronParts[2] || '*';
    document.getElementById('editCronMonth').value = cronParts[3] || '*';
    document.getElementById('editCronWeekday').value = cronParts[4] || '*';

    const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    modal.show();
    
    setTimeout(() => updateCronPreview('editCron'), 100);
}

function updateCronJob() {
    const index = document.getElementById('editTaskIndex').value;
    const cronData = {
        command: document.getElementById('editCronCommand').value,
        description: document.getElementById('editCronDescription').value,
        minute: document.getElementById('editCronMinute').value,
        hour: document.getElementById('editCronHour').value,
        day: document.getElementById('editCronDay').value,
        month: document.getElementById('editCronMonth').value,
        weekday: document.getElementById('editCronWeekday').value
    };

    const formData = new FormData();
    formData.append('action', 'edit');
    formData.append('index', index);
    formData.append('data', JSON.stringify(cronData));

    fetch('cron_manager.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Tarea actualizada exitosamente', 'success');
            loadCronJobs();
            updateDashboard();
            refreshCrontabIfVisible();
            bootstrap.Modal.getInstance(document.getElementById('editTaskModal')).hide();
        } else {
            showAlert('Error al actualizar la tarea: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error al actualizar la tarea', 'danger');
    });
}

function deleteCronJob(index) {
    const job = currentJobs[index];
    const confirmMessage = `¿Estás seguro de que quieres eliminar esta tarea?\n\nComando: ${job.command}\nProgramación: ${job.schedule}`;
    
    if (confirm(confirmMessage)) {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('index', index);

        fetch('cron_manager.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Tarea eliminada exitosamente', 'success');
                loadCronJobs();
                updateDashboard();
                refreshCrontabIfVisible();
            } else {
                showAlert('Error al eliminar la tarea', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error al eliminar la tarea', 'danger');
        });
    }
}

function showAlert(message, type, duration = 5000) {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => {
        if (alert.classList.contains('alert-dismissible')) {
            alert.remove();
        }
    });
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="bi bi-${getAlertIcon(type)}"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, duration);
}

function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}