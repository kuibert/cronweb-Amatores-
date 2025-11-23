/**
 * Gestor de interfaz de usuario
 */

const UIManager = {
    
    showNotification(message, type = 'info') {
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';
        
        const alert = document.createElement('div');
        alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    },
    
    showLoading(show = true) {
        let loader = document.getElementById('globalLoader');
        
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'globalLoader';
                loader.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
                loader.style.cssText = 'background: rgba(0,0,0,0.5); z-index: 10000;';
                loader.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
                document.body.appendChild(loader);
            }
        } else {
            if (loader) {
                loader.remove();
            }
        }
    },
    
    confirmAction(message) {
        return confirm(message);
    },
    
    updateJobsTable(jobs, onEdit, onDelete, onToggle, onRun) {
        const tbody = document.getElementById('jobsTableBody');
        if (!tbody) return;
        
        if (jobs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tareas programadas</td></tr>';
            return;
        }
        
        tbody.innerHTML = jobs.map((job, index) => `
            <tr class="${!job.enabled ? 'table-secondary' : ''}">
                <td>
                    <code>${this.escapeHtml(job.command)}</code>
                    ${job.description ? `<br><small class="text-muted">${this.escapeHtml(job.description)}</small>` : ''}
                </td>
                <td><code>${job.schedule}</code></td>
                <td>
                    <span class="badge ${job.enabled ? 'bg-success' : 'bg-secondary'}">
                        ${job.enabled ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td>
                    ${job.last_execution ? `
                        <small>${job.last_execution}</small><br>
                        <span class="badge ${job.last_status === 'success' ? 'bg-success' : 'bg-danger'}">
                            ${job.last_status === 'success' ? '✓ Éxito' : '✗ Error'}
                        </span>
                    ` : '<small class="text-muted">Nunca ejecutada</small>'}
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="(${onEdit})(${index})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-${job.enabled ? 'warning' : 'success'}" 
                                onclick="(${onToggle})(${index})" 
                                title="${job.enabled ? 'Desactivar' : 'Activar'}">
                            <i class="bi bi-${job.enabled ? 'pause' : 'play'}-circle"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="(${onRun})(${index})" title="Ejecutar ahora">
                            <i class="bi bi-play-fill"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="(${onDelete})(${index})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    updateLogsTable(logs) {
        const tbody = document.getElementById('logsTableBody');
        if (!tbody) return;
        
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay logs de ejecución</td></tr>';
            return;
        }
        
        tbody.innerHTML = logs.map(log => `
            <tr>
                <td><small>${log.timestamp}</small></td>
                <td><code>${this.escapeHtml(log.command)}</code></td>
                <td>
                    <span class="badge ${log.status === 'success' ? 'bg-success' : 'bg-danger'}">
                        ${log.status === 'success' ? '✓ Éxito' : '✗ Error'}
                    </span>
                </td>
                <td>
                    <small class="text-muted">${this.escapeHtml(log.output || 'Sin salida')}</small>
                </td>
            </tr>
        `).join('');
    },
    
    updateDashboard(stats) {
        const elements = {
            totalJobs: document.getElementById('totalJobs'),
            activeJobs: document.getElementById('activeJobs'),
            inactiveJobs: document.getElementById('inactiveJobs'),
            executedJobs: document.getElementById('executedJobs')
        };
        
        if (elements.totalJobs) elements.totalJobs.textContent = stats.total || 0;
        if (elements.activeJobs) elements.activeJobs.textContent = stats.active || 0;
        if (elements.inactiveJobs) elements.inactiveJobs.textContent = stats.inactive || 0;
        if (elements.executedJobs) elements.executedJobs.textContent = stats.executed || 0;
    },
    
    updateCrontabView(content) {
        const element = document.getElementById('crontabContent');
        if (element) {
            element.textContent = content;
        }
    },
    
    populateUserSelector(users, currentUser) {
        const selector = document.getElementById('linuxUserSelector');
        if (!selector) return;
        
        selector.innerHTML = users.map(user => 
            `<option value="${user}" ${user === currentUser ? 'selected' : ''}>Usuario: ${user}</option>`
        ).join('');
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    },
    
    fillForm(formId, data) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        for (const [key, value] of Object.entries(data)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        }
    }
};

window.UIManager = UIManager;
