'use strict';

import UserList from './userList';
import ChatBox from './chatBox';

export default

class Chat extends React.Component {
  constructor( props ) {
    super( props );

    this.selectUser = this.selectUser.bind( this );
    this.usernameFromID = this.usernameFromID.bind( this );

    this.state = {
      users: [],
      currentUser: {
        name: null,
        id: null,
        phoneNumber: null
      },
      currentUserStatus: false
    }
  }
  selectUser( id ) {
    let newUser = null;

    let deactiveUsers = this.state.users.map( user => {
      let active = false;

      if(user.id === id) {
        newUser = user;
        active = true
      }

      return Object.assign( user, { active } );
    } );

    this.getUserStatus( newUser );

    this.setState( {
      currentUser: newUser,
      users: deactiveUsers
    } );
  }
  usernameFromID( id ) {
    let u = this.state.users.filter( user => {
      return id === user.id
    } );

    return u.length > 0 ? u[0].name : null
  }
  userFromGeotabUser( user, currentUser ) {
    let active = (currentUser === undefined)
      ? false
      : (currentUser.id === user.id);

    return {
      id: user.id,
      name: user.firstName + ' ' + user.lastName,
      phoneNumber: null,
      active: active 
    };
  }
  componentWillMount() {
    this.props.geotab.call( 'Get', {
      typeName: 'User',
      search: {
        isDriver: true
      }
    } ).then( resp => {
      if(resp !== undefined && resp.hasOwnProperty( 'length' ) && resp.length > 0) {
        let currentUser = this.userFromGeotabUser( resp[0] );
        //let currentUser = this.componentDidMount();

        this.setState( {
          currentUser: currentUser,
          users: resp.map( user => this.userFromGeotabUser( user,currentUser ) )
        } );

        return currentUser;
      }
    } ).then( user => {
      this.getUserStatus( user );
    } );
  }
  getUserStatus( user ) {
    this.props.geotab.call( 'Get', {
      typeName: 'DeviceStatusInfo',
      search: {
        userSearch: {
          id: user.id
        }
      }
    } ).then( resp => {
			if (resp.length === 0) {
				console.warn('No status data for this user');

				this.setState( {
					currentUserStatus: null
				} );

				return null
			}

			const records = resp.sort( ( x, y ) => Date.parse( y.dateTime ) - Date.parse( x.dateTime ) );
			const record = records[0];

			console.info( record.device.id );

      this.props.geotab.call( 'Get', {
				typeName:'DeviceStatusInfo',
				search: {
					deviceSearch: {
						id: record.device.id
					}
				}
			} ).then( r => {
				this.props.geotab.call( 'GetAddresses', {
					coordinates: [
            {
              x: r[0].longitude || 0,
              y: r[0].latitude || 0
            }
          ]
				} ).then( resp2 => {
					if (resp2.length === 0) {
						console.warn( 'No address data for this address' );

						this.setState( {
							currentUserStatus: null
						} );

						return null
					}
					this.props.geotab.call( 'Get', {
						typeName: 'Device',
						search: {
							id: record.device.id
						}
					} ).then( resp3 => {
						if (resp3.length === 0) {
							return null;
						}

						this.setState( {
							currentUserStatus: {
								record: record,
								address: resp2,	
								vehicle: resp3[0]
							}
						} );
					} );
				} );
			} );
    } );
  }
  componentDidMount() {
    this.props.cb()
  }
  render() {
    if (this.state.currentUser === null) {
      return ( <div></div> );
    }

    return (
      <div className="container clearfix">
        <UserList database={this.props.database}
                  selectUser={this.selectUser}
                  users={this.state.users} />
        <ChatBox currentUserStatus={this.state.currentUserStatus}
                 idLookup={this.usernameFromID}
                 geotab={this.props.geotab}
                 userName={this.props.userName}
                 socket={this.props.socket}
                 database={this.props.database}
                 currentUser={this.state.currentUser} />
      </div>
    );
  }
}
