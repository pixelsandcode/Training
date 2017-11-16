const Puffer = require('puffer')
const db = new Puffer({host: 'localhost', name: 'default'})

const ODME = require('odme')
const Model = ODME.CB({source: db})

const ES = require('elasticsearch')
const client = new ES.Client({host: 'localhost:9200', log: 'error'})

const Joi = require('joi')

class User extends Model {

  _mask() {
    return 'name,dob'
  }

  PREFIX() {
    return 'u'
  }

  props() {
    return {
      name: {
        schema: Joi.string(),
        whiteList: true
      },
      dob: {
        schema: Joi.string(),
        whiteList: true
      }
    }
  }
}

const delete_index = () => {
  if (client.indices.exists({index: 'users'})) {
    client.indices.delete({
      index: 'users'
    }, (err, res) => {
      if (err) {
        console.log(`\nERROR IN DELETE:\n${JSON.stringify(err, null, 2)}`)
      } else {
        console.log(`\nDELETE USER INDEX:\n${JSON.stringify(res, null, 2)}`)
      }
    })
  }
}

const create_index = () => {
  client.indices.create({
    index: 'users',
    body: {
      mappings: {
        user: {
          properties: {
            doc: {
              properties: {
                name: {
                  type: 'string',
                  index: 'not_analyzed'
                },
                dob: {
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
      console.log(`\nERROR IN CREATE INDICES:\n${JSON.stringify(err, null, 2)}`)
    } else {
      console.log(`\nSUCCESS IN CREATE INDICES:\n${JSON.stringify(res, null, 2)}`)
    }
  })
}

const create_user = (argv) => {
  const user = new User({
    name: argv.name,
    dob: argv.dob
  })
  user.create(true).then((res, err) => {
    if (err) {
      console.log(`\nERROR IN DOCS:\n${JSON.stringify(err, null, 2)}`)
    } else {
      console.log(`\nADD NEW USER:\n${JSON.stringify(res, null, 2)}`)
    }
  })
}

const search_all = () => {
  client.search({
    index: 'users',
    type: 'user',
    query: {
      match_all: {}
    }
  }, (err, res) => {
    if (err) {
      console.log(`\nERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
    } else {
      console.log(`\nALL USERS:\n${JSON.stringify(res.hits.hits, null, 2)}`)
    }
  })
}

const search_user = (argv) => {
  client.search({
    index: 'users',
    type: 'user',
    body: {
      filter: {
        term: {
          "doc.name": argv.name
        }
      }
    }
  }, (err, res) => {
    if (err) {
      console.log(`\nERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
    } else {
      console.log(`\nUSERS WITH NAME='${argv.name}':\n${JSON.stringify(res, null, 2)}`)
    }
  })
}

const argv = require('yargs')
  .usage(`$0 delete-index
          $0 create-index
          $0 create-user --[name] --[dob]
          $0 search-all-users
          $0 search-user-name --[name]`)
  .alias('n', 'name')
  .alias('d', 'dob')
  .alias('h', 'help')

  .command({
    command: 'delete-index',
    aliases: 'di',
    builder: {},
    desc: 'Deletes "users" index form elasticsearch.',
    handler: delete_index
  })

  .command({
    command: 'create-index',
    aliases: 'ci',
    builder: {},
    desc: 'Creates "users" index.',
    handler: create_index
  })

  .command({
    command: 'create-user',
    aliases: 'cu',
    builder: (argv) => argv.demandOption('n', 'd'),
    desc: 'Creates doc in "users" index.',
    handler: create_user
  })

  .command({
    command: 'search-all',
    aliases: 'sa',
    builder: {},
    desc: 'Returns all users from index.',
    handler: search_all
  })

  .command({
    command: 'search-user',
    aliases: 'su',
    builder: (argv) => argv.demandOption('n'),
    desc: 'Returns users with exact name from "users".',
    handler: search_user
  })

  .help('h')
  .argv