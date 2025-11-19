// JavaScript para Amatores Cron Manager

// Cargar tareas al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    loadCronJobs();
    updateDashboard();
});

// Función para mostrar secciones
function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(sectionName + '-section').style.display = 'block';
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Cargar contenido específico
    if (sectionName === 'crontab') {
        loadCrontabContent();
    } else if (sectionName === 'tasks') {
        loadCronJobs();
    }
}

// Función para abrir modal de nueva tarea
function openNewTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('newTaskModal'));
    modal.show();
}

// Función para actualizar dashboard
function updateDashboard() {
    fetch('src/cron_manager.php?action=list')
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
    fetch('src/cron_manager.php?action=crontab')
        .then(response => response.text())
        .then(data => {
            document.getElementById('crontabContent').textContent = data || 'No hay tareas en el crontab';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('crontabContent').textContent = 'Error al cargar el crontab';
        });
}

// Función para cargar las tareas cron
function loadCronJobs() {
    fetch('src/cron_manager.php?action=list')
        .then(response => response.json())
        .then(data => {
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
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay tareas programadas</td></tr>';
        return;
    }

    jobs.forEach((job, index) => {
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
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editCronJob(${index})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-${job.enabled ? 'warning' : 'success'} btn-action" 
                        onclick="toggleCronJob(${index})">
                    <i class="bi bi-${job.enabled ? 'pause' : 'play'}"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteCronJob(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para guardar una nueva tarea cron
function saveCronJob() {
    const form = document.getElementById('cronForm');
    const formData = new FormData();
    
    const cronData = {
        command: document.getElementById('cronCommand').value,
        description: document.getElementById('cronDescription').value,
        minute: document.getElementById('cronMinute').value,
        hour: document.getElementById('cronHour').value,
        day: document.getElementById('cronDay').value,
        month: document.getElementById('cronMonth').value,
        weekday: document.getElementById('cronWeekday').value
    };

    formData.append('action', 'add');
    formData.append('data', JSON.stringify(cronData));

    fetch('src/cron_manager.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Tarea creada exitosamente', 'success');
            loadCronJobs();
            updateDashboard();
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

// Función para alternar el estado de una tarea
function toggleCronJob(index) {
    const formData = new FormData();
    formData.append('action', 'toggle');
    formData.append('index', index);

    fetch('src/cron_manager.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Estado de la tarea actualizado', 'success');
            loadCronJobs();
            updateDashboard();
        } else {
            showAlert('Error al actualizar la tarea', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error al actualizar la tarea', 'danger');
    });
}

// Función para eliminar una tarea
function deleteCronJob(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('index', index);

        fetch('src/cron_manager.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Tarea eliminada exitosamente', 'success');
                loadCronJobs();
                updateDashboard();
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

// Función para mostrar alertas
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.row'));
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}