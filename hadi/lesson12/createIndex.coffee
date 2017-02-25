elasticsearch = require('elasticsearch')
client = new elasticsearch.Client
  host: 'localhost:9200'
  log: 'trace'

client.indices.create
  index: 'blog'
  body:
    mappings:
      user:                # _source and properties indentation must be same.
        _source: includes: ['doc.*']
        properties:
          doc:             # that's because of odme structure
            properties:
              email:
                type: 'string'
                index: 'not_analyzed'
              password:
                type: 'string'
                index: 'not_analyzed'
              fullname:
                type: 'string'
      post:
        properties:
          doc:
            properties:
              title:
                type: 'string'
              body:
                type: 'string'
              author:
                type: 'string'
                index: 'not_analyzed'
      token:                      # blacklisted tokens
        properties:
          doc:
            properties:
              encoded_token:
                type: 'string'
                index: 'not_analyzed'
  (err, res) ->
    if err
      console.log err.message
    else
      console.log res
