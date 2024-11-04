import { Color, Size } from 'ds'
import { Config, asyncComputed, defaultAsync } from 'maui-core'
import { signal } from '@preact/signals'

const num = signal(1)

const square = asyncComputed(num, n => {
  return new Promise<number>(resolve => {
    setTimeout(() => {
      console.log('Processing')
      resolve(n ** 2)
    }, 1000)
  })
})

const double = asyncComputed(num, n => {
  return new Promise<number>(resolve => {
    setTimeout(() => {
      resolve(n * 2)
    }, 1000)
  })
})

setInterval(() => {
  num.value++
}, 2000)

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

export const configList = [Blue, Green, FortyTwo, Numbers, Doubles, Squares]
