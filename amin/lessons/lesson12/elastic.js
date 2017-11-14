'use strict'

const ES = require('elasticsearch')
const client = new ES.Client({host: 'localhost:9200'})

client.indices.create({
  index: 'blog',
  body: {
    mappings: {
      user: {
        properties: {
          doc: {
            properties: {
              email: {
                type: 'string',
                index: 'not_analyzed'
              },
              password: {
                type: 'string',
                index: 'not_analyzed'
              },
              fullname: {
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
      },
      jwt: {
        properties: {
          doc: {
            properties: {
              token: {
                type: 'string',
                index: 'not_analyzed'
              }
            }
          }
        }
      },
      post: {
        properties: {
          doc: {
            properties: {
              author_name: {
                type: 'string',
                index: 'not_analyzed'
              },
              author_email: {
                type: 'string',
                index: 'not_analyzed'
              },
              title: {
                type: 'string'
              },
              body: {
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