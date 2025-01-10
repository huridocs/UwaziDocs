import React, { Component } from 'react';
import { Icon } from 'UI';
import { Translate } from 'V2/i18n';

export default class Welcome extends Component {
  render() {
    return (
      <div className="blank-state">
        <Icon icon="cog" />
        <h4>
          <Translate>Welcome to Uwazi</Translate>
        </h4>
        <a href="https://uwazi.io/page/9852italrtk/support" target="_blank" rel="noreferrer">
          <Translate>Learn more</Translate>
        </a>
      </div>
    );
  }
}
