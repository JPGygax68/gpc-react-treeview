"use strict";

var my_tree = {
  label: 'ROOT',
  children: [ {   
      label: 'Child 1', children: [
        { label: 'Grandchild 1.1', leafOnly: true },
        { label: 'Grandchild 1.2', leafOnly: true }
      ]
    },
    { label: 'Child 2' }
  ]
};

class NodeProxy {
  
  constructor(node) {
    this.label = node.label || '(no label)';
    this.children = node.children ? node.children.map( (child) => new NodeProxy(child) ) : undefined;
    this.leafOnly = node.leafOnly;
  }
  
  getLabel() { return this.label; }
  
  // getType() { return this.type; }
  
  getChildren() {
    // TODO: async and one-at-a-time variants (two optional parameters, or separate methods?)
    return this.children; 
  }
  
  isLeafOnly() {
    return this.leafOnly;
  }
}

React.render( ( <TreeView rootNode={new NodeProxy(my_tree)} /> ), 
  document.getElementById('myTreeview') );
