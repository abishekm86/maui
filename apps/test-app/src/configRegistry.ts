import { Color, Listing, Size } from 'ds'
import {
  $asAsync,
  $asyncEffect,
  $effect,
  $if,
  $invoke,
  $mutate,
  $state,
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
    const [userColor] = $state('#aa3333')
    const getColorText = (color: string) => (color === '#aa3333' ? () => 'red' : '-')

    return {
      theme: {
        color: userColor,
        colorText: getColorText(userColor()),
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
    const [num, setNum] = $state(0)
    $effect(() => console.log(num()))
    const trigger = $mutate(() => setNum(num() + 1))
    $invoke(trigger, { interval: 1000 })

    return {
      size: $asAsync(num),
    }
  },
}

const EvenSquares: Config<Size.v1> = {
  schema: 'size@1',
  configFn: () => {
    const someAsyncComputation = (n: number) =>
      new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(n ** 2)
        }, 500)
      })

    const [num, setNum] = $state(1)
    const trigger = $mutate(() => setNum(num() + 1))
    $invoke(trigger, { interval: 1000 })

    const filtered = $if(() => num() % 2 === 0, num)
    // const filtered = $if(() => num() % 2 === 0, {
    //   initialValue: num(),
    //   $then: () => num(),
    //   $else: prev => prev,
    // })
    const [result] = $asyncEffect(() => someAsyncComputation(filtered()))

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

    const [queryParam, setQueryParam] = $state('minutes')
    const simulatedUserAction = $mutate(() =>
      queryParam() === 'minutes' ? setQueryParam('seconds') : setQueryParam('minutes'),
    )
    $invoke(simulatedUserAction, { interval: 6000 })
    const [response, apiTrigger] = $asyncEffect(() => getDateFromAsyncApi(queryParam()))
    $invoke(apiTrigger, { interval: 1000 })
    return {
      size: response,
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

    const [response, apiTrigger] = $asyncEffect(() => mockApi.list())
    const stop = $invoke(apiTrigger, { interval: 1000 })
    $invoke(stop, { delay: 5000 })

    return {
      items: response,
      columns: [
        { name: 'id', label: 'ID', cell: 'Foo' },
        { name: 'name', label: 'Name' },
        { name: 'value', label: 'Value' },
      ],
    }
  },
}

export const configRegistry: ConfigRegistry = {
  blue: Blue,
  grey: Grey,
  red: Red,
  fortyTwo: FortyTwo,
  numbers: Numbers,
  evenSquares: EvenSquares,
  now: Now,
  list: ListingExample,
}
