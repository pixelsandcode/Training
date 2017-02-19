Hapi = require('hapi')
cookieAuth = require('hapi-auth-cookie')

server = new Hapi.Server()
server.connection
  port: 8000
  host: 'localhost'

uuid = 1

users =
  admin:
    id: 'admin'
    password: 'admin'
    name: 'hadi abedi'

home = (request, reply) ->
  if request.auth.isAuthenticated
    reply 'Hello, ' + request.auth.credentials.name
  else
    reply 'You must login to see this page'

login = (request, reply) ->
  if request.auth.isAuthenticated
    return reply.redirect('/')
  message = ''
  account = null

  if !request.payload.username or !request.payload.password
    message = 'Missing username or password'
  else
    account = users[request.payload.username]
    if !account or account.password != request.payload.password
      message = 'Invalid username or password'

  if message
    reply message

  sid = String(++uuid)

  request.server.app.cache.set sid, { account: account }, 0, (err) ->
    if err
      reply err
    request.cookieAuth.set sid: sid
    reply 'You logged in'

logout = (request, reply) ->
  request.cookieAuth.clear()
  reply 'You logged out'

server.register [
  require('inert')
  require('vision')
  { register: require('lout') }
   cookieAuth], (err) ->
  if err
    throw err

  cache = server.cache(
    segment: 'sessions'
    expiresIn: 3 * 24 * 60 * 60 * 1000)

  server.app.cache = cache

  server.auth.strategy 'session', 'cookie', true,
    password: 'password-should-be-32-characters'
    cookie: 'sid-example'
    redirectTo: '/login'
    isSecure: false


    validateFunc: (request, session, callback) ->
      cache.get session.sid, (err, cached) ->
        if err
          return callback(err, false)
        if !cached
          return callback(null, false)
        callback null, true, cached.account
      return


  server.route [
    {
      method: 'GET'
      path: '/'
      config:
        handler: home
        auth: mode: 'try'
        plugins: 'hapi-auth-cookie': redirectTo: false
    }
    {
      method: 'GET'
      path: '/hello/{name}'
      config:
        handler: (request, reply) ->
          if request.auth.isAuthenticated
            reply 'Hello, ' + encodeURIComponent(request.params.name)
          else
            reply 'You must login to see this page'
        auth: mode: 'try'
        plugins: 'hapi-auth-cookie': redirectTo: false

    }
    {
      method: 'GET'
      path: '/ping'
      config:
        handler: (request, reply) ->
          if request.auth.isAuthenticated
            reply 'pong'
          else
            reply 'I will say pong if login'
        auth: mode: 'try'
        plugins: 'hapi-auth-cookie': redirectTo: false
    }
    {
      method: 'POST'
      path: '/login'
      config:
        handler: login
        auth: mode: 'try'
        plugins: 'hapi-auth-cookie': redirectTo: false
    }
    {
      method: 'POST'
      path: '/logout'
      config:
        handler: logout
        auth: false

    }
  ]
  server.start ->
    console.log 'Server ready'

###
server.register [
  require('inert')
  require('vision')
  { register: require('lout') }
], (err) -> if err
  err

###