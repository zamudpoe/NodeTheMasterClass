# **How To solve the TypeError :**  _performance.getEntriesByType is not a function

> Just require like this:

```javascript
var _performance        = require('perf_hooks').performance
var PerformanceObserver = require('perf_hooks').PerformanceObserver

var util         = require('util')
var debuglog     = util.debuglog('performance')
```

> **NOTE :** This option is wrong

```javascript
var measurements = _performance.getEntriesByType('measure')
  measurements.forEach(function (measurement) {
  measurement.duration)
})
```

> **NOTE :** This one is the correct way!

```js
// Log out all the measurements
const obs = new PerformanceObserver((measurements) => {
  measurements.getEntries().forEach((measurement) => {
    debuglog('\x1b[33m%s : \x1b[36m\x1b[5m%s\x1b[0m', measurement.name, measurement.duration)
  })
})
obs.observe({entryTypes: ['measure']})
```

That´s all!... now you can run ```NODE_DEBU=performance node index.js```  and make a post to the token route

---

