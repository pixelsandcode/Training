//const Hapi = require('hapi')
//const bucket = new require('puffer')({host: '127.0.0.1', name: 'users'}, true);

const couchbase = require('couchbase')
const cluster = new couchbase.Cluster('couchbase://127.0.0.1')
const bucket = cluster.openBucket('default')

const Joi = require('joi')
const Base = require('odme').CB({source: bucket})
const argv = require('yargs')

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

//console.log(bucket.get('u:1').value.toString())

/*argv
  .usage('usage: $0 save -n [name] -a [num] \n or: $0 get --key [DOCUMENT_KEY]')
  .alias('n', 'name')
  .alias('a', 'age')
  .alias('k', 'key')
  .command({
    command: 'save',
    desc: 'save a doc in database',
    //builder: (argv) => {
    //  argv.demandOption(['name', 'age'])
    //},
    builder: {},
    handler: (argv) => {
      user = new User({
        key: 'u:5',
        name: argv.name,
        age: argv.age
      })
      user.create(true).then((result, err) => {
        if (err) throw err
        console.log(result.value)
      })
    }
  })
  .command({
    command: 'get',
    desc: 'get a doc from database with specific id',
    //(argv) => {
    //  argv.demandOption(['name'])
    //},
    builder: {},
    handler: (argv) => {
      User.get(argv.key).then((err, result) => {
        if (err) throw err
        console.log(result.value)
      });
    }
  })
  .help()
  .argv*/

argv
  .alias('n', 'name')
  .alias('a', 'age')
  .alias('k', 'key')
  .command('save', 'save a doc in database', {},
    (argv) => {
      user = new User({key: 'u:5', name: argv.name, age: argv.age})
      console.log(user)
      user.create().then((result, err) => {
        if (err) throw err
        console.log(result.value)
      })
    }
  )
  .command('get', 'get a doc from database with specific id', {},
    (argv) => {
      User.get(argv.key).then((err, result) => {
        if (err) throw err
        console.log(result.value)
      });
    }
  )
  .argv