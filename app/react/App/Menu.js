import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {NeedAuthorization} from 'app/Auth';

class Menu extends Component {

  render() {
    const user = this.props.user.toJS();
    return (
      <ul className={this.props.className}>
        <li><Link to='/' className="btn"><i className="fa fa-th"></i>Library</Link></li>
        <NeedAuthorization>
          <li><Link to='/metadata' className="btn"><i className="fa fa-list-alt"></i>Metadata</Link></li>
        </NeedAuthorization>
        <NeedAuthorization>
          <li><Link to='/uploads' className="btn"><span><i className="fa fa-cloud-upload"></i>Uploads</span></Link></li>
        </NeedAuthorization>
        <NeedAuthorization>
          <li><Link to='/my_account' className="btn"><i className="fa fa-user"></i>{user.username}</Link></li>
        </NeedAuthorization>
        {(() => {
          if (!user._id) {
            return <li><Link to='/login' className="btn"><i className="fa fa-power-off"></i>Login</Link></li>;
          }
        })()}
      </ul>
    );
  }
}

Menu.propTypes = {
  user: PropTypes.object,
  className: PropTypes.string
};

export function mapStateToProps({user}) {
  return {user};
}

export default connect(mapStateToProps)(Menu);
