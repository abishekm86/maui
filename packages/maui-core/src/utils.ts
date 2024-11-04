export const defaultAsync = <T>(value: T | undefined = undefined) => ({
  loading: value === undefined,
  refreshing: false,
  error: undefined,
  value,
})
