"use strict";

var React = require('react');
var Dispatcher = require('flux').Dispatcher;
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragDropContext = require('react-dnd').DragDropContext;

var TreeView = require('treeview.jsx')(HTML5Backend);

var myStore = require('./mystore.js');

/* Prepare our data store */

var nodes = [
  { key: 'child1', label: 'Child 1' },
  { key: 'child2', label: 'Child 2' },
  { key: 'grandchild1.1', label: 'Grandchild 1.1', parentKey: 'child1', leaf: true },
  { key: 'grandchild1.2', label: 'Grandchild 1.2', parentKey: 'child1', leaf: true },
];

myStore.load(nodes);

/*
class NodeProxy {
  
  constructor(node, parent_proxy) {
    this.parent = parent_proxy;
    this.label = node.label || '(no label)';
    this.key = node.key;
    this.children = node.children ? node.children.map( (child) => new NodeProxy(child) ) : undefined;
    this.leafOnly = node.leafOnly;
  }
  
  getLabel() { return this.label; }
  
  // getType() { return this.type; }
  
  getKey() {
    return this.key;
  }
  
  getChildren() {
    // TODO: async and one-at-a-time variants (two optional parameters, or separate methods?)
    return this.children; 
  }
  
  isLeafOnly() {
    return this.leafOnly;
  }
  
  canDrag() {
    return true;
  }
  
  canDropAsChild(node, index) {
    return false;
  }
}
*/

/* Controller-View ("app") */

function getTreeState() {
  
  return myStore.getRootProxy()
}

var App = React.createClass({
  
  displayName: 'App',
  
  getInitialState: function() {
    
    return { rootNode: getTreeState() };
  },
  
  render: function() {
    return ( 
      <TreeView rootNode={this.state.rootNode} nodesHaveKeys={false} />
    );
  }
});

module.exports = DragDropContext(HTML5Backend)(App);
