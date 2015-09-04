"use strict";

//var insertCss = require('insert-css'); // JUST AN EXAMPLE
var React = require('react');
//require('react/dist/JSXTransformer');
var marked = require('marked');
var $ = require('jquery');

var Comment = React.createClass({
  displayName: 'Comment',
  render: function() {
    var rawHtml = marked(this.props.text.toString(), {sanitize: true});
    return React.createElement('div', {className: 'comment'},
      React.createElement('h2', {className: 'commentAuthor'}, this.props.author),
      React.createElement("span", {dangerouslySetInnerHTML: {__html: rawHtml}})
    );
  }
});

var CommentList = React.createClass({
  displayName: 'CommentList',
  render: function() {
    var comment_nodes = this.props.comments.map( function(comment) {
      return React.createElement(Comment, {author: comment.author, text: comment.text});
    });
    return React.createElement('div', {className: 'commentList'}, comment_nodes);
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
  getInitialState: function() {
    return {comments: []};
  },
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log('data:', data);
        this.setState({comments: data})
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval || 2000);
  },
  render: function() {
    console.log('this.state:', this.state);
    return React.createElement('div', null,
      React.createElement('h1', null, 'Comments'),
      React.createElement(CommentList, {comments: this.state.comments}),
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