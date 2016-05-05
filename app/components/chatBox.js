import Message from './message'
import PhoneNumber from './phoneNum'

export default
class ChatBox extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            textToSend: '',
            showAddress: false,
            showGoogleMap: false,
            googleMapAddress: null,
            messages: []
        }
    }
    componentWillMount() {
        this.props.socket.on('msg', data => {

            data = data.filter( message => {
                return message.userName == this.props.userName;
            })

            this.setState({
                textToSend: '',
                messages: this.state.messages.concat(
                    this.generateMessage(this.props.idLookup(data.from), String(new Date()), data.msg, false)
                )
            })
        })
        this.props.socket.on('messages', data => {
            this.props.geotab.call('Get', {
                typeName: 'User'
            }).then( resp => {
                console.log(resp);
            })
             //data = data.filter( message => {
             //    return message.to == this.props.userID;
             //})
            this.setState({
                messages: data.map(msg => this.generateMessage(this.props.idLookup(msg.from), msg.date, msg.msg, msg.dispatch))
            })
            console.log(data);
            //console.log(this.props.userID);
        })
    }
    componentWillUnmount() {
        this.props.socket.removeAllListeners('msg')
        this.props.socket.removeAllListeners('messages')
    }
    generateMessage(from, date, text, right) {
        //console.log(this.state.messages);
        if (from !== null) {
            return (
                <Message key={from + date + Math.random()} name={from} date={date} text={text} right={right} />
            )
        } else {
            return (
                <Message key={from + date + Math.random()} name={this.props.userName} date={date} text={text} right={right} />
            )
        }
    }
    updateText(el) {
        this.setState({
            textToSend: el.target.value
        })
    }
    sendMessage() {
        var text = this.state.textToSend

        if(text === '') {
            return
        }
        if(!this.sendGotalk.checked && !this.sendSms.checked) {
            alert('No known message mediums. Please select one')
            return
        }
        if(this.sendGotalk.checked) {

            this.props.geotab.call('Get', {
                typeName: 'DeviceStatusInfo'
            }).then(resp => {
                console.log(resp)
                //console.log(this.props.currentUser.id)
                if(resp !== undefined && resp.hasOwnProperty('length') && resp.length > 0) {
                    var device = resp[0].device.id
                    this.props.geotab.call('Add', {
                        typeName: 'TextMessage',
                        entity: {
                            device: {id: device},
                            userId: this.props.currentUser.id,
                            messageContent: {
                                message: text,
                                contentType: 'GoTalk'
                            },
                            isDirectionToVehicle: true
                        }
                    }).then( resp => {
                        //console.log(resp);


                        this.props.geotab.call('Get', {
                            typeName: 'TextMessage',
                            search: {
                                userId: this.props.currentUser.id
                            }
                        }).then( resp => {
                            //console.log(resp);
                        })

                    } )

                }
            })
        }
        if(this.sendSms.checked) {
            this.props.socket.emit('send', {
                to: this.props.currentUser.id,
                msg: this.state.textToSend,
                db: this.props.database
            })


            //this.props.geotab.call('Add', {
            //    typeName: 'TextMessage',
            //    entity: {
            //        device: {id: 'Go7'},
            //        id: this.props.currentUser.id,
            //        user: {
            //          name: this.props.userName
            //        },
            //        messageContent: {
            //            message: text,
            //            contentType: 'GoTalk'
            //        },
            //        isDirectionToVehicle: true
            //    }
            //}).then( resp => {
            //    console.log(resp);
            //} )
        }
        this.setState({
            textToSend: '',
            messages: this.state.messages.concat(
                this.generateMessage(this.props.userName, String(new Date()), this.state.textToSend, true)
            )
        })
        //console.log(this.state.messages);
        this.textArea.value = ''
    }
    componentWillReceiveProps(props) {
        this.props.socket.emit('messages', {
            to: props.currentUser.id,
            db: props.database
        })
    }
    componentDidUpdate() {
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight
    }
    keyPress(event) {
        var key = event.charCode

        if(key === 13) {
            this.sendMessage()
            event.stopPropagation()
            event.preventDefault()
        }
    }
    makeDuration(record) {
        var curDur = record.currentStateDuration;
        if(curDur === null) return null;
        if (!curDur) return '';
        var parts = /(?:([0-9])\.)?([0-9]{2}):([0-9]{2}):([0-9]{2})?/.exec(curDur);
        var d = parseInt(parts[1]),
            h = parseInt(parts[2]),
            m = parseInt(parts[3]),
            s = parseInt(parts[4]);
        var ms = (d ? d * 24 * 60 * 60 * 1000 : 0)
            + h * 60 * 60 * 1000
            + m * 60 * 1000
            + s * 1000;

        var dur = new Date() - new Date(record.dateTime) - ms;
        var d = Math.floor(dur / 1000 / 60 / 60 / 24),
            h = Math.floor(dur / 1000 / 60 / 60) % 24,
            m = Math.floor(dur / 1000 / 60) % 60,
            s = Math.floor(dur / 1000) % 60;

        if (d > 0) return d + 'd' + (h > 0 ? h + 'h' : "");
        else if (h > 0) return h + 'h' + (m > 0 ? m + 'm' : "");
        else if (m > 0) return m + (s > 29 ? 1 : 0) + 'm';
        else return s + 's';
    }
    makeRecordInfo(x) {
        const addr = x.address[0]
        const record = x.record
        const dur = this.makeDuration(record)
        let state = null
        if(new Date() - new Date(record.dateTime) < 24*60*60*1000) {
            if(record.isIgnitionOn !== undefined) {
                state = record.isIgnitionOn ? (record.speed < 4 ? 'Idling' : 'Driving') : 'Stopped'
            } else {
                state = (record.speed > 0) ? (record.speed < 4 ? 'Idling' : 'Driving') : 'Stopped'
            }
        } else {
            return (<div></div>)
        }

        return (
            <ul style={{width: '100%'}}>
                <li>
                    <span>{state}</span>
                </li>
                <div style={{cursor:'pointer'}} onClick={() => {
					location.hash = '#map,liveVehicleIds:!('+record.device.id+')'
				}}>
                    <li style={{color:'blue'}}>{addr.street}</li>
                    <li style={{color:'blue'}}>{(addr.city ? addr.city + ', ' : '') + addr.region}</li>
                </div>
            </ul>
        )
    }
    render() {
        const stat = this.props.currentUserStatus || {record:{isDeviceCommunicating: false},address:null}

        return (

            <div className="chat">
                <div className="chat-header clearfix" style={{display: 'flex'}}>

                    <div className="chat-left" style={{flexBasis: '50%'}}>
                        <div className="chat-about">
                            {/* Coloured circle */}
                            <div style={{
								float: 'left',
								marginRight: '3px',
								height:'15px',
								width: '15px',
								backgroundColor: stat.record.isDeviceCommunicating ? 'green' : 'red',
								borderRadius: '15px'
							}} />

                            <div className="chat-with">

                                {this.props.currentUser.name}

                                <span style={{fontSize: '0.9em'}}>{stat.vehicle ? ' [' +stat.vehicle.name+']' : null}</span>
                            </div>
                        </div>

                        <PhoneNumber database={this.props.database} socket={this.props.socket} userID={this.props.currentUser.id} number={this.props.currentUser.phoneNumber} geotab={this.props.geotab} />

                    </div>
                    <div className="status" style={{display: 'flex',flexBasis:'50%',textAlign:'right'}}>
                        {stat.address !== null ? this.makeRecordInfo(stat) : null}
                    </div>
                </div>



                <div ref={(ref) => this.chatHistory = ref} className="chat-history">
                    <ul>
                        {this.state.messages}
                    </ul>
                </div>

                <div className="chat-message clearfix">
                    <textarea ref={(ref) => this.textArea = ref} onKeyPress={this.keyPress.bind(this)} onChange={this.updateText.bind(this)} name="message-to-send" id="message-to-send" placeholder ="Type your message" rows="3" />

                    <div className="bottomOptions">
                        <div className="messageOption">
                            <input type="checkbox" ref={(ref) => this.sendGotalk = ref} defaultChecked={true} id="gotalk-checkbox" />
                            <label htmlFor="gotalk-checkbox">GoTalk</label>
                        </div>


                        <div className="messageOption">
                            <input type="checkbox" ref={(ref) => this.sendSms = ref} defaultChecked={true} id="sms-checkbox" />
                            <label htmlFor="sms-checkbox">SMS</label>
                        </div>

                        <div className="messageOption">
                            <input type="checkbox" ref={(ref) => this.sendGeotab = ref} defaultChecked={true} id="geotab-checkbox" />
                            <label htmlFor="geotab-checkbox">Geotab</label>
                        </div>
                        <div className="insert" style={{display: 'inline-block'}}>
                            <img style={{cursor:'pointer',padding:'0 10px'}} src="https://www.google.com/images/branding/product/ico/maps_32dp.ico" onClick={() => {
							this.setState({showGoogleMap: !this.state.showGoogleMap})
						}} />
                            {this.state.showGoogleMap ? (
                                <div style={{padding: '0 0 10px 0'}}>
                                    <input type="text" placeholder="Address" value={this.state.googleMapAddress} onChange={(evt) => this.setState({googleMapAddress: evt.target.value})} />
                                    <button style={{float: 'none',padding:'0 10px'}} onClick={() => {
							/*	this.props.geotab.call('GetCoordinates', {
									addresses: [this.state.googleMapAddress]
								}).then(resp => {
									if(resp.length === 0 || !resp[0].x || !resp[0].y) {
										return null
									}
                  const x = parseFloat(resp[0].x).toFixed(4)
                  const y = parseFloat(resp[0].y).toFixed(4)
									const googleURL = 'http://maps.google.com/maps?z=12&t=m&q=loc:'+y+'+'+x
									this.textArea.value += googleURL
								})
               */
                const googleURL = 'http://maps.google.com/maps?z=12&t=m&q=loc:'+encodeURI(this.state.googleMapAddress)
                this.textArea.value += googleURL

							}}>Geocode</button>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <button onClick={this.sendMessage.bind(this)}>Send</button>
                </div>

            </div>
        )
    }
}
