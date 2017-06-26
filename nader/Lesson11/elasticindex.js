#!/usr/bin/env node

'use strict';

const es = require('elasticsearch')
const client = new es.Client({
  host: 'localhost:9200',
  log: 'trace'
})

client.indices.create({
  index: 'jwt-user' ,
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
}, (error, response) => {
  if(error) {
    console.log(error.message)
  } else {
    console.log(response)
  }
})
