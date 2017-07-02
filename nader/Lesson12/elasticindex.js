#!/usr/bin/env node

'use strict';

const es = require('elasticsearch')
const client = new es.Client({
  host: 'localhost:9200',
  log: 'trace'
})

client.indices.create({
  index: 'jwt-user-post' ,
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
              name: {
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
              title: {
                type: 'string'
              },
              body: {
                type: 'string'
              },
              author: {
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
