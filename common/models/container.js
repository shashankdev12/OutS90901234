'use strict';
//const loopBackContext = require('loopback-context');

module.exports = function(Container)
{
  Container.uploadFile = function(req, res, body, cb)
  {
    console.log(111111);
    // try {
    //       Container.upload(req, res, {
    //           container: 'knowitblowit/prizes'
    //       }, function (err, data) {
    //
    //           if (err) {
    //             console.log(err);
    //
    //           } else {
    //             console.log("saved");
    //           }
    //
    //       });
    //     } catch (e) {
    //         cb(null, {
    //             status: "faliure",
    //             message: e
    //         });
    //     }
  }

  Container.remoteMethod(
    'uploadFile', {
      accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
      returns: [{
        arg: 'data',
        type: 'Object'
      }],
      http: {
        path: '/uploadFile',
        verb: 'post'
      }
    }
  );

};
