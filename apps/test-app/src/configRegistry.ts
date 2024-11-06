import { Color, Size } from 'ds'
import { Config, asyncEffect, conditionalComputed, defaultAsync } from 'maui-core'
import { signal } from '@preact/signals'

const num = signal(1)

const square = asyncEffect(num, n => {
  return new Promise<number>(resolve => {
    setTimeout(() => {
      resolve(n ** 2)
    }, 500)
  })
})

const filter = conditionalComputed(num, n => n % 2 === 0)

const double = asyncEffect(filter, n => {
  return new Promise<number>(resolve => {
    setTimeout(() => {
      resolve(n * 2)
    }, 500)
  })
})

// TODO: suspendable trigger
setInterval(() => {
  num.value++
}, 1000)

// TODO: enforce build time check to prevent duplicate config ids
const Blue: Config<Color.v1> = {
  id: 'blue',
  schema: 'color@1',
  color: '#3333aa',
  colorText: 'Blue',
}

const Green: Config<Color.v2> = {
  id: 'green',
  schema: 'color@2',
  theme: {
    color: '#33aa33',
    colorText: () => 'green',
  },
}

const Red: Config<Color.v2> = {
  id: 'red',
  schema: 'color@2',
  theme: {
    color: '#aa3333',
    colorText: () => 'red',
  },
  heading: () => 'my color',
}

const FortyTwo: Config<Size.v1> = {
  id: 'fortytwo',
  schema: 'size@1',
  size: () => defaultAsync(42),
}

const Numbers: Config<Size.v1> = {
  id: 'number',
  schema: 'size@1',
  size: () => defaultAsync(num.value),
}

const Doubles: Config<Size.v1> = {
  id: 'double',
  schema: 'size@1',
  size: () => double.value,
}

const Squares: Config<Size.v1> = {
  id: 'square',
  schema: 'size@1',
  size: square,
}

export const configList = [Blue, Green, Red, FortyTwo, Numbers, Doubles, Squares]
