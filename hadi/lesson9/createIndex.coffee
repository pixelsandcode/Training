elasticsearch = require('elasticsearch')
client = new elasticsearch.Client
  host: 'localhost:9200'
  log: 'trace'

client.indices.create
  index: 'posts'
  body:
    mappings:
      post:
        _source:
          includes: ['doc.title', 'doc.doc_key', 'doc.doc_type']
          properties:
            doc:
              properties:
                title:
                  type: 'string'
                doc_key:
                  type: 'string'
                doc_type:
                  type: 'string'
  (err, res) ->
    if err
      console.log err.message
    else
      console.log res
