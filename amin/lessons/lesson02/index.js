const couchbase = require('couchbase')
const cluster = new couchbase.Cluster('couchbase://127.0.0.1')
const bucket = cluster.openBucket('default')

const argv = require('yargs')
  .usage('$0 save --name=[name] --age=[age]' +
         '$0 get --name=[docID]')
  .alias('n', 'name')
  .alias('a', 'age')
  .command({
    command: 'save',
    aliases: 's',
    builder: (argv) => argv.demandOption(['n', 'a']),
    desc: 'This command saves a Document into bucket.',
    handler: (argv) => {
      bucket.upsert(argv.name, {name: argv.name, age: argv.age}, (err, res) => {
        if (err)
          console.log(JSON.stringify(err, null, 2))
        else
          console.log('Create doc successful:\n', JSON.stringify(res, null, 2))
      })
    }
  })
  .command({
    command: 'get',
    aliases: 'g',
    builder: (argv) => argv.demandOption('n'),
    desc: 'This command gets a doc from couchbase with specific name.',
    handler: (argv) => {
      bucket.get(argv.name, (err, res) => {
        if (err)
          console.log(JSON.stringify(err, null, 2))
        else
          console.log(JSON.stringify(res, null, 2))
      })
    }
  })
  .help('h')
  .argv


