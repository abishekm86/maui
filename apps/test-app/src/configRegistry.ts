import { Color, Size } from 'ds'
import { BaseConfig, Config, asyncEffect, conditionalComputed, defaultAsync } from 'maui-core'
import { effect, signal } from '@preact/signals'

// TODO: enforce build time check to prevent duplicate config ids
const Blue: Config<Color.v1> = {
  schema: 'color@1',
  configFn: () => ({
    color: '#3333aa',
    colorText: 'Blue',
  }),
}

const Green: Config<Color.v2> = {
  schema: 'color@2',
  configFn: () => ({
    theme: {
      color: '#33aa33',
      colorText: () => 'green',
    },
  }),
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
    effect(() => console.log(num.value))
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
    }, 1000)

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
        }, 500)
      })
    })

    // TODO: suspendable trigger
    setInterval(() => {
      num.value++
    }, 1000)

    return {
      size: square,
    }
  },
}

export const configRegistry: Record<string, BaseConfig> = {
  blue: Blue,
  green: Green,
  red: Red,
  fortyTwo: FortyTwo,
  numbers: Numbers,
  evens: Evens,
  squares: Squares,
}
