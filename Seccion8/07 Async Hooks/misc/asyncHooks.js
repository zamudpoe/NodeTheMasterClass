/*
  Asyn Hooks Example
*/

// Dependencies
var async_hooks = require('async_hooks')
var fs          = require('fs')

// Target execution context
var targetExecutionContext = false

// Return the ID of the current execution context.
const eid = async_hooks.executionAsyncId()

// Return the ID of the handle responsible for triggering the callback of the
// current execution scope to call.
const tid = async_hooks.triggerAsyncId()

// Write an arbitrary async function
var whatTimeIsIt = (callback) => {
  setInterval(() => {
    fs.writeSync(1, '\nWhen the setInterval runs, the executions context is ' + eid + '\n')
    callback(Date.now())
  }, 1000)
}

// call the function
whatTimeIsIt((time) => {
  fs.writeSync(1, "\tThe time is " + time + "\n")
})

var hooks = {
  //
  // The following are the callbacks that can be passed to createHook().
  //

  // init is called during object construction. The resource may not have
  // completed construction when this callback runs, therefore all fields of the
  // resource referenced by "asyncId" may not have been populated.
  init (asyncId, type, triggersAsyncId, resource) {
    fs.writeSync(1, "\n\t>>>>>> Hook init <<<<<<<<"+asyncId+"\n")
  },
  // Before is called just before the resource's callback is called. It can be
  // called 0-N times for handles (e.g. TCPWrap), and will be called exactly 1
  // time for requests (e.g. FSReqCallback).
  before (asyncId) {
    fs.writeSync(1, "\n\tHook before "+asyncId+"\n")
  },
  // After is called just after the resource's callback has finished.
  after (asyncId) {
    fs.writeSync(1, "\n\tHook after "+asyncId+"\n")
  },
  // Destroy is called when an AsyncWrap instance is destroyed.
  destroy (asyncId) {
    fs.writeSync(1, "\n\tHook destroy "+asyncId+"\n")
  },
  // promiseResolve is called only for promise resources, when the
  // `resolve` function passed to the `Promise` constructor is invoked
  // (either directly or through other means of resolving a promise)
  promiseResolve (asyncId) {
    fs.writeSync(1, "\n\tHook promiseResolve "+asyncId+"\n")
  },
}

// We need create a new asynHooks instance module
var asyncHook = async_hooks.createHook(hooks)
asyncHook.enable()
/* asyncHook.disable() */
