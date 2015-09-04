"use strict";

//var insertCss = require('insert-css'); // JUST AN EXAMPLE
var react = require('react');
require('react/dist/JSXTransformer');
console.log('react:', react);

module.exports = {
  
  init: function() {
    //insertCss( require("./org-unnamed.styl") );
  },

  react: react
  
  // Examples of convenience exports
  //ko: ko,
  //knockout: ko,
  //jQuery: require('jquery')
}