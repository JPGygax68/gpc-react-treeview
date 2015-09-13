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
  
  /* LIFECYCLE ----------------------*/
    
  getInitialState: function() {
    //console.log('TreeNode::getInitialState', 'this.props:', this.props);
    return {
      closed: false,
      dragHover: false
    }
  },
  
  componentWillMount: function() {
    //console.log('TreeNode::componentWillMount');
  },
    
  /* INTERNAL METHODS ---------------*/
  
  getChildElements: function() {
    
    var children, child_elements;
    
    if (!this.props.leafOnly) {
      children = this.props.data.getChildren(); // TODO: asynchronous implementations
      child_elements = [];
      child_elements.push( <li><InsertionMark/></li> );
      if (children && children.length > 0) {
        children.forEach( function(child, i) {
            //console.log('child: ', i);
            var key = this.props.treeView.props.nodesHaveKeys ? child.getKey() : undefined;
            child_elements.push( ( 
              <li>
                <TreeNode data={child} 
                  ref={(child_inst) => this.childInstances[i] = child_inst }
                  firstChild={i === 0} lastChild={i === children.length -1}
                  parent={this} index={i} treeView={this.props.treeView}
                  key={key}
                  leafOnly={child.isLeafOnly()}
                />
              </li> 
            ) );
            child_elements.push( ( <li><InsertionMark active={this.state.dragHover}/></li> ) );
          }, this);
      }
    }
    
    return child_elements;
  },

  setSelected: function() {
    this.props.treeView.setSelectedNode(this);
  },
  
  getPreviousSibling: function() {
    
    console.assert(this.props.parent.childInstances && this.props.parent.childInstances.length > 0 && this.props.index > 0);
    return this.props.parent.childInstances[this.props.index - 1];
  },
  
  /* INTRA-COMPONENT METHODS --------*/
  
  selectPreviousChild: function(child_index) {
    
    if (child_index > 0) {
      this.childInstances[child_index - 1].select();
    }
    else {
    }
  },

  selectNextChild: function(child_index) {

    if (child_index < (this.childInstances.length - 1)) {
      this.childInstances[child_index + 1].select();
    }
    else {
    }
  },
  
  selectFirstChild: function() {
    
    console.assert(this.childInstances.length > 0);
    this.childInstances[0].select();
  },

  selectLastChild: function() {
    
    console.assert(this.childInstances.length > 0);
    this.childInstances[this.childInstances.length-1].select();
  },

  /* QUERIES ------------------------*/
  
  isFirstChild: function() {
    return this.props.firstChild;
  },
  
  isLastChild: function() {
    return this.props.lastChild;
  },
  
  isSelected: function() {
    return this.props.treeView.state.selectedNode === this;
  },
  
  hasChildren: function() {
    return this.childInstances.length > 0;
  },
  
  previousSibling: function() {
    
    if (this.props.index > 0) {
      return this.props.parent.childInstances[this.props.index - 1];
    }
  },
  
  nextSibling: function() {
    
    if (this.props.index < (this.props.parent.childInstances.length - 1)) {
      return this.parent.childInstances[this.props.index + 1];
    }
  },
  
  /* ACTIONS ------------------------*/
  
  select: function() {
    //console.log('select');
    this.refs["label"].getDOMNode().focus();
  },
  
  selectNext: function() {
    
    if (!this.state.closed && this.hasChildren()) {
      this.selectFirstChild();
    }
    else if (!this.isLastChild()) {
      this.selectNextSibling();
    }
    else {
      this.props.parent.selectNextSibling();
    }
  },
  
  selectPrevious: function() {

    if (!this.isFirstChild()) {
      var previous = this.previousSibling();
      if (previous.hasChildren() && !previous.state.closed) {
        previous.selectLastChild();
      }
      else {
        this.selectPreviousSibling();
      }
    }
    else {
      this.props.parent.select();
    }
  },
  
  close: function() {
    this.setState({ closed: true });
  },
  
  open: function() {
    this.setState({ closed: false });
  },
  
  selectPreviousSibling: function() {
    if (this.props.index > 0) {
      this.props.parent.selectPreviousChild(this.props.index);
    }
  },
  
  selectNextSibling: function() {
    //console.log('selectNextSibling:', 'index:', this.props.index, 'parent:', this.props.parent);
    if (this.props.parent && this.props.index < (this.props.parent.childInstances.length - 1)) {
      this.props.parent.selectNextChild(this.props.index);
    }
  },
  
  /* EVENT HANDLERS -----------------*/
  
  handleClickOnHandle: function(e) {
    //console.log('handleClickOnHandle', this.state.closed);
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  handleClickOnLabel: function(e) {
    //console.log('handleClickOnLabel');
    this.setSelected();
    stopEvent(e);
  },
  handleDragEnter: function(e) {
    //console.log('handleDragEnter', e.clientX, e.clientY);
    this.setState({ dragHover: true });
    e.preventDefault();
    e.stopPropagation();
  },
  handleDragLeave: function(e) {
    //console.log('handleDragLeave');
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
      //console.log('UP');
      this.selectPrevious();
      stopEvent(e);
    }
    else if (e.which === 40) /* DOWN */ {
      //console.log('DOWN');
      this.selectNext();
      stopEvent(e);
    }
    else if (e.which === 37) /* LEFT */ {
      //console.log('LEFT');
      stopEvent(e);
      if (!this.state.closed) { this.close(); }
    }
    else if (e.which === 39) /* RIGHT */ {
      //console.log('RIGHT');
      stopEvent(e);
      if (this.state.closed) { this.open(); }
    }
  },
  handleFocusOnLabel: function(e) {
    //console.log('handleFocusOnLabel');
    if (!this.isSelected()) {
      this.setSelected();
      e.stopPropagation();
    }
  },
  handleDragBefore: function(index, e) {
    //console.log('handleDragBefore:', index, e);
  },
  handleDragOnto: function(e) {
  },
  handleDragAfter: function(e) {
  },
  
  /* Rendering ----------------------*/
  
  render: function() {
    //console.log('TreeNode::render()', 'this.childElements:', this.childElements);
    
    var selected = this.props.treeView.state.selectedNode === this;
    
    var classes = 'node';
    if (this.props.leafOnly ) classes += ' leaf-only'; // TODO: no CSS styling yet to reflect this
    if (selected            ) classes += ' selected';
    if (this.state.dragHover) classes += ' drag-hover';
    if (this.state.closed   ) classes += ' closed';
    if (!this.state.hasChildren) classes += ' childless';

    this.childInstances = []; // will be fill by child node ref callbacks
    
    return (
      <div className={classes} 
        // onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} onDragOver= {this.handleDragOver}
        onKeyDown={this.handleKeyDown}
      >
        <span className="handle" onClick={this.handleClickOnHandle} />
        <span tabIndex="0" className="label-box" ref="label"
          onMouseOver={this.handleMouseOver} onMouseMove={this.handleMouseMove}
          onClick={this.handleClickOnLabel} onFocus={this.handleFocusOnLabel}
        >
          <span className="label">{this.props.data.getLabel()}</span>
          <div className="top" onDragEnter={this.handleDragBefore.bind(this, this.props.parentIndex)}/>
          <div className="center" />
          <div className="bottom" />
        </span>
        <ul className="child-nodes">{this.getChildElements()}</ul>
      </div> 
    );
  }
});

module.exports = TreeNode;