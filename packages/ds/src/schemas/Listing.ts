import { AsyncValue, Schema, Value } from 'maui-core'

export interface Column {
  name: Value<string>
  label: Value<string>
  cell?: Value<string>
}

export namespace Listing {
  export interface v1 extends Schema<'listing@1'> {
    items: AsyncValue<Record<string, any>[]>
    columns: Column[]
  }
}
