"use strict"

module.exports = (server, options) => {

  const User = require('./models/user')(server, options)
  const Post = require('./models/post')(server, options)
  const B_Token = require('./models/blocked-tokens')(server, options)

  server.method('method.name', () => {

  })

}
