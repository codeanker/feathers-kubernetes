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
