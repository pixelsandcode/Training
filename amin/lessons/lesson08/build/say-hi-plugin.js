'use strict'

const sayHiPlugin =
  {
    register: (server, options, next) => {
      server.route(require('./routes')())
      next()
    }
  }

sayHiPlugin.register.attributes = {
  name: 'say-hi-plugin',
  version: '1.0.0'
}

module.exports = sayHiPlugin