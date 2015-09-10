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
  setSelectedNode: function(proxy) {
    if (this.selected_node) this.selected_node.setProps({ selected: false });
    this.selected_node = proxy;
  },
  componentWillMount: function() {
    console.log('TreeView::componentWillMount', 'props:', this.props);
    this.props.root_node.init();
  },
  componentDidMount: function() {
    console.log('TreeView::componentDidMount');
    if (this.props.url) {
      this.loadCommentsFromServer();
      setInterval(this.loadCommentsFromServer, this.props.pollInterval || 2000);
    }
  },
  render: function() {
    //console.log('this.props.top_nodes:', this.props.top_nodes);
    return ( <div className="gpc treeview">
        <TreeNode label="ROOT" data={this.props.root_node} ref={(c) => this.props.root_node.setComponent(c)}/>
      </div> );
  }
});

// Class that represents nodes

function NodeProxy(data) {
  
  console.assert(data.original_node);
  this.original_node = data.original_node;
  this.key = data.key;
  this.label = data.label || '(no label)';
  this.child_nodes = data.child_nodes;
  
  this.parent = null;
  this.root = null;
}

NodeProxy.prototype = {
  
  init: function() {
    this.setParentAndRoot(this, this);
  },
  
  setParentAndRoot: function(parent, root) {
    this.parent = parent;
    this.root = root;
    if (this.child_nodes) this.child_nodes.forEach( function(child) { child.setParentAndRoot(this, root) }.bind(this) );
  },
  
  setSelected: function() {
    this.root.setSelectedNode(this);
  },
  
  setComponent: function(comp) {
    this.component = comp;
    console.log('NodeProxy::setComponent():', comp);
  },
  
  // Only on root node
  
  setSelectedNode: function(node) {
    if (this.selected_node) {
      this.selected_node.component.setState({ selected: false });
    }
    this.selected_node = node;
    if (node) {
      this.selected_node.component.setState({ selected: true });
    }
  }
}

// Class method that wrap existing tree structure

TreeView.wrapExistingTree = function(root_node) {
    
  var key = 'ROOT';
  
  return root_node = wrap(root_node, key);
  
  //---
  
  function wrap(node, key) {
    console.log('wrap:', node, key);
    return new NodeProxy({
      original_node: node,
      key: key,
      label: node.label,
      child_nodes: node.children && node.children.length > 0 ? 
        node.children.map( (child, i) => wrap(child, key + '.' + (i + 1).toString() ) )
        : null
    });
  }
}

module.exports = {
  
  TreeView: TreeView,
  TreeNode: TreeNode,
  
  React: React
  
  // Examples of convenience exports
  //ko: ko,
  //knockout: ko,
  //jQuery: require('jquery')
}