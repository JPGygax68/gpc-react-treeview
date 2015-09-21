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
  
  getSelectionPathProps: function() {
    
    var propChain = this.state.selection.map( (rep) => this.props.getNodeProps(rep) );
    propChain.unshift( this.props.getNodeProps() ); // root node
    return propChain;
  },
  
  /* CALLABLE FROM CONTAINED NODES ------------*/

  // TODO: may not be needed
  getSelectionLineage: function() {
    
    return this.state.selection;
  },
  selectionChanged: function(selection) {
    if (DEBUG) console.debug('TreeView::selectionChanged(', selection, ')');
    
    this.setState({ selection });
  },
  selectNextNode: function(nodeInst) {
    if (DEBUG) console.debug('TreeView::selectNextNode');
    
    var propsChain = this.getSelectionPathProps(); // 1 element longer than selection!
    var depth = this.state.selection.length; // 0 = root is selected
    var curNodeProps = propsChain[depth];
    
    // Is node open, and does it have a child ?
    if (!nodeInst.state.closed && curNodeProps.childNodes && curNodeProps.childNodes.length > 0) {
      this.state.selection.push( curNodeProps.childNodes[0] );
      this.setState({ selection: this.state.selection });
    }
    else {
      var curNodeInst = nodeInst;
      while (depth > 0) {
        var parNodeInst = curNodeInst.props.parent;        
        var parNodeProps = parNodeInst.state.nodeProps;
        var index = _.indexOf(parNodeProps.childNodes, curNodeInst.props.rep); 
          // => TODO: what if rep's are of a type that cannot be simply compared?
        if (parNodeProps.childNodes && index < parNodeProps.childNodes.length - 1) {
          var succRep = parNodeProps.childNodes[index + 1];
          this.state.selection.splice(depth - 1, 1000, succRep)
          this.setState({ selection: this.state.selection });
          break;
        }
        // Climb up a level
        curNodeProps = parNodeProps; // no need to re-fetch
        curNodeInst = parNodeInst;
        depth --;
      }
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