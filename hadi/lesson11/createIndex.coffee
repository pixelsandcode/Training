elasticsearch = require('elasticsearch')
client = new elasticsearch.Client
  host: 'localhost:9200'
  log: 'trace'

client.indices.create
  index: 'jwt-index'
  body:
    mappings:
      user:                # _source and properties indentation must be same.
        _source: includes: ['doc.*']
        properties:
          doc:
            properties:
              email:
                type: 'string'
                index: 'not_analyzed'
              password:
                type: 'string'
                index: 'not_analyzed'
              fullname:
                type: 'string'
              dob:
                type: 'string'
              weight:
                type: 'string'
              height:
                type: 'string'
              doc_type:
                type: 'string'
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
