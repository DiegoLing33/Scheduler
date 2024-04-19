import { Application, Configure, With } from 'metafoks-application'
import { Scheduler } from '../src'

@Configure({
  scanner: {
    glob: ['./example/**/*.ts'],
    loggerLevel: 'trace',
  },
  logger: {
    fileWritingEnabled: false,
    defaultLevel: 'trace',
  },
  container: {
    loggerLevel: 'trace',
  },
})
@With(Scheduler.extension)
@Application
export class App {}
