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
  
  /* CALLABLE FROM CONTAINED NODES ------------*/
  
  setSelectedNode: function(node) {
    //console.log('TreeView::setSelectedNode:', node);
    this.setState({ selectedNode: node });
  },  
  canDragNode: function(node) {
    return true;
  },
  startingDrag: function(node) {
    this.dragging_node = node;
  },
  
  /* LIFECYCLE --------------------------------*/
  
  getInitialState: function() {
    return { 
      selected_node: null
    };
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
  },
  
  /* INTERNAL METHODS -------------------------*/
  
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
  }
  
});

module.exports = {
  
  TreeView: TreeView,
  TreeNode: TreeNode,
  
  React: React
  
  // Examples of convenience exports
  //ko: ko,
  //knockout: ko,
  //jQuery: require('jquery')
}