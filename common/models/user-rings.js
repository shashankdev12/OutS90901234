'use strict';
let app = require('../../server/server');

module.exports = function(Userrings) {
    
    Userrings.updateRings = function (req, cb)
    {
        try
        {
          let reqObject = req.res.req;
          let aData = JSON.parse(reqObject.body.data);
          //let aData =  {gameId: 1,childId: 1,ringNo:3}
            async.waterfall([
              function(callback) {
                // Checking licence
                userScoreInfo(aData).then(function(userScoreData)
                {
                  callback(null, userScoreData);
                })
                .catch(function(err)
                {
                  callback(err);
                });
              },
              function(userScoreData,callback) {
                // Checking licence
                checkOrInsert(aData,userScoreData).then(function(checkUserRings)
                {
                  callback(null, userScoreData,checkUserRings);
                })
                .catch(function(err)
                {
                  callback(err);
                });
              }
              ,
              function(userScoreData,checkUserRings,callback) {
                // Checking licence
                if(checkUserRings <= 6)
                {
                  console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
                  updateTotalRings(userScoreData).then(function(update)
                  {
                    callback(null, update,checkUserRings);
                  })
                  .catch(function(err)
                  {
                    callback(err);
                  });
                }
                else
                {
                  callback(null, 1,checkUserRings);
                }
              }
          ], function (err, result,checkUserRings)
          {
            if(err)
            {
              cb(null,{status:"fail",data:"Error while updating"})
            }
            else
            {
              cb(null,{status:"success",data:checkUserRings})
            }
          });
        }
        catch(e)
        {
          cb(null,{status:"fail"})

        }
    }

    Userrings.remoteMethod(
        'updateRings', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/updateRings',verb: 'post'}
        });


    function userScoreInfo(info)
    {
        return new Promise(function(resolve, reject)
        {
        let userScoreModel =  app.models.user_score;
        userScoreModel.findOne({where:{user_game_id:info.gameId,user_child_id:info.childId},fields:{id:true,user_game_id:true,user_child_id:true,totalRings:true}},function(err,userScoreData)
        {
            if(err)
            {
            reject(err);
            }
            else
            {
            if(userScoreData)
            {
                resolve(userScoreData);
            }
            else
            {
                reject(0);
            }
            }
        })
        });
    }


    function checkOrInsert(info,userScoreData)
    {
        return new Promise(function(resolve, reject)
        {
        let userRingsModel =  app.models.user_rings;
        userRingsModel.findOne({where:{user_score_id:userScoreData.id,ringType:info.ringNo}},function(err,userRings)
        {
            if(err)
            {
            reject(err);
            }
            else
            {
            if(userRings)
            {
                //console.log("asdasdas",userRings);
                userRingsModel.count({user_score_id:userScoreData.id},function(err,userRingsCount)
                {
                //console.log("errrrrrrr",err);
                //console.log("errrrrrrr",userRingsCount);
                resolve(22);
                })
    
            }
            else
            {
                userRingsModel.create({user_score_id:userScoreData.id,ringType:info.ringNo,created:new Date(),modified:new Date()},function(err,userRings)
                {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    userRingsModel.count({user_score_id:userScoreData.id},function(err,userRingsCount)
                    {
                    //console.log("errrrrrrr",err);
                    //console.log("errrrrrrr",userRingsCount);
                    resolve(userRingsCount)
                    })
    
                }
                })
            }
            }
        })
        });
    }


    function updateTotalRings(userScoreData)
    {
        return new Promise(function(resolve, reject)
        {
            userScoreData.updateAttributes({totalRings:userScoreData.totalRings+1}, function(err, userInstance)
            {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(1)
            }
            });
        });
    }
            

};
