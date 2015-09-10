"use strict";

var React = require('react');

var TreeNode = React.createClass({
  
  displayName: 'TreeNode',
  getInitialState: function() {
    //console.log('TreeNode::getInitialState', 'this.props:', this.props);
    return {
      closed: false,
      selected: false,
      drag_hover: false
    }
  },
  handleClickOnHandle: function(e) {
    //console.log('handleClickOnHandle', this.state.closed);
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  handleClickOnLabel: function(e) {
    //console.log('handleClickOnLabel');
    e.preventDefault();
    if (!this.state.selected) this.props.data.setSelected(true);
  },
  handleDragEnter: function(e) {
    //console.log('handleDragEnter', e.clientX, e.clientY);
    this.setState({ drag_hover: true });
    e.preventDefault();
  },
  handleDragLeave: function(e) {
    //console.log('handleDragLeave');
    this.setState({ drag_hover: false });
    e.preventDefault();
  },
  handleDragOver: function(e) {
    console.log('handleDragOver', e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    e.preventDefault();
  },
  handleMouseOver: function(e) {
    //console.log('handleMouseOver', e.x, e.y);
  },
  handleMouseMove: function(e) {
    //console.log('handleMouseMove', e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  },
  handleKeyDown: function(e) {
    if (e.which === 38) {
      // TODO: tell parent to move to previous sibling
    }
  },
  render: function() {
    //console.log('this.props.data.child_nodes:', this.props.data.child_nodes);
    var children;
    if (this.props.data.child_nodes && this.props.data.child_nodes.length > 0) {
      var self = this;
      children = this.props.data.child_nodes.map( function(child, i) {
          return ( <li><TreeNode data={child} ref={ (c) => child.setComponent(c) } /></li> );
        }, this);
    }
    var classes = 'node';
    if (!children) classes += ' childless';
    if (this.state.selected) classes += ' selected';
    if (this.state.drag_hover) classes += ' drag-hover';
    var children_list = children && !this.state.closed ? ( <ul>{children}</ul> ) : null;
    return <div tabIndex="0" className={classes}>
      <span className="handle" onClick={this.handleClickOnHandle} />
      <span className="label-box" 
          onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} onDragOver= {this.handleDragOver}
          onMouseOver={this.handleMouseOver} onMouseMove={this.handleMouseMove}
          onClick={this.handleClickOnLabel}>
            <span className="label">{this.props.data.label}</span>
            <div className="top" />
            <div className="center" />
            <div className="bottom" />
      </span>
      {children_list}
    </div>
  }
});

module.exports = TreeNode;