const couchbase = require('couchbase')

const cluster = new couchbase.Cluster('couchbase://127.0.0.1')
const bucket = cluster.openBucket('default')

const argv = require('yargs')
  .alias('n', 'name')
  .alias('a', 'age')
  .command(
    'save',
    'save a doc in couchbase', 
    { },
    function (argv) {
      bucket.upsert('u:3', {name: argv.name, age: argv.age}, function (err, result) {
        if (err) throw err
      })
    })
  .command(
    'get',
    'get a doc from couchbase with specific name',
    { },
    function (argv) {
      bucket.get(argv.name, function (err, result) {
        if (err) throw err
        console.log(result.value)
      });
    })
  .argv


