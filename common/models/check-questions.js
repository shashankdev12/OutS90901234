'use strict';
var app = require('../../server/server');
var loopback =  require('loopback');
var path = require('path');


module.exports = function(Checkquestions) {



    Checkquestions.questionsReport = function (req, cb)
    {

        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
console.log(aData);
        //let aData = {questionMasterId:10,region:"EN",questionStatus:1}
       Checkquestions.create(aData.wrongQuestions,function(err,data){
            if(err)
            {
                console.log(err);
                cb(null,{status:"fail",message:"Error"})
            }
            else
            {
                cb(null,{status:"success",message:"inserted"})
            }
        })   
    }
    
    Checkquestions.remoteMethod(
      'questionsReport', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/questionsReport',verb:'post'}
    });

};
