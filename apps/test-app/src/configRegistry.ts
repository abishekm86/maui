import { Color, Size } from 'ds'
import { Config, asyncEffect, conditionalComputed, ConfigRegistry } from 'maui-core'
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

  configFn: () => {
    const user = signal('abishek')
    const userColor = signal('#aa3333')
    const getColorText = (color: string) => (color === '#aa3333' ? () => 'red' : '-')

    return {
      theme: {
        color: userColor,
        colorText: getColorText(userColor.value),
      },
      heading: () => `${user.value}'s color`,
    }
  },
}

const FortyTwo: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => ({
    size: () => ({ value: 42 }),
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
      size: () => ({ value: num.value }),
    }
  },
}

const Squares: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => {
    const someAsyncComputation = (n: number) =>
      new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(n ** 2)
        }, 500)
      })

    const num = signal(1)
    const filter = conditionalComputed(num, n => n % 2 === 0)
    const square = asyncEffect(filter, n => someAsyncComputation(n))

    // TODO: suspendable trigger
    setInterval(() => {
      num.value++
    }, 1000)

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
  squares: Squares,
}
