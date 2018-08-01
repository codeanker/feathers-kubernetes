[![Dependency Status](https://img.shields.io/david/codeanker/feathers-kubernetes.svg?style=flat-square)](https://david-dm.org/codeanker/feathers-kubernetes)
[![Download Status](https://img.shields.io/npm/dm/@codeanker/feathers-kubernetes.svg?style=flat-square)](https://www.npmjs.com/package/@codeanker/feathers-kubernetes)

# Feathers Kubernetes
this package can expose 2 endpoint that are good for the use of a kubernetes cluster. 
The healthz endpoint for kubernetes pod lifecycle.
And the metrics endpoint a Prometheus endpoint to collect feathers service metrics.

## example

```
const { prometheus, health } = require('feathers-kubernetes')

app.configure(prometheus()) // this must be placed after the this been called
app.configure(health())
```
