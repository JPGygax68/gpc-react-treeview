"use strict";

var React = require('react');
//require('react/dist/JSXTransformer');
var $ = require('jquery');
var insertCss = require('insert-css');

// TODO: CSS injection should not be set in stone like this, provide variety of bundler modules ?
var css = require('./styles.styl');
insertCss(css);

var TreeNode = React.createClass({
  displayName: 'TreeNode',
  getInitialState: function() {
    return {
      closed: false
    }
  },
  handleClickOnHandle: function(e) {
    console.log('handleClickOnHandle', this.state.closed);
    e.preventDefault();
    this.setState({ closed: !this.state.closed });
  },
  render: function() {
    var children = React.Children.map(
      this.props.children,
      function(child) {
        return <li>{child}</li>;
      }
    );
    var classes = 'node';
    if (!this.props.children || this.props.children.length === 0) {
      classes += ' childless';
    }
    var children_list;
    if (this.props.children && this.props.children.length > 0 && !this.state.closed) {
      children_list = (<ul>{children}</ul>);
    }
    return <div className={classes}>
      <span className="handle" onClick={this.handleClickOnHandle}/>
      <span className="label">{this.props.label}</span>
      {children_list}
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
    return <div className="gpc treeview">
        <TreeNode label="ROOT">
          {this.props.children}
        </TreeNode>
      </div>
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