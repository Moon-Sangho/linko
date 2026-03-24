import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from '@renderer/utils/debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not invoke the function immediately', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, { delay: 300 })
    debounced('arg')
    expect(fn).not.toHaveBeenCalled()
  })

  it('invokes the function after the delay has elapsed', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, { delay: 300 })
    debounced('arg')
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('arg')
  })

  it('passes all arguments to the wrapped function', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, { delay: 100 })
    debounced('a', 'b', 'c')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('a', 'b', 'c')
  })

  it('resets the timer when called again before the delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, { delay: 300 })

    debounced('first')
    vi.advanceTimersByTime(200)
    debounced('second')
    vi.advanceTimersByTime(200)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('second')
  })

  it('invokes the function only once for rapid successive calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, { delay: 300 })

    debounced('1')
    debounced('2')
    debounced('3')

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('3')
  })

  it('invokes the function for each separate call group', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, { delay: 300 })

    debounced('first group')
    vi.advanceTimersByTime(300)

    debounced('second group')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenNthCalledWith(1, 'first group')
    expect(fn).toHaveBeenNthCalledWith(2, 'second group')
  })

  it('does not invoke the function one millisecond before the delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, { delay: 500 })
    debounced()
    vi.advanceTimersByTime(499)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('fires after vi.advanceTimersByTime(0) when delay is 0, not synchronously on call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, { delay: 0 })
    debounced('arg')
    // The underlying setTimeout(fn, 0) has not fired yet — call was not synchronous
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(0)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('arg')
  })
})
