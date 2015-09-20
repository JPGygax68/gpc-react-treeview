"use strict";

var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

const DEBUG = true;

var _nodes; // We take advantage of the fact that React Stores are implicitly singletons
var _index;
var _root;

var myStore = assign({}, EventEmitter.prototype, {
  
  /* The load() method processes the node records and creates a tree structure of
    proxy objects, using the "key" and "parentKey" properties to determine relationships.
    The top-level nodes of the generated tree can be obtained via getAll(); every proxy 
    node has at least a "label" property and may have a "childNodes" property, which is
    a simple array of child proxy nodes.    
   */
  load: function(nodes) {
    if (DEBUG) console.debug('myStore::load()');
    
    console.assert(!_nodes && !_index && !_root);
    
    _nodes = nodes;
    _index = {};
    _root = { childNodes: [] }; // root proxy

    _nodes.forEach( (node, i) => {
      
      // Add node to index
      // TODO: option to create unique keys by compounding with ancestor key
      if (_index[node.key]) throw new Error('myStore: more than one node has key "'+node.key+'"');     
      var proxy = _index[node.key] = { label: node.label };
      
      // Special node properties
      if (node.leaf) proxy.leaf = true;
      
      // Append the node to the parent's childNodes list
      var parent = (typeof node.parentKey === 'undefined') ? _root : _index[node.parentKey];
      if (!parent.childNodes) parent.childNodes = [];
      parent.childNodes.push( proxy );
    });
    
    //console.debug(' -> index:', _index);
  },
  
  getRootProxy: function() {
    
    return _root;
  }
  
  // TODO: add event subscription and unsubscribe methods
});

module.exports = myStore;