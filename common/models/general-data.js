'use strict';
let app = require('../../server/server');
let loopback =  require('loopback');
let path = require('path');
let async = require('async');

module.exports = function(Generaldata) {

    
    Generaldata.getGeneralData = function (req, cb)
    {
        try
        {
            Generaldata.find({fields:{created:false,modified:false}},function(err,data){
                cb(null,{status:1,data:data})
            })
        }
        catch (e)
        {
        cb(null,{status:"fail",message:"Exception Error",err:e});
        }
  }

  Generaldata.remoteMethod(
      'getGeneralData', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getGeneralData',verb: 'post'}
  });

};
