Path = require('path')
Hapi = require('hapi')
Hoek = require('hoek')

Base = require('./node_modules/odme/build/main').CB
db = new require('puffer') { host: '127.0.0.1', name: 'default' } #, true of false #last parameter is for mock

elasticsearch = require('elasticsearch')
client = new elasticsearch.Client
  host: 'localhost:9200'
  log: 'trace'

server = new Hapi.Server();
server.connection
  port: 3030
  host: "localhost"

class Post extends Base
  source: db
  PREFIX: 'post'
  doc_type: 'post'
  props:
    title: true
    body: true
    author: true
    created_at: true

pst = new Post
  title: 'Learn NodeJS'
  body: 'This is my blog post about how to learn NodeJS'
  author: 'Jason'
  created_at: '2016-05-15'
###
pst.create().then (d) ->
  console.log d, 'saved'
###
server.route
  method: 'GET'
  path: '/posts/{post_key}'
  handler: (request, reply) ->
    reply server.methods.getDoc encodeURIComponent(request.params.post_key)

server.method
  name: 'getDoc'
  method: (postKey) ->
    Post.get(postKey).then (o) ->
     o

server.route
  method: 'POST'
  path: '/posts'
  handler: (request, reply) ->
    reply insertDoc request.payload

insertDoc = (payload) ->
  if payload.title != undefined & payload.author != undefined & payload.body != undefined
    post = new Post
      title: payload.title
      body: payload.body
      author: payload.author
      created_at: payload.created_at
    post.create().then (d) ->
      'document saved'
  else
    'Title, author and body fields can not be empty'

server.route
  method: 'GET'
  path: '/posts'
  handler: (request, reply) ->
    reply server.methods.getAllDocs()


server.method
  name: 'getAllDocs'
  method: () ->
    client.search
      index: 'posts'
      type: 'post'
      body:
        _source: ['doc.doc_key']
        query:
          match_all: {}
    .then (resp) ->
      #resp.hits.hits[0]._source.doc.doc_key
      result = resp.hits.hits
      keys = []
      for i in [0..result.length-1]
        keys[i] = result[i]._id
      Post.get(keys).then (d) -> d

server.route
  method: 'DELETE'
  path: '/posts/{post_key}'
  handler: (request, reply) ->
    reply server.methods.deleteDoc(encodeURIComponent(request.params.post_key))

server.method
  name: 'deleteDoc'
  method: (docKey) ->
    Post.remove(docKey).then (d) -> d


server.route
  method: 'PUT'
  path: '/posts/{post_key}'
  handler: (request, reply) ->
    reply server.methods.updateDoc(encodeURIComponent(request.params.post_key), request.payload)

server.method
  name: 'updateDoc'
  method: (docKey, payload) ->
    upPost = new Post docKey,
      payload
    upPost.update().then (d) -> d


server.register [
  require('inert')
  require('vision')
  { register: require('lout') }
], (err) -> if err
  err

#console.log server.methods.getDoc 'post_1' #why state is pending by using this code



server.start (err) =>
  throw err if err
  console.log "Server running at #{server.info.uri}"
