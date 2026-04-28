App({
  onLaunch() {
    const log = (msg) => {
      console.log(msg)
      try {
        const entry = `[${new Date().toLocaleTimeString()}] ${msg}`
        const existing = wx.getStorageSync('cli_debug_log') || ''
        wx.setStorageSync('cli_debug_log', existing + entry + '\n')
      } catch (e) {
        console.warn('[CLI-DEBUG] persist failed:', e.message)
      }
    }
    log('[CLI-DEBUG] 小程序已经启动')

    let count = 0
    setInterval(() => {
      count++
      console.log(`[CLI-DEBUG] 持续日志输出 #${count} at ${new Date().toLocaleTimeString()}`)
      console.warn(`[CLI-DEBUG] 这是一条警告 #${count}`)
      console.error(`[CLI-DEBUG] 这是一条错误 #${count}`)
      if (count % 3 === 0) {
        const obj = { type: 'heartbeat', count, timestamp: Date.now() }
        console.log('[CLI-DEBUG] 对象日志:', obj)
      }
    }, 3000)
  }
})