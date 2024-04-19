import 'reflect-metadata'
import { ScheduledComponentToken, ScheduledMetadataKey } from '../context'
import { MFC } from 'metafoks-application'

export interface ScheduledProps {
  fixedTimeout?: number
}
export function Scheduled(cron: string, props?: ScheduledProps): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(ScheduledMetadataKey.cronExpression, cron, target)
    Reflect.defineMetadata(ScheduledMetadataKey.cronFixedTimeout, props?.fixedTimeout, target)
    MFC.CreateComponent({ token: ScheduledComponentToken, multiple: true })(target)
  }
}
