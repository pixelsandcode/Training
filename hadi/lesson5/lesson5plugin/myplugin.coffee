baseRoutes = register: (server, options, next) ->
  server.route
    method: 'GET'
    path: '/bye/{name}'
    handler: (request, reply) ->
      reply "#{options.message} #{encodeURIComponent(request.params.name)}"
      
  next()
  
baseRoutes.register.attributes =
  name: 'base-routes'
  version: '1.0.0'
module.exports = baseRoutes
