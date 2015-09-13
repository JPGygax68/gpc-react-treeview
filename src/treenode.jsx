"use strict";

var React = require('react');

/* HELPER FUNCTIONS -----------------*/

function stopEvent(e) { 
  e.preventDefault(); 
  e.stopPropagation(); 
}

/* HELPER ELEMENT -------------------*/

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
  
  propTypes: {
    data: React.PropTypes.object.isRequired,
    leafOnly: React.PropTypes.bool
  },
  
  getInitialState: function() {
    //console.log('TreeNode::getInitialState', 'this.props:', this.props);
    return {
      closed: false,
      dragHover: false
    }
  },
  
  handleClickOnHandle: function(e) {
    //console.log('handleClickOnHandle', this.state.closed);
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  handleClickOnLabel: function(e) {
    console.log('handleClickOnLabel');
    /* e.preventDefault();
    if (!this.props.treeView.state.selectedNode !== this) {
      this.props.treeView.setSelectedNode(this);
    }
    */
  },
  handleDragEnter: function(e) {
    console.log('handleDragEnter', e.clientX, e.clientY);
    this.setState({ dragHover: true });
    e.preventDefault();
    e.stopPropagation();
  },
  handleDragLeave: function(e) {
    console.log('handleDragLeave');
    this.setState({ dragHover: false });
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
    if      (e.which === 38) {
      // TODO: tell parent to move to previous sibling
    }
    else if (e.which === 37) /* LEFT */ {
      if (!this.state.closed) { stopEvent(e); this.close(); }
    }
    else if (e.which === 39) /* RIGHT */ {
      if (this.state.closed) { stopEvent(e); this.open(); }
    }
  },
  handleFocusOnLabel: function(e) {
    console.log('handleFocusOnLabel');
    if (!this.props.treeView.state.selectedNode !== this) {
      this.props.treeView.setSelectedNode(this);
      e.stopPropagation();
    }
  },
  handleDragBefore: function(index, e) {
    console.log('handleDragBefore:', index, e);
  },
  handleDragOnto: function(e) {
  },
  handleDragAfter: function(e) {
  },
  
  /* ACTIONS ------------------------*/
  
  close: function() {
    this.setState({ closed: true });
  },
  
  open: function() {
    this.setState({ closed: false });
  },
  
  render: function() {
    //console.log('this.props.data.children:', this.props.data.children);
    var children;
    if (this.props.data.getChildren() && this.props.data.getChildren().length > 0) {
      var self = this;
      children = [];
      children.push( <li><InsertionMark/></li> );
      this.props.data.getChildren().forEach( function(child, i) {
          var key = this.props.treeView.props.nodesHaveKeys ? child.getKey() : undefined;
          children.push( ( <li><TreeNode data={child} key={key} treeView={this.props.treeView} /></li> ) );
          children.push( ( <li><InsertionMark active={this.state.dragHover}/></li> ) );
        }, this);
    }
    var selected = this.props.treeView.state.selectedNode === this;
    var classes = 'node';
    if (this.props.leafOnly ) classes += ' leaf-only'; // TODO: no CSS styling yet to reflect this
    if (!children           ) classes += ' childless';
    if (selected            ) classes += ' selected';
    if (this.state.dragHover) classes += ' drag-hover';
    if (this.state.closed   ) classes += ' closed';
    return (
      <div className={classes} 
        // onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} onDragOver= {this.handleDragOver}
        onKeyDown={this.handleKeyDown}
        onFocus={this.handleFocus}
      >
        <span className="handle" onClick={this.handleClickOnHandle} />
        <span tabIndex="0" className="label-box" 
          onMouseOver={this.handleMouseOver} onMouseMove={this.handleMouseMove}
          onClick={this.handleClickOnLabel} onFocus={this.handleFocusOnLabel}
        >
          <span className="label">{this.props.data.getLabel()}</span>
          <div className="top" onDragEnter={this.handleDragBefore.bind(this, this.props.parentIndex)}/>
          <div className="center" />
          <div className="bottom" />
        </span>
        <ul className="child-nodes">{children}</ul>
      </div> 
    );
  }
});

module.exports = TreeNode;