"use strict";

var React = require('react');
var Dispatcher = require('flux').Dispatcher;
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragDropContext = require('react-dnd').DragDropContext;

var TreeView = require('treeview.jsx')(HTML5Backend);

/* The test data, in "flat" form */

var nodes = [
  { key: 'child1', label: 'Child 1' },
  { key: 'child2', label: 'Child 2' },
  { key: 'grandchild1.1', label: 'Grandchild 1.1', parentKey: 'child1', leaf: true },
  { key: 'grandchild1.2', label: 'Grandchild 1.2', parentKey: 'child1', leaf: true },
];

/* An "index" is needed to put the data (back) into a tree-like structure
 */
 
// TODO: keep the index up-to-date when changes occur
// TODO: make this into a utility function/class ?

/* A Proxy has the following properties:
  node: reference to the original node (not in the root node proxy)
  parent: a reference to the parent proxy
  childNodes: an array of child proxies
 */
var rootNodeProxy = function() {
  
  var index = {};
  var rootProxy = {};

  nodes.forEach( (node) => {
    var proxy = getNodeProxy(node.key);
    proxy.node = node;
    proxy.parent = getNodeProxy(node.parentKey);
    if (!proxy.parent.childNodes) proxy.parent.childNodes = [];
    proxy.parent.childNodes.push(proxy);
  });
  
  return rootProxy;
  
  function getNodeProxy(key) { 
    return typeof key === 'undefined' ? rootProxy: (index[key] || (index[key] = {}));
  }
}();

/* Controller-View ("app") */

var App = React.createClass({
  
  displayName: 'App',
  
  getInitialState: function() {
    
    return { 
      rootNodeProxy: rootNodeProxy
    };
  },
  
  render: function() {
    return ( 
      <TreeView 
        rootNodeProxy={this.state.rootNodeProxy}
        nodesHaveUniqueKeys={true}
        getNodeProps={ function(proxy) {
          return {
            label: proxy.node ? proxy.node.label : 'ROOT',
            parent: proxy.node && proxy.parent,
            key: proxy.node && proxy.node.key,
            childNodes: proxy.childNodes,
            leaf: proxy.node && proxy.node.leaf
          } 
        } }
      />
    );
  }
});

module.exports = DragDropContext(HTML5Backend)(App);
