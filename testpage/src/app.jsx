"use strict";

var React = require('react');
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragDropContext = require('react-dnd').DragDropContext;

var App = React.createClass({
  
  propTypes: {
    rootNode: React.PropTypes.object.isRequired
  },
  render: function() {
    return ( 
      <TreeView rootNode={this.props.rootNode} key="$" nodesHaveKeys={false} />
    );
  }
});

debugger;
module.exports = DragDropContext(HTML5Backend)(App);