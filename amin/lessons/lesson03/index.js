const db = new require('puffer')({host: 'localhost', name: 'default'})
const Model = require('odme').CB({source: db})
const Joi = require('joi')

class User extends Model {
  props() {
    return {
      name: {
        schema: Joi.string(),
        whiteList: true
      },
      age: {
        schema: Joi.number().integer().min(14),
        whiteList: true
      }
    }
  }
}

const argv = require('yargs')
  .usage('$0 save --name=[name] --age=[age] \n $0 get --name=[docID]')
  .alias('n', 'name')
  .alias('a', 'age')
  .command({
    command: 'save',
    aliases: 's',
    builder: (argv) => argv.demandOption(['n', 'a']),
    desc: 'This command saves the Document into bucket.',
    handler: (argv) => {
      let user = new User({
        name: argv.name,
        age: argv.age
      })
      user.create(true).then((res) => {
        console.log(res)
      })
    }
  })
  .command({
    command: 'get',
    aliases: 'g',
    builder: (argv) => argv.demandOption('n'),
    desc: 'This command load the Document from bucket.',
    handler: (argv) => {
      User.get(argv.name).then((res) => {
        console.log(res.doc)
      })
    }
  })
  .help()
  .argv