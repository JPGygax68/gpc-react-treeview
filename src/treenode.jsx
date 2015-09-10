"use strict";

var React = require('react');

var TreeNode = React.createClass({
  
  displayName: 'TreeNode',
  getInitialState: function() {
    console.log('TreeNode::getInitialState', 'this.props:', this.props);
    return {
      closed: false,
      selected: false,
      drag_hover: false,
      children: this.props.child_nodes
    }
  },
  handleClickOnHandle: function(e) {
    console.log('handleClickOnHandle', this.state.closed);
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  handleClickOnLabel: function(e) {
    console.log('handleClickOnLabel', 'state.selected:', this.state.selected, '_comp:', this._comp);
    e.preventDefault();
    if (!this.state.selected) {
      this.setState({ selected: true });
      if (this.props.onSelected) this.props.onSelected(this._comp);
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
  handleDescendantSelected: function(comp) {
    console.log('handleDescendantSelected', 'comp:', comp);
    if (this.props.onDescendantSelected) this.props.onDescendantSelected(comp);
  },
  render: function() {
    var children;
    //console.log('this.state.children:', this.state.children);
    if (this.state.children && this.state.children.length > 0) {
      var self = this;
      children = this.state.children.map( function(child, i) {
          return ( <li><TreeNode label={child.label} 
            child_nodes={child.child_nodes} 
            onSelected={this.handleDescendantSelected}
            onDescendantSelected={this.handleDescendantSelected}
          /></li> );
        }, this);
    }
    var classes = 'node';
    if (!children) classes += ' childless';
    if (this.state.selected) classes += ' selected';
    if (this.state.drag_hover) classes += ' drag-hover';
    var children_list = children && !this.state.closed ? ( <ul>{children}</ul> ) : null;
    return <div tabIndex="0" className={classes} ref={ (comp) => this._comp = comp } >
      <span className="handle" onClick={this.handleClickOnHandle} />
      <span className="label" onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} onClick={this.handleClickOnLabel}>
        {this.props.label}
      </span>
      {children_list}
    </div>
  }
});

module.exports = TreeNode;