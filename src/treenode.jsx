"use strict";

var React = require('react');
var DragSource = require('react-dnd').DragSource;
var DropTarget = require('react-dnd').DropTarget;
var _ = require ('lodash');

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
      nodeProps: this.props.treeView.props.getNodeProps(this.props.data),
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
    
    this.setState( { nodeProps: this.props.treeView.props.getNodeProps(this.props.data) } );
  },
  
  /* INTERNAL METHODS ---------------*/
  
  getIndexChain: function () {
    var chain = [];
    for (var node = this; node; node = node.props.parent) chain.unshift(node.props.index);
    return chain;
  },
  
  /* QUERIES ------------------------*/
  
  isRoot: function() { return !this.state.nodeProps.parent; },
  getChildCount: function() { return this.state.nodeProps.childNodes && this.state.nodeProps.childNodes.length; },
  isSelected: function() {
    
    return this.props.treeView.props.nodesHaveUniqueKeys ?
      this.state.nodeProps.key === this.props.treeView.state.selection :
      _.isEqual(this.getIndexChain(), this.props.treeView.state.selection);
  },
  hasChildren: function() { return this.getChildCount() > 0; },
  isFirstSibling: function() { return this.props.index === 0; },
  isLastSibling: function() {   
    if (this.isRoot()) return true;
    var parentProps = this.props.treeView.props.getNodeProps(this.state.nodeProps.parent);
    console.assert(parentProps.childNodes);
    return this.props.index === parentProps.childNodes.length - 1;
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
    return this.getChildAt(this.props.treeView.props.getNodeProps(data).childNodes.length - 1);
  },
  isNodeDraggable: function() {
    
    if (typeof this.props.data.canDrag === 'function') {
      return this.props.data.canDrag();
    }
    else return false;
  },
  
  /* ACTIONS ------------------------*/
  
  select: function() {
    
    /*
    if (!this.isSelected()) {
      var newSel = [];
      for (var current = this; current.props.parent; current = current.props.parent) {
        newSel.unshift(current.props.index);
      }
      this.props.treeView.setState({ selection: newSel });
    }
    */
  },
  selectNext: function() {
    throw new Error('selectNext: TODO');
    if (DEBUG) console.debug('selectNext', this.props.data.getLabel());
    
    /*
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
    */
  },
  selectPrevious: function() {
    throw new Error('selectPrevious: TODO');
    if (DEBUG) console.debug('selectPrevious', this);

    /*
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
          console.debug('current:', current);
          // Check if the node has children and is not closed -> abort if otherwise
          var children = current.props.data.childNodes;
          if (current.state.closed || !children || children.length === 0) break;
          // Add the index of the last child to the selection
          var index = children.length - 1;
          sel.push( index );
        }
        // Update the view
        this.props.treeView.setState({ selection: sel });
      }
      else {
        this.props.parent.select();
      }
    }
    */
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

    var selection = this.props.treeView.props.nodesHaveUniqueKeys ?
      this.state.nodeProps.key :
      this.getIndexChain([]);
      
    this.props.treeView.selectionChanged( selection );
  },
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
    
    var nodeProps = this.props.treeView.props.getNodeProps(this.props.data);
    console.log('nodeProps:', nodeProps);
    
    var classes = 'node';
    // Transitory state
    if ( this.state.closed         ) classes += ' closed'           ;
    if ( this.state.beingDragged   ) classes += ' being-dragged'    ;
    if ( this.state.validDropTarget) classes += ' valid-drop-target';
    // Node properties
    if ( nodeProps.leaf            ) classes += ' leaf'             ;
    // Queries
    if ( this.isSelected()         ) classes += ' selected'         ; // TODO: set focus (delayed?)
    if (!this.hasChildren()        ) classes += ' childless'        ;

    return this.props.connectDragSource(
      <div className={classes} onKeyDown={this.handleKeyDown}>
        <div className= "header">
          <div className="handle" onClick={this.handleClickOnHandle} />
          { React.createElement(TreeNodeLabel, { 
              node: this, 
              text: nodeProps.label,
              onSelected: this.handleLabelSelected,
              onObtainedFocus: this.handleObtainedFocus,
              onKeyDown: this.handleKeyDown,
              selected: this.isSelected() 
            }) 
          }
        </div>
        <ul className="child-nodes">{this.renderChildren(nodeProps)}</ul>
      </div> 
    );
  },
  renderChildren: function(nodeProps) {
    
    var child_elements;

    if (!nodeProps.leaf) {
      child_elements = [];
      child_elements.push( (
        <li>
          <InsertionMark parent={this} index={0} />
        </li>
      ) );
      if (nodeProps.childNodes && nodeProps.childNodes.length > 0) {
        nodeProps.childNodes.forEach( function(child, i) {
          child_elements.push( ( 
            <li>
              <TreeNode data={child} key={this.state.nodeProps.key}
                ref={'child-'+i}
                firstChild={i === 0} lastChild={i === (nodeProps.childNodes.length - 1)}
                parent={this} index={i} treeView={this.props.treeView}
                depth={this.props.depth + 1}
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