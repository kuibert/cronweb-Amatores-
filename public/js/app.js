// CronWeb Amatores - Aplicación Principal (Versión Híbrida con Módulos)
// Usa módulos cargados globalmente: ApiClient, Validators, UIManager, CronTemplates

let currentJobs = [];
let filteredJobs = [];
let currentLinuxUser = null;
let availableLinuxUsers = [];
let allLogs = [];
let filteredLogs = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    loadAvailableUsers();
    setupCronValidators();
    loadConfig();
});

function loadAvailableUsers() {
    ApiClient.getLinuxUsers()
        .then(data => {
            if (data.success) {
                availableLinuxUsers = data.users;
                currentLinuxUser = data.users[0];
                populateUserSelector();
                updateDashboard();
                loadCronJobs();
            }
        })
        .catch(error => console.error('Error:', error));
}

function populateUserSelector() {
    UIManager.populateUserSelector(availableLinuxUsers, currentLinuxUser);
}

function changeLinuxUser() {
    const selector = document.getElementById('linuxUserSelector');
    currentLinuxUser = selector.value;
    currentPage = 1;
    updateDashboard();
    loadCronJobs();
    loadLogs();
    loadCrontabContent();
}

function loadCronJobs() {
    if (!currentLinuxUser) return;
    ApiClient.listJobs(currentLinuxUser)
        .then(jobs => {
            currentJobs = jobs;
            filteredJobs = jobs;
            displayCronJobs(jobs);
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error al cargar tareas', 'danger');
        });
}

function displayCronJobs(jobs) {
    const tbody = document.getElementById('cronTableBody');
    if (!tbody) return;
    
    if (jobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tareas programadas</td></tr>';
        document.getElementById('tasksPagination').style.display = 'none';
        return;
    }
    
    const totalPages = Math.ceil(jobs.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedJobs = jobs.slice(start, end);
    
    tbody.innerHTML = paginatedJobs.map((job, paginatedIndex) => {
        const index = start + paginatedIndex;
        const lastExecution = job.last_execution || 'Nunca';
        const statusBadgeClass = job.last_status === 'success' ? 'success' : job.last_status === 'error' ? 'danger' : 'info';
        const statusText = job.last_status === 'success' ? '✅ Éxito' : job.last_status === 'error' ? '❌ Error' : '⏳ Sin ejecutar';
        
        return `
            <tr class="${!job.last_execution ? 'table-info' : ''}">
                <td>
                    <span class="badge ${job.enabled ? 'bg-success' : 'bg-secondary'}">
                        ${job.enabled ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td><code>${escapeHtml(job.command)}</code></td>
                <td><span class="cron-expression">${job.schedule}</span></td>
                <td>${job.description || 'Sin descripción'}</td>
                <td>
                    <small class="text-muted">${lastExecution}</small><br>
                    <span class="badge bg-${statusBadgeClass}">${statusText}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info" onclick="runTaskNow(${index})" title="Ejecutar Ahora">
                            <i class="bi bi-play-fill"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="editCronJob(${index})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-${job.enabled ? 'warning' : 'success'}" 
                                onclick="toggleCronJob(${index})" title="${job.enabled ? 'Desactivar' : 'Activar'}">
                            <i class="bi bi-${job.enabled ? 'pause' : 'play-circle'}"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteCronJob(${index})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginationList = document.getElementById('paginationList');
    const paginationNav = document.getElementById('tasksPagination');
    
    if (totalPages <= 1) {
        paginationNav.style.display = 'none';
        return;
    }
    
    paginationNav.style.display = 'block';
    let html = '';
    
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Anterior</a>
    </li>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Siguiente</a>
    </li>`;
    
    paginationList.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayCronJobs(filteredJobs);
}

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
    
    ApiClient.addJob(cronData, currentLinuxUser)
        .then(data => {
            if (data.success) {
                showAlert('Tarea creada exitosamente', 'success');
                loadCronJobs();
                updateDashboard();
                document.getElementById('cronForm').reset();
                bootstrap.Modal.getInstance(document.getElementById('newTaskModal')).hide();
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => showAlert('Error al crear tarea', 'danger'));
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
    
    ApiClient.editJob(index, cronData, currentLinuxUser)
        .then(data => {
            if (data.success) {
                showAlert('Tarea actualizada exitosamente', 'success');
                loadCronJobs();
                updateDashboard();
                bootstrap.Modal.getInstance(document.getElementById('editTaskModal')).hide();
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => showAlert('Error al actualizar tarea', 'danger'));
}

function deleteCronJob(index) {
    const job = currentJobs[index];
    if (!confirm(`¿Eliminar esta tarea?\n\n${job.command}`)) return;
    
    ApiClient.deleteJob(index, currentLinuxUser)
        .then(data => {
            if (data.success) {
                showAlert('Tarea eliminada exitosamente', 'success');
                loadCronJobs();
                updateDashboard();
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => showAlert('Error al eliminar tarea', 'danger'));
}

function toggleCronJob(index) {
    ApiClient.toggleJob(index, currentLinuxUser)
        .then(data => {
            if (data.success) {
                showAlert(data.message, 'success');
                loadCronJobs();
                updateDashboard();
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => showAlert('Error al cambiar estado', 'danger'));
}

function runTaskNow(index) {
    const job = currentJobs[index];
    if (!confirm(`¿Ejecutar ahora?\n\n${job.command}`)) return;
    
    ApiClient.runJob(index, currentLinuxUser)
        .then(data => {
            if (data.success) {
                showAlert('Tarea ejecutada: ' + (data.output || 'Sin salida'), 'success');
                loadCronJobs();
                updateDashboard();
                loadLogs();
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => showAlert('Error al ejecutar tarea', 'danger'));
}

function loadLogs() {
    if (!currentLinuxUser) return;
    ApiClient.getLogs(currentLinuxUser)
        .then(logs => {
            allLogs = logs;
            filterLogs();
        })
        .catch(error => console.error('Error:', error));
}

function filterLogs() {
    const statusFilter = document.getElementById('logStatusFilter')?.value || 'all';
    const searchTerm = document.getElementById('logSearchInput')?.value.toLowerCase() || '';
    
    filteredLogs = allLogs.filter(log => {
        const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
        const matchesSearch = !searchTerm || 
                            log.command.toLowerCase().includes(searchTerm) ||
                            (log.output && log.output.toLowerCase().includes(searchTerm));
        return matchesStatus && matchesSearch;
    });
    
    displayLogs(filteredLogs);
}

function displayLogs(logs) {
    const tbody = document.getElementById('logsTableBody');
    if (!tbody) return;
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay logs</td></tr>';
        return;
    }
    
    tbody.innerHTML = logs.slice(0, 50).map(log => {
        const task = currentJobs.find(job => job.command === log.command);
        const description = task?.description || '';
        
        return `
            <tr>
                <td><small class="text-muted">${log.timestamp}</small></td>
                <td>
                    ${description ? `<strong>${description}</strong><br>` : ''}
                    <code class="text-muted" style="font-size: 0.85em">${escapeHtml(log.command)}</code>
                </td>
                <td>
                    <span class="badge bg-${log.status === 'success' ? 'success' : 'danger'}">
                        ${log.status === 'success' ? '✅ Éxito' : '❌ Error'}
                    </span>
                </td>
                <td>
                    <small class="${log.status === 'success' ? 'text-muted' : 'text-danger'}">
                        ${log.output ? (log.output.length > 100 ? log.output.substring(0, 100) + '...' : log.output) : 'Sin salida'}
                    </small>
                </td>
            </tr>
        `;
    }).join('');
}

function clearLogs() {
    if (!confirm('¿Limpiar todos los logs?')) return;
    
    ApiClient.clearLogs(currentLinuxUser)
        .then(data => {
            if (data.success) {
                showAlert('Logs limpiados exitosamente', 'success');
                loadLogs();
            }
        })
        .catch(error => showAlert('Error al limpiar logs', 'danger'));
}

function updateDashboard() {
    if (!currentLinuxUser) return;
    ApiClient.listJobs(currentLinuxUser)
        .then(data => {
            const total = data.length;
            const active = data.filter(job => job.enabled).length;
            const inactive = total - active;
            const unexecuted = data.filter(job => !job.last_execution).length;
            
            document.getElementById('totalTasks').textContent = total;
            document.getElementById('activeTasks').textContent = active;
            document.getElementById('inactiveTasks').textContent = inactive;
            document.getElementById('unexecutedTasks').textContent = unexecuted;
            
            displayUnexecutedTasks(data.filter(job => !job.last_execution));
        })
        .catch(error => console.error('Error:', error));
}

function displayUnexecutedTasks(unexecutedJobs) {
    const section = document.getElementById('unexecutedTasksSection');
    const container = document.getElementById('unexecutedTasksList');
    
    if (unexecutedJobs.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = unexecutedJobs.map((job, index) => {
        const originalIndex = currentJobs.indexOf(job);
        const statusBadge = job.enabled ? '<span class="badge bg-success">Activa</span>' : '<span class="badge bg-secondary">Inactiva</span>';
        
        return `
            <div class="list-group-item d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <strong class="me-2">${job.description || 'Sin descripción'}</strong>
                        ${statusBadge}
                    </div>
                    <code class="text-muted" style="font-size: 0.85em">${escapeHtml(job.command)}</code><br>
                    <small class="text-muted">
                        <i class="bi bi-clock"></i> ${job.schedule}
                    </small>
                </div>
                <div>
                    <button class="btn btn-sm btn-info" onclick="runTaskNow(${originalIndex})" title="Ejecutar ahora">
                        <i class="bi bi-play-fill"></i> Ejecutar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadCrontabContent() {
    if (!currentLinuxUser) return;
    ApiClient.getCrontab(currentLinuxUser)
        .then(content => {
            document.getElementById('crontabContent').textContent = content || 'No hay tareas en el crontab';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('crontabContent').textContent = 'Error al cargar el crontab';
        });
}

function exportTasks() {
    if (!currentLinuxUser) return;
    ApiClient.exportJobs(currentLinuxUser);
}

function importTasks() {
    document.getElementById('importFile').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const tasks = JSON.parse(e.target.result);
            ApiClient.importJobs(tasks, currentLinuxUser)
                .then(data => {
                    if (data.success) {
                        showAlert('Tareas importadas exitosamente', 'success');
                        loadCronJobs();
                        updateDashboard();
                    } else {
                        showAlert('Error: ' + data.message, 'danger');
                    }
                });
        } catch (error) {
            showAlert('Error: Archivo JSON inválido', 'danger');
        }
    };
    reader.readAsText(file);
}

function useTemplate(templateName) {
    CronTemplates.applyTemplate(templateName, 'cron');
    updateCronPreview('cron');
    openNewTaskModal();
}

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
    
    currentPage = 1;
    displayCronJobs(filteredJobs);
}

function setupCronValidators() {
    const fields = ['cronMinute', 'cronHour', 'cronDay', 'cronMonth', 'cronWeekday'];
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) element.addEventListener('input', () => updateCronPreview('cron'));
    });
    
    const editFields = ['editCronMinute', 'editCronHour', 'editCronDay', 'editCronMonth', 'editCronWeekday'];
    editFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) element.addEventListener('input', () => updateCronPreview('editCron'));
    });
}

function updateCronPreview(prefix) {
    const schedule = {
        minute: document.getElementById(`${prefix}Minute`)?.value || '*',
        hour: document.getElementById(`${prefix}Hour`)?.value || '*',
        day: document.getElementById(`${prefix}Day`)?.value || '*',
        month: document.getElementById(`${prefix}Month`)?.value || '*',
        weekday: document.getElementById(`${prefix}Weekday`)?.value || '*'
    };
    
    const description = Validators.getCronDescription(schedule);
    const previewEl = document.getElementById(`${prefix}Preview`);
    const descriptionEl = document.getElementById(`${prefix}Description`);
    
    if (previewEl && descriptionEl) {
        previewEl.style.display = 'block';
        descriptionEl.textContent = description;
    }
}

function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionName + '-section').style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (sectionName === 'crontab') loadCrontabContent();
    else if (sectionName === 'tasks') loadCronJobs();
    else if (sectionName === 'logs') loadLogs();
}

function openNewTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('newTaskModal'));
    modal.show();
}

function loadConfig() {
    const savedTheme = localStorage.getItem('cronManagerTheme') || 'light';
    applyTheme(savedTheme);
    
    const savedConfig = localStorage.getItem('cronManagerConfig');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        document.getElementById('timezone').value = config.timezone || 'America/Mexico_City';
        document.getElementById('theme').value = config.theme || savedTheme;
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('cronManagerTheme', newTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
    
    const themeSelect = document.getElementById('theme');
    if (themeSelect) themeSelect.value = theme;
}

function saveConfig() {
    const config = {
        timezone: document.getElementById('timezone').value,
        theme: document.getElementById('theme').value
    };
    
    localStorage.setItem('cronManagerConfig', JSON.stringify(config));
    localStorage.setItem('cronManagerTheme', config.theme);
    applyTheme(config.theme);
    showAlert('Configuración guardada exitosamente', 'success');
}

function backupCrontab() {
    exportTasks();
}

function showAlert(message, type, duration = 5000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), duration);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
