"use strict";

var React = require('react');
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragDropContext = require('react-dnd').DragDropContext;
var DragSource = require('react-dnd').DragSource;

var InsertionMark = require('./insertionmark.jsx');

/* HELPER FUNCTIONS -----------------*/

function stopEvent(e) { 
  e.preventDefault(); 
  e.stopPropagation(); 
}

/* Drag and Drop (React DnD) --------*/

var dndNodeSource = {
  
  beginDrag: function(props) {
    return {
      data: props.data
    };
  }
};

function dndCollect(connect, monitor) {
  
  return {
    connectDragSource: connect.dragSource(), // function that will be used to wrap the component
    isDragging: monitor.isDragging()
  }
}

/* MAIN CLASS -----------------------*/

var TreeNode = React.createClass({
  
  displayName: 'TreeNode',
  
  propTypes: {
    data: React.PropTypes.object.isRequired,
    leaf: React.PropTypes.bool,
    connectDragSource: React.PropTypes.func.isRequired,
    isDragging: React.PropTypes.bool.isRequired
  },
  
  /* LIFECYCLE ----------------------*/
  
  getPropTypes: function() {
    
    return {
      data: React.PropTypes.object.isRequired,
      connectDragSource: React.PropTypes.func.isRequired,
      isDragging: React.PropTypes.bool.isRequired
    }
  },
  getDefaultProps: function() {
    
    return {
      data: null
    }
  },
  getInitialState: function() {
    //console.log('TreeNode::getInitialState', 'this.props:', this.props);
    
    return {
      children: this.props.data.getChildren(),
      selectedChildIndex: -1,
      //beingDragged: false,
      canDropHere: false
    }
  }, 
  componentWillMount: function() {
    //console.log('TreeNode::componentWillMount');
  },
    
  /* INTERNAL METHODS ---------------*/
  
  getChildCount: function() {
    
    return this.state.children.length;
  },
  getChildAt: function(index) {
    
    console.assert(index < this.state.children.length);
    return this.refs['child-'+index];
  },
  selectPreviousChild: function() {
    
    console.assert(this.state.selectedChildIndex > 0);
    this.setState({ selectedChildIndex: this.state.selectedChildIndex - 1 });
  },
  selectNextChild: function() {

    console.assert(this.state.selectedChildIndex < (this.state.children.length - 1));
    this.setState({ selectedChildIndex: this.state.selectedChildIndex - 1 });
  },
  selectLastChild: function() {
    
    console.assert(this.state.children.length > 0);
    this.setState({ selectedChildIndex: this.state.children.length - 1});
  },
  selectChildAt: function(index) {
    console.log('selectChildAt(', index, ')');
    
    this.setState({ selectedChildIndex: index });
    if (this.props.parent) {
      this.props.parent.selectChildAt(this.props.index);
    }
  },
  setSelected: function() {
    
    if (this.props.parent) {
      this.props.parent.selectChildAt(this.props.index);
    }
    this.setState({ selectedChildIndex: -1 });
  },

  /* QUERIES ------------------------*/
  
  hasChildren: function() {
    return this.state.children && this.state.children.length > 0;
  },
  isFirstSibling: function() { return this.props.index === 0; },
  isLastSibling: function() { 
    return this.isRoot() || this.props.index === (this.props.parent.getChildCount() -1); 
  },
  getPreviousSibling: function() {
    
    console.assert(this.props.index > 0);
    return this.props.parent.getChildAt(this.props.index - 1);
  },
  getNextSibling: function() {
    
    console.assert(this.props.index < (this.props.parent.getChildCount() - 1));
    return this.props.parent.getChildAt(this.props.index + 1);
  },
  getLastChild: function() {
    return this.getChildAt(this.state.children.length - 1);
  },
  isNodeDraggable: function() {
    
    if (typeof this.props.data.canDrag === 'function') {
      return this.props.data.canDrag();
    }
    else return false;
  },
  isRoot: function() { return !this.props.parent; },
  isOnSelectionPath: function() {
    
    return this.isRoot() 
      || this.props.parent 
        && (this.props.parent.isRoot() || this.props.parent.isOnSelectionPath())
        && this.props.parent.state.selectedChildIndex === this.props.index;
  },
  isSelected: function() {
    
    return this.isOnSelectionPath() && this.state.selectedChildIndex < 0;
  },
  
  /* ACTIONS ------------------------*/
  
  select: function() {

    this.refs["label"].getDOMNode().focus();
  },
  selectNext: function() {
    console.log('selectNext', this.props.data.getLabel());
    
    if (!this.state.closed && this.hasChildren()) {
      this.getChildAt(0).select();
    }
    else {
      if (!this.isLastSibling()) {
        this.getNextSibling().select();
      }
      else if (this.props.parent) {
        if (!this.props.parent.isLastSibling()) {
          this.props.parent.getNextSibling().select();
        }
      }
    }
    // TODO: other cases
  },
  selectPrevious: function() {
    console.log('selectPrevious', this);

    if (!this.isFirstSibling()) {
      var previous = this.getPreviousSibling();
      console.log('previous:', previous);
      while (previous.hasChildren() && !previous.state.closed) {
        previous = previous.getLastChild();
      }
      previous.select();
    }
    else {
      if (!this.isRoot()) {
        this.props.parent.select();
      }
    }
  },
  close: function() {
    this.setState({ closed: true });
  },
  open: function() {
    this.setState({ closed: false });
  },
  
  /* EVENT HANDLERS -----------------*/
  
  handleClickOnHandle: function(e) {
    //console.log('handleClickOnHandle', this.state.closed);
    
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  handleClickOnLabel: function(e) {
    //console.log('handleClickOnLabel');
    
    // NOTE: nothing to do, focus should take care of everything
    //this.setSelected();
    //stopEvent(e);
  },
  /*
  handleDragStart: function(e) {
    console.log('TreeNode::handleDragStart');
    
    if (this.isNodeDraggable()) {
      this.setState({ beingDragged: true });
      e.dataTransfer.setData('text/plain', 'dummy');
      this.props.treeView.startedDragging(this);
      e.stopPropagation();
    }
  },
  handleDragEnd: function(e) {
    console.log('TreeNode::handleDragEnd');
    
    this.props.treeView.dragHasEnded();
    this.setState({ beingDragged: false });
  },
  handleDragEnter: function(e) {
    console.log('TreeNode::handleDragEnter', e.clientX, e.clientY);
    
    if (true) { // TODO
      this.setState({ validDropTarget: true });
      stopEvent(e);
    }
  },
  handleDragLeave: function(e) {
    console.log('handleDragLeave');
    
    stopEvent(e);
  },
  handleDragOver: function(e) {
    console.log('handleDragOver', e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    
    if (this.state.canDropHere) {
      stopEvent(e);
    }
  },
  */
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
    console.log('handleFocusOnLabel', 'this.props.index:', this.props.index);
    
    if (!this.isSelected()) {
      this.setSelected();
      e.preventDefault();
      //e.stopPropagation();
    }
  },
  
  /* Rendering ----------------------*/
  
  render: function() {
    //console.log('TreeNode::render()', 'this.childElements:', this.childElements);
    
    var classes = 'node';
    // Properties
    if ( this.props.leaf           ) classes += ' leaf'             ; // TODO: no CSS styling yet to reflect this
    // Transitory state
    if ( this.state.closed         ) classes += ' closed'           ;
    if ( this.state.beingDragged   ) classes += ' being-dragged'    ;
    if ( this.state.validDropTarget) classes += ' valid-drop-target';
    // Queries
    if ( this.isSelected()         ) classes += ' selected'         ;
    if (!this.hasChildren()        ) classes += ' childless'        ;

    this.childInstances = []; // will be fill by child node ref callbacks
    
    console.log('this.props.connectDragSource', this.props.connectDragSource);
    
    return this.props.connectDragSource(
      <div className={classes} onKeyDown={this.handleKeyDown}>
        <div className="header">
          <div className="handle" onClick={this.handleClickOnHandle} />
          { this.renderLabel() }
        </div>
        <ul className="child-nodes">{this.renderChildren()}</ul>
      </div> 
    );
  },
  renderLabel: function() {

    return (
      <div className="label" tabIndex="0" ref="label"
        onClick    ={this.handleClickOnLabel} onFocus    ={this.handleFocusOnLabel}
        draggable  ={this.isNodeDraggable() }
        /* onDragEnter={this.handleDragEnter   } onDragLeave={this.handleDragLeave   }
        onDragStart={this.handleDragStart   } onDragEnd  ={this.handleDragEnd     } */
      >
        {this.props.data.getLabel()}
      </div>
    );
  },
  renderChildren: function() {
    
    var children, child_elements;
    
    if (!this.props.leaf) {
      children = this.props.data.getChildren(); // TODO: asynchronous implementations
      child_elements = [];
      child_elements.push( (
        <li>
          <InsertionMark containingNode={this} index={0} 
            /* onCanDropHere={this.handleCanDropHere.bind(this, 0)}
            onDropHere   ={this.handleDropHere   .bind(this, 0)} */        
          />
        </li>
      ) );
      if (children && children.length > 0) {
        children.forEach( function(child, i) {
            //console.log('child: ', i);
            var key = this.props.treeView.props.nodesHaveKeys ? child.getKey() : undefined;
            child_elements.push( ( 
              <li>
                <TreeNode data={child} key={key}
                  /* ref={(child_inst) => this.childInstances[i] = child_inst} */
                  ref={'child-'+i}
                  firstChild={i === 0} lastChild={i === (children.length - 1)}
                  parent={this} index={i} treeView={this.props.treeView}
                  leaf={child.isLeafOnly()}
                />
              </li> 
            ) );
            child_elements.push( ( 
              <li>
                <InsertionMark containingNode={this} index={i + 1} 
                  /* onCanDropHere={this.handleCanDropHere.bind(this, i + 1)}
                  onDropHere   ={this.handleDropHere   .bind(this, i + 1)} */
                />
              </li> 
            ) );
          }, this);
      }
    }
    
    return child_elements;
  },
  
});

TreeNode = DragSource("NODE", dndNodeSource, dndCollect)(TreeNode);

module.exports = TreeNode;