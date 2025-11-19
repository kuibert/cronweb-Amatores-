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
            
            $newJob = [
                'id' => uniqid(),
                'command' => $data['command'],
                'description' => $data['description'] ?? '',
                'schedule' => sprintf('%s %s %s %s %s', 
                    $data['minute'], 
                    $data['hour'], 
                    $data['day'], 
                    $data['month'], 
                    $data['weekday']
                ),
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
    
    private function loadJobs() {
        $content = file_get_contents($this->cronFile);
        return json_decode($content, true) ?: [];
    }
    
    private function saveJobs($jobs) {
        file_put_contents($this->cronFile, json_encode($jobs, JSON_PRETTY_PRINT));
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
        
    case 'delete':
        $index = (int)$_POST['index'];
        $result = $cronManager->deleteJob($index);
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