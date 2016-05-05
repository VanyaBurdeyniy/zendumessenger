import UserBox from './userBox'

export default
class UserList extends React.Component {
  constructor(props) {
    super(props)
  }
  selectUser(el) {
    this.props.selectUser(el)
  }
  render() {
    let users = this.props.users.map((user,i) => {
      return (
          <UserBox key={i} selectUser={this.selectUser.bind(this)} active={user.active} name={user.name} id={user.id} />
      )
    })
    return (
        <div className="people-list" id="people-list">
          <ul className="list">
            <li className="top-logo" style={{height: '50px'}}>
              <img src="https://apps.zenduit.com/ZenduMessenger/images/logo-white.png" />
            </li>
            {users}
          </ul>
        </div>
    )
  }
}