<?php
/**
 * Controlador de tareas cron
 */

namespace CronWeb\Controllers;

use CronWeb\Services\CronService;

class CronController {
    
    private $cronService;
    private $linuxUser;
    
    public function __construct(string $linuxUser, array $config) {
        $this->linuxUser = $linuxUser;
        $this->cronService = new CronService($linuxUser, $config);
    }
    
    public function list(): array {
        $jobs = $this->cronService->getAllJobs();
        return array_map(function($job) {
            return $job->toArray();
        }, $jobs);
    }
    
    public function add(array $data): array {
        try {
            $this->cronService->addJob($data);
            return ['success' => true, 'message' => 'Tarea creada exitosamente'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function edit(int $index, array $data): array {
        try {
            $this->cronService->updateJob($index, $data);
            return ['success' => true, 'message' => 'Tarea actualizada exitosamente'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function toggle(int $index): array {
        try {
            $this->cronService->toggleJob($index);
            $job = $this->cronService->getJob($index);
            $message = $job->isEnabled() ? 'Tarea habilitada' : 'Tarea deshabilitada';
            return ['success' => true, 'message' => $message];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function delete(int $index): array {
        try {
            $this->cronService->deleteJob($index);
            return ['success' => true, 'message' => 'Tarea eliminada'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function run(int $index): array {
        try {
            return $this->cronService->executeJob($index);
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function export(): array {
        $jobs = $this->cronService->getAllJobs();
        return array_map(function($job) {
            return $job->toArray();
        }, $jobs);
    }
    
    public function import(array $data): array {
        try {
            $this->cronService->importJobs($data);
            return ['success' => true, 'message' => 'Tareas importadas exitosamente'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function getLogs(): array {
        return $this->cronService->getLogService()->getLogs();
    }
    
    public function clearLogs(): array {
        try {
            $this->cronService->getLogService()->clearLogs();
            return ['success' => true, 'message' => 'Logs limpiados'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function getCrontab(): string {
        $jobs = $this->cronService->getAllJobs();
        
        if (empty($jobs)) {
            return 'No hay tareas en el crontab';
        }
        
        $lines = [
            "# Amatores Cron Manager - Tareas generadas automáticamente",
            "# Usuario Linux: {$this->linuxUser}",
            ""
        ];
        
        foreach ($jobs as $job) {
            if ($job->isEnabled()) {
                $line = $job->getSchedule() . " " . $job->getCommand();
                
                if ($job->getLastExecution()) {
                    $status = $job->getLastStatus() ?? 'pending';
                    $statusIcon = $status === 'success' ? '✅' : ($status === 'error' ? '❌' : '⏳');
                    $line .= " # " . ($job->getDescription() ?: 'Sin descripción');
                    $line .= " | Última ejecución: " . $job->getLastExecution() . " " . $statusIcon;
                } else {
                    $line .= " # " . ($job->getDescription() ?: 'Sin descripción') . " | ⏳ Nunca ejecutada";
                }
                
                $lines[] = $line;
            }
        }
        
        return implode("\n", $lines);
    }
}
