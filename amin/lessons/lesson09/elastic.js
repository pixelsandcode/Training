'use strict'

const ES = require('elasticsearch')
const client = new ES.Client({host: 'localhost:9200'})

client.indices.create({
  index: 'posts',
  body: {
    mappings: {
      post: {
        properties: {
          doc: {
            properties: {
              title: {
                type: 'string'
              },
              docKey: {
                type: 'string'
              },
              docType: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  }
}, (err, res) => {
  if (err) {
    console.error(`\n---------ERROR IN CREATE INDICES:\n${JSON.stringify(err, null, 2)}`)
  } else {
    console.log(`\n---------SUCCESS IN CREATE INDICES:\n${JSON.stringify(res, null, 2)}`)
  }
})
