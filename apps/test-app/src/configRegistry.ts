import { Color, Size } from 'ds'
import { Config } from 'maui-core'

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
    color: () => '#33aa33',
    colorText: () => 'green',
  },
}

const FortyTwo: Config<Size.v1> = {
  id: 'fortytwo',
  schema: 'size@1',
  size: () => {
    function expensive(ms: number) {
      let date = new Date()
      let curDate: Date
      do {
        curDate = new Date()
      } while (curDate.getTime() - date.getTime() < ms)
    }

    expensive(2000)
    return 42
  },
}

export const configList = [Blue, Green, FortyTwo]
