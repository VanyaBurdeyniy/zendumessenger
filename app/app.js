import Chat from './components/chat'
import io from 'socket.io-client'

var wrapper = document.getElementById('checkmateContent')

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



      api.getSession(cred => {

        console.log(cred);

        $.ajax({
          type: "POST",
          url: '104.197.218.74:3051/cred',
          data: cred,
          contentType: 'application/json',
          success: function(data) {
            console.log(data);
          },
          error: function(err) {
            console.log(err);
          }
        });
      })

    },
    focus: (api,state) => {
      wrapper.style.margin = "0"
    },
    blur: (api,state) => {
      wrapper.style.margin = "0 0 0 14px"
    }
  }
}
