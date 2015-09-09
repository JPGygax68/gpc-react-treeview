"use strict";

var React = require('react');

/*

function Node(def) {
  
  def = def || {};
  
  this.label = def.label || '(no label)';
}

Node.prototype = {
  
  handleClickOnHandle: function(e) {
    console.log('handleClickOnHandle', this.closed);
    e.preventDefault();
    this.closed = ! this.closed;
  },

  render: function() {
    var children;
    if (this.children && this.children.length > 0) {
      children = this.children.map(
        this.children,
        function(child) {
          return node.render();
        },
        this
      );
    }
    var classes = 'node';
    if (children) classes += ' childless';
    if (this.state.selected) classes += ' selected';
    if (this.state.drag_hover) classes += ' drag-hover';
    var children_list;
    if (children && !this.closed) {
      children_list = (<ul>{children}</ul>);
    }
    return <div tabIndex="0" className={classes}>
      <span className="handle" onClick={this.handleClickOnHandle}/>
      <span className="label" onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} onClick={this.handleClickOnLabel}>
        {this.label}
      </span>
      {children_list}
    </div>
  },
  
  handleClickOnLabel: function(e) {
    console.log('handleClickOnLabel', this.state.selected);
    e.preventDefault();
    if (!this.state.selected) {
      this.setState({ selected: true });
    }
  },
  
  handleDragEnter: function(e) {
    console.log('handleDragEnter');
    this.drag_hover = true;
    e.preventDefault();
  },
  
  handleDragLeave: function(e) {
    console.log('handleDragLeave');
    this.drag_hover = false;
    e.preventDefault();
  },
  
  handleKeyDown: function(e) {
    if (e.which === 38) {
      // TODO: tell parent to move to previous sibling
    }
  }
  
} // Node.prototype

*/

function Node(label, children) {
  
  def = def || {};
  
  this.label = def.label || '(no label)';
  this.children = [];  
  if (children) children.forEach( this.appendChild.bind(this) );
}

Node.prototype = {
  
  appendChild: function(label, children) {
    this.children.push( new Node(label, children) );
  }
};


var TreeNode = React.createClass({
  displayName: 'TreeNode',
  getInitialState: function() {
    console.log('TreeNode::getInitialState', 'this.props:', this.props);
    return {
      closed: false,
      selected: false,
      drag_hover: false,
      children: this.props.children && this.props.children.length > 0 ? this.props.children.map( function(child) {
        //console.log('child:', child, typeof child);
        return ( <TreeNode label={child.label} children={child.children} /> )
      }) : null
    }
  },
  handleClickOnHandle: function(e) {
    console.log('handleClickOnHandle', this.state.closed);
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  handleClickOnLabel: function(e) {
    console.log('handleClickOnLabel', this.state.selected);
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
    console.log('this.state.children:', this.state.children);
    if (this.state.children && this.state.children.length > 0) {
      children = React.Children.map(
        this.state.children,
        function(child) {
          return <li>{child}</li>;
        }
      );
    }
    var classes = 'node';
    if (!children) classes += ' childless';
    if (this.state.selected) classes += ' selected';
    if (this.state.drag_hover) classes += ' drag-hover';
    var children_list;
    if (children && !this.state.closed) {
      children_list = (<ul>{children}</ul>);
    }
    return <div tabIndex="0" className={classes}>
      <span className="handle" onClick={this.handleClickOnHandle} />
      <span className="label" onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} onClick={this.handleClickOnLabel}>
        {this.props.label}
      </span>
      {children_list}
    </div>
  }
});

module.exports = TreeNode;