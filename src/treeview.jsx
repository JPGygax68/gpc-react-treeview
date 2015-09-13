"use strict";

var React = require('react');
//require('react/dist/JSXTransformer');
var $ = require('jquery');
var insertCss = require('insert-css');

// TODO: CSS injection should not be set in stone like this, provide variety of bundler modules ?
var css = require('./styles.styl');
insertCss(css);

var TreeNode = require('./treenode.jsx');

var TreeView = React.createClass({
  
  displayName: 'TreeView',
  
  propTypes: {
    rootNode: React.PropTypes.object.isRequired,
    nodesHaveKeys: React.PropTypes.bool
  },
  
  getInitialState: function() {
    return { 
      selected_node: null,
      dragging: false 
    };
  },
  
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({comments: data})
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      },
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }
    });
  },
  setSelectedNode: function(node) {
    if (this.state.selectedNode) {
      this.state.selectedNode.setState({ selected: false });
    }
    this.setState({ selectedNode: node });
  },
  componentWillMount: function() {
    //console.log('TreeView::componentWillMount', 'props:', this.props);
  },
  componentDidMount: function() {
    //console.log('TreeView::componentDidMount');
    if (this.props.url) {
      this.loadCommentsFromServer();
      setInterval(this.loadCommentsFromServer, this.props.pollInterval || 2000);
    }
    // Listen to drag events
    self = this;
    document.addEventListener('dragstart', function(e) {
      console.log('dragstart');
      self.setState({ dragging: true });
    });
    document.addEventListener('dragend', function(e) {
      console.log('dragend');
      self.setState({ dragging: false });
    });
  },
  
  render: function() {
    //console.log('this.props.top_nodes:', this.props.top_nodes);
    // Note: the "dragging" attribute should probably be implemented 
    return ( 
      <div className="gpc treeview">
        <TreeNode label="ROOT"
          treeView={this}
          data={this.props.rootNode}
          dragging={this.state.dragging}
        />
      </div> 
    );
  }
});

// Class that represents nodes

/*
function NodeProxy(data) {
  
  console.assert(data.original_node);
  this.original_node = data.original_node;
  this.key = data.key;
  this.label = data.label || '(no label)';
  this.child_nodes = data.child_nodes;
  
  this.parent = null;
  this.root = null;
  this.selected = false;
}
*/

/* This class is the data model for a tree view, plus the "adaptation layer" allowing
  the treeview to access the data.
  In a mature implementation, event handlers could (should?) be used by the treeview
  to access data indirectly.
  For the other direction, i.e. updating the view when the data has changed, user code
  could obtain a ref (the callback type) to the treeview component, and use keys to
  inform the view of updates without having to re-generate the whole view.
*/

/*
NodeProxy.prototype = {
  
  init: function() {
    this.setParentAndRoot(this, this);
  },
  
  setParentAndRoot: function(parent, root) {
    this.parent = parent;
    this.root = root;
    if (this.child_nodes) {
      this.child_nodes.forEach( function(child) { 
          child.setParentAndRoot(this, root) 
        }.bind(this) 
      );
    }
  }
}
*/

module.exports = {
  
  TreeView: TreeView,
  TreeNode: TreeNode,
  
  React: React
  
  // Examples of convenience exports
  //ko: ko,
  //knockout: ko,
  //jQuery: require('jquery')
}