export class TimeOutError extends Error {
  public constructor(timeout: number) {
    super(`Scheduled job is out of date (${timeout}ms break)`)
    this.name = 'TimeOutError'
  }
}
