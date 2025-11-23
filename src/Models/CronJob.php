<?php
/**
 * Modelo CronJob - Representa una tarea cron
 */

namespace CronWeb\Models;

class CronJob {
    private $id;
    private $command;
    private $description;
    private $schedule;
    private $enabled;
    private $createdAt;
    private $updatedAt;
    private $lastExecution;
    private $lastStatus;
    
    public function __construct(array $data = []) {
        $this->id = $data['id'] ?? uniqid();
        $this->command = $data['command'] ?? '';
        $this->description = $data['description'] ?? '';
        $this->schedule = $data['schedule'] ?? '* * * * *';
        $this->enabled = $data['enabled'] ?? true;
        $this->createdAt = $data['created_at'] ?? date('Y-m-d H:i:s');
        $this->updatedAt = $data['updated_at'] ?? null;
        $this->lastExecution = $data['last_execution'] ?? null;
        $this->lastStatus = $data['last_status'] ?? null;
    }
    
    public function toArray(): array {
        return [
            'id' => $this->id,
            'command' => $this->command,
            'description' => $this->description,
            'schedule' => $this->schedule,
            'enabled' => $this->enabled,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
            'last_execution' => $this->lastExecution,
            'last_status' => $this->lastStatus
        ];
    }
    
    // Getters
    public function getId(): string { return $this->id; }
    public function getCommand(): string { return $this->command; }
    public function getDescription(): string { return $this->description; }
    public function getSchedule(): string { return $this->schedule; }
    public function isEnabled(): bool { return $this->enabled; }
    public function getCreatedAt(): string { return $this->createdAt; }
    public function getUpdatedAt(): ?string { return $this->updatedAt; }
    public function getLastExecution(): ?string { return $this->lastExecution; }
    public function getLastStatus(): ?string { return $this->lastStatus; }
    
    // Setters
    public function setCommand(string $command): void { $this->command = $command; }
    public function setDescription(string $description): void { $this->description = $description; }
    public function setSchedule(string $schedule): void { $this->schedule = $schedule; }
    public function setEnabled(bool $enabled): void { $this->enabled = $enabled; }
    public function setUpdatedAt(string $updatedAt): void { $this->updatedAt = $updatedAt; }
    public function setLastExecution(string $lastExecution): void { $this->lastExecution = $lastExecution; }
    public function setLastStatus(string $lastStatus): void { $this->lastStatus = $lastStatus; }
    
    public function toggle(): void {
        $this->enabled = !$this->enabled;
    }
}
