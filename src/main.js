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
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) return;
    this.props.onCommentSubmit({author: author, text: text});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text  ).value = '';
  },
  render: function() {
    return React.createElement('form', {className: 'commentForm', onSubmit: this.handleSubmit},
      React.createElement('p', null, React.createElement('input', {type: 'text', ref: 'author', placeholder: 'Your name'}) ),
      React.createElement('p', null, React.createElement('input', {type: 'text', ref: 'text'  , placeholder: 'Say something...'}) ),
      React.createElement('p', null, React.createElement('input', {type: 'submit', value: 'Post'}) )
    );
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
        this.setState({comments: data})
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      },
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }
    });
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval || 2000);
  },
  render: function() {
    return React.createElement('div', null,
      React.createElement('h1', null, 'Comments'),
      React.createElement(CommentList, {comments: this.state.comments}),
      React.createElement(CommentForm, {onCommentSubmit: this.handleCommentSubmit}, null) 
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