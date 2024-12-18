export function mockAsyncApiFetch<T>(
  data: T[],
  id: number,
  abortSignal: AbortSignal,
  logMessage: string,
  apiDelay = 750,
): Promise<T | undefined> {
  return new Promise<T | undefined>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const onAbort = () => {
      console.log('Operation aborted before completion')
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      reject(new DOMException('Aborted', 'AbortError'))
    }

    abortSignal.addEventListener('abort', onAbort)

    timeoutId = setTimeout(() => {
      abortSignal.removeEventListener('abort', onAbort)
      if (abortSignal.aborted) {
        console.log('Operation aborted before completion')
        return
      }
      console.log(logMessage, id)
      if (id < data.length) {
        resolve(data[id])
      } else {
        resolve(undefined)
      }
    }, apiDelay)
  })
}
