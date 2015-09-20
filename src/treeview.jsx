"use strict";

var React = require('react');
var PropTypes = React.PropTypes;
var DragDropContext = require('react-dnd').DragDropContext;

var insertCss = require('insert-css');

// TODO: CSS injection should not be set in stone like this, provide variety of bundler modules ?
var css = require('./styles.styl');
insertCss(css);

var ViewModel = require('./viewmodel.js');
var TreeNode = require('./treenode.jsx');

const DEBUG = true;

var TreeView = React.createClass({
  
  displayName: 'TreeView',
  
  propTypes: {
    rootNodeProxy: PropTypes.any.isRequired,
    getNodeProps: PropTypes.func.isRequired,
  },
  
  /* CALLABLE FROM CONTAINED NODES ------------*/
  
  selectionChanged: function(selection) {
    if (DEBUG) console.debug('TreeView::selectionChanged(', selection, ')');
    
    this.setState({ selection: selection });
  },
  
  /* LIFECYCLE --------------------------------*/
  
  getInitialState: function() {
    
    return {};  // TODO: selection
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
        <TreeNode
          treeView={this}
          data={this.props.rootNodeProxy}
          depth={0}
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

module.exports = function(backend) { return DragDropContext(backend)(TreeView); };