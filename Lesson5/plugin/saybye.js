'use strict';

const saybyeplugin = {
      register: function (server, options, next) {
        server.route({
          method: 'GET',
          path: '/bye/{name}',
          handler: function(request, reply){
            reply('Bye, ' + encodeURIComponent(request.params.name))
            }
          })
                next();
                    }
};

saybyeplugin.register.attributes = {
      name: 'say.bye.plugin',
          version: '1.0.0'
};
module.exports= saybyeplugin;
