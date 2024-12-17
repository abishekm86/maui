import { Color, Greeting, Listing } from 'ds'
import {
  $action,
  $async, // $computed,
  // $collection,
  // $if,
  $invoke,
  $state,
  Config,
  ConfigRegistry,
  Value,
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
    const color = '#aa3333'
    const getColorText = (color: string) => (color === '#aa3333' ? 'red' : '-')

    return {
      theme: {
        color: color,
        colorText: getColorText(color),
      },
    }
  },
}

// TODO: typings don't allow primitives in AsyncValue
// const One: Config<Greeting.v1> = {
//   schema: 'greeting@1',
//   configFn: () => ({
//     message: {
//       value: '1',
//     },
//   }),
// }

const Two: Config<Greeting.v1> = {
  schema: 'greeting@1',
  configFn: () => ({
    message: {
      value: () => '2',
    },
  }),
}

const Hello: Config<Greeting.v1> = {
  schema: 'greeting@1',
  configFn: () => {
    const getName = (
      id: number,
      abortSignal: AbortSignal,
    ): Promise<{ firstName: string; lastName: string } | undefined> => {
      const names = [
        { firstName: 'Eleanor', lastName: 'Vance' },
        { firstName: 'Caleb', lastName: "O'Connell" },
        { firstName: 'Isabelle', lastName: 'Rodriguez' },
        { firstName: 'Jasper', lastName: 'Nguyen' },
        { firstName: 'Aurora', lastName: 'Harrison' },
      ]

      return new Promise<{ firstName: string; lastName: string } | undefined>((resolve, reject) => {
        setTimeout(() => {
          // Remove the abort listener after the timeout completes to prevent memory leaks
          if (abortSignal.aborted) {
            console.log('Operation aborted before completion')
            reject(new DOMException('Aborted', 'AbortError'))
            return // Important to prevent further execution
          }
          console.log('Called api with', id)
          if (id < names.length) {
            resolve(names[id])
          } else {
            resolve(undefined)
          }
        }, 400)
      })
    }

    const greetings = ['Hi', 'Aloha', 'Boujour', 'Vanakkam', 'Hola']
    const ids = [0, 1, 2, 3, 4]

    const [greetingId, setGreetingId] = $state(0)
    const greeting = greetingId.then(id => greetings[id]).then(g => g.toUpperCase())

    const [id, setId] = $state(ids[0])
    const [response, refreshApi] = $async(abort => getName(id(), abort))
    const message = response
      .then(v => `${v?.firstName} ${v?.lastName}`)
      .then(fullName => `${greeting()}, ${fullName}`)

    const updateInputs = $action(() => {
      setGreetingId((greetingId() + 1) % 5)
      setId(ids[Math.floor(Math.random() * 5)])
    })
    $invoke(updateInputs, { interval: 4500 })
    $invoke(refreshApi, { interval: 1000 })

    return {
      message,
    }
  },
}

const ListingExample: Config<Listing.v1> = {
  schema: 'listing@1',
  configFn: () => {
    type Api = { id: number; name: string; value: number }

    const mockApi = (() => {
      const items: Api[] = []
      let updateItem: () => void
      let firstRun = true

      setTimeout(() => {
        console.log('Updating')
        updateItem()
      }, 8000)

      return {
        list: async () =>
          new Promise<Value<Api>[]>(resolve => {
            setTimeout(() => {
              if (firstRun) {
                for (let i = 0; i < 25; i++) {
                  const newItem = {
                    id: items.length + 1,
                    name: `Item ${items.length + 1}`,
                    value: Math.floor(Math.random() * 1000),
                  }
                  items.push(newItem)
                }
              } else {
                if (Math.random() < 0.5) {
                  const newItem = {
                    id: items.length + 1,
                    name: `Item ${items.length + 1}`,
                    value: Math.floor(Math.random() * 1000),
                  }
                  items.push(newItem)
                }
              }
              firstRun = false
              resolve(
                items.map((item, id) => {
                  const [getItem, setItem] = $state(item)
                  if (id === 20) updateItem = () => setItem({ ...getItem(), value: 424242 })
                  return getItem
                }),
              )
            }, 500)
          }),
      }
    })()

    const [response, apiTrigger] = $async(() => mockApi.list())
    const stop = $invoke(apiTrigger, { interval: 1000 })
    $invoke(stop, { delay: 60 * 1000 })

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

// const a = { value: 1, id: 1 }
// const b = { value: 2, id: 2 }
// const c = { value: 3, id: 3 }

// const coll = $collection([a, b, c])
// $effect(() => {
//   for (let i = 0; i < coll.length(); i++) {
//     $effect(() => console.log(coll.at(i)))
//   }
// })
// coll.set([c, b, a])
// coll.set([b, c, a])

export const configRegistry: ConfigRegistry = {
  blue: Blue,
  grey: Grey,
  red: Red,
  // one: One,
  two: Two,
  hello: Hello,
  list: ListingExample,
}
