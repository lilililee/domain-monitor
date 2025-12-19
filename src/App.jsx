import { useState, useEffect, useRef, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { PermissionWarning } from './components/PermissionWarning'
import { BatchImportModal } from './components/BatchImportModal'
import { SettingsModal } from './components/SettingsModal'
import { DomainList } from './components/DomainList'

function App() {
  // Initialize state lazily from localStorage
  const getInitialData = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem('domain-monitor-data')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed[key] || defaultValue
      }
    } catch (e) {
      console.error('Failed to load data', e)
    }
    return defaultValue
  }

  const [domains, setDomains] = useState(() => getInitialData('domains', []))
  const [settings, setSettings] = useState(() => getInitialData('settings', { interval: 60, startHour: 9, endHour: 20 }))
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showBatchImport, setShowBatchImport] = useState(false)
  const [batchInput, setBatchInput] = useState('')
  const [, setLastScan] = useState(null)
  const [permission, setPermission] = useState(Notification.permission)
  const [debugLog, setDebugLog] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')

  // Ref to prevent double-scan on mount due to React.StrictMode
  const hasScannedOnMount = useRef(false)

  // Ref to hold latest domains state
  const domainsRef = useRef(domains)
  useEffect(() => {
    domainsRef.current = domains
  }, [domains])

  const settingsRef = useRef(settings)
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString()
    setDebugLog((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 50))
    console.log(`[DomainMonitor] ${msg}`)
  }

  // Persistence
  useEffect(() => {
    localStorage.setItem('domain-monitor-data', JSON.stringify({ domains, settings }))
  }, [domains, settings])

  const requestNotificationPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    addLog(`Permission requested: ${result}`)
    if (result === 'granted') {
      new Notification('SYSTEM_ONLINE', { body: 'Notification subsystem initialized.' })
      toast.success('NOTIFICATION_GRANTED')
    } else {
      toast.error('NOTIFICATION_DENIED')
    }
  }

  const testNotification = () => {
    addLog('User clicked Test Notification')
    toast('SENDING_TEST_PING...', { icon: '🔔' })
    if (permission === 'granted') {
      try {
        const n = new Notification('TEST_PROTOCOL', { body: 'Communication link check normal.' })
        n.onshow = () => addLog('Test notification displayed')
        n.onerror = (e) => addLog(`Test notification error: ${e}`)
      } catch (e) {
        addLog(`Exception creating test notification: ${e.message}`)
        toast.error('NOTIFICATION_FAILED_CHECK_BROWSER')
      }
    } else {
      toast.error('PERMISSION_REQUIRED')
    }
  }

  const testDelayedNotification = () => {
    addLog('Starting 5s delay test...')
    toast('AUTO_TRIGGER_IN_5S...', { icon: '⏳' })
    setTimeout(() => {
      addLog('Timer fired. Attempting to send notification without user interaction...')
      if (Notification.permission === 'granted') {
        try {
          const n = new Notification('DELAY_TEST_SUCCESS', { body: 'Automated protocol execution complete.' })
          n.onshow = () => addLog('Delayed notification displayed!')
          n.onerror = (e) => addLog(`Delayed notification error: ${e}`)
        } catch (e) {
          addLog(`Exception in delayed notification: ${e.message}`)
        }
      } else {
        addLog('Permission not granted for delayed test')
      }
    }, 5000)
  }

  // Monitoring Loop
  const workerRef = useRef(null)

  const checkDomain = useCallback(async (domain) => {
    const start = Date.now()
    try {
      const response = await fetch(domain.url, { method: 'GET', cache: 'no-cache' })
      const duration = Date.now() - start

      console.log('response.status: ', response.status)
      if (response.status === 200 || response.status === 304) {
        return {
          ...domain,
          status: 'up',
          lastChecked: new Date().toISOString(),
          responseTime: duration,
          error: null,
          statusCode: response.status
        }
      } else {
        return {
          ...domain,
          status: 'down',
          lastChecked: new Date().toISOString(),
          responseTime: duration,
          error: `Status: ${response.status} ${response.statusText}`,
          statusCode: response.status
        }
      }
    } catch (error) {
      const duration = Date.now() - start
      return {
        ...domain,
        status: 'down',
        lastChecked: new Date().toISOString(),
        responseTime: duration,
        error: error.message || 'Network Error',
        statusCode: 0
      }
    }
  }, [])

  const scanSingleDomain = async (id) => {
    const domain = domains.find((d) => d.id === id)
    if (!domain) return

    setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, isScanning: true } : d)))

    try {
      const updated = await checkDomain(domain)
      setDomains((prev) => prev.map((d) => (d.id === id ? { ...updated, isScanning: false } : d)))
    } catch (e) {
      console.error(e)
      setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, isScanning: false } : d)))
    }
  }

  const sendNotification = useCallback((errorDomains) => {
    toast.error(`DETECTED ${errorDomains.length} ABNORMAL_NODES`, {
      duration: 5000,
      style: {
        background: '#1e1e1e',
        color: '#ff4b4b',
        border: '1px solid #ff4b4b'
      }
    })

    if (!('Notification' in window)) {
      addLog('Browser does not support desktop notification')
      return
    }

    if (Notification.permission === 'granted') {
      try {
        addLog(`Creating notification for ${errorDomains.length} errors...`)
        setTimeout(() => {
          try {
            const n = new Notification('Domain Monitor Alert', {
              body: `Detected ${errorDomains.length} targets is offline.`,
              silent: false,
              requireInteraction: false
            })
            n.onshow = () => addLog('System alert shown successfully')
            n.onerror = (e) => addLog(`System alert error event: ${e}`)
            n.onclick = () => {
              window.focus()
              n.close()
            }
          } catch (innerErr) {
            addLog(`Notification construction failed: ${innerErr.message}`)
          }
        }, 0)
      } catch (e) {
        addLog(`System alert exception: ${e.message}`)
      }
    } else {
      addLog(`Notification skipped. Permission status: ${Notification.permission}`)
    }
  }, [])

  const runScan = useCallback(async () => {
    addLog('Starting batch scan...')
    setLoading(true)
    let hasErrors = false
    let errorDomains = []

    const currentDomains = domainsRef.current.filter((d) => d.enabled !== false)

    const updatedDomains = await Promise.all(
      currentDomains.map(async (domain) => {
        const updated = await checkDomain(domain)
        if (updated.status === 'down') {
          errorDomains.push(updated)
          hasErrors = true
        }
        return updated
      })
    )

    setDomains((prev) =>
      prev.map((d) => {
        const updated = updatedDomains.find((ud) => ud.id === d.id)
        return updated || d
      })
    )

    setLastScan(new Date())
    setLoading(false)

    if (hasErrors) {
      addLog(`Scan finished. Found ${errorDomains.length} errors. Sending notification...`)
      sendNotification(errorDomains)
    } else {
      addLog('Scan finished. No errors found.')
    }
  }, [checkDomain, sendNotification])

  useEffect(() => {
    workerRef.current = new Worker(new URL('./timerWorker.js', import.meta.url), { type: 'module' })
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'TICK') {
        const now = new Date()
        const hour = now.getHours()
        const { startHour = 9, endHour = 20 } = settingsRef.current

        // Check time window
        let inWindow = false
        if (startHour <= endHour) {
          inWindow = hour >= startHour && hour < endHour
        } else {
          // Cross-midnight range (e.g. 22 to 6)
          inWindow = hour >= startHour || hour < endHour
        }

        if (inWindow) {
          runScan()
        } else {
          // Silently skip
        }
      }
    }

    return () => {
      workerRef.current.terminate()
    }
  }, [runScan])

  useEffect(() => {
    if (!workerRef.current) return

    if (domains.length > 0) {
      if (!hasScannedOnMount.current) {
        runScan()
        hasScannedOnMount.current = true
      }
      // Reset/Start timer
      workerRef.current.postMessage({ type: 'START', interval: settings.interval * 1000 })
    } else {
      workerRef.current.postMessage({ type: 'STOP' })
    }
  }, [settings.interval, domains.length, runScan])

  const toggleDomainEnabled = (id) => {
    const domainToToggle = domains.find((d) => d.id === id)
    if (!domainToToggle) return

    const newEnabled = domainToToggle.enabled === false

    setDomains((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            enabled: newEnabled,
            status: newEnabled ? 'pending' : 'disabled'
          }
        }
        return d
      })
    )

    if (newEnabled) {
      const targetDomain = { ...domainToToggle, enabled: true }
      checkDomain(targetDomain).then((updated) => {
        setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)))
      })
    }
  }

  const removeDomain = (id) => {
    if (!confirm('CONFIRM_REMOVE_TARGET?')) return
    setDomains(domains.filter((d) => d.id !== id))
  }

  const updateSettings = (newSettingsValues) => {
    // Handle legacy single-value call if any, though we updated the modal
    const updates = typeof newSettingsValues === 'object' ? newSettingsValues : { interval: parseInt(newSettingsValues) }

    const newSettings = {
      ...settings,
      ...updates,
      interval: parseInt(updates.interval) || settings.interval,
      startHour: parseInt(updates.startHour) ?? settings.startHour,
      endHour: parseInt(updates.endHour) ?? settings.endHour
    }

    setSettings(newSettings)
    // setShowSettings(false) // Keep modal open
    toast.success('SYSTEM_PARAMETERS_UPDATED', {
      style: {
        background: '#0f172a',
        color: '#22d3ee',
        border: '1px solid #22d3ee'
      }
    })
  }

  const handleBatchImport = (e) => {
    e.preventDefault()
    const rawUrls = batchInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (rawUrls.length === 0) {
      toast.error('NO_VALID_DATA_DETECTED', {
        style: { background: '#0f172a', color: '#ff4b4b', border: '1px solid #ff4b4b' }
      })
      return
    }

    const existingUrls = new Set(domains.map((d) => d.url.toLowerCase().replace(/\/$/, '')))
    const newDomains = []
    let skippedCount = 0

    rawUrls.forEach((url) => {
      let targetUrl = url
      if (!targetUrl.startsWith('http')) {
        targetUrl = `https://${targetUrl}`
      }
      const normalizedCheck = targetUrl.toLowerCase().replace(/\/$/, '')

      if (existingUrls.has(normalizedCheck)) {
        skippedCount++
        return
      }
      existingUrls.add(normalizedCheck)

      newDomains.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: targetUrl,
        status: 'pending',
        lastChecked: null,
        responseTime: null,
        error: null,
        statusCode: null,
        enabled: true
      })
    })

    if (newDomains.length === 0) {
      toast('ALL_TARGETS_EXIST_SKIPPED', {
        icon: 'ℹ️',
        style: { background: '#0f172a', color: '#facc15', border: '1px solid #facc15' }
      })
      setBatchInput('')
      return
    }

    setDomains((prev) => [...prev, ...newDomains])
    setBatchInput('')
    setShowBatchImport(false)

    const msg = skippedCount > 0 ? `IMPORTED ${newDomains.length} TARGETS (SKIPPED ${skippedCount} DUPLICATES)` : `IMPORTED ${newDomains.length} TARGETS`

    toast.success(msg, {
      style: { background: '#0f172a', color: '#22d3ee', border: '1px solid #22d3ee' }
    })

    newDomains.forEach((d) => {
      checkDomain(d).then((updated) => {
        setDomains((prev) => prev.map((pd) => (pd.id === d.id ? updated : pd)))
      })
    })
  }

  const clearAllDomains = () => {
    if (confirm('WARNING: THIS_ACTION_WILL_PURGE_ALL_DATA.\n\nCONFIRM_EXECUTION?')) {
      setDomains([])
      setShowSettings(false)
      toast.success('SYSTEM_DATA_PURGED', {
        style: { background: '#0f172a', color: '#ff4b4b', border: '1px solid #ff4b4b' }
      })
    }
  }

  const handleImportConfig = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target.result)

        if (!config.domains || !Array.isArray(config.domains)) {
          throw new Error('Invalid configuration format')
        }

        if (config.settings) {
          setSettings((prev) => {
            const next = { ...prev }

            if (config.settings.interval) {
              const val = parseInt(config.settings.interval)
              if (!isNaN(val) && val >= 5) next.interval = val
            }

            if (config.settings.startHour !== undefined) {
              const val = parseInt(config.settings.startHour)
              if (!isNaN(val) && val >= 0 && val <= 23) next.startHour = val
            }

            if (config.settings.endHour !== undefined) {
              const val = parseInt(config.settings.endHour)
              if (!isNaN(val) && val >= 0 && val <= 24) next.endHour = val
            }

            return next
          })
        }

        setDomains((prevDomains) => {
          const existingMap = new Map(prevDomains.map((d) => [d.url.toLowerCase().replace(/\/$/, ''), d]))
          const domainsToAdd = []

          config.domains.forEach((d) => {
            if (!d.url) return
            const key = d.url.toLowerCase().replace(/\/$/, '')

            if (existingMap.has(key)) {
              const existing = existingMap.get(key)
              existingMap.set(key, { ...existing, enabled: d.enabled !== false })
            } else {
              domainsToAdd.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                url: d.url,
                status: 'pending',
                lastChecked: null,
                responseTime: null,
                error: null,
                statusCode: null,
                enabled: d.enabled !== false
              })
            }
          })
          return [...Array.from(existingMap.values()), ...domainsToAdd]
        })

        toast.success('CONFIG_IMPORTED', {
          style: { background: '#0f172a', color: '#22d3ee', border: '1px solid #22d3ee' }
        })
      } catch (err) {
        console.error('Import failed', err)
        toast.error('IMPORT_FAILED: INVALID_FORMAT', {
          style: { background: '#0f172a', color: '#ff4b4b', border: '1px solid #ff4b4b' }
        })
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const exportConfig = () => {
    const config = {
      version: 1,
      timestamp: new Date().toISOString(),
      settings,
      domains: domains.map((d) => ({
        url: d.url,
        enabled: d.enabled
      }))
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `domain-monitor-config-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('CONFIG_EXPORTED', {
      style: { background: '#0f172a', color: '#22d3ee', border: '1px solid #22d3ee' }
    })
  }

  const manualScan = () => {
    runScan()
  }

  const toggleBatchImport = () => {
    if (!showBatchImport) setShowSettings(false)
    setShowBatchImport((prev) => !prev)
  }

  const toggleSettings = () => {
    if (!showSettings) setShowBatchImport(false)
    setShowSettings((prev) => !prev)
  }

  const filteredDomains = [...domains]
    .sort((a, b) => {
      if (a.status === 'down' && b.status !== 'down') return -1
      if (a.status !== 'down' && b.status === 'down') return 1
      return 0
    })
    .filter((domain) => {
      if (filterStatus === 'all') return true
      if (filterStatus === 'disabled') return domain.enabled === false
      if (domain.enabled === false) return false
      return domain.status === filterStatus
    })

  return (
    <div className="h-screen flex flex-col text-cyan-50 font-mono p-8 selection:bg-cyan-500 selection:text-black overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'font-mono',
          style: {
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}
      />
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
        <div className="flex-none">
          <Header
            loading={loading}
            showBatchImport={showBatchImport}
            onToggleBatchImport={toggleBatchImport}
            showSettings={showSettings}
            onToggleSettings={toggleSettings}
            manualScan={manualScan}
          />

          <PermissionWarning />

          {showBatchImport && (
            <BatchImportModal value={batchInput} onChange={(e) => setBatchInput(e.target.value)} onSubmit={handleBatchImport} onCancel={() => setShowBatchImport(false)} />
          )}

          {showSettings && (
            <SettingsModal
              settings={settings}
              permission={permission}
              debugLog={debugLog}
              onRequestPermission={requestNotificationPermission}
              onTestNotification={testNotification}
              onTestDelayedNotification={testDelayedNotification}
              onSaveSettings={updateSettings}
              onImportConfig={handleImportConfig}
              onExportConfig={exportConfig}
              onClearAll={clearAllDomains}
            />
          )}

          <FilterBar filterStatus={filterStatus} setFilterStatus={setFilterStatus} domains={domains} />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          <DomainList domains={filteredDomains} hasAnyDomains={domains.length > 0} onScan={scanSingleDomain} onToggle={toggleDomainEnabled} onRemove={removeDomain} />
        </div>
      </div>
    </div>
  )
}

export default App
