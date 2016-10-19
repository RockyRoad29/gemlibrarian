"use strict";

var request = require('request');

const GEMS_API =  "https://rubygems.org/api/v1/";
const OPTIONS = {
  timeout: 1500,
  headers: {
  }
};

function p_request(options) {
  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // fulfills the promise with `body` as the value
        return resolve(body);
      } else {
        // rejects the promise with `err` as the reason
        return reject({error: error, response: response});
      }
    });
  });
}

// GET - /api/v1/gems/[GEM NAME].(json|yaml)
function show_gem(name) {
  var options = Object.assign({}, OPTIONS);
  options.url = GEMS_API + `gems/${name}.json`;
  return p_request(options).then(function(body){
    var info = JSON.parse(body);
    console.log(info);
  });
}

// GET - /api/v1/search.(json|yaml)?query=[YOUR QUERY]
function search(query) {
  var options = Object.assign({}, OPTIONS);
  options.url = GEMS_API + "search.json?query=" + query;
  return p_request(options).then(function(body){
    var info = JSON.parse(body);
    // _.pick(info, some_keys);
    console.log(info);
  });
}

show_gem('rails').then(function(){
  search('devise');
});
