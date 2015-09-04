"use strict";

//var insertCss = require('insert-css'); // JUST AN EXAMPLE
var React = require('react');
//require('react/dist/JSXTransformer');
var marked = require('marked');

var Comment = React.createClass({
  displayName: 'Comment',
  render: function() {
    var rawHtml = marked(this.props.children.toString(), {sanitize: true});
    return React.createElement('div', {className: 'comment'},
      React.createElement('h2', {className: 'commentAuthor'}, this.props.author),
      React.createElement("span", {dangerouslySetInnerHTML: {__html: rawHtml}})
    );
  }
});

var CommentList = React.createClass({
  displayName: 'CommentList',
  render: function() {
    return React.createElement('div', {className: 'commentList'}, 
      React.createElement(Comment, {author: 'Pete Hunt'}, 'This is one comment'),
      React.createElement(Comment, {author: 'Jordan Walke'}, 'This is *another* comment')
    );
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
    return React.createElement('div', null,
      React.createElement('h1', null, 'Comments'),
      React.createElement(CommentList, null),
      React.createElement(CommentForm, null) 
    );
  }
});

module.exports = {
  
  init: function() {
    //insertCss( require("./org-unnamed.styl") );
  },

  CommentBox: CommentBox,
  
  React: React
  
  // Examples of convenience exports
  //ko: ko,
  //knockout: ko,
  //jQuery: require('jquery')
}