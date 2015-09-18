"use strict";

var React = require('react');
var DragSource = require('react-dnd').DragSource;
var DropTarget = require('react-dnd').DropTarget;

var InsertionMark = require('./insertionmark.jsx');

var DEBUG = false;

/* HELPER FUNCTIONS -----------------*/

function stopEvent(e) { 

  e.preventDefault(); 
  e.stopPropagation(); 
}

/* Drag and Drop (React DnD) --------*/

/* Note: the dragSource is applied to a TreeNode as a whole,
  while the dropTarget is applied to the label only.
 */
var dragSource = {
  
  beginDrag: function(props) {
    console.debug('beginDrag:', props.parent, props.index);

    return {
      parent: props.parent && props.parent.props.data,
      index: props.index
    };
  }
};

function dragCollect(connect, monitor) {
  
  return {
    connectDragSource: connect.dragSource(), // function that will be used to wrap the component
    isDragging: monitor.isDragging()
  }
}

var nodeLabelTarget = {
  
  drop: function (props) {
    if (DEBUG) console.debug('nodeLabelTarget::drop()');
  }
};

function dropCollect(connect, monitor) {
  
  return {
    connectDropTarget: connect.dropTarget(), // function that will be used to wrap the component
    isOver: monitor.isOver()
  }
}

/* SUB-COMPONENT --------------------*/

var TreeNodeLabel = React.createClass({
  
  propTypes: {
    text: React.PropTypes.string.isRequired,
    node: React.PropTypes.object.isRequired,
    selected: React.PropTypes.bool.isRequired,
    onSelected: React.PropTypes.func.isRequired,
    onObtainedFocus: React.PropTypes.func.isRequired,
    onKeyDown: React.PropTypes.func.isRequired
  },
  
  componentDidMount: function() {
    if (DEBUG) console.debug('TreeNodeLabel::componentDidMount()');
  },
  
  componentDidUpdate: function(prevProps, prevState) {
    if (DEBUG) console.debug('TreeNodeLabel::componentDidUpdate');

    if (this.props.selected) {
      // We do this here but not in componentDidMount, because the initial 
      // rendering should not grab the focus - leave that to the user.
      if (DEBUG) console.debug('setting focus on label');
      this.refs["label"].getDOMNode().focus();
    }  
  },
  
  handleClickOnLabel: function(e) {
    if (DEBUG) console.debug('TreeNodeLabel::handleClickOnLabel');
    
    this.props.onSelected.call(this.props.node);
    e.stopPropagation();
  },
  
  handleFocusOnLabel: function(e) {
    if (DEBUG) console.debug('TreeNodeLabel::handleFocusOnLabel', 'this.props.node:', this.props.node);
    
    this.props.onObtainedFocus.call(this.props.node);
    e.stopPropagation();
  },
  
  handleKeyDown: function(e) {
    
    this.props.handleKeyDown.call(this.props.node, e);
    e.stopPropagation();
  },
  
  render: function() {
    
    return (
      <div className="label" tabIndex="0" ref="label"
        onClick={this.handleClickOnLabel} onFocus={this.handleFocusOnLabel}
        onKeydown={this.handleKeyDown}
        /* draggable={this.props.node.isNodeDraggable() } /* TODO: probably not needed with ReactDnd */
      >
        { this.props.text }
      </div>
    );
  }
});

TreeNodeLabel = DropTarget("NODE", nodeLabelTarget, dropCollect)(TreeNodeLabel);

/* MAIN CLASS -----------------------*/

var TreeNode = React.createClass({
  
  displayName: 'TreeNode',
  
  propTypes: {
    parent: React.PropTypes.object,
    data: React.PropTypes.object.isRequired,
    leaf: React.PropTypes.bool,
    connectDragSource: React.PropTypes.func.isRequired,
    isDragging: React.PropTypes.bool.isRequired,
    onSelectionPath: React.PropTypes.bool // actually means: "on the selection path"
  },
  
  /* LIFECYCLE ----------------------*/
  
  getDefaultProps: function() {
    
    return {
      parent: null,
      data: null
    }
  },
  getInitialState: function() {
    if (DEBUG) console.debug('TreeNode::getInitialState', 'this.props:', this.props);
    
    return {
      closed: false,
      canDropHere: false
    }
  }, 
  componentWillMount: function() {
    if (DEBUG) console.debug('TreeNode::componentWillMount');
  },
  componentDidMount: function() {
    if (DEBUG) console.debug('componentDidMount');
    
  },
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
    if (DEBUG) console.debug('TreeNode::componentDidUpdate');
  },
  componentWillReceiveProps: function(nextProps) {
    if (DEBUG) console.debug('componentWillReceiveProps');
  },
  
  /* INTERNAL METHODS ---------------*/
  
  getChildCount: function() {
    
    return this.props.data.getChildren().length;
  },
  getChildAt: function(index) {
    
    console.assert(index < this.props.data.getChildren().length);
    if (DEBUG) console.debug('getChildAt('+index+'):', this.refs['child-'+index]);
    return this.refs['child-'+index];
  },
  selectPreviousChild: function() {
    
    console.assert(this.state.selectedChildIndex > 0);
    this.setState({ selectedChildIndex: this.state.selectedChildIndex - 1 });
  },
  selectNextChild: function() {

    console.assert(this.state.selectedChildIndex < (this.props.data.getChildren().length - 1));
    this.setState({ selectedChildIndex: this.state.selectedChildIndex + 1 });
  },
  selectLastChild: function() {
    
    console.assert(this.props.data.getChildren().length > 0);
    this.setState({ selectedChildIndex: this.props.data.getChildren().length - 1});
  },
  descendantWasSelected: function(child_index) {
    if (DEBUG) console.debug('descendantWasSelected(', child_index, ')');
    
    this.setState({ selectedChildIndex: child_index });
    if (this.props.parent) {
      this.props.parent.descendantWasSelected(this.props.index);
    }
  },
  selectNextSibling: function() {
    
    console.assert(this.isSelected());
    this.props.parent.selectNextChild();
  },
  selection: function() { return this.props.treeView.state.selection; },
  
  /* QUERIES ------------------------*/
  
  isSelected: function() {
    
    return (this.isRoot()|| this.isOnSelectionPath())
       && this.props.treeView.state.selection.length === this.props.depth;
  },
  hasChildren: function() {
    var children = this.props.data.getChildren();
    return children && children.length > 0;
  },
  isFirstSibling: function() { return this.props.index === 0; },
  isLastSibling: function() { 
    // TODO: get this as a property from the parent instead ?
    var result = this.isRoot() || this.props.index === (this.props.parent.getChildCount() -1); 
    return result;
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
    return this.getChildAt(this.props.data.getChildren().length - 1);
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
        && this.props.index === this.props.treeView.state.selection[this.props.depth - 1];
  },
  
  /* ACTIONS ------------------------*/
  
  select: function() {
    
    if (!this.isSelected()) {
      var newSel = [];
      for (var current = this; current.props.parent; current = current.props.parent) {
        newSel.unshift(current.props.index);
      }
      this.props.treeView.setState({ selection: newSel });
    }
  },
  selectNext: function() {
    if (DEBUG) console.debug('selectNext', this.props.data.getLabel());
    
    console.assert(this.isOnSelectionPath());
    
    if (!this.state.closed && this.hasChildren()) {
      var sel = this.selection();
      sel.unshift(0);
      this.props.treeView.setState({ selection: sel });
    }
    else {
      if (!this.isLastSibling()) {
        var sel = this.selection();
        sel.splice(sel.length - 1, 1, this.props.index + 1);
        this.props.treeView.setState({ selection: sel });
      }
      else if (this.props.parent) {
        if (DEBUG) console.debug('climbing up before forward');
        // Check how many levels we have to climb up before moving forward
        var index = this.selection().length - 1; // could also use depth property
        //console.debug('initial index:', index);
        var current = this.props.parent;
        while (current && current.isLastSibling()) {
          index --;          
          current = current.props.parent;
          //console.debug('index:', index, 'current:', current);
        }
        // If we arrive at the root node, there's nowhere left to move
        if (index > 0) {
          //console.debug('index after climb:', index);
          var sel = this.selection();
          sel.splice(index - 1, 1000, current.props.index + 1);
          //console.debug('new selection:', sel);
          this.props.treeView.setState({ selection: sel });
        }
      }
    }
    // TODO: other cases
  },
  selectPrevious: function() {
    if (DEBUG) console.debug('selectPrevious', this);

    console.assert(this.isOnSelectionPath());

    if (!this.isRoot()) {
      if (!this.isFirstSibling()) {
        // Set selection to previous sibling
        var sel = this.selection();
        var index = this.props.index - 1;
        sel.splice(sel.length - 1, 1, index); // -1 is special
        // Select the last visible descendant:
        // Get a ref to the previous sibling
        var sibling = this.props.parent.refs['child-'+index];
        for (var current = sibling; current; current = current.refs['child-'+index]) {
          // Check if the node has children and is not closed -> abort if otherwise
          var children = current.props.data.getChildren();
          if (current.state.closed || !children || children.length === 0) break;
          // Add the index of the last child to the selection
          var index = current.props.data.getChildren().length - 1;
          sel.push( index );
        }
        // Update the view
        this.props.treeView.setState({ selection: sel });
      }
      else {
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
    if (DEBUG) console.debug('handleClickOnHandle', this.state.closed);
    
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  handleLabelSelected: function() {
    if (DEBUG) console.debug('TreeNode::handleLabelSelected');
  },
  /*
  handleDragStart: function(e) {
    console.('TreeNode::handleDragStart');
    
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
    if (DEBUG) console.debug('TreeNode::handleKeyDown');
    
    if      (e.which === 38) /* UP */ {
      this.selectPrevious();
      stopEvent(e);
    }
    else if (e.which === 40) /* DOWN */ {
      this.selectNext();
      stopEvent(e);
    }
    else if (e.which === 37) /* LEFT */ {
      stopEvent(e);
      if (!this.state.closed) { this.close(); }
    }
    else if (e.which === 39) /* RIGHT */ {
      stopEvent(e);
      if (this.state.closed) { this.open(); }
    }
  },
  handleObtainedFocus: function() {
    if (DEBUG) console.debug('TreeNode::handleObtainedFocus', 'this.props.index:', this.props.index);
    
    if (!this.isSelected()) {
      this.select();
    }
  },
  
  /* Rendering ----------------------*/
  
  render: function() {
    if (DEBUG) console.debug('TreeNode::render()');
    
    var classes = 'node';
    // Properties
    if ( this.props.leaf           ) classes += ' leaf'             ; // TODO: no CSS styling yet to reflect this
    if ( this.isSelected()         ) classes += ' selected'         ; // TODO: set focus (delayed?)
    // Transitory state
    if ( this.state.closed         ) classes += ' closed'           ;
    if ( this.state.beingDragged   ) classes += ' being-dragged'    ;
    if ( this.state.validDropTarget) classes += ' valid-drop-target';
    // Queries
    if (!this.hasChildren()        ) classes += ' childless'        ;

    return this.props.connectDragSource(
      <div className={classes} onKeyDown={this.handleKeyDown}>
        <div className= "header">
          <div className="handle" onClick={this.handleClickOnHandle} />
          { React.createElement(TreeNodeLabel, { 
              node: this, 
              text: this.props.data.getLabel(),
              onSelected: this.handleLabelSelected,
              onObtainedFocus: this.handleObtainedFocus,
              onKeyDown: this.handleKeyDown,
              selected: this.isSelected() 
            }) 
          }
        </div>
        <ul className="child-nodes">{this.renderChildren()}</ul>
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
          <InsertionMark parent={this} index={0} />
        </li>
      ) );
      if (children && children.length > 0) {
        children.forEach( function(child, i) {
            var key = this.props.treeView.props.nodesHaveKeys ? child.getKey() : undefined;
            child_elements.push( ( 
              <li>
                <TreeNode data={child} key={key}
                  ref={'child-'+i}
                  firstChild={i === 0} lastChild={i === (children.length - 1)}
                  parent={this} index={i} treeView={this.props.treeView}
                  depth={this.props.depth + 1}
                  leaf={child.isLeafOnly()} /* TODO: wrap to support fallback */
                />
              </li> 
            ) );
            child_elements.push( ( 
              <li>
                <InsertionMark parent={this} index={i + 1} />
              </li> 
            ) );
          }, this);
      }
    }
    
    return child_elements;
  },
  
});

TreeNode = DragSource("NODE", dragSource, dragCollect)(TreeNode);

module.exports = TreeNode;