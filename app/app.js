import Chat from './components/chat'
import io from 'socket.io-client'

var wrapper = document.getElementById('checkmateContent')

Backendless.initApp( "5326FC43-1D64-2419-FFEB-E25EC1417F00", "726AE85C-E3B2-209C-FF97-78471BE77900", "v1" );

var windowCallback = () => {
  var listEl = document.querySelector('.list')
  var chatEl = document.querySelector('.chat')

  listEl.style.height = wrapper.clientHeight + 'px'
  chatEl.style.height = wrapper.clientHeight + 'px'
}

geotab.addin.ZenduMessenger = (api,state) => {
  return {
    initialize: (api, state, init) => {
      api.getSession(session => {
        api.call('Get', {
          typeName: 'User',
          search: {
            name: session.userName
          }
        }).then(resp => {
          if(resp.hasOwnProperty('length') && resp.length > 0 && resp[0].hasOwnProperty('id')) {
            var currentUser = resp[0]
            const socket = io.connect('https://services.zenduit.com:3051/chat')

            socket.on('authpls', () => {
              socket.emit('auth', {
                db: session.database,
                id: currentUser.id
              })
            })

            socket.on('authsuccess', () => {
              console.log('successfully authed')
              ReactDOM.render(<Chat cb={windowCallback} userName={session.userName} database={session.database} geotab={api} socket={socket} />, document.getElementById('app'));
            })

            init()
          }
        })
      })

      api.call('Get', {
        typeName: 'User'
      }).then( resp => {
        console.log(resp);
      })


      function userRegistered( user )
      {
        console.log( "user has been registered" );
      }

      function gotError( err ) // see more on error handling
      {
        console.log( "error message - " + err.message );
        console.log( "error code - " + err.statusCode );

        return;
      }

      function registerUser()
      {
        var user = new Backendless.User();
        user.email = "apps@zenduit.com";
        user.password = "Zenduit123";
        console.log('register');

        Backendless.UserService.login( user.email, user.password, true, new Backendless.Async( userRegistered, gotError ) );
      }

      registerUser();

    },
    focus: (api,state) => {
      wrapper.style.margin = "0"
    },
    blur: (api,state) => {
      wrapper.style.margin = "0 0 0 14px"
    }
  }
}
