import { Schema } from 'maui-core'

export namespace Info {
  export interface v1 extends Schema<'info@1'> {
    message: string
  }
}
