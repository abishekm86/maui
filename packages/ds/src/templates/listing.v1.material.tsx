// templates/ItemListTemplate.tsx
import ArrowBackIos from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos'
import { IconButton, MenuItem, Select, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import {
  $batch,
  $computed,
  $effect,
  $state,
  AsyncValue,
  ProcessedConfig,
  Schema,
  Template,
} from 'maui-core'
import { memo } from 'preact/compat'
import { useRef } from 'preact/hooks'
import { FixedSizeList, areEqual } from 'react-window'
import { Column, Listing } from 'src/schemas'
import { Metadata, TemplateFeatures } from 'src/types'

// Update TemplateProps to match the new schema
interface TemplateProps extends Schema<'listing@1'> {
  items: Required<AsyncValue<Record<string, any>[]>>
  columns: Column[]
}

// Update metadata to use ItemList.v1
export const metadata: Metadata<Listing.v1, TemplateProps> = {
  schema: 'listing@1',
  features: {
    theme: 'material',
  },
  transform: config => {
    return {
      schema: 'listing@1',
      ...config,
      items: {
        ...config.items,
        loading: config.items.loading ?? false,
        refreshing: config.items.refreshing ?? false,
      },
    }
  },
}

// Main component
const useStyles = makeStyles(() => ({
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  table: {
    width: '100%',
  },
  gridHeader: (props: any) => ({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: `repeat(${props.columns.length}, 1fr)`,
  }),
  gridRow: (props: any) => ({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: `repeat(${props.columns.length}, 1fr)`,
    boxSizing: 'border-box',
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
  }),
  gridCell: {
    padding: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tableBodyWrapper: {
    width: '100%',
    overflowY: 'auto',
    height: '100%',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '8px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '8px',
  },
  pageSelect: {
    marginLeft: '4px',
    marginRight: '4px',
    marginTop: '4px',
  },
}))

const Table = function (props: ProcessedConfig<TemplateProps>) {
  const classes = useStyles(props)
  const {
    items: { loading, refreshing, result },
    columns,
  } = props
  const tableHeight = 400
  const itemsPerPage = 10
  const rowHeight = tableHeight / itemsPerPage

  const [currentPage, setCurrentPage] = $state(1)
  const currentPageStartIndex = $computed(() => (currentPage() - 1) * itemsPerPage)
  const totalPages = $computed(() => Math.ceil((result().value?.length || 0) / itemsPerPage))
  const [isPageChangeFromPagination, setIsPageChangeFromPagination] = $state(false)
  const [isScrollingProgrammatically, setIsScrollingProgramatically] = $state(false)
  const [visibleStartIndex, setVisibileStartIndex] = $state(0)

  const listRef = useRef<FixedSizeList>(null)

  const createMessageRow = (message?: string) => (
    <div className={classes.gridRow}>
      <div className={classes.gridCell} style={{ gridColumn: `1 / span ${columns.length}` }}>
        <Typography variant="body1">{message || <>&nbsp;</>}</Typography>
      </div>
    </div>
  )

  const THeader = () => (
    <div className={classes.gridHeader}>
      {columns.map(column => (
        <div key={column.name()} className={classes.gridCell}>
          <Typography variant="h6">{column.label()}</Typography>
        </div>
      ))}
    </div>
  )

  const TBody = () => {
    const rows = result().value || []
    if (loading()) return createMessageRow('Loading...')
    if (rows.length === 0) return createMessageRow('Nothing to see here...')

    // Update currentPage based on scroll position
    const onItemsRendered = ({ visibleStartIndex, visibleStopIndex }) => {
      setVisibileStartIndex(visibleStartIndex)
      if (!isScrollingProgrammatically()) {
        const middleIndex = Math.floor((visibleStartIndex + visibleStopIndex) / 2)
        const newPage = Math.floor(middleIndex / itemsPerPage) + 1
        if (newPage !== currentPage()) {
          setCurrentPage(newPage)
        }
      }
    }

    // Scroll to the item corresponding to the current page set via pagination
    $effect(() => {
      if (isPageChangeFromPagination()) {
        const index = (currentPage() - 1) * itemsPerPage

        setIsScrollingProgramatically(true)
        listRef.current?.scrollToItem(index, 'start')
        setTimeout(() => {
          setIsScrollingProgramatically(false)
        }, 100) // Adjust timeout as needed
        setIsPageChangeFromPagination(false)
      }
    })

    const Row = ({ index, style }) => {
      const row = rows[index]
      return (
        <div style={{ ...style }} className={classes.gridRow}>
          {columns.map(column => (
            <div key={column.name()} className={classes.gridCell}>
              <Typography variant="body1">
                {column.cell ? column.cell() : row[column.name()]}
              </Typography>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className={classes.tableBodyWrapper} style={{ height: tableHeight }}>
        <FixedSizeList
          ref={listRef}
          height={tableHeight}
          itemCount={rows.length}
          itemSize={rowHeight}
          width="100%"
          onItemsRendered={onItemsRendered}
        >
          {memo(Row, areEqual)}
        </FixedSizeList>
      </div>
    )
  }

  const handlePrevious = () => {
    if (currentPage() <= 1) return

    if (currentPageStartIndex() >= visibleStartIndex()) {
      $batch(() => {
        setIsPageChangeFromPagination(true)
        setCurrentPage(currentPage() - 1)
      })
    } else {
      // move page to top of current page without changing page
      setIsPageChangeFromPagination(true)
    }
  }

  const handleNext = () => {
    if (currentPage() >= totalPages()) return

    if (currentPageStartIndex() <= visibleStartIndex()) {
      $batch(() => {
        setIsPageChangeFromPagination(true)
        setCurrentPage(currentPage() + 1)
      })
    } else {
      // move page to top of current page without changing page
      setIsPageChangeFromPagination(true)
    }
  }

  const Pagination = () => (
    <>
      {totalPages() > 0 && (
        <div className={classes.pagination}>
          <IconButton disabled={currentPage() <= 1} onClick={handlePrevious} size="small">
            <ArrowBackIos fontSize="small" />
          </IconButton>
          <Typography variant="body1">Page</Typography>
          <Select
            value={currentPage()}
            onChange={e => {
              const target = e.target as HTMLSelectElement
              $batch(() => {
                setIsPageChangeFromPagination(true)
                setCurrentPage(Number(target.value))
              })
            }}
            variant="standard"
            size="small"
            className={classes.pageSelect}
          >
            {Array.from({ length: totalPages() }, (_, i) => i + 1).map(page => (
              <MenuItem key={page} value={page}>
                {page}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="body1">of {totalPages()}</Typography>
          <IconButton disabled={currentPage() >= totalPages()} onClick={handleNext} size="small">
            <ArrowForwardIos fontSize="small" />
          </IconButton>
        </div>
      )}
    </>
  )

  const TFooter = () => (
    <div className={classes.footer}>
      {createMessageRow(refreshing() ? 'Refreshing' : undefined)}
      <Pagination />
    </div>
  )

  return (
    <div className={classes.tableContainer}>
      <Typography variant="h5">Items</Typography>
      <div className={classes.table}>
        <THeader />
        <TBody />
        <TFooter />
      </div>
    </div>
  )
}

// TableRow component
// const TableRowComponent = ({ row, columns }: { row: Record<string, any>; columns: string[] }) => (
//   <TableRow>
//     {columns.map(column => (
//       <TableCell key={column}>
//         <Typography variant="body1">{row[column]}</Typography>
//       </TableCell>
//     ))}
//   </TableRow>
// )

// // Memoized TableRowComponent to prevent re-rendering unless the row changes
// const MemoizedTableRow = memo(
//   TableRowComponent,
//   (prevProps, nextProps) => prevProps.row === nextProps.row,
// )

export const template: Template<TemplateProps, TemplateFeatures> = function (props) {
  return (
    <>
      <Table {...props} />
    </>
  )
}
