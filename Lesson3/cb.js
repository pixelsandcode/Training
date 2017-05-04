const db = new require('puffer')({ host: 'localhost', name: 'default' })
const Base = require('odme').CB({source:db})
const Joi = require('joi')
const argv = require('yargs')

class User extends Base {
  props() {
    return {
      name:{
        schema: Joi.string(),
        whiteList: true
      },
      age:{
        schema: Joi.number().integer().min(14),
        whiteList: true
      }
    }
  }
}
argv
.usage("$0 save -n=[name] -a=[age]" + '\n' + "$0 get --name=[Document-ID]")
.command({
  command: 'save',
  builder: (argv) => argv.demandOption(['n', 'a']),
  desc: 'This command saves the Document to bucket.',
  handler: (argv) => {
    let user = new User ({name: argv.n, age: argv.a})
    user.create(true).then( (result, err) => { if(!err){ console.log(result)} } )
  }
})
.command({
  command: 'get',
  builder: (argv) => argv.demandOption('name'),
  desc: 'This command load the Document from bucket.',
  handler: (argv) => {
    User.get(argv.name).then( (result, err) => { if(!err){ console.log(result)} } )
  }
})

.help()
.argv
