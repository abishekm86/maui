import { AsyncValue, Schema, Value } from 'maui-core'

export namespace Listing {
  export interface v1 extends Schema<'listing@1'> {
    items: AsyncValue<Record<string, any>[]>
    columns: Value<string[]>
  }
}
