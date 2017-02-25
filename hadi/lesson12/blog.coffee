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

class Tokens extends Base
  source: db
  PREFIX: 'token'
  props:
    encoded_token: true

class Posts extends Base
  source: db
  PREFIX: 'post'
  doc_type: 'post'
  props:
    title: true
    body: true
    author: true

# bring your own validation function

validate = (decoded, request, callback) ->
# do your checks to see if the person is valid
  client.search
    index: 'blog'
    type: 'token'
    body:
      query:
        term:
          encoded_token: request.auth.token
  .then (response) ->
    if response.hits.total == 0 # if token wasn't in blacklist, check token validation
      client.search
        index: 'blog'
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
      method: 'POST'
      path: '/register'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: register

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
      method: 'POST'
      path: '/logout'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: logout

    }
    {
      method: 'GET'
      path: '/me'
      config:
        auth: 'jwt'    # if authentication fails, hapi raise an error (handler unaccessable)
        handler: me
    }
    {
      method: 'GET'
      path: '/posts/{post_key}'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: getPost
    }
    {
      method: 'POST'
      path: '/posts'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: createPost
    }
    {
      method: 'GET'
      path: '/posts'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: getAllPosts
    }
    {
      method: 'GET'
      path: '/me/posts'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: getMyPosts
    }
    {
      method: 'DELETE'
      path: '/posts/{post_key}'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: deletePost
    }
    {
      method: 'PUT'
      path: '/posts/{post_key}'
      config:
        auth:
          mode: 'try'
          strategy: 'jwt'
        handler: updatePost
    }
  ]
  return

server.start ->
  console.log 'Server running at:', server.info.uri
  return


register = (request, reply) ->
  if request.auth.isAuthenticated
    reply 'Already signed up'
  else
    payload = request.payload
    if Boolean(payload.email) & Boolean(payload.password) & Boolean(payload.fullname)
      client.search
        index: 'blog'
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
          user.create()
          .then (d) ->
            reply d
        else
          reply 'Email already exists'
    else
      reply 'email, password and fullname fields can not be empty'

login = (request, reply) ->
  if request.auth.isAuthenticated
    reply(text: 'Already logged in. You used a Token!').header 'Authorization', request.headers.authorization

  else if Boolean(request.payload.email) & Boolean(request.payload.password)
    client.search
      index: 'blog'
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
        token = JWT.sign(obj, 'NeverShareYourSecret', {expiresIn: 60 * 60})
        reply(text: 'You logged in!', jwtToken: token).header 'Authorization', token
  else
    reply 'missing email and/or password'

logout = (request, reply) ->
  if request.auth.isAuthenticated
    token = new Tokens
      encoded_token: request.auth.token
    token.create().then (d) ->
      reply(d)
  else
    reply 'You must login first'

me = (request, reply) ->
  decodedToken =  request.auth.credentials
  tokenEmail = decodedToken.id
  client.search
    index: 'blog'
    type: 'user'
    body:
      _source:
        includes: ['doc.email', 'doc.fullname']
      query:
        term:
          email: tokenEmail
  .then (response) ->
    reply response.hits.hits[0]._source.doc

getPost = (request, reply) ->
  if request.auth.isAuthenticated
    Posts.get(encodeURIComponent(request.params.post_key))
      .then (d) -> reply d
      #.catch(err) -> err
  else
    reply 'You must login to see the post'


createPost = (request, reply) ->
  if request.auth.isAuthenticated
    if Boolean(request.payload.title) & Boolean(request.payload.body)
      post = new Posts
        title: request.payload.title
        body: request.payload.body
        author: request.auth.credentials.id
      post.create().then (d) ->
        reply d
    else
      reply 'title and body fields can not be empty'
  else
    reply 'You must login first'

getAllPosts = (request, reply) ->
  if request.auth.isAuthenticated
    if !request.query.page
      client.search
        index: 'blog'
        type: 'post'
        body:
          sort: [
            {title: 'asc'}
            {body: 'asc'}
          ]
          from: 0
          size: 5
          _source:
            includes: ['doc.*']
          query:
            match_all: {}
      .then (resp) ->
        reply resp
    else
      client.search
        index: 'blog'
        type: 'post'
        body:
          sort: [
            {title: 'asc'}
            {body: 'asc'}
          ]
          from: 5 * request.query.page
          size: 5
          _source:
            includes: ['doc.*']
          query:
            match_all:{}
      .then (resp) ->
        reply resp
  else
    reply 'You must login first'


### pagination by scroll
    client.search
      index: 'blog'
      type: 'post'
      scroll: '30s'
      body:
        sort: [
          {title: 'asc'}
          {body: 'asc'}
        ]
        size: 5
        _source:
          includes: ['doc.*']
        query:
          match_all: {}
    .then (resp) ->
      #reply resp
      client.scroll
        scrollId: resp._scroll_id
        scroll: '30s'
      .then (response) ->
        reply response

###

getMyPosts = (request, reply) ->
  if request.auth.isAuthenticated
    if !request.query.page
      client.search
        index: 'blog'
        type: 'post'
        body:
          sort: [
            {title: 'asc'}
            {body: 'asc'}
          ]
          from: 0
          size: 5
          _source:
            includes: ['doc.*']
          query:
            term:
              author: request.auth.credentials.id
      .then (resp) ->
        reply resp
    else
      client.search
        index: 'blog'
        type: 'post'
        body:
          sort: [
            {title: 'asc'}
            {body: 'asc'}
          ]
          from: 5 * request.query.page
          size: 5
          _source:
            includes: ['doc.*']
          query:
            term:
              author: request.auth.credentials.id
      .then (resp) ->
        reply resp
  else
    reply 'You must login first'

deletePost = (request, reply) ->
  if request.auth.isAuthenticated
    postKey = encodeURIComponent(request.params.post_key)
    currentUserEmail = request.auth.credentials.id
    client.search
      index: 'blog'
      type: 'post'
      body:
        query:
          term:
            _id: postKey
    .then (resp) ->
      if resp.hits.total == 1
        author = resp.hits.hits[0]._source.doc.author
        if currentUserEmail == author
          Posts.remove(postKey).then (d) ->
            reply d
        else
          reply 'You are not the owner of post'
      else
        reply 'requested post does not exist'
  else
    reply 'You must login first'

updatePost = (request, reply) ->
  if request.auth.isAuthenticated
    payload = request.payload
    Posts.get(encodeURIComponent(request.params.post_key))
    .then (post) ->
      if post.doc.author == request.auth.credentials.id
        if Boolean(payload.title) or Boolean(payload.body)
          if payload.title
            post.doc.title = payload.title
          if payload.body
            post.doc.body = payload.body
          post.update().then (d) ->
            reply d
        else
          reply 'Nothing to update, title and/or body fields are empty'
      else
        reply 'You are not the owner of post'
    .catch (err) ->
      reply 'The post does not exist' #err
  else
    reply 'You must login first'
