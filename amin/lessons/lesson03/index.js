const Joi = require('joi')
const couchbase = require('couchbase')
const cluster = new couchbase.Cluster('couchbase://127.0.0.1')
const bucket = cluster.openBucket('default')
const Base = require('odme').CB({source: bucket})

class User extends Base {
  props() {
    return {
      key: {
        schema: Joi.string(),
        whitelist: true
      },
      name: {
        schema: Joi.string(),
        whitelist: true
      },
      age: {
        schema: Joi.number().integer().min(1).max(150),
        whitelist: true
      }
    }
  }
}

argv = require('yargs')
  .usage('usage: $0 save -n [name] -a [num] \n or: $0 get --key [DOCUMENT_KEY]')
  .alias('n', 'name')
  .alias('a', 'age')
  .alias('k', 'key')
  .command(
    'save',
    'save a doc in database',
    //(argv) => {
    //  argv.demandOption(['name', 'age'])
    //},
    {},
    (argv) => {
      user = new User({
        key: 'u:5',
        name: argv.name,
        age: argv.age
      })
      user.save().then((result, err) => {
        if (err) throw err
        console.log(result.value)
      })
    })
  .command(
    'get',
    'get a doc from database with specific id',
    //(argv) => {
    //  argv.demandOption(['name'])
    //},
    {},
    (argv) => {
      User.get(argv.key).then((err, result) => {
        if (err) throw err
        console.log(result.value)
      });
    })
  .help()
  .argv
