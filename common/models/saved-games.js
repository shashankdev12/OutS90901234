'use strict';

module.exports = function(Savedgames) {
    
    Savedgames.saveGame = function (req, cb)
    {
	console.log(" ======================= Save Games =========================")
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
        //console.log("data=========================",aData);
      try
      {
        if(reqObject.accessToken)
        {
            Savedgames.findOne(
                {where:{user_id:parseInt(aData.userId)}},function(err,data)
                {
                    if(err)
                    {
                        cb(null,{status:"fail",message:"Error While Gettiing Data"})
                    }
                    else
                    {
			//console.log(data);
                       if(data)
                       {
                         Savedgames.updateAll({user_id:parseInt(aData.userId)},{game_id:parseInt(aData.gameId),game:aData.saveFile,modified:new Date()},
                            function(err,updateData)
                            {
                                if(err)
                                {
                                    cb(null,{status:"fail"});
                                }
                                else
                                {
                                    cb(null,{status:"success"});
                                }
                            })
                       } 
                       else
                       {
                        Savedgames.create({user_id:parseInt(aData.userId),game_id:parseInt(aData.gameId),game:aData.saveFile,status:1,
                            created:new Date(),modified:new Date},function(err,saveGame)
                            {
                                if(err)
                                {
                                    cb(null,{status:"fail"});
                                }
                                else
                                {
                                    cb(null,{status:"success"});
                                }
                            })
                       }
                    }
                })
        }
        else
        {
            cb(null,{status:"fail",message:"Access Token Error"})
        }
      }
      catch (e)
      {
console.log("data",e);
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

    Savedgames.remoteMethod(
        'saveGame', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/saveGame',verb: 'post'}
        });


	/* Remove Save  Game*/

    Savedgames.removeGame = function (req, cb)
    {
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
//console.log(aData);
        try
        {
        if(reqObject.accessToken)
        {
          Savedgames.findOne({where:{user_id:aData.userId}},function(err,data)
          {
            if(err)
            {
                cb(null,{status:"fail",message:"Error While Gettiing Data"})
            }
            else
            {
               if(data)
               {
                 Savedgames.deleteAll({user_id:aData.userId},function(err,deleteDta)
                 {
                    if(err)
                    {
                        cb(null,{status:"fail"});
                    }
                    else
                    {
                        cb(null,{status:"success"});
                    }
                })
               }
               else
               {
                 cb(null,{status:"fail",message:"No Record Found"});
               }
            }
        })
      }
      else
      {
          cb(null,{status:"fail",message:"Access Token Error"})
      }
    }
    catch (e)
    {
      cb(null,{status:"fail",message:"Exception Error",err:e});
    }
  }

    Savedgames.remoteMethod(
        'removeGame', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/removeGame',verb: 'post'}
        });



        

};
