import { AsyncValue, Schema } from 'maui-core'

export namespace Greeting {
  export interface v1 extends Schema<'greeting@1'> {
    message: AsyncValue<string | undefined>
  }
}
