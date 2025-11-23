/**
 * CronWeb Amatores v2.0 - Aplicación Principal
 * Orquestador que usa los módulos refactorizados
 */

// Estado de la aplicación
const AppState = {
    currentJobs: [],
    filteredJobs: [],
    currentLinuxUser: null,
    availableLinuxUsers: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadAvailableUsers();
        setupEventListeners();
        setupCronValidators();
    } catch (error) {
        console.error('Error al inicializar:', error);
        UIManager.showNotification('Error al inicializar la aplicación', 'error');
    }
}

// Cargar usuarios disponibles
async function loadAvailableUsers() {
    try {
        const data = await ApiClient.getLinuxUsers();
        if (data.success) {
            AppState.availableLinuxUsers = data.users;
            AppState.currentLinuxUser = data.current || data.users[0];
            
            UIManager.populateUserSelector(AppState.availableLinuxUsers, AppState.currentLinuxUser);
            
            await loadCronJobs();
            await updateDashboard();
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

// Cambiar usuario Linux
async function changeLinuxUser() {
    const selector = document.getElementById('linuxUserSelector');
    AppState.currentLinuxUser = selector.value;
    
    await loadCronJobs();
    await updateDashboard();
    await loadLogs();
    await loadCrontabContent();
}

// Cargar tareas cron
async function loadCronJobs() {
    try {
        UIManager.showLoading(true);
        const jobs = await ApiClient.listJobs(AppState.currentLinuxUser);
        AppState.currentJobs = jobs;
        AppState.filteredJobs = jobs;
        
        UIManager.updateJobsTable(
            jobs,
            'editCronJob',
            'deleteCronJob',
            'toggleCronJob',
            'runCronJob'
        );
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        UIManager.showNotification('Error al cargar tareas', 'error');
    } finally {
        UIManager.showLoading(false);
    }
}

// Agregar nueva tarea
async function addCronJob() {
    const jobData = {
        command: document.getElementById('cronCommand').value,
        description: document.getElementById('cronDescription').value,
        minute: document.getElementById('cronMinute').value,
        hour: document.getElementById('cronHour').value,
        day: document.getElementById('cronDay').value,
        month: document.getElementById('cronMonth').value,
        weekday: document.getElementById('cronWeekday').value
    };
    
    // Validar
    const commandValidation = Validators.validateCommand(jobData.command);
    if (!commandValidation.valid) {
        UIManager.showNotification(commandValidation.message, 'error');
        return;
    }
    
    const scheduleValidation = Validators.validateSchedule(jobData);
    if (!scheduleValidation.valid) {
        UIManager.showNotification(scheduleValidation.message, 'error');
        return;
    }
    
    try {
        UIManager.showLoading(true);
        const result = await ApiClient.addJob(jobData, AppState.currentLinuxUser);
        
        if (result.success) {
            UIManager.showNotification('Tarea creada exitosamente', 'success');
            UIManager.clearForm('cronForm');
            
            // Cerrar modal si existe
            const modal = bootstrap.Modal.getInstance(document.getElementById('addJobModal'));
            if (modal) modal.hide();
            
            await loadCronJobs();
            await updateDashboard();
        } else {
            UIManager.showNotification(result.message || 'Error al crear tarea', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        UIManager.showNotification('Error al crear tarea', 'error');
    } finally {
        UIManager.showLoading(false);
    }
}

// Editar tarea
async function editCronJob(index) {
    const job = AppState.currentJobs[index];
    if (!job) return;
    
    // Parsear schedule
    const [minute, hour, day, month, weekday] = job.schedule.split(' ');
    
    UIManager.fillForm('editCronForm', {
        editCronCommand: job.command,
        editCronDescription: job.description,
        editCronMinute: minute,
        editCronHour: hour,
        editCronDay: day,
        editCronMonth: month,
        editCronWeekday: weekday
    });
    
    // Guardar índice para actualización
    document.getElementById('editJobIndex').value = index;
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('editJobModal'));
    modal.show();
}

// Guardar edición
async function saveEditCronJob() {
    const index = parseInt(document.getElementById('editJobIndex').value);
    
    const jobData = {
        command: document.getElementById('editCronCommand').value,
        description: document.getElementById('editCronDescription').value,
        minute: document.getElementById('editCronMinute').value,
        hour: document.getElementById('editCronHour').value,
        day: document.getElementById('editCronDay').value,
        month: document.getElementById('editCronMonth').value,
        weekday: document.getElementById('editCronWeekday').value
    };
    
    try {
        UIManager.showLoading(true);
        const result = await ApiClient.editJob(index, jobData, AppState.currentLinuxUser);
        
        if (result.success) {
            UIManager.showNotification('Tarea actualizada exitosamente', 'success');
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('editJobModal'));
            if (modal) modal.hide();
            
            await loadCronJobs();
            await updateDashboard();
        } else {
            UIManager.showNotification(result.message || 'Error al actualizar tarea', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        UIManager.showNotification('Error al actualizar tarea', 'error');
    } finally {
        UIManager.showLoading(false);
    }
}

// Eliminar tarea
async function deleteCronJob(index) {
    if (!UIManager.confirmAction('¿Estás seguro de eliminar esta tarea?')) {
        return;
    }
    
    try {
        UIManager.showLoading(true);
        const result = await ApiClient.deleteJob(index, AppState.currentLinuxUser);
        
        if (result.success) {
            UIManager.showNotification('Tarea eliminada exitosamente', 'success');
            await loadCronJobs();
            await updateDashboard();
        } else {
            UIManager.showNotification(result.message || 'Error al eliminar tarea', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        UIManager.showNotification('Error al eliminar tarea', 'error');
    } finally {
        UIManager.showLoading(false);
    }
}

// Activar/Desactivar tarea
async function toggleCronJob(index) {
    try {
        UIManager.showLoading(true);
        const result = await ApiClient.toggleJob(index, AppState.currentLinuxUser);
        
        if (result.success) {
            UIManager.showNotification(result.message, 'success');
            await loadCronJobs();
            await updateDashboard();
        } else {
            UIManager.showNotification(result.message || 'Error al cambiar estado', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        UIManager.showNotification('Error al cambiar estado', 'error');
    } finally {
        UIManager.showLoading(false);
    }
}

// Ejecutar tarea
async function runCronJob(index) {
    try {
        UIManager.showLoading(true);
        const result = await ApiClient.runJob(index, AppState.currentLinuxUser);
        
        if (result.success) {
            UIManager.showNotification('Tarea ejecutada exitosamente', 'success');
            await loadCronJobs();
            await loadLogs();
        } else {
            UIManager.showNotification('Error en la ejecución: ' + result.output, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        UIManager.showNotification('Error al ejecutar tarea', 'error');
    } finally {
        UIManager.showLoading(false);
    }
}

// Cargar logs
async function loadLogs() {
    try {
        const logs = await ApiClient.getLogs(AppState.currentLinuxUser);
        UIManager.updateLogsTable(logs);
    } catch (error) {
        console.error('Error al cargar logs:', error);
    }
}

// Limpiar logs
async function clearLogs() {
    if (!UIManager.confirmAction('¿Estás seguro de limpiar todos los logs?')) {
        return;
    }
    
    try {
        const result = await ApiClient.clearLogs(AppState.currentLinuxUser);
        if (result.success) {
            UIManager.showNotification('Logs limpiados exitosamente', 'success');
            await loadLogs();
        }
    } catch (error) {
        console.error('Error:', error);
        UIManager.showNotification('Error al limpiar logs', 'error');
    }
}

// Actualizar dashboard
async function updateDashboard() {
    const stats = {
        total: AppState.currentJobs.length,
        active: AppState.currentJobs.filter(j => j.enabled).length,
        inactive: AppState.currentJobs.filter(j => !j.enabled).length,
        executed: AppState.currentJobs.filter(j => j.last_execution).length
    };
    
    UIManager.updateDashboard(stats);
}

// Cargar contenido de crontab
async function loadCrontabContent() {
    try {
        const content = await ApiClient.getCrontab(AppState.currentLinuxUser);
        UIManager.updateCrontabView(content);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Exportar tareas
function exportJobs() {
    ApiClient.exportJobs(AppState.currentLinuxUser);
}

// Importar tareas
async function importJobs() {
    const fileInput = document.getElementById('importFile');
    if (!fileInput.files[0]) {
        UIManager.showNotification('Selecciona un archivo', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const jobs = JSON.parse(e.target.result);
            const result = await ApiClient.importJobs(jobs, AppState.currentLinuxUser);
            
            if (result.success) {
                UIManager.showNotification('Tareas importadas exitosamente', 'success');
                await loadCronJobs();
                await updateDashboard();
            } else {
                UIManager.showNotification(result.message, 'error');
            }
        } catch (error) {
            UIManager.showNotification('Error al importar: archivo inválido', 'error');
        }
    };
    reader.readAsText(fileInput.files[0]);
}

// Usar plantilla
function useTemplate(templateName) {
    CronTemplates.applyTemplate(templateName, 'cron');
    updateCronPreview('cron');
}

// Actualizar preview de cron
function updateCronPreview(prefix) {
    const schedule = {
        minute: document.getElementById(`${prefix}Minute`).value,
        hour: document.getElementById(`${prefix}Hour`).value,
        day: document.getElementById(`${prefix}Day`).value,
        month: document.getElementById(`${prefix}Month`).value,
        weekday: document.getElementById(`${prefix}Weekday`).value
    };
    
    const description = Validators.getCronDescription(schedule);
    const previewElement = document.getElementById(`${prefix}Preview`);
    if (previewElement) {
        previewElement.textContent = description;
    }
}

// Configurar validadores
function setupCronValidators() {
    const fields = ['cronMinute', 'cronHour', 'cronDay', 'cronMonth', 'cronWeekday'];
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', () => updateCronPreview('cron'));
        }
    });
    
    const editFields = ['editCronMinute', 'editCronHour', 'editCronDay', 'editCronMonth', 'editCronWeekday'];
    editFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', () => updateCronPreview('editCron'));
        }
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Selector de usuario
    const userSelector = document.getElementById('linuxUserSelector');
    if (userSelector) {
        userSelector.addEventListener('change', changeLinuxUser);
    }
}

// Filtrar tareas
function filterJobs(searchTerm) {
    if (!searchTerm) {
        AppState.filteredJobs = AppState.currentJobs;
    } else {
        AppState.filteredJobs = AppState.currentJobs.filter(job => 
            job.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    UIManager.updateJobsTable(
        AppState.filteredJobs,
        'editCronJob',
        'deleteCronJob',
        'toggleCronJob',
        'runCronJob'
    );
}
