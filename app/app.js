'use strict';

import Chat from './components/chat';
import io from 'socket.io-client';

let wrapper = document.getElementById('checkmateContent');

let windowCallback = () => {
  let listEl = document.querySelector( '.list' );
  let chatEl = document.querySelector( '.chat' );

  listEl.style.height = wrapper.clientHeight + 'px';
  chatEl.style.height = wrapper.clientHeight + 'px';
};

geotab.addin.ZenduMessenger = ( api, state ) => {
  return {
    initialize: ( api, state, init ) => {
      api.getSession( session => {
        api.call('Get', {
          typeName: 'User',
          search: {
            name: session.userName
          }
        } ).then( resp => {
          if(resp.hasOwnProperty( 'length' ) && resp.length > 0 && resp[0].hasOwnProperty( 'id' )) {
            let currentUser = resp[0];

            const socket = io.connect( 'https://services.zenduit.com:3051/chat' );
            
            socket.on( 'authpls', () => {
              socket.emit( 'auth', {
                db: session.database,
                id: currentUser.id 
              } );
            } );
            
            socket.on( 'authsuccess', () => {
              console.log( 'Successfully authed' );

              ReactDOM.render(<Chat cb={windowCallback}
                                    userName={session.userName}
                                    database={session.database}
                                    geotab={api}
                                    socket={socket} />, document.getElementById( 'app' ));
            } );

            init()
          }
        } );
      } );
    },
    focus: () => {
      wrapper.style.margin = '0';
    },
    blur: () => {
      wrapper.style.margin = '0 0 0 14px';
    }
  }
};
