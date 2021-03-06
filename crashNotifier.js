require('dotenv').config();

const request = require('request');
const xoauth2 = require('xoauth2');
const ipAddress = process.env.IP;
const utilities = require('./lib/utilities');
const terminal = require('./lib/terminal');
var mailer = require('./lib/mailer');
const util = require('util');

var serverIsUp = true;
var errLines = 60;

const requestCallback = function(err,res,body){
    if(!err && res.statusCode == 200){ // Works well
        serverIsUp = true;
    }else if(serverIsUp == true){ // Should notify
        console.log('NOTIFY');

        var htmlPage = util.format("Server was down at <b>%s</b>.", utilities.timestamp());
        htmlPage += util.format("<a href='http://%s:3000/ping'>Check again</a>.", ipAddress);
        htmlPage += "\n Here is last "+errLines+" lines of error logs.";

        terminal.exec('pm2 logs --err --nostream --lines '+errLines+' server')
            .then()
            .catch()
            .then(function(data){
                // Will be executed on both success and failure.
                // Data will be 'logs' or 'error'

                htmlPage += "<br><pre>"+data+"</pre>";

                mailer.sendMail(htmlPage)
                    .then(function(){
                        serverIsUp = false;
                    })
                    .catch(function(){

                    })
            });


    }else{ // Notified already
        // console.log('notified already')
    }
}


setInterval(function(){
    request.get("http://"+ipAddress+":3000/ping", requestCallback);
},3*1000);
