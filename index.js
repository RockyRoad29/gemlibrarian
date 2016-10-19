"use strict";

var request = require('request');
require('console.table');
var _ = require('underscore');

const GEMS_API =  "https://rubygems.org/api/v1/";
const OPTIONS = {
  timeout: 1500,
  headers: {
  }
};

var table_keys = [ 'name'
  , 'downloads'
  , 'version'
  , 'version_downloads'
  // , 'platform'
  // , 'authors'
  // , 'info'
  // , 'licenses'
  // , 'metadata'
  // , 'sha'
  // , 'project_uri'
  // , 'gem_uri'
  // , 'homepage_uri'
  // , 'wiki_uri'
  // , 'documentation_uri'
  // , 'mailing_list_uri'
  // , 'source_code_uri'
  // , 'bug_tracker_uri'
  // , 'dependencies'
    ];

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
  options.url = GEMS_API + `gems/${name}.yaml`;
  return p_request(options).then(function(body){
    var info = (body);
    console.log(info);
  });
}

// GET - /api/v1/search.(json|yaml)?query=[YOUR QUERY]
function search(query) {
  var options = Object.assign({}, OPTIONS);
  options.url = GEMS_API + "search.json?query=" + query;
  return p_request(options).then(function(body){
    var infos = JSON.parse(body).map(function(row){
      return _.pick(row, table_keys);
    });
    //console.log(Object.keys(info[0]));
    console.table(infos);
  });
}

show_gem('rails').then(function(){
  search('devise-i18n');
});
