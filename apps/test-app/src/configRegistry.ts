import { Color, Listing, Size } from 'ds'
import {
  $,
  $action,
  $async,
  $asyncAction,
  $if,
  $invoke,
  $updater,
  Config,
  ConfigRegistry,
  defaultResult,
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
    const trigger = $updater(() => setNum(num.value + 1))
    $invoke(trigger, { interval: 1000 })

    $action(() => console.log(num.value))
    const asyncNum = $async(num)

    return {
      size: asyncNum,
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
    const trigger = $updater(() => setNum(num.value + 1))
    $invoke(trigger, { interval: 1000 })

    const filtered = $if(() => num.value % 2 === 0, num) // alias for { $then: () => num.value, $else: prev => prev, initialValue: num.value }
    // const filtered = $if(() => num.value % 2 === 0, {
    //   initialValue: 0,
    //   $then: () => num.value,
    //   $else: () => -num.value,
    // })
    const [result] = $asyncAction(() => someAsyncComputation(filtered.value))

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

    const [queryParam, setQueryParam] = $('minutes')
    const queryParamTrigger = $updater(() =>
      queryParam.value === 'minutes' ? setQueryParam('seconds') : setQueryParam('minutes'),
    )
    $invoke(queryParamTrigger, { interval: 4500 })
    const [result, apiTrigger] = $asyncAction(() => getDateFromAsyncApi(queryParam.value))
    $invoke(apiTrigger, { interval: 1000 })

    return {
      size: result,
    }
  },
}

const ListingExample: Config<Listing.v1> = {
  schema: 'listing@1',
  configFn: () => {
    type Api = { id: number; name: string; value: number }

    const mockApi = (() => {
      const items: Api[] = []
      let firstRun = true

      return {
        list: async () =>
          new Promise<Api[]>(resolve => {
            setTimeout(() => {
              if (!firstRun) {
                for (let i = 0; i < 100; i++) {
                  const newItem = {
                    id: items.length + 1,
                    name: `Item ${items.length + 1}`,
                    value: Math.floor(Math.random() * 1000),
                  }
                  items.push(newItem)
                }
              }
              firstRun = false
              resolve(JSON.parse(JSON.stringify([...items])))
            }, 500)
          }),
      }
    })()

    const [result, apiTrigger] = $asyncAction(() => mockApi.list())
    const stop = $invoke(apiTrigger, { interval: 1000 })
    $invoke(stop, { delay: 5000 })

    return {
      items: result,
      columns: () => ['id', 'name', 'value'],
    }
  },
}

const ListingExample2: Config<Listing.v1> = {
  schema: 'listing@1',
  configFn: () => {
    type Api = { id: number; name: string; data: number }

    const mockApi = (() => {
      const items: Api[] = []
      let firstRun = true

      return {
        list: async () =>
          new Promise<Api[]>(resolve => {
            setTimeout(() => {
              if (!firstRun) {
                for (let i = 0; i < 10; i++) {
                  const newItem = {
                    id: items.length + 1,
                    name: `Cell ${items.length + 1}`,
                    data: Math.floor(Math.random() * 1000),
                  }
                  items.push(newItem)
                }
              }
              firstRun = false
              resolve(JSON.parse(JSON.stringify([...items])))
            }, 500)
          }),
      }
    })()

    const [result, apiTrigger] = $asyncAction(() => mockApi.list())
    const stop = $invoke(apiTrigger, { interval: 1000 })
    $invoke(stop, { delay: 5000 })

    return {
      items: result,
      columns: () => ['id', 'name', 'data'],
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
  list: ListingExample,
  list2: ListingExample2,
}
