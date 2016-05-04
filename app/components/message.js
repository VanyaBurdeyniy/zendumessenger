'use strict';

export default;

class Message extends React.Component {
  constructor( props ) {
    super( props );
  }
  render() {
    return (
      <li className="clearfix">
        <div className={"message-data" + (this.props.right ? " align-right" : "")}>
          <span className="message-data-time" >{this.props.date}</span> &nbsp; &nbsp;
          <span className="message-data-name" >{this.props.name}</span>
          <i className="me"></i>
        </div>
        <div className={"message" + (this.props.right ? " other-message float-right" : " my-message")}>
          {this.props.text}
        </div>
      </li>
    );
  }
}
