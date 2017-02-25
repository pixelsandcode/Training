JWT = require('jsonwebtoken')
Q   = require('q')

elasticsearch = require('elasticsearch')
client = new elasticsearch.Client
  host: 'localhost:9200'
  log: 'trace'

Base = require('./node_modules/odme/build/main').CB
db = new require('puffer') { host: '127.0.0.1', name: 'default' }

secret = 'NeverShareYourSecret'

verify = (token, key) ->
  deferred = Q.defer()
  JWT.verify token, secret, (err, decoded) ->
    if err
      if err.name == 'TokenExpiredError'
        Tokens.remove(key).then (d) -> deferred.resolve()
    deferred.resolve()
  deferred.promise

class Tokens extends Base
  source: db
  PREFIX: 'token'
  props:
    encoded_token: true

client.search
  index: 'blog'
  type: 'token'
  body:
    query:
      match_all: {}
.then (resp) ->
  total = resp.hits.total
  result = resp.hits.hits
  promises = []
  for i in [0..total-1]
    token = result[i]._source.doc.encoded_token
    key = result[i]._id
    promises.push verify(token, key)
  Q.all(promises)
  .then ->
    console.log "all expired tokens deleted"
