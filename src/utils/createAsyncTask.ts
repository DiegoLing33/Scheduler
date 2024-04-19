import { TimeOutError } from '../errors'

export function promiseWithTimeout(promise: Promise<any>, timeoutMillis: number, onCancel: () => void) {
  let reject: any
  let resolve: any
  let isResolved = false

  const error = new TimeOutError(timeoutMillis)

  let timeout = setTimeout(function () {
    isResolved = true
    onCancel()
    reject(error)
  }, timeoutMillis)

  return new Promise(function (res, rej) {
    reject = rej
    resolve = res

    promise.then(
      function (value) {
        clearTimeout(timeout)
        if (!isResolved) resolve(value)
      },
      function (err) {
        clearTimeout(timeout)
        if (!isResolved) reject(err)
      },
    )
  })
}
