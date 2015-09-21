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
  Note: this is just one possible implementation. Two flat indices, on the key
    and on the parentKey, would have served the same purpose.
 */
 
// TODO: keep the index up-to-date when changes occur
// TODO: make this into a utility function/class ?

/* A Proxy has the following properties:
  node: reference to the original node (not in the root node rep)
  parent: a reference to the parent rep
  childNodes: an array of child proxies
 */
var rootNodeProxy = function() {
  
  var index = {};
  var rootProxy = {};

  nodes.forEach( (node) => {
    var rep = getNodeProxy(node.key);
    rep.node = node;
    rep.parent = getNodeProxy(node.parentKey);
    if (!rep.parent.childNodes) rep.parent.childNodes = [];
    rep.parent.childNodes.push(rep);
  });
  
  return rootProxy;
  
  function getNodeProxy(key) { 
    return typeof key === 'undefined' ? rootProxy: (index[key] || (index[key] = {}));
  }
}();

/* Controller-View ("app") */

var App = React.createClass({
  
  displayName: 'App',
  
  render: function() {
    return ( 
      <TreeView 
        getNodeProps={ function(rep) {
          console.assert(!(rep && !rep.node));
          var props = (!rep) ? {
            // Root node
            label: 'ROOT!',
            childNodes: rootNodeProxy.childNodes
          }
          : {
            label: rep.node.label,
            parent: rep.node && rep.parent,
            childNodes: rep.childNodes,
            leaf: rep.node && rep.node.leaf
          };
          return props;
        } }
      />
    );
  }
});

module.exports = DragDropContext(HTML5Backend)(App);
