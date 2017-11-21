'use strict'

const client = new require('elasticsearch').Client({
  host: 'localhost:9200',
  log: 'error'
})

const handlers = require('./handlers')(client)

const argv = require('yargs')
  .usage(`$0 delete-indices
          $0 create-indices
          $0 create-docs
          $0 search-all-user
          $0 search-user-name --[name]
          $0 search-user-name-fuzzy --[name]
          $0 search-user-date --[dateFrom] --[dateTo]
          $0 search-user-date-fuzzy --[name] --[dateFrom] --[dateTo]
          $0 search-book-name --[name]`)
  .alias('n', 'name')
  .alias('f', 'dateFrom')
  .alias('t', 'dateTo')
  .command({
    command: 'delete-indices',
    aliases: 'di',
    builder: {},
    desc: 'Deletes all indices form elasticsearch.',
    handler: handlers.delete_indices
  })
  .command({
    command: 'create-indices',
    aliases: 'ci',
    builder: {},
    desc: 'Creates "users" & "books" indices.',
    handler: handlers.create_indices
  })
  .command({
    command: 'create-docs',
    aliases: 'cd',
    builder: {},
    desc: 'Creates 10 docs in "users" & 2 docs "books" indices.',
    handler: handlers.create_docs
  })
  .command({
    command: 'search-all-user',
    aliases: 'sau',
    builder: {},
    desc: 'Shows all users from index.',
    handler: handlers.search_all
  })
  .command({
    command: 'search-user-name',
    aliases: 'sun',
    builder: (argv) => argv.demandOption('n'),
    desc: 'Shows users with specified name from "users".',
    handler: handlers.search_user
  })
  .command({
    command: 'search-user-name-fuzzy',
    aliases: 'sunf',
    builder: (argv) => argv.demandOption('n'),
    desc: 'Shows users with specified name from "users" using "fuzzy".',
    handler: handlers.search_user_fuzzy
  })
  .command({
    command: 'search-user-date',
    aliases: 'sud',
    builder: (argv) => argv.demandOption(['f', 't']),
    desc: 'Shows users with specified date-of-birth range.',
    handler: handlers.search_user_date
  })
  .command({
    command: 'search-user-date-fuzzy',
    aliases: 'sudf',
    builder: (argv) => argv.demandOption(['n', 'f', 't']),
    desc: 'Shows users with specified date-of-birth range using "fuzzy".',
    handler: handlers.search_user_date_fuzzy
  })
  .command({
    command: 'search-book-name',
    aliases: 'sbn',
    builder: (argv) => argv.demandOption('n'),
    desc: 'Shows books with exact name from "books" index.',
    handler: handlers.search_book
  })
  .help('h')
  .argv
