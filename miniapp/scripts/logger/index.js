const { appendFileSync } = require('fs')
const { resolve } = require('path')
const http = require('http')

const LOG_FILE = resolve(__dirname, '../../mini-program-debug.log')

function writeLog(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  appendFileSync(LOG_FILE, line + '\n')
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { resolve(data) }
      })
    }).on('error', reject)
  })
}

async function connectCDP() {
  let targets = []
  try {
    const result = await httpGet('http://127.0.0.1:3799/json')
    if (Array.isArray(result)) targets = result
  } catch { }

  if (targets.length === 0) {
    writeLog('CDP HTTP endpoint not available, trying direct WebSocket...')
    return connectDirectWS()
  }

  writeLog(`Found ${targets.length} CDP targets`)
  const appTarget = targets.find(t =>
    (t.title && t.title.toLowerCase().includes('appservice')) ||
    (t.url && t.url.includes('appservice'))
  ) || (targets.find(t => t.url && t.url.includes('pageframe'))) || targets[0]

  writeLog(`Connecting to: ${appTarget.title || appTarget.url || appTarget.id}`)
  return attachToTarget(appTarget.webSocketDebuggerUrl)
}

function connectDirectWS() {
  return new Promise((resolve, reject) => {
    let sessionId = null
    let pendingTargets = null
    const ws = new WebSocket('ws://127.0.0.1:3799')

    ws.onopen = () => {
      writeLog('Direct CDP WebSocket connected, discovering targets...')
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }))
      ws.send(JSON.stringify({ id: 2, method: 'Target.setDiscoverTargets', params: { discover: true } }))
      ws.send(JSON.stringify({ id: 3, method: 'Target.getTargets' }))
    }

    ws.onmessage = (event) => {
      let msg
      try { msg = JSON.parse(event.data) } catch { return }

      if (msg.id === 3 && msg.result && msg.result.targetInfos) {
        pendingTargets = msg.result.targetInfos
        const appTarget = pendingTargets.find(t =>
          t.title && t.title.toLowerCase().includes('appservice')
        ) || pendingTargets.find(t => t.type === 'page' || t.type === 'iframe') || pendingTargets[0]
        if (appTarget) {
          writeLog(`Attaching to target: ${appTarget.title || appTarget.targetId} (type: ${appTarget.type})`)
          ws.send(JSON.stringify({
            id: 4, method: 'Target.attachToTarget',
            params: { targetId: appTarget.targetId, flatten: true }
          }))
        }
      }

      if (msg.id === 4 && msg.result) {
        sessionId = msg.result.sessionId
        writeLog(`Attached! Session: ${sessionId}`)
        ws.send(JSON.stringify({
          id: 5, sessionId,
          method: 'Runtime.enable'
        }))
      }

      handleEvent(msg, ws)
    }

    ws.onerror = (e) => { writeLog(`WS error: ${e.message}`); reject(e) }
    ws.onclose = () => writeLog('CDP connection closed')
  })
}

function attachToTarget(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    ws.onopen = () => {
      writeLog('Target WebSocket connected')
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }))
      ws.send(JSON.stringify({ id: 2, method: 'Runtime.runIfWaitingForDebugger' }))
    }
    ws.onmessage = (event) => {
      let msg
      try { msg = JSON.parse(event.data) } catch { return }
      handleEvent(msg, ws)
    }
    ws.onerror = (e) => { writeLog(`Target WS error: ${e.message}`); reject(e) }
    ws.onclose = () => writeLog('Target WS connection closed')
  })
}

function handleEvent(msg, ws) {
  if (!msg) return

  if (msg.method === 'Runtime.consoleAPICalled') {
    const { type, args, timestamp } = msg.params
    const text = args.map(a => {
      if (a.value !== undefined) return a.value
      if (a.preview) return a.preview.description || JSON.stringify(a.preview)
      return JSON.stringify(a)
    }).join(' ')
    writeLog(`[CONSOLE.${type}] ${text}`)
    return
  }

  if (msg.method === 'Runtime.exceptionThrown') {
    const { exceptionDetails } = msg.params
    const text = exceptionDetails.text || exceptionDetails.exception?.description || ''
    writeLog(`[EXCEPTION] ${text}`)
    return
  }

  if (msg.method === 'Runtime.executionContextCreated') {
    const ctx = msg.params.context
    writeLog(`[CONTEXT] ${ctx.name} (${ctx.origin})`)
  }
}

async function main() {
  appendFileSync(LOG_FILE, `\n===== Mini-Program Logger Started at ${new Date().toISOString()} =====\n`)
  writeLog('Logger initializing...')
  writeLog(`Output file: ${LOG_FILE}`)

  try {
    await connectCDP()
    writeLog('Logger running. Capturing console output...')
    writeLog('Press Ctrl+C to stop')
  } catch (err) {
    writeLog(`Connection failed: ${err.message}`)
    writeLog('')
    writeLog('=== USAGE ===')
    writeLog('Make sure the IDE is running (open it manually or via cli.bat open)')
    writeLog('The --remote-port 3799 is enabled by default in the IDE')
    writeLog('')
    writeLog('Quick test: curl http://127.0.0.1:3799/json')
    writeLog('If that returns data, re-run this script')
    process.exit(1)
  }
}

process.on('SIGINT', () => {
  writeLog('Logger stopped by user')
  process.exit(0)
})

main()
