import { ScheduledMetadataKey } from './ScheduledMetadataKey'
import { ScheduledTask } from '../interfaces'
import 'reflect-metadata'

export interface ScheduledMetaDataType {
  cronExpression: string
  fixedTimeout?: number
}

export class ScheduledMetaData {
  public static getData(value: ScheduledTask): ScheduledMetaDataType {
    return {
      cronExpression: Reflect.getMetadata(ScheduledMetadataKey.cronExpression, value.constructor),
      fixedTimeout: Reflect.getMetadata(ScheduledMetadataKey.cronFixedTimeout, value.constructor),
    }
  }
}
