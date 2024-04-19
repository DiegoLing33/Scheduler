export interface ScheduledTask {
  execute(): Promise<void>
  onCancel?(): void
}
