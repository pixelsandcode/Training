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

const handlers = require('./handlers')(client, User)

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
    handler: handlers.delete_index
  })
  .command({
    command: 'create-index',
    aliases: 'ci',
    builder: {},
    desc: 'Creates "users" index.',
    handler: handlers.create_index
  })
  .command({
    command: 'create-user',
    aliases: 'cu',
    builder: (argv) => argv.demandOption('n', 'd'),
    desc: 'Creates doc in "users" index.',
    handler: handlers.create_user
  })
  .command({
    command: 'search-all',
    aliases: 'sa',
    builder: {},
    desc: 'Returns all users from index.',
    handler: handlers.search_all
  })
  .command({
    command: 'search-user',
    aliases: 'su',
    builder: (argv) => argv.demandOption('n'),
    desc: 'Returns users with exact name from "users".',
    handler: handlers.search_user
  })
  .help('h')
  .argv