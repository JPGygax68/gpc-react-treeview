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
    if      (e.which === 38) /* UP */ {
      // TODO: tell parent to move to previous sibling
    }
    else if (e.which === 40) /* DOWN */ {
      // TODO: tell parent to move to next sibling
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
    if (!this.isSelected()) {
      this.select();
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
  
  /* QUERIES ------------------------*/
  
  isFirstChild: function() {
    return this.state.firstChild;
  },
  
  isLastChild: function() {
    return this.state.lastChild;
  },
  
  isSelected: function() {
    return this.props.treeView.state.selectedNode === this;
  },
  
  /* ACTIONS ------------------------*/
  
  select: function() {
    this.props.treeView.setSelectedNode(this);
  },
  
  close: function() {
    this.setState({ closed: true });
  },
  
  open: function() {
    this.setState({ closed: false });
  },
  
  /* Rendering ----------------------*/
  
  render: function() {
    //console.log('this.props.data.children:', this.props.data.children);
    var child_elts;
    if (!this.props.leafOnly) {
      var children = this.props.data.getChildren(); // TODO: asynchronous implementations
      child_elts = [];
      child_elts.push( <li><InsertionMark/></li> );
      if (children) {
        children.forEach( function(child, i) {
            var key = this.props.treeView.props.nodesHaveKeys ? child.getKey() : undefined;
            child_elts.push( ( 
              <li>
                <TreeNode data={child} 
                  firstChild={i === 0} lastChild={i === children.length -1}
                  parent={this} key={key} index={i} treeView={this.props.treeView}
                  leafOnly={child.isLeafOnly()}
                />
              </li> 
            ) );
            child_elts.push( ( <li><InsertionMark active={this.state.dragHover}/></li> ) );
          }, this);
      }
    }
    var selected = this.props.treeView.state.selectedNode === this;
    var classes = 'node';
    if (this.props.leafOnly ) classes += ' leaf-only'; // TODO: no CSS styling yet to reflect this
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
        <ul className="child-nodes">{child_elts}</ul>
      </div> 
    );
  }
});

module.exports = TreeNode;