import { Color, Greeting } from 'ds'
import { $await, $invoke, $state, Config, ConfigRegistry } from 'maui-core'

import { mockAsyncApiFetch } from './helpers'

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

const Hello: Config<Greeting.v1> = {
  schema: 'greeting@1',
  configFn: () => ({
    message: {
      value: () => 'hello, world',
    },
  }),
}

const Shopping: Config<Greeting.v1> = {
  schema: 'greeting@1',
  configFn: () => {
    const getName = (
      id: number,
      abortSignal: AbortSignal,
    ): Promise<{ firstName: string; lastName: string; cartId: number } | undefined> => {
      const data = [
        { firstName: 'Eleanor', lastName: 'Vance', cartId: 0 },
        { firstName: 'Caleb', lastName: "O'Connell", cartId: 1 },
        { firstName: 'Isabelle', lastName: 'Rodriguez', cartId: 2 },
        { firstName: 'Jasper', lastName: 'Nguyen', cartId: 3 },
        { firstName: 'Aurora', lastName: 'Harrison', cartId: 4 },
      ]
      return mockAsyncApiFetch(data, id, abortSignal, 'Called getName api with user id:')
    }

    const getCart = (
      id: number,
      abortSignal: AbortSignal,
    ): Promise<{ id: number; numItems: number } | undefined> => {
      const data = [
        { id: 0, numItems: 0 },
        { id: 1, numItems: 1 },
        { id: 2, numItems: 2 },
        { id: 3, numItems: 3 },
        { id: 4, numItems: 4 },
      ]
      return mockAsyncApiFetch(data, id, abortSignal, 'Called getCarts api with cart id:', 1000)
    }

    const userIds = [0, 1, 2, 3, 4]
    const [userId, setId] = $state(userIds[0])

    // top level api call
    const userResponse = $await(abort => getName(userId(), abort)).transform(response => ({
      ...response,
      fullName: response ? `${response?.firstName} ${response?.lastName}` : undefined, // TODO: use $if to filter undefineds
    }))

    // chained api
    const cartResponse = userResponse.value.await(async (user, abort) => {
      const cartId = user.cartId
      return cartId !== undefined ? getCart(cartId, abort) : undefined // TODO: support filters to ignore undefined responses
    })

    // join
    const message = userResponse
      .transform(user => {
        // TODO: support join
        const cart = cartResponse.value()
        if (cart && user.cartId === cart.id) return { user, cart }
        else return { user, cart: undefined }
      })
      .transform(({ user, cart }) => {
        if (user.fullName) {
          const cartMessage = cart
            ? `You have ${cart.numItems} items in your cart!`
            : 'Your cart is loading...'
          return `Hi, ${user.fullName}. ${cartMessage}`
        } else {
          return `Please wait...`
        }
      })

    $invoke(() => setId((userId() + 1) % 5), { interval: 9000 }) // simulate user filter
    $invoke(userResponse.refresh, { interval: 3000 }) // refresh data periodically

    return {
      message,
    }
  },
}

// const ListingExample: Config<Listing.v1> = {
//   schema: 'listing@1',
//   configFn: () => {
//     type Api = { id: number; name: string; value: number }

//     const mockApi = (() => {
//       const items: Api[] = []
//       let updateItem: () => void
//       let firstRun = true

//       setTimeout(() => {
//         console.log('Updating')
//         updateItem()
//       }, 8000)

//       return {
//         list: async () =>
//           new Promise<Value<Api>[]>(resolve => {
//             setTimeout(() => {
//               if (firstRun) {
//                 for (let i = 0; i < 25; i++) {
//                   const newItem = {
//                     id: items.length + 1,
//                     name: `Item ${items.length + 1}`,
//                     value: Math.floor(Math.random() * 1000),
//                   }
//                   items.push(newItem)
//                 }
//               } else {
//                 if (Math.random() < 0.5) {
//                   const newItem = {
//                     id: items.length + 1,
//                     name: `Item ${items.length + 1}`,
//                     value: Math.floor(Math.random() * 1000),
//                   }
//                   items.push(newItem)
//                 }
//               }
//               firstRun = false
//               resolve(
//                 items.map((item, id) => {
//                   const [getItem, setItem] = $state(item)
//                   if (id === 20) updateItem = () => setItem({ ...getItem(), value: 424242 })
//                   return getItem
//                 }),
//               )
//             }, 500)
//           }),
//       }
//     })()

//     const [response, apiTrigger] = $async(() => mockApi.list())
//     const stop = $invoke(apiTrigger, { interval: 1000 })
//     $invoke(stop, { delay: 60 * 1000 })

//     return {
//       items: response,
//       columns: [
//         { name: 'id', label: 'ID', cell: 'Foo' },
//         { name: 'name', label: 'Name' },
//         { name: 'value', label: 'Value' },
//       ],
//     }
//   },
// }

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
  hello: Hello,
  shopping: Shopping,
  // list: ListingExample,
}
