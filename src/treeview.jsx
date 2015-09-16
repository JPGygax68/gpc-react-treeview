"use strict";

var React = require('react');

// TODO: remove once better understood
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragDropContext = require('react-dnd').DragDropContext;

//var $ = require('jquery');
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
  
  /* LIFECYCLE --------------------------------*/
  
  getInitialState: function() {
    return { 
      selected_node_inst: null,
      dragging_node_inst: null
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
    var className = "gpc treeview";
    if (this.state.dragging) className += ' dragging';
    
    return ( 
      <div className={className}>
        <TreeNode label="ROOT"
          treeView={this}
          data={this.props.rootNode}
        />
      </div> 
    );
  },
  
  /* INTERNAL METHODS -------------------------*/
  
  startedDragging: function(node_inst) {
    this.setState({ dragging_node_inst: node_inst });
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
  }
  
});

module.exports = {
  
  TreeView: DragDropContext(HTML5Backend)(TreeView),
  TreeNode: TreeNode,
  
  React: React
}