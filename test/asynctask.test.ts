import { timeout } from '../src/utils/timeout'
import { promiseWithTimeout } from '../src/utils/createAsyncTask'

describe('async task tests', () => {
  const resultFn = jest.fn()

  const asyncFn = async () => {
    await timeout(200)
    console.log('done')
    resultFn()
  }

  beforeEach(() => {
    resultFn.mockClear()
  })

  it('should work', async () => {
    try {
      const task = await promiseWithTimeout(asyncFn(), 100)
      console.log('well')
    } catch (e) {
      console.log(e)
    }
    await timeout(500)
    expect(resultFn).not.toHaveBeenCalled()
  })
})
