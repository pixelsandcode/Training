base = require('odme').Base
couchbase = require('couchbase')
cluster = new couchbase.Cluster()


argv = require('yargs')
  .usage('usage: $0 save -n [name] -a [num] \n or: $0 get --key [DOCUMENT_KEY]')
  .help()
  .argv

class User extends base
  PREFIX: 'doc'
  props:
    name: true
    age: true
    total_logins: false
  _mask: 'name,age'


if argv._.length == 1
  if argv.n != undefined & argv.n != true  & argv.a != undefined & argv.a != true & argv._[0] == 'save'
    bucket = cluster.openBucket()
    usr = new User {name: argv.n , age: argv.a, city: 'tehran', total_logins: 10}
    bucket.upsert usr.key, usr.mask(), (err,result) ->
      try
        console.log 'document saved'
        bucket.disconnect()
      catch err
        console.log err.message
        bucket.disconnect()

  else if argv.key != undefined & argv.key != true & argv._[0] == 'get'
    bucket = cluster.openBucket()
    bucket.get argv.key, (err, result) ->
      try
        console.log result.value
        bucket.disconnect()
      catch err
        console.log 'requested document does not exist'
        bucket.disconnect()
  else
    console.log "command not found... \n Options \n   --help to show help"

else
  console.log "command not found... \n Options \n   --help to show help"