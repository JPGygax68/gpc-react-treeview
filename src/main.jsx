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
        <TreeNode label="ROOT" child_nodes={this.props.root_node.child_nodes} />
      </div> );
  }
});

// Class method that wrap existing tree structure

TreeView.wrapExistingTree = function(root_node) {
    
  var key = 'ROOT';
  
  return root_node = wrap(root_node, key);
  
  //---
  
  function wrap(node, key) {
    console.log('wrap:', node, key);
    return {
      original_node: node,
      key: key,
      label: node.label || '(no label)',
      child_nodes: node.children && node.children.length > 0 ? 
        node.children.map( (child, i) => wrap(child, key + '.' + (i + 1).toString() ) )
        : null
    }
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