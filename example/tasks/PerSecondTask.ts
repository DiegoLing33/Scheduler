import { Scheduled, ScheduledTask } from '../../src'

@Scheduled('*/2 * * * * *', { fixedTimeout: 500 })
export class PerSecondTask implements ScheduledTask {
  public isCancel = false
  execute(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        if (this.isCancel) return

        console.log(500)
        resolve()
      }, 3000)
    })
  }

  onCancel() {
    this.isCancel = true
  }
}
