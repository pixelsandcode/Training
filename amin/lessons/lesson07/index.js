const Puffer = require('puffer')
const db = new Puffer({
  host: 'localhost',
  name: 'default'
})

const ODME = require('odme')
const Model = ODME.CB({source: db})

const ES = require('elasticsearch')
const client = new ES.Client({
  host: 'localhost:9200',
  //log: 'trace'
})

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
    handler: () => {
      if (client.indices.exists({index: 'users'})) {
        client.indices.delete({
          index: 'users'
        }, (err, res) => {
          if (err) {
            console.log(`\n---------ERROR IN DELETE:\n${JSON.stringify(err, null, 2)}`)
          } else {
            console.log(`\n---------DELETE USER INDEX:\n${JSON.stringify(res, null, 2)}`)
          }
        })
      }
    }
  })

  .command({
    command: 'create-index',
    aliases: 'ci',
    builder: {},
    desc: 'Creates "users" index.',
    handler: () => {
      client.indices.create({
        index: 'users',
        body: {
          mappings: {
            users: {
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
          console.log(`\n---------ERROR IN CREATE INDICES:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------SUCCESS IN CREATE INDICES:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .command({
    command: 'create-user',
    aliases: 'cu',
    builder: (argv) => argv.demandOption('n', 'd'),
    desc: 'Creates doc in "users" index.',
    handler: (argv) => {
      const user = new User({
        name: argv.name,
        dob: argv.dob
      })
      user.create(true).then((res, err) => {
        if (err) {
          console.log(`\n---------ERROR IN DOCS:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------ADD NEW USER:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .command({
    command: 'search-all-user',
    aliases: 'a',
    builder: {},
    desc: 'Returns all users from index.',
    handler: () => {
      client.search({
        index: 'users',
        //q: 'type:user'
        docType: 'user',
        query: {
          match_all: {}
          //type: 'user'
        }
      // client.search({
      //   body: {}
      }, (err, res) => {
        if (err) {
          console.log(`\n---------ERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------ALL USERS:\n${JSON.stringify(res, null, 2)}`)
        }
      })
      console.log('search all users')
    }
  })

  .command({
    command: 'search-user-name',
    aliases: 's',
    builder: (argv) => argv.demandOption('n'),
    desc: 'Returns users with exact name from "users".',
    handler: (argv) => {
      client.search({
        index: 'users',
        docType: 'user',
        //type: 'user',
        body: {
          filter: {
            term: {
              "doc.name": argv.name
            }
          }
        }
      }, (err, res) => {
        if (err) {
          console.log(`\n---------ERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------LIST OF USERS WITH NAME='${argv.name}':\n
          ${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .help('h')
  .argv