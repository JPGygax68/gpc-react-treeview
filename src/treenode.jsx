"use strict";

var React = require('react');

var TreeNode = React.createClass({
  displayName: 'TreeNode',
  getInitialState: function() {
    return {
      closed: false,
      drag_hover: false
    }
  },
  handleClickOnHandle: function(e) {
    console.log('handleClickOnHandle', this.state.closed);
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  handleDragEnter: function(e) {
    console.log('handleDragEnter');
    this.setState({ drag_hover: true });
    e.preventDefault();
  },
  handleDragLeave: function(e) {
    console.log('handleDragLeave');
    this.setState({ drag_hover: false });
    e.preventDefault();
  },
  handleKeyDown: function(e) {
    if (e.which === 38) {
      // TODO: tell parent to move to previous sibling
    }
  },
  render: function() {
    var children = React.Children.map(
      this.props.children,
      function(child) {
        return <li>{child}</li>;
      }
    );
    var classes = 'node';
    if (!this.props.children || this.props.children.length === 0) classes += ' childless';
    if (this.state.drag_hover) classes += ' drag-hover';
    var children_list;
    if (this.props.children && this.props.children.length > 0 && !this.state.closed) {
      children_list = (<ul>{children}</ul>);
    }
    return <div tabIndex="0" className={classes}>
      <span className="handle" onClick={this.handleClickOnHandle}/>
      <span className="label" onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave}>{this.props.label}</span>
      {children_list}
    </div>
  }
});

module.exports = TreeNode;