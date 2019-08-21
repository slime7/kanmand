import React, { Component } from 'react';
import {
  Checkbox,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { createSelector } from 'reselect';
import { configSelector } from 'views/utils/selectors';
import PropTypes from 'prop-types';

const ghostSelector = createSelector(
  [configSelector],
  config => ({
    logPosition: get(config, 'plugin.poi-plugin-ghost.logPosition', true),
  }),
);

class SettingComponent extends Component {
  static propTypes = {
    logPosition: PropTypes.bool,
  };

  static defaultProps = {
    logPosition: true,
  };

  handleLogPositionChanged = (ev) => {
    window.config.set('plugin.poi-plugin-ghost.logPosition', ev.target.checked);
  };

  render() {
    const { logPosition } = this.props;
    return (
      <div id="plugin-ghost-settings">
        <Checkbox
          onChange={this.handleLogPositionChanged}
          checked={logPosition}
        >
          记录远征和出击点击坐标
        </Checkbox>
      </div>
    );
  }
}

const ghostSetting = connect(
  state => ghostSelector(state),
)(SettingComponent);

export default { ghostSetting };
