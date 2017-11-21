module.exports = (server) => {
  server.method({
    name: 'sayhi',
    method: (name) => {
      return `Hello ${name}! :-D`
    }
  })
}