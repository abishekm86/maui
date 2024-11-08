import { Color, Size } from 'ds'
import { Config, asyncEffect, conditionalComputed, defaultAsync, ConfigRegistry } from 'maui-core'
import { signal } from '@preact/signals'

const Blue: Config<Color.v1> = {
  schema: 'color@1',
  configFn: () => ({
    color: '#3333aa',
    colorText: 'Blue',
  }),
}

const Grey: Config<Color.v2> = {
  schema: 'color@2',
  configFn: () => ({}),
}

const Red: Config<Color.v2> = {
  schema: 'color@2',
  configFn: () => ({
    theme: {
      color: '#aa3333',
      colorText: () => 'red',
    },
    heading: () => 'my color',
  }),
}

const FortyTwo: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => ({
    size: () => defaultAsync(42),
  }),
}

const Numbers: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => {
    const num = signal(1)
    // effect(() => console.log(num.value))
    // TODO: suspendable trigger
    setInterval(() => {
      num.value++
    }, 1000)

    return {
      size: () => defaultAsync(num.value),
    }
  },
}

const Evens: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => {
    const num = signal(1)

    const evens = conditionalComputed(num, n => n % 2 === 0)

    // TODO: suspendable trigger
    setInterval(() => {
      num.value++
    }, 500)

    return {
      size: () => defaultAsync(evens.value),
    }
  },
}

const Squares: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => {
    const num = signal(1)

    const square = asyncEffect(num, n => {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(n ** 2)
        }, 1000)
      })
    })

    // TODO: suspendable trigger
    setInterval(() => {
      num.value++
    }, 2000)

    return {
      size: square,
    }
  },
}

export const configRegistry: ConfigRegistry = {
  blue: Blue,
  grey: Grey,
  red: Red,
  fortyTwo: FortyTwo,
  numbers: Numbers,
  evens: Evens,
  squares: Squares,
}
