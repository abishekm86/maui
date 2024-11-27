declare module 'react-window' {
  import * as React from 'react'

  export interface FixedSizeListProps {
    height: number
    width: number | string
    itemSize: number
    itemCount: number
    children: React.ComponentType<{ index: number; style: React.CSSProperties }>
    onItemsRendered?: (props: {
      visibleStartIndex: number
      visibleStopIndex: number
      overscanStartIndex: number
      overscanStopIndex: number
    }) => void
  }

  export class FixedSizeList extends React.Component<FixedSizeListProps> {
    scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void
  }

  export function areEqual(prevProps: any, nextProps: any): boolean
}
