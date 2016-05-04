'use strict';

export default;

class UserBox extends React.Component {
  constructor( props ) {
    super( props );
  }
  selectSelf() {
    this.props.selectUser( this.props.id )
  }
  render() {
    return (
      <li onClick={this.selectSelf.bind( this )}
          className={"clearfix userBox" + (this.props.active ? ' active' : '')} >
        <div className="about">
          <div className="name">{this.props.name}</div>
        </div>
      </li>
    );
  }
}
