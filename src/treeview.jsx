"use strict";

var React = require('react');
var PropTypes = React.PropTypes;
var DragDropContext = require('react-dnd').DragDropContext;
var _ = require('lodash');

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
    rep: PropTypes.any.isRequired,
    getNodeProps: PropTypes.func.isRequired,
  },
  
  /* INTERNAL METHODS -------------------------*/
  
  getSelectionProps: function() {
    
    var propChain = this.state.selection.map( (rep) => this.props.getNodeProps(rep) );
    propChain.unshift( this.props.getNodeProps() ); // root nodeName
    return propChain;
  },
  
  /* CALLABLE FROM CONTAINED NODES ------------*/
  
  getSelectionLineage: function() {
    
    // TODO: pluck
    return this.state.selection;
  },
  selectionChanged: function(selection) {
    if (DEBUG) console.debug('TreeView::selectionChanged(', selection, ')');
    
    this.setState({ selection });
  },
  selectNextNode: function() {
    if (DEBUG) console.debug('TreeView::selectNextNode');
    
    var propsChain = this.getSelectionProps();
    var depth = this.state.selection.length;
    var currentProps = propsChain[depth];
    var newSel = this.state.selection;
    while (depth > 0) {
      var currentRep = this.state.selection[depth - 1];
      var parentProps = propsChain[depth - 1];
      var index = _.indexOf(parentProps.childNodes, currentRep); // TODO: what if rep's are of a type that cannot be simply compared?
      if (parentProps.childNodes && index < parentProps.childNodes.length - 1) {
        var succRep = parentProps.childNodes[index + 1];
        newSel.splice(depth - 1, 1, succRep)
        this.setState({ selection: newSel });
        break;
      }
      //debugger;
      currentProps = parentProps;
      newSel.pop();
      depth --;
    }
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
        <TreeNode treeView={this} depth={0} />
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