'use strict';
var app = require('../../server/server');
var loopback =  require('loopback');
var path = require('path');

module.exports = function(Messages) {

  /* Getting Data for message pop up */

  Messages.getmessage = function (req, cb) {
    let reqObject = req.res.req;
    //let aData = JSON.parse(reqObject.body.data);
    let messageModel = app.models.messages;
	console.log("=====================================Get Message====================")
    messageModel.findOne({fields:{id:true,heading:true,message:true,file:true,type:true,messageType:true}},function(err,data)
    {
      if(err)
      {
        cb(null,{status:'fail',message:"Error While Getting data"})
      }
      else
      {
        cb(null,{status:'success',data:data})
      }
    })
  }

  Messages.remoteMethod(
    'getmessage', {
      accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
      returns: [{arg: 'data',type: 'Object'}],
      http: {path: '/getmessage',verb: 'post'}
  });

};
