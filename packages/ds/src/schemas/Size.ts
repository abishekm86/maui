import { AsyncValue, Schema } from 'maui-core'

export namespace Size {
  export interface v1 extends Schema<'size@1'> {
    size: AsyncValue<number>
  }
}
