'use strict'

const ES = require('elasticsearch')
const client = new ES.Client({host: 'localhost:9200'})

client.indices.create({
  index: 'users_jwt',
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
              dob: {
                type: 'string'
              },
              weight: {
                type: 'string'
              },
              height: {
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
      }
    }
  }
}, (err, res) => {
  if (err) {
    console.error(`\nERROR IN CREATE INDEX:\n${JSON.stringify(err, null, 2)}`)
  } else {
    console.log(`\nSUCCESS IN CREATE INDEX:\n${JSON.stringify(res, null, 2)}`)
  }
})
