const client = require('prom-client')

export default function (options = {}) {
  options = {
    endpoint: '/metrics',
    ...options
  }
  return function() {
    const app = this

    app.get(options.endpoint, (req, res) => {
      res.set('Content-Type', client.register.contentType)
      res.end(client.register.metrics())
    })

    app.hooks({
      before: { all: timeStart },
      after: { all: timeEnd },
      error: {
        all: (hook) => {
          hook._log = hook._log || { hrtime: [0, 0], elapsed: 0 }
  
          if (hook._log.hrtime !== 0) {
            const diff = process.hrtime(hook._log.hrtime || [0, 0])
            hook._log.elapsed = (diff[0] * 1e9) + diff[1]
          }
          pendingGauge.labels(hook.path, hook.method, hook.params.provider || 'server').dec()
          errorHistogram.labels(hook.path, hook.method, hook.params.provider || 'server').observe(1)
        }
      }
    })
  }
}

const responseTimeHistogram = new client.Histogram({
  name: 'responseTime',
  help: 'Response Time',
  buckets: [0.1, 5, 15, 50, 100, 500],
  labelNames: ['service','method','provider']
})

const resultItemsCountHistogram = new client.Histogram({
  name: 'resultItemsCount',
  help: 'Total requests',
  buckets: [0.1, 5, 15, 50, 100, 500],
  labelNames: ['service','method', 'provider']
})

const errorHistogram = new client.Histogram({
  name: 'error',
  help: 'errors',
  buckets: [0.1, 5, 15, 50, 100, 500],
  labelNames: ['service','method', 'provider']
})

const pendingGauge = new client.Gauge({
  name: 'pending',
  help: 'pending service calls',
  labelNames: ['service','method', 'provider']
})

function timeStart (hook) {
  const route = hook.path // feathers-hooks v1.7.0 required
  pendingGauge.labels(route, hook.method, hook.params.provider || 'server').inc()
  hook._log = {
    route,
    hrtime: [0, 0],
    elapsed: 0
  }
  hook._log.hrtime = process.hrtime() // V8 bug: breaks if inside the above object literal

  return hook
}

function timeEnd (hook) {
  if (!hook._log || !hook._log.hrtime) return
  const diff = process.hrtime(hook._log.hrtime)

  hook._log.elapsed = (diff[0] * 1e9) + diff[1]
  responseTimeHistogram.labels(hook._log.route, hook.method, hook.params.provider || 'server').observe( hook._log.elapsed / 1e6 )
  pendingGauge.labels(hook._log.route, hook.method, hook.params.provider || 'server').dec()
  
  if (hook.method === 'find' || hook.method === 'get') {
    const items = getItems(hook)
    resultItemsCountHistogram.labels(hook._log.route, hook.method, hook.params.provider || 'server').observe( Array.isArray(items) ? items.length : 1 )
  }

  function getItems (hook) { // to reduce complexity for code climate
    const result = hook.result
    return result ? result.data || result : result
  }
}
