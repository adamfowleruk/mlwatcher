# Readme file for ML Watcher

### A Node.js directory watcher and auto deployer for MarkLogic

MarkLogic is often used to deploy content and applications to. Typically this uses a copy or deploy tool that
copies all contents of a folder to the remote system - regardless of whether anything has changed or not. This leads
to time wasted.

This Node.js based application, powered by the MLJS JavaScript REST API wrapper for MarkLogic, watches a directory
on the local file system, and pushes all changed to MarkLogic as soon as they arrive.

## Installation and Usage

The below assumes you have Node.js installed, and it's executable on your path.

1. Create a REST instance on top of your database - for an example, read the createrest.sh file in this repo
2. Take a copy of the repo - git clone http://github.com/adamfowleruk/mlwatcher.git
3. Open a terminal and change directory to the mlwatcher folder
4. chmod the mlwatcher file - chmod u+x mlwatcher
5. Type mlwatcher ../some/folder/to/watch localhost:9004 admin:admin (where localhost is where MarkLogic is installed, 9004 is the REST API server for your DB, username is admin, password is admin)
6. That's all!

If deploying a REST app to a modules database, ensure that:-
- The rest port is for your modules DB if deploying a REST app, NOT your content db!
- The directory you are watching is the top level src folder, NOT your repo's top level folder

## How it works

Mlwatcher uses the watchr Node.js library to monitor file systems and the MLJS JavaScript wrapper for the MarkLogic
REST API to deploy your file changes.

A message is printed with a time stamp for every file that is deployed. These could be a REST API application (common
  to do in MarkLogic pre-sales), or a directory with content being changed on a regular basis (e.g. shared folder).

Original content is never modified, although on some systems the 'last opened' date and time may be updated.

## Feedback

For any changes, please log an issue on GitHub http://github.com/adamfowleruk/mlwatcher/issues

## Limitations

It is limited by the number of files your platform is able to open. On the mac this is 256 by default. MLWatcher changes
this to 1048, the maximum, on starting each time. If you have more files than that you may hit limitations.
