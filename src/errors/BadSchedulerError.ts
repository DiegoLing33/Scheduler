export class BadSchedulerError extends Error {
  constructor(name: string) {
    super(`Scheduler <${name}> has not cron expression!`)
  }
}
