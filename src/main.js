"use strict";

//var insertCss = require('insert-css'); // JUST AN EXAMPLE
var React = require('react');
//require('react/dist/JSXTransformer');

var CommentList = React.createClass({
  displayName: 'CommentList',
  render: function() {
    return React.createElement('div', {className: 'commentList'}, 'Hello, World! I\'m a comment list');
  }
});

var CommentForm = React.createClass({
  displayName: 'CommentForm',
  render: function() {
    return React.createElement('div', {className: 'commentForm'}, 'Hello, World! I\'m a comment form');
  }
});

var CommentBox = React.createClass({
  displayName: 'CommentBox',
  render: function() {
    console.log('here');
    return React.createElement('div', null,
      React.createElement('h1', null, 'Comments'),
      React.createElement('CommentList', null),
      React.createElement('CommentForm', null) 
    );
  }
});

module.exports = {
  
  init: function() {
    //insertCss( require("./org-unnamed.styl") );
  },

  CommentBox: CommentBox,
  //CommentList: CommentList,
  //CommentForm: CommentForm,
  
  React: React
  
  // Examples of convenience exports
  //ko: ko,
  //knockout: ko,
  //jQuery: require('jquery')
}