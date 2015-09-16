"use strict";

var React = require('react');
var DragSource = require('react-dnd').DragSource;
//var DragDropContext = require('react-dnd').DragDropContext;

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
    isDragging: React.PropTypes.bool.isRequired,
    onSelectionPath: React.PropTypes.bool // actually means: "on the selection path"
  },
  
  /* LIFECYCLE ----------------------*/
  
  getPropTypes: function() {
    
    return {
      data: React.PropTypes.object.isRequired,
      connectDragSource: React.PropTypes.func.isRequired,
      isDragging: React.PropTypes.bool.isRequired,
      onSelectionPath: React.PropTypes.bool
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
  componentDidMount: function() {
    console.log('componentDidMount');
    
  },
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {

    if (this.isSelected()) {
      console.log('setting focus on label');
      this.refs["label"].getDOMNode().focus();
    }
  },
  componentWillReceiveProps: function(nextProps) {
    
    if (!nextProps.onSelectionPath) {
      this.setState({ selectedChildIndex: -1 });
    }
  },
  
  /* INTERNAL METHODS ---------------*/
  
  getChildCount: function() {
    
    return this.state.children.length;
  },
  getChildAt: function(index) {
    
    console.assert(index < this.state.children.length);
    console.log('getChildAt('+index+'):', this.refs['child-'+index]);
    return this.refs['child-'+index];
  },
  selectPreviousChild: function() {
    
    console.assert(this.state.selectedChildIndex > 0);
    this.setState({ selectedChildIndex: this.state.selectedChildIndex - 1 });
  },
  selectNextChild: function() {

    console.assert(this.state.selectedChildIndex < (this.state.children.length - 1));
    this.setState({ selectedChildIndex: this.state.selectedChildIndex + 1 });
  },
  selectLastChild: function() {
    
    console.assert(this.state.children.length > 0);
    this.setState({ selectedChildIndex: this.state.children.length - 1});
  },
  /* selectChildAt: function(index) {
    console.log('selectChildAt(', index, ')');
    
    this.setState({ selectedChildIndex: index });
    if (this.props.parent) {
      this.props.parent.selectChildAt(this.props.index);
    }
  }, */
  descendantWasSelected: function(child_index) {
    console.log('descendantWasSelected(', child_index, ')');
    
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
    return this.state.children && this.state.children.length > 0;
  },
  isFirstSibling: function() { return this.props.index === 0; },
  isLastSibling: function() { 
    // TODO: get this as a property from the parent instead ?
    var result = this.isRoot() || this.props.index === (this.props.parent.getChildCount() -1); 
    //console.log('isLastSibling? ->', result);
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
        && this.props.index === this.props.treeView.state.selection[this.props.depth - 1];
  },
  
  /* ACTIONS ------------------------*/
  
  select: function() {
    
    if (!this.isSelected()) {
      var newSel = [];
      for (var current = this; current.props.parent; current = current.props.parent) {
        newSel.unshift(current.props.index);
      }
      //console.log('new selection path:', newSel);
      this.props.treeView.setState({ selection: newSel });
    }
  },
  setFocus: function() {

    this.refs["label"].getDOMNode().focus();
  },
  selectNext: function() {
    console.log('selectNext', this.props.data.getLabel());
    
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
        console.log('climbing up before forward');
        // Check how many levels we have to climb up before moving forward
        var index = this.selection().length - 1; // could also use depth property
        //console.log('initial index:', index);
        var current = this.props.parent;
        while (current && current.isLastSibling()) {
          index --;          
          current = current.props.parent;
          //console.log('index:', index, 'current:', current);
        }
        // If we arrive at the root node, there's nowhere left to move
        if (index > 0) {
          //console.log('index after climb:', index);
          var sel = this.selection();
          sel.splice(index - 1, 1000, current.props.index + 1);
          //console.log('new selection:', sel);
          this.props.treeView.setState({ selection: sel });
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
      previous.setFocus();
    }
    else {
      if (!this.isRoot()) {
        this.props.parent.setFocus();
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
      this.select();
      e.preventDefault();
      e.stopPropagation();
    }
  },
  
  /* Rendering ----------------------*/
  
  render: function() {
    console.log('TreeNode::render()');
    
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

    this.childInstances = []; // will be fill by child node ref callbacks
    
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
                  depth={this.props.depth + 1}
                  leaf={child.isLeafOnly()} /* TODO: wrap to support fallback */
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