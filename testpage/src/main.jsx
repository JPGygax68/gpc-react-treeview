"use strict";

var my_tree = {
  label: 'ROOT',
  children: [ {   
      label: 'Child 1', children: [
        { label: 'Grandchild 1.1' },
        { label: 'Grandchild 1.2' }
      ]
    },
    { label: 'Child 2' }
  ]
};

class NodeProxy {
  
  constructor(node) {
    this.label = node.label || '(no label)';
    this.children = node.children ? node.children.map( (child) => new NodeProxy(child) ) : undefined;
  }
  
  getLabel() { return this.label; }
  
  // getType() { return this.type; }
  
  getChildren() {
    // TODO: async and one-at-a-time variants (two optional parameters, or separate methods?)
    return this.children; 
  }
}

React.render( ( <TreeView rootNode={new NodeProxy(my_tree)} /> ), 
  document.getElementById('myTreeview') );
