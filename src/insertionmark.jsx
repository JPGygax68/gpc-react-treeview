"use strict";

var React = require('react');
var DropTarget = require('react-dnd').DropTarget;
var insertCss = require('insert-css');

// TODO: CSS injection should not be set in stone like this, provide variety of bundler modules ?
var css = require('./insertionmark.styl');
insertCss(css);


/* HELPER FUNCTIONS -----------------*/

function stopEvent(e) {
  
  e.preventDefault(); 
  e.stopPropagation(); 
}

/* Drag&Drop ------------------------*/

var dropTarget = {
  
  canDrop: function(props, monitor) {
    //console.debug('canDrop(): props:', props, 'monitor:', monitor);

    // Drag source: node being dragged
    var src = monitor.getItem();

    // Target (us)
    var parent = props.parent.props.data,
        index = props.index;
        
    return src.parent === parent;
  },
  
  drop: function(props, monitor) {
    console.log('InsertionMark dropTarget::drop(', props, '): TODO!');
  }
};

function collect(connect, monitor) {
  
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

/* MAIN CLASS -----------------------*/

var InsertionMark = React.createClass({
  
  displayName: 'InsertionMark',
  
  propTypes: {
    parent: React.PropTypes.object.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool.isRequired
  },
  
  getDefaultProps: function() {
  },
  
  getInitialState: function() {
    return {
    };
  },
  
  render: function() {
    
    var className = 'insertion-mark';

    if (this.props.isOver ) className += ' drag-over';
    if (this.props.canDrop) className += ' can-drop' ;
    
    return this.props.connectDropTarget( 
      <div className={className} ref={(c) => this.container = c}>
        <div
          onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} 
          onDragOver={this.handleDragOver} onDrop={this.handleDrop}
        >
          <div className="brace left" />
          <div className="bar" />
          <div className="brace right" />
        </div>
      </div>
    );
  }
  
});

module.exports = DropTarget("NODE", dropTarget, collect)(InsertionMark);

