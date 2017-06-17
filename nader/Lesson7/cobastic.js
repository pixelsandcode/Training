const db = new require('puffer')({
  host: 'localhost',
  name: 'default'
})

const Base = require('odme').CB({
  source: db
})

const elasticsearch = require('elasticsearch')
const Client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
})

const Joi = require('joi')
const argv = require('yargs')

class User extends Base {
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
  _mask() {
    return 'name,dob'
  }
}
argv

.usage(
`node $0 create-index
node $0 delete-index
node $0 create-user --[name] --[dob]
node $0 search-user --[name]
`
)

.command({
  command: 'create-index',
  aliases: 'ci',
  desc: 'This command creates an index in elasticsearch with specifide mapping.',
  handler: (argv) => {

    Client.indices.create({
      index: 'cobastic',
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
  command: 'delete-index',
  aliases: 'di',
  desc: 'This command deletes the cobastic index in elasticsearch.',
  handler: (argv) => {

    Client.indices.delete({
      index: 'cobastic'
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })

  }

})

.alias('n', 'name')
.alias('d', 'dob')

.command({
  command: 'create-user',
  aliases: 'cu',
  builder: (argv) => argv.demandOption(['name', 'dob']),
  desc: 'This command saves the Document to bucket.',
  handler: (argv) => {

    let user = new User({
      name: argv.name,
      dob: argv.dob
    })

    user.create(true).then((result, err) => {
      if (err) {
        console.log(err.message)
      } else {
        console.log(result)
      }
    })

  }
})

.command({
  command: 'search-user',
  aliases: 'su',
  builder: (argv) => argv.demandOption('name'),
  desc: 'This command searches the user whit name in elasticsearch.',
  handler: (argv) => {

    Client.search({
      index: 'cobastic',
      type: 'user',
      body: {
        query: {
          match: {
            "doc.name": argv.name
          }
        }
      }
    })

  }
})

.help('h')
.alias('h', 'help')
.argv
