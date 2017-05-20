'use strict';

const saybyeplugin = {
  register: (server, options, next) => {
    server.route({
      method: 'GET',
      path: '/bye/{name}',
      handler: function(request, reply) {
        reply('Bye, ' + encodeURIComponent(request.params.name))
      },
      config: {
        description: 'this is the bye plugin for lesson5 hapi server.',
        notes: `usage : GET/bye/{name}`,
        tags: ['plugin', 'bye']
      }
    })
    next();
  }
};

saybyeplugin.register.attributes = {
  name: 'say-bye',
  version: '1.0.2'
};
module.exports = saybyeplugin;
