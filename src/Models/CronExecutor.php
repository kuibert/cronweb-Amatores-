<?php
/**
 * Ejecutor de comandos cron
 */

namespace CronWeb\Models;

class CronExecutor {
    
    private $linuxUser;
    private $config;
    
    public function __construct(string $linuxUser, array $config) {
        $this->linuxUser = $linuxUser;
        $this->config = $config;
    }
    
    public function execute(string $command): array {
        $wrapperPath = str_replace('{user}', $this->linuxUser, $this->config['cron']['wrapper_script']);
        
        if (file_exists($wrapperPath)) {
            $fullCommand = sprintf(
                'sudo -u %s %s %s 2>&1',
                escapeshellarg($this->linuxUser),
                escapeshellarg($wrapperPath),
                escapeshellarg($command)
            );
        } else {
            $fullCommand = sprintf(
                'sudo -u %s bash -c %s 2>&1',
                escapeshellarg($this->linuxUser),
                escapeshellarg($command)
            );
        }
        
        exec($fullCommand, $output, $returnCode);
        
        return [
            'success' => $returnCode === 0,
            'output' => implode("\n", $output),
            'return_code' => $returnCode
        ];
    }
    
    public function updateSystemCrontab(array $jobs): bool {
        $cronContent = $this->generateCrontabContent($jobs);
        
        $tempFile = tempnam($this->config['paths']['temp'], 'cron');
        file_put_contents($tempFile, $cronContent);
        chmod($tempFile, 0644);
        
        $command = sprintf(
            'sudo -u %s crontab %s 2>&1',
            escapeshellarg($this->linuxUser),
            escapeshellarg($tempFile)
        );
        
        exec($command, $output, $returnCode);
        unlink($tempFile);
        
        if ($returnCode !== 0) {
            error_log("Error updating crontab for {$this->linuxUser}: " . implode("\n", $output));
            return false;
        }
        
        return true;
    }
    
    private function generateCrontabContent(array $jobs): string {
        $lines = [
            "# Amatores Cron Manager - Tareas generadas automáticamente",
            "# Usuario: {$this->linuxUser}",
            ""
        ];
        
        foreach ($jobs as $job) {
            if ($job instanceof CronJob && $job->isEnabled()) {
                $wrapperPath = str_replace('{user}', $this->linuxUser, $this->config['cron']['wrapper_script']);
                $comment = $job->getDescription() ? " # " . $job->getDescription() : "";
                $lines[] = $job->getSchedule() . " " . $wrapperPath . " '" . $job->getCommand() . "'" . $comment;
            }
        }
        
        return implode("\n", $lines) . "\n";
    }
}
