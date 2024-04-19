import { ExtensionFactory, LoggerFactory } from 'metafoks-application'
import { ScheduledComponentToken } from '../context'
import { ScheduledTask } from '../interfaces'
import { BadSchedulerError } from '../errors'
import { SchedulerConfig } from '../configuration'
import cron from 'node-cron'
import { promiseWithTimeout } from '../utils/createAsyncTask'
import { ScheduledMetaData } from '../context/ScheduledMetaData'

export class Scheduler {
  public static readonly DEFAULT_FIXED_TIMEOUT = 10_000

  public static extension = ExtensionFactory.create<SchedulerConfig>({
    configProperty: 'scheduler',
    identifier: 'org.metafoks.scheduler',
    install: (app, config) => {
      const configFixedTimeout = config.defaultFixedTimeout ?? Scheduler.DEFAULT_FIXED_TIMEOUT

      const schedulers = app.container.getAll<ScheduledTask>(ScheduledComponentToken).map(value => {
        const meta = ScheduledMetaData.getData(value)
        if (!meta.cronExpression || !cron.validate(meta.cronExpression))
          throw new BadSchedulerError(value.constructor.name)

        return {
          cronExpression: meta.cronExpression,
          cronFixedTimeout: meta.fixedTimeout ?? configFixedTimeout,
          target: value,
        }
      })
      app.container.set('Scheduler', new Scheduler(config, schedulers))
    },
    autorun: app => {
      app.container.getClassFirst(Scheduler).start()
    },
    close: app => {
      app.container.getClassFirst(Scheduler).stop()
    },
  })

  private readonly _logger = LoggerFactory.create(Scheduler)

  public constructor(
    private _config: SchedulerConfig,
    private _schedulers: { cronExpression: string; cronFixedTimeout: number; target: ScheduledTask }[],
  ) {}

  private readonly _tasks = new Map<string, { isRunning: boolean }>()

  private _setTaskRunning(taskId: string, isRunning: boolean) {
    this._tasks.set(taskId, { isRunning })
  }

  public start() {
    if (this._config.enabled === false) {
      this._logger.warn('scheduler is disabled in the configuration: config.scheduler.enabled = false')
      return
    }

    this._logger.info('starting scheduler')

    for (const { cronExpression, target, cronFixedTimeout } of this._schedulers) {
      this._logger.debug(`registering job <${target.constructor.name}> with cron <${cron}>`)
      if (!('execute' in target)) throw new Error('Scheduled job must have an execute method')

      const taskId = `Task@${target.constructor.name}`

      cron.schedule(
        cronExpression,
        () => {
          if (this._tasks.has(taskId) && this._tasks.get(taskId)?.isRunning) {
            this._logger.warn(`confict! task <${taskId}> is already running`)
            return
          }

          this._logger.debug(`executing task <${taskId}>`)
          const timerStart = Date.now()

          this._setTaskRunning(taskId, true)
          promiseWithTimeout(target.execute(), cronFixedTimeout, () => {
            target.onCancel?.()
          })
            .then(() => {
              const timerEnd = Date.now()
              this._logger.debug(`task <${taskId}> executed in ${(timerEnd - timerStart) / 1000}s`)
            })
            .catch(reason => {
              this._logger.warn(`task <${taskId}> exit, reason: ${reason}`)
            })
            .finally(() => {
              this._setTaskRunning(taskId, false)
            })
        },
        {},
      )

      this._logger.info(`registered job <${target.constructor.name}> with cron <${cron}>`)
    }
  }

  public stop() {
    cron.getTasks().clear()
  }
}
