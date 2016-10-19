"use strict";

var request = require('request');

const GEMS_API =  "https://rubygems.org/api/v1/";
var options = {
  url: "https://rubygems.org/api/v1/gems/rails.json",
  timeout: 1500,
  headers: {
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    console.log(info);
  } else {
    console.log('error: '+ response.statusCode);
    console.log(body);
  }
}


// GET - /api/v1/gems/[GEM NAME].(json|yaml)
function show_gem(name) {
  options.url = GEMS_API + `gems/${name}.json`;
  request(options.url, callback);
}

// GET - /api/v1/search.(json|yaml)?query=[YOUR QUERY]
function search(query) {
  options.url = GEMS_API + "search.json?query=" + query;
  request(options.url, callback);
  // _.pick(info, some_keys);
}

// show_gem('devise');
search('devise');
