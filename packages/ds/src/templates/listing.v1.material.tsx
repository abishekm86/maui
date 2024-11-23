// templates/ItemListTemplate.tsx
import ArrowBackIos from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos'
import { IconButton, MenuItem, Select, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { $, $compute, AsyncValue, ProcessedConfig, Schema, Template, Value } from 'maui-core'
// import { memo } from 'preact/compat'
import { useEffect, useRef } from 'preact/hooks'
import { FixedSizeList } from 'react-window'
import { Listing } from 'src/schemas'
import { Metadata, TemplateFeatures } from 'src/types'

// Update TemplateProps to match the new schema
interface TemplateProps extends Schema<'listing@1'> {
  items: Required<AsyncValue<Record<string, any>[]>>
  columns: Value<string[]>
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
    gridTemplateColumns: `repeat(${props.columns.value.length}, 1fr)`,
  }),
  gridRow: (props: any) => ({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: `repeat(${props.columns.value.length}, 1fr)`,
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

  // these are signals, since their values are rendered
  const [currentPage, setCurrentPage] = $(1)
  const currentPageStartIndex = $compute(() => (currentPage.value - 1) * itemsPerPage)
  const totalPages = $compute(() => Math.ceil((result.value.value?.length || 0) / itemsPerPage))
  const [shouldResetToTop, resetToTop] = $(false)

  const listRef = useRef<FixedSizeList>(null)
  const isPageChangeFromPagination = useRef(false)
  const isScrollingProgrammatically = useRef(false)
  const visibleStartIndexRef = useRef(0)

  const createMessageRow = (message?: string) => (
    <div className={classes.gridRow}>
      <div className={classes.gridCell} style={{ gridColumn: `1 / span ${columns.value.length}` }}>
        <Typography variant="body1">{message || <>&nbsp;</>}</Typography>
      </div>
    </div>
  )

  const THeader = () => (
    <div className={classes.gridHeader}>
      {columns.value.map(column => (
        <div key={column} className={classes.gridCell}>
          <Typography variant="h6">{column}</Typography>
        </div>
      ))}
    </div>
  )

  const TBody = () => {
    const rows = result.value.value || []
    if (loading.value) return createMessageRow('Loading...')
    if (rows.length === 0) return createMessageRow('Nothing to see here...')

    // Update currentPage based on scroll position
    const onItemsRendered = ({ visibleStartIndex, visibleStopIndex }) => {
      visibleStartIndexRef.current = visibleStartIndex

      if (!isScrollingProgrammatically.current) {
        const middleIndex = Math.floor((visibleStartIndex + visibleStopIndex) / 2)
        const newPage = Math.floor(middleIndex / itemsPerPage) + 1
        if (newPage !== currentPage.value) {
          setCurrentPage(newPage)
        }
      }
    }

    // Scroll to the item corresponding to the current page when currentPage changes via pagination
    useEffect(() => {
      if (isPageChangeFromPagination.current) {
        const index = (currentPage.value - 1) * itemsPerPage
        isScrollingProgrammatically.current = true
        listRef.current?.scrollToItem(index, 'start')
        setTimeout(() => {
          isScrollingProgrammatically.current = false
        }, 100) // Adjust timeout as needed
        isPageChangeFromPagination.current = false
        resetToTop(false)
      }
    }, [currentPage.value, shouldResetToTop.value])

    const Row = ({ index, style }) => {
      const row = rows[index]
      return (
        <div style={{ ...style }} className={classes.gridRow}>
          {columns.value.map(column => (
            <div key={column} className={classes.gridCell}>
              <Typography variant="body1">{row[column]}</Typography>
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
          {Row}
        </FixedSizeList>
      </div>
    )
  }

  const handlePrevious = () => {
    if (currentPage.value <= 1) return

    isPageChangeFromPagination.current = true
    if (currentPageStartIndex.value >= visibleStartIndexRef.current) {
      setCurrentPage(currentPage.value - 1)
    } else {
      resetToTop(true)
    }
  }

  const handleNext = () => {
    if (currentPage.value >= totalPages.value) return

    isPageChangeFromPagination.current = true
    if (currentPageStartIndex.value <= visibleStartIndexRef.current) {
      setCurrentPage(currentPage.value + 1)
    } else {
      resetToTop(true)
    }
  }

  const Pagination = () => (
    <>
      {totalPages.value > 0 && (
        <div className={classes.pagination}>
          <IconButton disabled={currentPage.value <= 1} onClick={handlePrevious} size="small">
            <ArrowBackIos fontSize="small" />
          </IconButton>
          <Typography variant="body1">Page</Typography>
          <Select
            value={currentPage.value}
            onChange={e => {
              isPageChangeFromPagination.current = true
              const target = e.target as HTMLSelectElement
              setCurrentPage(Number(target.value))
            }}
            variant="standard"
            size="small"
            className={classes.pageSelect}
          >
            {Array.from({ length: totalPages.value }, (_, i) => i + 1).map(page => (
              <MenuItem key={page} value={page}>
                {page}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="body1">of {totalPages.value}</Typography>
          <IconButton
            disabled={currentPage.value >= totalPages.value}
            onClick={handleNext}
            size="small"
          >
            <ArrowForwardIos fontSize="small" />
          </IconButton>
        </div>
      )}
    </>
  )

  const TFooter = () => (
    <div className={classes.footer}>
      {createMessageRow(refreshing.value ? 'Refreshing' : undefined)}
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
