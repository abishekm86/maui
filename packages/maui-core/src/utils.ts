export const defaultAsync = <T>(value?: T) => ({
  loading: value === undefined,
  refreshing: false,
  value,
})
