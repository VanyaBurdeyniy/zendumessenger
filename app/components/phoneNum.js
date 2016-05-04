export default
class PhoneNumber extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      modify: false,
      rawNumber: null
    }
  }
  componentWillReceiveProps(props) {
    if(this.props.userID === props.userID && this.props.database === props.database) {
      return
    }
    this.props.socket.emit('getnumber', {
      id: props.userID,
      db: props.database
    })
  }
  componentWillMount() {
    this.props.socket.emit('getnumber', {
      id: this.props.userID,
      db: this.props.database
    })
    this.props.socket.on('number', data => {
      console.log('data -> ' + JSON.stringify(data))
      if(this.state.rawNum !== data.num) {
        this.setState({
          rawNumber: data.num
        })
      }
    })
  }
  componentWillUnmount() {
    this.props.socket.removeAllListeners('number')
    this.props.socket.removeAllListeners('getnumber')
  }
  changeModify(el) {
    if(this.state.modify === true) {
      this.props.socket.emit('number', {
        id: this.props.userID,
        db: this.props.database,
        num: this.state.rawNumber
      })
    }
    this.setState({
      modify: !this.state.modify
    })

    this.props.geotab.call('Get', {
      typeName: 'User',
      search: {
        id: this.props.userID
      }
    }).then( resp => {
      console.log(resp);
    })
  }
  changeNumber(el) {
    this.setState({
      rawNumber: el.target.value
    })
  }
  render() {
    return (
        <div className="phoneNum">
          <input type="text" disabled={!this.state.modify} onChange={this.changeNumber.bind(this)} placeholder="Phone number" value={this.state.rawNumber} />

          <button onClick={this.changeModify.bind(this)} className="modifyNum">{this.state.modify ? 'Save' : 'Edit'}</button>
        </div>
    )
  }
}
