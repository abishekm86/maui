import { Schema, Value } from 'maui-core'

export namespace Color {
  export interface v1 extends Schema<'color@1'> {
    color: string // Color value in RGB or HEX
    colorText: string // Color description (e.g., "blue")
  }

  export interface v2 extends Schema<'color@2'> {
    theme?: {
      color: Value<string>
      colorText: Value<string>
    }
    heading?: Value<{ text: string }>
  }
}
