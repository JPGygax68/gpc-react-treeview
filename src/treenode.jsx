"use strict";

var React = require('react');

var InsertionMark = React.createClass({
  
  displayName: 'InsertionMark',
  
  getInitialState: function() {
    return {};
  },
  
  render: function() {
    var className = 'insertion-mark';
    if (this.props.active) className += ' active';
    return ( <div className={className}>
        <div>
          <div className="brace left" />
          <div className="bar" />
          <div className="brace right" />
        </div>
      </div>
    );
  }
  
});

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
    console.log('handleDragEnter', e.clientX, e.clientY);
    this.setState({ drag_hover: true });
    e.preventDefault();
    e.stopPropagation();
  },
  handleDragLeave: function(e) {
    console.log('handleDragLeave');
    this.setState({ drag_hover: false });
    e.preventDefault();
    e.stopPropagation();
  },
  handleDragOver: function(e) {
    //console.log('handleDragOver', e.nativeEvent.offsetX, e.nativeEvent.offsetY);
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
  handleDragBefore: function(index, e) {
    console.log('handleDragBefore:', index, e);
  },
  handleDragOnto: function(e) {
  },
  handleDragAfter: function(e) {
  },
  render: function() {
    //console.log('this.props.data.child_nodes:', this.props.data.child_nodes);
    var children;
    if (this.props.data.child_nodes && this.props.data.child_nodes.length > 0) {
      var self = this;
      children = [];
      children.push( <li><InsertionMark/></li> );
      this.props.data.child_nodes.forEach( function(child, i) {
          children.push( ( <li><TreeNode data={child} ref={ (c) => child.setComponent(c) } parentIndex={i} /></li> ) );
          children.push( ( <li><InsertionMark active={this.state.drag_hover}/></li>) );
        }, this);
    }
    var classes = 'node';
    if (!children            ) classes += ' childless';
    if (this.state.selected  ) classes += ' selected';
    if (this.state.drag_hover) classes += ' drag-hover';
    if (this.state.closed    ) classes += ' closed';
    var children_list = children && !this.state.closed ? ( <ul className="child-nodes">{children}</ul> ) : null;
    return (
      <div tabIndex="0" className={classes} 
        // onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} onDragOver= {this.handleDragOver}
      >
        <span className="handle" onClick={this.handleClickOnHandle} />
        <span className="label-box" 
          onMouseOver={this.handleMouseOver} onMouseMove={this.handleMouseMove}
          onClick={this.handleClickOnLabel}>
            <span className="label">{this.props.data.label}</span>
            <div className="top" onDragEnter={this.handleDragBefore.bind(this, this.props.parentIndex)}/>
            <div className="center" />
            <div className="bottom" />
        </span>
        {children_list}
      </div> 
    );
  }
});

module.exports = TreeNode;