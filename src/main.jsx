"use strict";

//var insertCss = require('insert-css'); // JUST AN EXAMPLE
var React = require('react');
//require('react/dist/JSXTransformer');
var marked = require('marked');
var $ = require('jquery');

var TreeNode = React.createClass({
  displayName: 'TreeNode',
  render: function() {
    var children = React.Children.map(
      this.props.children,
      function(child) {
        return <li>{child}</li>;
      }
    );
    return <div>
      <span>{this.props.label}</span>
      <ul>
        {children}
      </ul>
    </div>
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

var TreeView = React.createClass({
  displayName: 'TreeView',
  getInitialState: function() {
    return {
    }
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
    console.log('componentDidMount');
    if (this.props.url) {
      this.loadCommentsFromServer();
      setInterval(this.loadCommentsFromServer, this.props.pollInterval || 2000);
    }
  },
  render: function() {
    return <TreeNode label="ROOT">
        {this.props.children}
      </TreeNode>
    // return React.createElement('div', null, React.createElement(TreeNode, {label: 'ROOT'}, this.props.children) );
    // React.createElement('div', null
      //React.createElement('h1', null, 'Comments')
      //React.createElement(CommentList, {comments: this.state.comments}),
      //React.createElement(CommentForm, {onCommentSubmit: this.handleCommentSubmit}, null) 
    //);
  }
});

module.exports = {
  
  TreeView: TreeView,
  TreeNode: TreeNode,
  
  React: React
  
  // Examples of convenience exports
  //ko: ko,
  //knockout: ko,
  //jQuery: require('jquery')
}