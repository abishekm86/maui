import { Color, Size } from 'ds'
import {
  Config,
  ConfigRegistry,
  $action,
  $filter,
  $,
  $invoke,
  defaultResult,
  $async,
} from 'maui-core'

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
    const [userColor] = $('#aa3333')
    const getColorText = (color: string) => (color === '#aa3333' ? () => 'red' : '-')

    return {
      theme: {
        color: userColor,
        colorText: getColorText(userColor.value),
      },
      heading: 'My color',
    }
  },
}

const FortyTwo: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => ({
    size: {
      result: () => defaultResult(42),
    },
  }),
}

const Numbers: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => {
    const [num, setNum] = $(1)
    const result = $async(num)
    $action(n => console.log(n), [num])
    // TODO: suspendable trigger
    setInterval(() => {
      setNum(num.value + 1)
    }, 1000)

    return {
      size: result,
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

    const [num, setNum] = $(1)
    const filtered = $filter(n => n % 2 === 0, num)
    const [result] = $action(f => someAsyncComputation(f), [filtered])

    setInterval(() => {
      setNum(num.value + 1)
    }, 1000)

    return {
      size: result,
    }
  },
}

const Now: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => {
    const getDateFromAsyncApi = (show: string) =>
      new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(
            show === 'seconds'
              ? new Date().getSeconds()
              : show === 'minutes'
                ? new Date().getMinutes()
                : Date.now(),
          )
        }, 500)
      })

    const [param] = $('minutes')
    const [result, trigger] = $action(s => getDateFromAsyncApi(s), [param])

    $invoke(trigger, 1000)

    return {
      size: result,
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
  now: Now,
}
