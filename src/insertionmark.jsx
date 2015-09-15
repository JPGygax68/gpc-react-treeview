"use strict";

var React = require('react');

/* HELPER FUNCTIONS -----------------*/

function stopEvent(e) { 
  e.preventDefault(); 
  e.stopPropagation(); 
}

var InsertionMark = React.createClass({
  
  displayName: 'InsertionMark',
  
  propTypes: {
  },
  
  getInitialState: function() {
    return {
      dragOver: false,
      validDropTarget: false
    };
  },
  
  handleDragEnter: function(e) {
    console.log('InsertionMark::handleDragEnter', e, e.dataTransfer);
    
    // TODO: check via callbacks
    if (true) {
      console.log('InsertionMark: ALLOWING DROP');
      this.setState({ validDropTarget: true });
    }
  },
  handleDragLeave: function(e) {
    console.log('InsertionMark::handleDragLeave', e);
    
    this.setState({ validDropTarget: false });
  },
  handleDragOver: function(e) {
    
    // TODO: checking hooks
    // TODO: cache result
    if (this.state.validDropTarget) {
      e.preventDefault(); // will allow the drop
    }    
  },
  handleDrop: function(e) {
    console.log('InsertionMark::handleDrop() TODO');
    
    this.setState({ validDropTarget: false }); // TODO: move this to a method that ends a drag ?
    //this.props.containingNode.setState({ dragOver: false, validDropTarget: false });
    //stopEvent(e);
    e.preventDefault();
    //e.stopPropagation();
  },
  
  render: function() {
    
    var className = 'insertion-mark';
    if (this.props.dragOver       ) className += ' drag-over';
    if (this.state.validDropTarget) className += ' valid-drop-target';
    //console.log('className:', className);
    
    return ( 
      <div className={className} ref="container">
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

module.exports = InsertionMark;

