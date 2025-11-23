<?php
/**
 * Amatores Cron Manager - Backend PHP Multi-Usuario
 * Gestiona las operaciones de crontab para múltiples usuarios Linux
 */

require_once 'auth.php';
requireAuth(); // Proteger todas las peticiones

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

class CronManager {
    private $cronFile;
    private $linuxUser;
    
    public function __construct($linuxUser = null) {
        // Validar y establecer usuario Linux
        if ($linuxUser) {
            validateLinuxUser($linuxUser);
            
            // Verificar permisos
            if (!canAccessLinuxUser($_SESSION['username'], $linuxUser)) {
                throw new Exception('No tienes permiso para acceder a este usuario');
            }
            
            $this->linuxUser = $linuxUser;
        } else {
            $this->linuxUser = 'melvin'; // Usuario por defecto
        }
        
        // Archivo JSON por usuario
        $this->cronFile = __DIR__ . '/cron_jobs_' . $this->linuxUser . '.json';
        
        // Crear archivo si no existe
        if (!file_exists($this->cronFile)) {
            file_put_contents($this->cronFile, json_encode([]));
        }
    }
    
    public function listJobs() {
        $jobs = $this->loadJobs();
        return ['success' => true, 'data' => $jobs];
    }
    
    public function addJob($data) {
        try {
            $jobs = $this->loadJobs();
            
            // Validar campos requeridos
            if (empty($data['command'])) {
                throw new Exception('El comando es requerido');
            }
            
            // Limpiar y validar campos de tiempo
            $minute = $this->validateCronField($data['minute'] ?? '*', 'minute');
            $hour = $this->validateCronField($data['hour'] ?? '*', 'hour');
            $day = $this->validateCronField($data['day'] ?? '*', 'day');
            $month = $this->validateCronField($data['month'] ?? '*', 'month');
            $weekday = $this->validateCronField($data['weekday'] ?? '*', 'weekday');
            
            $newJob = [
                'id' => uniqid(),
                'command' => trim($data['command']),
                'description' => trim($data['description'] ?? ''),
                'schedule' => sprintf('%s %s %s %s %s', $minute, $hour, $day, $month, $weekday),
                'enabled' => true,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            $jobs[] = $newJob;
            $this->saveJobs($jobs);
            
            // Actualizar crontab real
            $this->updateSystemCrontab();
            
            return ['success' => true, 'message' => 'Tarea creada exitosamente'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    private function validateCronField($value, $type) {
        $value = trim($value);
        if (empty($value)) $value = '*';
        
        // Si es *, es válido
        if ($value === '*') return '*';
        
        // Si contiene patrones como */5, validar
        if (preg_match('/^\*\/\d+$/', $value)) {
            return $value;
        }
        
        // Si es un rango como 0-9, convertir a lista
        if (preg_match('/^(\d+)-(\d+)$/', $value, $matches)) {
            $start = (int)$matches[1];
            $end = (int)$matches[2];
            
            // Validar rangos según el tipo
            $limits = [
                'minute' => [0, 59],
                'hour' => [0, 23], 
                'day' => [1, 31],
                'month' => [1, 12],
                'weekday' => [0, 7]
            ];
            
            if (isset($limits[$type])) {
                [$min, $max] = $limits[$type];
                if ($start < $min || $end > $max || $start > $end) {
                    throw new Exception("Rango inválido para $type: $value");
                }
            }
            
            return $value;
        }
        
        // Si es un número simple, validar
        if (is_numeric($value)) {
            $num = (int)$value;
            $limits = [
                'minute' => [0, 59],
                'hour' => [0, 23],
                'day' => [1, 31], 
                'month' => [1, 12],
                'weekday' => [0, 7]
            ];
            
            if (isset($limits[$type])) {
                [$min, $max] = $limits[$type];
                if ($num < $min || $num > $max) {
                    throw new Exception("Valor inválido para $type: $value (rango: $min-$max)");
                }
            }
            
            return $value;
        }
        
        // Si es una lista separada por comas
        if (strpos($value, ',') !== false) {
            return $value; // Aceptar listas por ahora
        }
        
        throw new Exception("Formato inválido para $type: $value");
    }
    
    public function toggleJob($index) {
        try {
            $jobs = $this->loadJobs();
            
            if (!isset($jobs[$index])) {
                throw new Exception('Tarea no encontrada');
            }
            
            $jobs[$index]['enabled'] = !$jobs[$index]['enabled'];
            $this->saveJobs($jobs);
            
            // Actualizar crontab real
            $this->updateSystemCrontab();
            
            $message = $jobs[$index]['enabled'] ? 'Tarea habilitada en crontab' : 'Tarea deshabilitada';
            return ['success' => true, 'message' => $message];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function editJob($index, $data) {
        try {
            $jobs = $this->loadJobs();
            
            if (!isset($jobs[$index])) {
                throw new Exception('Tarea no encontrada');
            }
            
            // Actualizar la tarea
            $jobs[$index]['command'] = $data['command'];
            $jobs[$index]['description'] = $data['description'] ?? '';
            $jobs[$index]['schedule'] = sprintf('%s %s %s %s %s', 
                $data['minute'], 
                $data['hour'], 
                $data['day'], 
                $data['month'], 
                $data['weekday']
            );
            $jobs[$index]['updated_at'] = date('Y-m-d H:i:s');
            
            // Marcar como pendiente al editar
            unset($jobs[$index]['last_execution']);
            unset($jobs[$index]['last_status']);
            
            $this->saveJobs($jobs);
            
            // Actualizar crontab real
            $this->updateSystemCrontab();
            
            return ['success' => true, 'message' => 'Tarea actualizada y marcada como pendiente'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function deleteJob($index) {
        try {
            $jobs = $this->loadJobs();
            
            if (!isset($jobs[$index])) {
                throw new Exception('Tarea no encontrada');
            }
            
            array_splice($jobs, $index, 1);
            $this->saveJobs($jobs);
            
            // Actualizar crontab real
            $this->updateSystemCrontab();
            
            return ['success' => true, 'message' => 'Tarea eliminada'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function loadJobs() {
        $content = file_get_contents($this->cronFile);
        return json_decode($content, true) ?: [];
    }
    
    private function saveJobs($jobs) {
        file_put_contents($this->cronFile, json_encode($jobs, JSON_PRETTY_PRINT));
    }
    
    public function runJob($index) {
        try {
            $jobs = $this->loadJobs();
            
            if (!isset($jobs[$index])) {
                throw new Exception('Tarea no encontrada');
            }
            
            $job = $jobs[$index];
            $command = $job['command'];
            
            // Ejecutar comando directamente (www-data ya tiene permisos sudo NOPASSWD para crontab)
            // Para ejecución manual, usar el wrapper del usuario
            $wrapperPath = '/home/' . $this->linuxUser . '/wrapper_cron.sh';
            if (file_exists($wrapperPath)) {
                $fullCommand = sprintf(
                    'sudo -u %s %s %s 2>&1',
                    escapeshellarg($this->linuxUser),
                    escapeshellarg($wrapperPath),
                    escapeshellarg($command)
                );
            } else {
                // Fallback: ejecutar directamente
                $fullCommand = sprintf(
                    'sudo -u %s bash -c %s 2>&1',
                    escapeshellarg($this->linuxUser),
                    escapeshellarg($command)
                );
            }
            exec($fullCommand, $output, $returnCode);
            
            logAction($this->linuxUser, 'RUN_JOB', $command);
            
            $result = [
                'success' => $returnCode === 0,
                'output' => implode("\n", $output),
                'return_code' => $returnCode
            ];
            
            // Guardar log
            $this->addLog($command, $returnCode === 0 ? 'success' : 'error', $result['output']);
            
            // Actualizar última ejecución
            $jobs[$index]['last_execution'] = date('Y-m-d H:i:s');
            $jobs[$index]['last_status'] = $returnCode === 0 ? 'success' : 'error';
            $this->saveJobs($jobs);
            
            return $result;
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function getLogs() {
        $logFile = __DIR__ . '/execution_logs_' . $this->linuxUser . '.json';
        if (!file_exists($logFile)) {
            return [];
        }
        
        $content = file_get_contents($logFile);
        $logs = json_decode($content, true) ?: [];
        
        // Ordenar por fecha descendente
        usort($logs, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        // Limitar a los últimos 100 logs
        return array_slice($logs, 0, 100);
    }
    
    public function clearLogs() {
        $logFile = __DIR__ . '/execution_logs_' . $this->linuxUser . '.json';
        file_put_contents($logFile, json_encode([]));
        return ['success' => true, 'message' => 'Logs limpiados'];
    }
    
    public function importJobs($importedJobs) {
        try {
            if (!is_array($importedJobs)) {
                throw new Exception('Formato de datos inválido');
            }
            
            $currentJobs = $this->loadJobs();
            
            foreach ($importedJobs as $job) {
                // Validar estructura del job
                if (!isset($job['command']) || !isset($job['schedule'])) {
                    continue;
                }
                
                $newJob = [
                    'id' => uniqid(),
                    'command' => $job['command'],
                    'description' => $job['description'] ?? '',
                    'schedule' => $job['schedule'],
                    'enabled' => $job['enabled'] ?? true,
                    'created_at' => date('Y-m-d H:i:s'),
                    'imported' => true
                ];
                
                $currentJobs[] = $newJob;
            }
            
            $this->saveJobs($currentJobs);
            $this->updateSystemCrontab();
            
            return ['success' => true, 'message' => 'Tareas importadas exitosamente'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    private function addLog($command, $status, $output) {
        $logFile = __DIR__ . '/execution_logs_' . $this->linuxUser . '.json';
        $logs = [];
        
        if (file_exists($logFile)) {
            $content = file_get_contents($logFile);
            $logs = json_decode($content, true) ?: [];
        }
        
        $logs[] = [
            'timestamp' => date('Y-m-d H:i:s'),
            'command' => $command,
            'status' => $status,
            'output' => substr($output, 0, 500) // Limitar salida
        ];
        
        // Mantener solo los últimos 1000 logs
        if (count($logs) > 1000) {
            $logs = array_slice($logs, -1000);
        }
        
        file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));
    }
    
    private function updateSystemCrontab() {
        $jobs = $this->loadJobs();
        $cronContent = "# Amatores Cron Manager - Tareas generadas automáticamente\n";
        $cronContent .= "# Usuario: " . $this->linuxUser . "\n";
        
        foreach ($jobs as $job) {
            if ($job['enabled']) {
                $comment = !empty($job['description']) ? " # " . $job['description'] : "";
                $cronContent .= $job['schedule'] . " " . $job['command'] . $comment . "\n";
            }
        }
        
        // Guardar en archivo temporal
        $tempFile = tempnam(sys_get_temp_dir(), 'cron');
        file_put_contents($tempFile, $cronContent);
        
        // Aplicar al crontab del usuario específico usando sudo
        if (PHP_OS_FAMILY === 'Linux') {
            $command = sprintf(
                'sudo -u %s crontab %s 2>&1',
                escapeshellarg($this->linuxUser),
                escapeshellarg($tempFile)
            );
            exec($command, $output, $returnCode);
            
            if ($returnCode !== 0) {
                error_log("Error updating crontab for {$this->linuxUser}: " . implode("\n", $output));
                logAction($this->linuxUser, 'CRONTAB_UPDATE_ERROR', implode(', ', $output));
            } else {
                logAction($this->linuxUser, 'CRONTAB_UPDATED', 'Crontab actualizado exitosamente');
            }
        }
        
        unlink($tempFile);
        
        // Guardar copia para visualización
        file_put_contents(__DIR__ . '/current_crontab_' . $this->linuxUser . '.txt', $cronContent);
    }
}

// Obtener usuario Linux de la petición
$linuxUser = $_GET['linux_user'] ?? $_POST['linux_user'] ?? $_SESSION['current_linux_user'] ?? null;

// Si no hay usuario, obtener el primero permitido
if (!$linuxUser) {
    $allowed = getAllowedLinuxUsers();
    $linuxUser = $allowed[0] ?? 'melvin';
}

// Guardar en sesión
$_SESSION['current_linux_user'] = $linuxUser;

try {
    $cronManager = new CronManager($linuxUser);
} catch (Exception $e) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'list':
        echo json_encode($cronManager->listJobs()['data']);
        break;
        
    case 'add':
        $data = json_decode($_POST['data'], true);
        $result = $cronManager->addJob($data);
        echo json_encode($result);
        break;
        
    case 'toggle':
        $index = (int)$_POST['index'];
        $result = $cronManager->toggleJob($index);
        echo json_encode($result);
        break;
        
    case 'edit':
        $index = (int)$_POST['index'];
        $data = json_decode($_POST['data'], true);
        $result = $cronManager->editJob($index, $data);
        echo json_encode($result);
        break;
        
    case 'delete':
        $index = (int)$_POST['index'];
        $result = $cronManager->deleteJob($index);
        echo json_encode($result);
        break;
        
    case 'run':
        $index = (int)$_POST['index'];
        $result = $cronManager->runJob($index);
        echo json_encode($result);
        break;
        
    case 'logs':
        $result = $cronManager->getLogs();
        echo json_encode($result);
        break;
        
    case 'clear_logs':
        $result = $cronManager->clearLogs();
        echo json_encode($result);
        break;
        
    case 'export':
        $jobs = $cronManager->loadJobs();
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="cron_backup.json"');
        echo json_encode($jobs, JSON_PRETTY_PRINT);
        break;
        
    case 'import':
        $data = json_decode($_POST['data'], true);
        $result = $cronManager->importJobs($data);
        echo json_encode($result);
        break;
        
    case 'crontab':
        // Obtener crontab con información de ejecución
        $jobs = $cronManager->loadJobs();
        $cronLines = [];
        
        $cronLines[] = "# Amatores Cron Manager - Tareas generadas automáticamente";
        $cronLines[] = "# Usuario Linux: " . $linuxUser;
        $cronLines[] = "";
        
        foreach ($jobs as $job) {
            if ($job['enabled']) {
                $line = $job['schedule'] . " " . $job['command'];
                
                // Agregar información de ejecución
                if (isset($job['last_execution'])) {
                    $status = $job['last_status'] ?? 'pending';
                    $statusIcon = $status === 'success' ? '✅' : ($status === 'error' ? '❌' : '⏳');
                    $line .= " # " . ($job['description'] ?: 'Sin descripción');
                    $line .= " | Última ejecución: " . $job['last_execution'] . " " . $statusIcon;
                } else {
                    $line .= " # " . ($job['description'] ?: 'Sin descripción') . " | ⏳ Nunca ejecutada";
                }
                
                $cronLines[] = $line;
            }
        }
        
        if (count($cronLines) <= 3) {
            echo 'No hay tareas en el crontab';
        } else {
            echo implode("\n", $cronLines);
        }
        break;
    
    case 'get_linux_users':
        // Obtener usuarios Linux permitidos para el usuario web actual
        echo json_encode([
            'success' => true,
            'users' => getAllowedLinuxUsers(),
            'current' => $linuxUser
        ]);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}
?>