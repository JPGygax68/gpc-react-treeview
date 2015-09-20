"use strict";

var React = require('react');
var Dispatcher = require('flux').Dispatcher;
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragDropContext = require('react-dnd').DragDropContext;

var TreeView = require('treeview.jsx')(HTML5Backend);

var my_tree = {
  label: 'ROOT',
  key: '$',
  children: [ {   
      label: 'Child 1 - bla bla bla bla', key: '1', children: [
        { label: 'Grandchild 1.1', key: '1', leafOnly: true },
        { label: 'Grandchild 1.2', key: '2', leafOnly: true }
      ]
    },
    { label: 'Child 2', key: '2' }
  ]
};

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

var App = React.createClass({
  
  displayName: 'App',
  
  render: function() {
    return ( 
      <TreeView rootNode={new NodeProxy(my_tree)} key="$" nodesHaveKeys={false} />
    );
  }
});

module.exports = DragDropContext(HTML5Backend)(App);
