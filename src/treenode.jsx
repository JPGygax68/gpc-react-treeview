"use strict";

var React = require('react');

var TreeNode = React.createClass({
  
  displayName: 'TreeNode',
  getInitialState: function() {
    console.log('TreeNode::getInitialState', 'this.props:', this.props);
    return {
      closed: false,
      selected: this.props.data.selected,
      drag_hover: false
    }
  },
  handleClickOnHandle: function(e) {
    console.log('handleClickOnHandle', this.state.closed);
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  handleClickOnLabel: function(e) {
    console.log('handleClickOnLabel');
    e.preventDefault();
    if (!this.state.selected) {
      this.setState({ selected: true });
    }
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
    var children;
    console.log('this.props.data.child_nodes:', this.props.data.child_nodes);
    if (this.props.data.child_nodes && this.props.data.child_nodes.length > 0) {
      var self = this;
      children = this.props.data.child_nodes.map( function(child, i) {
          return ( <li><TreeNode data={child} /></li> );
        }, this);
    }
    var classes = 'node';
    if (!children) classes += ' childless';
    if (this.state.selected) classes += ' selected';
    if (this.state.drag_hover) classes += ' drag-hover';
    var children_list = children && !this.state.closed ? ( <ul>{children}</ul> ) : null;
    return <div tabIndex="0" className={classes}>
      <span className="handle" onClick={this.handleClickOnHandle} />
      <span className="label" onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} onClick={this.handleClickOnLabel}>
        {this.props.data.label}
      </span>
      {children_list}
    </div>
  }
});

module.exports = TreeNode;