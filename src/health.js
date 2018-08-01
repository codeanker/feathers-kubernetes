export default function (options = {}) {
  options = {
    endpoint: '/healthz',
    ...options
  }
  return function() {
    const app = this
    app.get(options.endpoint, (req, res, next) => {
      let checks = []
      if(options.mongodb) checks.push(new Promise((resolve, reject) => {
        if(!options.mongodb.db) reject()
        options.mongodb.db.admin().ping(err => err ? reject(err) : resolve() )
      }))
      if (options.redis) options.redis.ping()
      Promise.all(checks)
        .then(() => res.sendStatus(200))
        .catch(err => next(err))
    })
  }
}