"use strict"

module.exports = (server, options) => {

  const Blog = require('./models/sample')(server, options)

  server.method('method.name', () => {

  })

}
