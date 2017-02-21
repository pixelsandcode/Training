Hapi = require('hapi')
JWT = require('jsonwebtoken')

elasticsearch = require('elasticsearch')
client = new elasticsearch.Client
  host: 'localhost:9200'
  log: 'trace'

Base = require('./node_modules/odme/build/main').CB
db = new require('puffer') { host: '127.0.0.1', name: 'default' }

class Users extends Base
  source: db
  PREFIX: 'user'
  doc_type: 'user'
  props:
    email: true
    password: true
    fullname: true
    dob: true
    weight: true
    height: true

class Tokens extends Base
  source: db
  PREFIX: 'token'
  props:
    encoded_token: true

# bring your own validation function

validate = (decoded, request, callback) ->
# do your checks to see if the person is valid
  client.search
    index: 'jwt-index'
    type: 'token'
    body:
      query:
        term:
          encoded_token: request.auth.token
  .then (response) ->
    if response.hits.total == 0 # if token wasn't in blacklist check token validation
      client.search
        index: 'jwt-index'
        type: 'user'
        body:
          query:
            term:
              email: decoded.id
      .then (resp) ->
        if resp.hits.total == 0
          callback null, false
        else
          callback null, true
    else                            # if token was in black list don't validate the token
      callback null, false

server = new (Hapi.Server)
server.connection port: 8000

# include our module here ↓↓
server.register [require('hapi-auth-jwt2'), require('inert'), require('vision'), require('lout')], (err) ->
  if err
    throw err

  secret = 'NeverShareYourSecret'
  server.auth.strategy 'jwt', 'jwt',
    key: secret
    validateFunc: validate
    verifyOptions: algorithms: [ 'HS256' ]

  server.auth.default 'jwt'

  server.route [
    {
      method: 'GET'
      path: '/'
      config: auth: false
      handler: (request, reply) ->
        reply text: 'Token not required'
        return

    }
    {
      method: 'POST'
      path: '/signup'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: signup

    }
    {
      method: 'POST'
      path: '/login'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: login

    }
    {
      method: 'GET'
      path: '/me'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: me

    }
    {
      method: 'GET'
      path: '/feed'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: feed

    }
    {
      method: 'POST'
      path: '/logout'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: logout

    }
  ]
  return
server.start ->
  console.log 'Server running at:', server.info.uri
  return

login = (request, reply) ->
  if request.auth.isAuthenticated
    reply(text: 'Already logged in. You used a Token!').header 'Authorization', request.headers.authorization

  else if Boolean(request.payload.email) & Boolean(request.payload.password)
    client.search
      index: 'jwt-index'
      type: 'user'
      body:
        query:
          bool:
            must:
              [
                {
                  term:
                    email: request.payload.email
                }
                {
                  term:
                    password: request.payload.password
                }
              ]
    .then (resp) ->
      if resp.hits.total == 0
        reply 'wrong email or password'
      else
        obj =
          id: request.payload.email
        token = JWT.sign(obj, 'NeverShareYourSecret', {expiresIn: 60})
        reply(text: 'You logged in!', jwtToken: token).header 'Authorization', token
  else
    reply 'missing email and/or password'

signup = (request, reply) ->
  if request.auth.isAuthenticated
    reply 'Already signed up'
  else
    payload = request.payload
    if Boolean(payload.email) & Boolean(payload.password) & Boolean(payload.fullname) & Boolean(payload.dob) & Boolean(payload.weight) & Boolean(payload.height)
      client.search
        index: 'jwt-index'
        type: 'user'
        body:
          query:
            term:
              email: payload.email
      .then (resp) ->
        if resp.hits.total == 0
          user = new Users
            email: payload.email
            password: payload.password
            fullname: payload.fullname
            dob: payload.dob
            weight: payload.weight
            height: payload.height
          user.create().then (d) ->
            reply 'signed up'
        else
          reply 'Email already exists'
    else
      reply 'email, password, fullname, dob, weight and height fields can not be empty'

me = (request, reply) ->
  if request.auth.isAuthenticated
    decodedToken =  request.auth.credentials
    tokenEmail = decodedToken.id
    client.search
      index: 'jwt-index'
      type: 'user'
      body:
        query:
          term:
            email: tokenEmail
    .then (response) ->
      reply response.hits.hits[0]._source.doc
  else
    reply 'Not authenticated'

feed = (request, reply) ->
  if request.auth.isAuthenticated
    decodedToken =  request.auth.credentials
    tokenEmail = decodedToken.id
    client.search
      index: 'jwt-index'
      type: 'user'
      body:
        query:
          term:
            email: tokenEmail
    .then (response) ->
      nameOfUser = response.hits.hits[0]._source.doc.fullname
      reply  [{ card: 'menu' }, { card: 'profile', name: nameOfUser } ]
  else
    reply  [{ card: 'menu' }, { card: 'login' }]

logout = (request, reply) ->
  if request.auth.isAuthenticated
    token = new Tokens
      encoded_token: request.auth.token
    token.create().then (d) ->
      reply('You logged out')
  else
    reply 'You must login first'