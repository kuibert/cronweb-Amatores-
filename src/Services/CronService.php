<?php
/**
 * Servicio principal de gestión de tareas cron
 */

namespace CronWeb\Services;

use CronWeb\Models\CronJob;
use CronWeb\Models\CronValidator;
use CronWeb\Models\CronExecutor;

class CronService {
    
    private $cronFile;
    private $linuxUser;
    private $config;
    private $executor;
    private $logService;
    
    public function __construct(string $linuxUser, array $config) {
        $this->linuxUser = $linuxUser;
        $this->config = $config;
        
        $pattern = $config['files']['cron_jobs_pattern'];
        $filename = str_replace('{user}', $linuxUser, $pattern);
        $this->cronFile = $config['paths']['data'] . '/' . $filename;
        
        if (!file_exists($this->cronFile)) {
            file_put_contents($this->cronFile, json_encode([]));
        }
        
        $this->executor = new CronExecutor($linuxUser, $config);
        $this->logService = new LogService($linuxUser, $config);
    }
    
    public function getAllJobs(): array {
        $content = file_get_contents($this->cronFile);
        $jobsData = json_decode($content, true) ?: [];
        
        return array_map(function($data) {
            return new CronJob($data);
        }, $jobsData);
    }
    
    public function getJob(int $index): ?CronJob {
        $jobs = $this->getAllJobs();
        return $jobs[$index] ?? null;
    }
    
    public function addJob(array $data): void {
        if (empty($data['command'])) {
            throw new \Exception('El comando es requerido');
        }
        
        $validated = CronValidator::validateSchedule($data);
        $schedule = CronValidator::scheduleToString($validated);
        
        $job = new CronJob([
            'command' => trim($data['command']),
            'description' => trim($data['description'] ?? ''),
            'schedule' => $schedule,
            'enabled' => true
        ]);
        
        $jobs = $this->getAllJobs();
        $jobs[] = $job;
        $this->saveJobs($jobs);
        $this->executor->updateSystemCrontab($jobs);
    }
    
    public function updateJob(int $index, array $data): void {
        $jobs = $this->getAllJobs();
        
        if (!isset($jobs[$index])) {
            throw new \Exception('Tarea no encontrada');
        }
        
        $validated = CronValidator::validateSchedule($data);
        $schedule = CronValidator::scheduleToString($validated);
        
        $jobs[$index]->setCommand($data['command']);
        $jobs[$index]->setDescription($data['description'] ?? '');
        $jobs[$index]->setSchedule($schedule);
        $jobs[$index]->setUpdatedAt(date('Y-m-d H:i:s'));
        
        $this->saveJobs($jobs);
        $this->executor->updateSystemCrontab($jobs);
    }
    
    public function toggleJob(int $index): void {
        $jobs = $this->getAllJobs();
        
        if (!isset($jobs[$index])) {
            throw new \Exception('Tarea no encontrada');
        }
        
        $jobs[$index]->toggle();
        $this->saveJobs($jobs);
        $this->executor->updateSystemCrontab($jobs);
    }
    
    public function deleteJob(int $index): void {
        $jobs = $this->getAllJobs();
        
        if (!isset($jobs[$index])) {
            throw new \Exception('Tarea no encontrada');
        }
        
        array_splice($jobs, $index, 1);
        $this->saveJobs($jobs);
        $this->executor->updateSystemCrontab($jobs);
    }
    
    public function executeJob(int $index): array {
        $jobs = $this->getAllJobs();
        
        if (!isset($jobs[$index])) {
            throw new \Exception('Tarea no encontrada');
        }
        
        $job = $jobs[$index];
        $result = $this->executor->execute($job->getCommand());
        
        // Actualizar última ejecución
        $job->setLastExecution(date('Y-m-d H:i:s'));
        $job->setLastStatus($result['success'] ? 'success' : 'error');
        $jobs[$index] = $job;
        $this->saveJobs($jobs);
        
        // Guardar log
        $this->logService->addLog(
            $job->getCommand(),
            $result['success'] ? 'success' : 'error',
            $result['output']
        );
        
        return $result;
    }
    
    public function importJobs(array $importedJobs): void {
        $currentJobs = $this->getAllJobs();
        
        foreach ($importedJobs as $jobData) {
            if (!isset($jobData['command']) || !isset($jobData['schedule'])) {
                continue;
            }
            
            $jobData['id'] = uniqid();
            $jobData['created_at'] = date('Y-m-d H:i:s');
            $jobData['imported'] = true;
            
            $currentJobs[] = new CronJob($jobData);
        }
        
        $this->saveJobs($currentJobs);
        $this->executor->updateSystemCrontab($currentJobs);
    }
    
    private function saveJobs(array $jobs): void {
        $jobsData = array_map(function($job) {
            return $job->toArray();
        }, $jobs);
        
        file_put_contents($this->cronFile, json_encode($jobsData, JSON_PRETTY_PRINT));
    }
    
    public function getLogService(): LogService {
        return $this->logService;
    }
}
