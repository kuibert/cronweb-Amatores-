<?php
/**
 * Amatores Cron Manager - Backend PHP
 * Gestiona las operaciones de crontab
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

class CronManager {
    private $cronFile;
    
    public function __construct() {
        // Archivo temporal para almacenar las tareas cron
        $this->cronFile = __DIR__ . '/cron_jobs.json';
        
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
            
            return ['success' => true, 'message' => 'Estado actualizado'];
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
            
            $this->saveJobs($jobs);
            
            // Actualizar crontab real
            $this->updateSystemCrontab();
            
            return ['success' => true, 'message' => 'Tarea actualizada exitosamente'];
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
            
            // Ejecutar comando
            exec($command . ' 2>&1', $output, $returnCode);
            
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
        $logFile = __DIR__ . '/execution_logs.json';
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
        $logFile = __DIR__ . '/execution_logs.json';
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
        $logFile = __DIR__ . '/execution_logs.json';
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
        
        foreach ($jobs as $job) {
            if ($job['enabled']) {
                $comment = !empty($job['description']) ? " # " . $job['description'] : "";
                $cronContent .= $job['schedule'] . " " . $job['command'] . $comment . "\n";
            }
        }
        
        // Guardar en archivo temporal
        $tempFile = tempnam(sys_get_temp_dir(), 'cron');
        file_put_contents($tempFile, $cronContent);
        
        // Aplicar al crontab real en Linux
        if (PHP_OS_FAMILY === 'Linux') {
            exec("crontab $tempFile 2>&1", $output, $returnCode);
            if ($returnCode !== 0) {
                error_log("Error updating crontab: " . implode("\n", $output));
            }
        }
        
        unlink($tempFile);
        
        // Guardar copia para visualización
        file_put_contents(__DIR__ . '/current_crontab.txt', $cronContent);
    }
}

// Procesar la solicitud
$cronManager = new CronManager();
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
        // Obtener crontab real en Linux
        if (PHP_OS_FAMILY === 'Linux') {
            exec('crontab -l 2>/dev/null', $output, $returnCode);
            if ($returnCode === 0) {
                echo implode("\n", $output);
            } else {
                echo 'No hay tareas en el crontab';
            }
        } else {
            // Fallback para desarrollo
            $content = file_get_contents(__DIR__ . '/current_crontab.txt');
            echo $content ?: 'No hay tareas en el crontab';
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}
?>