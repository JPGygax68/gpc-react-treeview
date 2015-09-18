"use strict";

var React = require('react');
var DropTarget = require('react-dnd').DropTarget;

/* HELPER FUNCTIONS -----------------*/

function stopEvent(e) { 
  e.preventDefault(); 
  e.stopPropagation(); 
}

/* Drag&Drop ------------------------*/

var dropTarget = {
  
  drop: function(props) {
    console.log('InsertionMark dropTarget::drop(',props,'): TODO!');
  }
};

function collect(connect, monitor) {
  
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

/* MAIN CLASS -----------------------*/

var InsertionMark = React.createClass({
  
  displayName: 'InsertionMark',
  
  propTypes: {
    connectDropTarget: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool.isRequired
  },
  
  getInitialState: function() {
    return {
      //dragOver: false, 
      //validDropTarget: false
    };
  },
  
  render: function() {
    
    var className = 'insertion-mark';
    //if (this.props.dragOver       ) className += ' drag-over';
    //if (this.state.validDropTarget) className += ' valid-drop-target';
    
    return this.props.connectDropTarget( 
      <div className={className} ref={(c) => this.container = c}>
        <div
          onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave} onDragOver={this.handleDragOver}
          onDrop={this.handleDrop}
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

