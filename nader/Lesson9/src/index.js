#!/usr/bin/env node

const db = new require('puffer')({
  host: 'localhost',
  name: 'default'
})

const Base = require('odme').CB({
  source: db
})

const BaseJoi = require('joi')
const Extension = require('joi-date-extensions')
const Joi = BaseJoi.extend(Extension)
const argv = require('yargs')

class Post extends Base {
  PREFIX() {
    return 'post'
  }
  props() {
    return {
      title: {
        schema: Joi.string(),
        whiteList: true
      },
      body: {
        schema: Joi.string(),
        whiteList: true
      },
      author: {
        schema: Joi.string(),
        whiteList: true
      },
      created_at: {
        schema: Joi.date().format('YYYY-MM-DD'),
        whiteList: true
      }
    }
  }
}

argv

.usage(
  " $0 create-index " + '\n' +
  " $0 create-doc " + '\n' +
  " $0 get-doc --[docKey]"
)

.command({
  command: 'create-index',
  desc: 'This command will make an index in elasticsearch with specified mappings.',
  aliases: 'ci',
  handler: (argv) => {

    const es = require('elasticsearch')
    const client = new es.Client({
      host: 'localhost:9200',
      log: 'trace'
    })

    client.indices.create({
      index: 'post',
      body: {
        mappings: {
          post: {
            _source: {
              includes:['doc.title','doc.docKey','doc.docType']
            },
            properties: {
              doc:{
                properties: {
                  title: {
                    type: 'string',
                    index: 'not_analyzed'
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
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })
  }
})

.command({
  command: 'create-doc',
  desc: 'This command will make post doc in couchbase bucket.',
  aliases: 'cd',
  handler: (argv) => {

    var key = 'post_1'

    let pst = new Post({
      title: 'Learn NodeJS',
      body: 'This is my blog post about how to learn NodeJS',
      author: 'Jason',
      created_at: '2016-05-15'
    }, key)

    pst.create(true).then(
      (err, result) => {
        if (err) {
          console.error(err)
        } else {
          console.log(result)
        }
      }
    )



  }
})

.alias('d', 'docKey')

.command({
  command: 'get-doc',
  desc: 'This command will get the doc with the docKey.',
  aliases: 'gd',
  builder: (argv) => argv.demandOption('d'),
  handler: (argv) => {

    Post.get(argv.d).then( (d) => console.log(d))

  }
})

.help('h')
.alias('h', 'help')
.argv
