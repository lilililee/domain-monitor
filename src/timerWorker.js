/* eslint-disable no-restricted-globals */
let timer = null

self.onmessage = (e) => {
  const { type, interval } = e.data

  if (type === 'START') {
    if (timer) clearInterval(timer)
    console.log('[Worker] Starting timer with interval:', interval)
    timer = setInterval(() => {
      self.postMessage({ type: 'TICK' })
    }, interval)
  } else if (type === 'STOP') {
    if (timer) clearInterval(timer)
    timer = null
    console.log('[Worker] Timer stopped')
  }
}

