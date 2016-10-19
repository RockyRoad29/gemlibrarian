"use strict";

var request = require('request');
require('console.table');
var _ = require('underscore');

const GEMS_API =  "https://rubygems.org/api/v1/";
const GH_API = "https://api.github.com/repos/";
const OPTIONS = {
  timeout: 2500,
  headers: {
        'User-Agent': 'request' // necessary for GH_API
  }
};

var table_keys = [ 'name'
  , 'downloads'
  , 'version'
  , 'version_downloads'
  // , 'platform'a
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

    // Github repo properties
    , 'Stars'
    , 'Forks'
    , 'Updated'
    , 'Size'
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

// show_gem('rails').then(function(){
//   search('devise-i18n');
// });
function append_GH_infos(row) {
  return new Promise(function(resolve,reject) {
    // Parse gh repo name
    const r = /^https?:\/\/github.com\/(.*)/;
    var uri = row.source_code_uri || row.home_page_uri;
    // console.log(uri);
    if (uri) {
      var m = uri.match(r);
      if (m) {
        var repo = m[1];
        console.log("Checking GH repo: %s", repo);
        var options = Object.assign({}, OPTIONS);
        options.url = GH_API + repo;
        return p_request(options).then(function(body){
          // Convert json text to js object
          // console.log("GH answered for: %s", repo);
          return JSON.parse(body);
        }).then(function(infos) {
          const wanted = { Stars: 'stargazers_count', Forks: 'forks_count', Updated: 'pushed_at', Size: 'size' };
          for (var k in wanted) {
            row[k] = infos[wanted[k]];
          }
          // console.log(row);
          return resolve(row);
        }).catch(function(reason){
          console.log("Error retrieving %s: %s", repo, reason.error);
          if (reason.response) {
            console.log(reason.response.statusCode, reason.response.statusMessage);
          }
          return resolve(row);
        });
      } else {
        return resolve(row);
      }
    } else {
      return resolve(row);
    }
  });
}

function search_plus(query) {
  var options = Object.assign({}, OPTIONS);
  options.url = GEMS_API + "search.json?query=" + query;
  return p_request(options).then(function(body){
    // Convert json text to js object
    return JSON.parse(body);
  }).then(function(infos) {
    console.log(`${infos.length} gems found.\n`);
    // Add some details from github
    return Promise.all(
      infos.map(function(row){
        return append_GH_infos(row);
      }));
  }).then(function(infos) {
    // TODO Filter out some rows
    return infos;
  }).then(function(infos) {
    // TODO Sort rows
    return infos;
  }).then(function(infos) {
    // Keep only some properties
    // console.log(Object.keys(info[0]));
    return infos.map(function(row){
      return _.pick(row, table_keys);
    });
  }).then(function(infos) {
    // layout results as text table
    console.log(""); // newline
    console.table(infos);
  });
}

// =======================================================================================================
var parseArgs = require('minimist');
// see node_modules/minimist/test/ for examples
var argv = parseArgs(process.argv.slice(2), {
  boolean: ['h', 'v']
});
if (argv.h || argv._.length<1) {
  console.log("Usage:\n\n"
              + "Search remote gems matching keywords:\n"
              + "   gemlibrarian some key word\n"
              + "\n"
              + "or display details about a single gem:\n"
              + "   gemlibrarian -v interesting_gem\n"
             );
} else {
  if (argv.v) {
    show_gem(argv._[0])
      .catch(console.error);
  } else {
    var query = argv._.join('+');
    console.log("You asked about: %j", query);
    search_plus(query)
      .catch(console.error);
  }
}
