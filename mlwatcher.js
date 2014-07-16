/*
Copyright 2014 MarkLogic Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Require
var watchr = require('watchr');
var mljs = require("mljs");
var fs = require("fs");

var usage = function() {
  console.log("Usage: mlwatcher directory hostname:restport username:password [-firstfull]");
};

if (process.argv.length < 5 || process.argv.length > 6) {
  console.log("FATAL ERROR: Wrong number of arguments: Should be 3 or 4 arguments");
  usage();
  process.exit(1);
}

// TODO parse and validate parameters
var path = process.argv[2];
var server = process.argv[3].split(":");
var credentials = process.argv[4].split(":");
var full = process.argv[5];

if (server.length != 2) {
  console.log("FATAL ERROR: Wrong number of elements as part of server: Should be two elements: hostname:restport");
  usage();
  process.exit(1);
}

if (credentials.length != 2) {
  console.log("FATAL ERROR: Wrong number of elements as part of credentials: Should be two elements: username:password");
  usage();
  process.exit(1);
}

console.log("Remember: If deploying code, make sure your REST port is for your MODULES database and NOT your content DB");

// check for -firstfull parameter to deploy all files initially, then start watching
var firstfull = (full === "-firstfull");

var db = new mljs();
db.logger.transports.console.level = "error";
db.configure({host: server[0], port: server[1], username: credentials[0], password: credentials[1]});

var dt = function() {
  // return a formatted date time with consistent length
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec;

};

var deployAll = function() {
  // TODO full mljs deploy of folder
  console.log(dt() + ": -firstfull option not yet implemented. Continuing with watching for changes.");
};

var deployfile = function(file) {
  // TODO deploy single file and send message to console.log
  var relfile = file.substring(path.length);
  // TODO convert \ to / on windows
  console.log(dt() + ": Deploying '" + path + "' as '" + relfile + "'");
  fs.readFile(file, function (err,data) {
    if (err) {
      console.log(dt() + ": Error reading file '" + file + "': " + err);
    } else {
      // TODO validate content type by extension - using MarkLogic extensions where possible
      db.save(data,relfile,null,function(result) {
        if (result.inError) {
          console.log(dt() + ": Error deploying '" + relfile + "', details: '" + result.details + "'");
        } else {
          console.log(dt() + ": Successfully deployed '" + relfile + "'");
        }
      });
    }
  });
};

if (firstfull) {
  deployAll();
}

// Watch a directory or file
console.log(dt() + ': Watching path: ' + path);
watchr.watch({
    path: path,
    listeners: {
        log: function(logLevel){
            //console.log(dt() + ': A log message occured:', arguments);
        },
        error: function(err){
            console.log(dt() + ': An error occured:', err);
        },
        watching: function(err,watcherInstance,isWatching){
            if (err) {
                console.log(dt() + ": Watching the path " + watcherInstance.path + " failed with error", err);
            } else {
                console.log(dt() + ": Watching the path " + watcherInstance.path + " completed");
            }
        },
        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
            //console.log(dt() + ': A change event occured:',arguments);
            deployfile(filePath);
        }
    },
    next: function(err,watchers){
        if (err) {
            return console.log(dt() + ": Watching everything failed with error", err);
        } else {
          //console.log(dt() + ': Watching everything completed', watchers);
        }

        // Close watchers after 60 seconds
        setTimeout(function(){
            var i;
            console.log(dt() + ': Stop watching our path');
            for ( i=0;  i<watchers.length; i++ ) {
                watchers[i].close();
            }
        },60*1000);
    }
});
