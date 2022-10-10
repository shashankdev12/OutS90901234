//https://stackoverflow.com/questions/45770688/how-to-stop-server-side-timer-on-user-disconnect-node-js-socket-io
//https://stackoverflow.com/questions/26903077/lower-timeout-for-node-js-socket-connection
// /https://stackoverflow.com/questions/45917824/how-to-stop-timer-on-server-when-user-disconnect-node-js-socket-io

var app = require('../../server/server');
let randomstring = require("randomstring");
let HashMap = require('hashmap');
global.room = new HashMap();
global.userRoom = new HashMap();
global.roomList = new HashMap();

module.exports =
{
  onConnection: function()
  {
    app.io.on('connection', function(socket)
    {
      app.io.to(socket.id).emit('user_connected',"user connected successfully" );

   /* With room Id user can join the game */

      socket.on('joinRoom', function(roomId,playerType,status,deviceTo)
      {
       try
       {
         console.log("===================== HIT ===================")
          //console.log("room",room);
          //console.log("room",roomId);
          console.log("userRoom",playerType);
          console.log("status",status);
         /* setting roomId to user socket */
	   let deviceType = playerType;
         /*checking roomId in room hashmap which user sending is exist of not ! */

         let obj = {id:1,deviceToken:deviceTo,socketid:socket.id,deviceType:deviceType};
         if((room.get(roomId) != null) || (room.get(roomId) != undefined))
         {
	   console.log("room.get(roomId).deviceAttached==============",room.get(roomId).deviceAttached)
	   if(room.get(roomId).deviceAttached < 7)
           {
           	userRoom.set(socket.id,roomId);
           	/* setting main player for game */
          	 if(playerType == 'MainDevice')
           	{
             	   room.get(roomId).mainDevice = socket.id;
           	}
           	room.get(roomId).deviceAttached += 1; // counting devices to a game
           	let finalArray =[];
	   	finalArray = room.get(roomId).deviceArryObj;
		 console.log("roomInfo",room.get(roomId));
	   	console.log("array obj",room.get(roomId).deviceArryObj);
		console.log("array====================",finalArray);
	   	if(status != "Existing")
           	{
              		if(finalArray.length > 0)
              		{
		           obj.id =  finalArray.length+1; 
              		}
	  	  finalArray.push(obj);
          	}
	  	else
	  	{
	     		let finalArray= room.get(roomId).deviceArryObj;
	             	let index = finalArray.findIndex(x => x.deviceToken ===deviceTo);
        	     	console.log(">>>>>>>>>>>>>>>>>>>>>>====================<><><><<",finalArray[index])
            	        obj.id = finalArray[index].id
		        finalArray[index].socketid=socket.id
	  	}
		console.log("final Array ===========================",finalArray);
	   	console.log("obj==============",obj)
           	/* joining the user to room */
           	socket.join(roomId);

	           app.io.to(socket.id).emit("roomConnect","Successfully join the room",obj);
        	   app.io.to(userRoom.get(socket.id)).emit('newUserConnected',obj);
	    }
	    else
	    {
           	app.io.to(socket.id).emit("roomLimitCross","Max Device Attached");
	    }
         }
         else
         {
//           console.log("hellllll================================");
           /* if room id do not match error message to user */
           if(status == "Existing")
           {
             //let roomData=
             //{
               //  roomInfo: roomId,
               //  gameInfo:userInfoInRoom,
               //  mainDevice: "",
               //  deviceAttached:0
             //}
             //room.set(roomId,roomData);
             console.log(1);
             userRoom.set(socket.id,roomId);
             /* setting main player for game */
             if(playerType == 'MainDevice')
             {
               room.get(roomId).mainDevice = socket.id;
             }
             room.get(roomId).deviceAttached += 1; // counting devices to a game

             /* joining the user to room */
             socket.join(roomId);

             //app.io.to(socket.id).emit("roomConnect","Successfully join the room");

             let finalArray= room.get(roomId).deviceArryObj;
             let index = finalArray.findIndex(x => x.deviceToken ===deviceTo);
             console.log(">>>>>>>>>>>>>>>>>>>>>>====================<><><><<",finalArray[index])

             obj.id = finalArray[index].id

             app.io.to(socket.id).emit("roomConnect","Successfully join the room",obj);
             app.io.to(userRoom.get(socket.id)).emit('newUserConnected',obj);

           }
           else
           {
              app.io.to(socket.id).emit("roomJoinError","No Such room, try again");
           }

         }
       }
       catch(e)
       {
         console.log(e);
         /* any error occurs while adding the user to room */
         app.io.to(socket.id).emit("roomJoinError","Error while adding in room");
       }
     });

   /* sending all event to room users */

// winner event

   socket.on('winner', function(info) {
	console.log("winner=================",info);
      try {
	console.log("Helllllllllpppppppppppppppp");
          updateUserWin(info).then(function (update) 
	  {
          })
          .catch(function (err) 
           {
              
          });
                
        
      }
      catch(e)
      {
        /* any error occurs while adding the user to room */
        app.io.to(socket.id).emit("roomEmitData","Error while adding to room");
      }
   });

   socket.on('roomEmitData', function(info)
     {
      try
      {
        if(userRoom.get(socket.id) != null)
        {
          app.io.to(userRoom.get(socket.id)).emit('roomEmitData',info);
        }
        else
        {
          app.io.to(socket.id).emit("roomEmitData","No Such room, try again");
        }
      }
      catch(e)
      {
        /* any error occurs while adding the user to room */
        app.io.to(socket.id).emit("roomEmitData","Error while adding to room");
      }
    });

   /* hit answer */

   socket.on('answerGivenByPlayer', function(info)
    {
     try
     {
       /* updating score by each player*/
       updatePlayerScoreInfo(info).then(function(dataStatus)
       {
         app.io.to(userRoom.get(socket.id)).emit('answerGivenByPlayer','updated');
       })
       .catch(function(err)
       {
         app.io.to(userRoom.get(socket.id)).emit('answerGivenByPlayer',"Error while updating");
       });
     }
     catch(e)
     {
       /* any error occurs while adding the user to room */
       app.io.to(socket.id).emit("roomEmitData","Error while updating");
     }
   });

   /* uppdate user rings */

   socket.on('updateRings', function(aData)
   {

	console.log("update Ring>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",aData)
    try
    {
      console.log(aData);
        //let aData =  {gameId: 1,childId: 1,ringNo:3}
        async.waterfall([
          function(callback) {
	    console.log("===================== Condiition 1")

            // Checking licence
            userScoreInfo(aData).then(function(userScoreData)
            {
	      console.log("userScoreData==================",userScoreData)	 
              callback(null, userScoreData);
            })
            .catch(function(err)
            {
              callback(err);
            });
          },
          function(userScoreData,callback) {
            // Checking licence
	    console.log("===================== Condiition 2")
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
              console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
              callback(null, 1,checkUserRings);
            }
          }
      ], function (err, result,checkUserRings)
      {
        if(err)
        {
          console.log("rrrrrrrrrrrrrrrrrrrrrrr",err);
          app.io.to(userRoom.get(socket.id)).emit('updateRings',"Error while updating");
          //cb(null,{status:"fail",message:err})
        }
        else
        {
          console.log("rrrrrrrrrrrrrrrrrrrrrrr",result);
          console.log("count",checkUserRings);
          app.io.to(userRoom.get(socket.id)).emit('updateRings',checkUserRings);
          //cb(null,{status:"success",data:result})
        }
      });
    }
    catch(e)
    {
      /* any error occurs while adding the user to room */
      app.io.to(socket.id).emit("updateRings","Error while updating");
    }
  });

   /* Get leaderboard */

   socket.on('leaderBoard', function(info)
   {
   try
   {
     /* updating score by each player */
     leaderBoard(info).then(function(leaderBoard)
     {
       app.io.to(userRoom.get(socket.id)).emit('leaderBoard',leaderBoard);
     })
     .catch(function(err)
     {
       app.io.to(userRoom.get(socket.id)).emit('leaderBoard',"Error while getting leaderboard");
     });
   }
   catch(e)
   {
     /* any error occurs while adding the user to room */
     app.io.to(socket.id).emit("leaderBoard","Error while getting leaderboard");
   }
 });


/* ==================== update user win =================   */

function updateUserWin(info) {
  return new Promise(function(resolve, reject)
  {
    console.log("add user win called",info);
    let userChilds = app.models.user_childs;
    let userTeams = app.models.user_teams;
    if(info.GameType == '1' ) {
	console.log("IN")
      userChilds.findOne({where : {id : parseInt(info.WinnerId)}}, function(err, foundEntry) {
        if(err) {
	console.log(err);
          reject(err);
        }
        else {
          console.log("found entry ", foundEntry);
          foundEntry.updateAttributes({ games_won:foundEntry.games_won+1}, function(err, userInstance)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              console.log("user win updated successfully");
              resolve(1)
            }
          });
        }
      });
    }
    else if(info.GameType == '2') {
      userTeams.findOne({where : {id : parseInt(info.WinnerId)}}, function(err, foundEntry) {
        if(err) {
          reject(err);
        }
        else {
          console.log("found entry ", foundEntry);
          foundEntry.updateAttributes({ games_won:foundEntry.games_won+1}, function(err, userInstance)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              console.log("user win updated successfully");
              resolve(1)
            }
          });
        }
      });
    }
    
  });
}
/* ===================================================   */


    /* Get Ring Deduct */

    socket.on('deductRing', function(info)
   {
   try
   {
     console.log(info);
     deductUserRings(info).then(function(data)
     {
       app.io.to(userRoom.get(socket.id)).emit('deductRing',data);
     })
     .catch(function(err)
     {
       app.io.to(userRoom.get(socket.id)).emit('deductRing',data);
     });
   }
   catch(e)
   {
     /* any error occurs while adding the user to room */
     app.io.to(socket.id).emit("leaderBoard","Error while getting leaderboard");
   }
  });

   /* ================== Disconnect Automatic ================ */

   socket.on('disconnect', function()
     {
       console.log("disconnect Call");
       console.log("scokte id",socket.id);
       try
       {
         let roomId = userRoom.get(socket.id);
         console.log("roomId",roomId);
         if(room != '')
         {
           console.log("room.get(roomId)",room.get(roomId));
           if(room.get(roomId).mainDevice == socket.id)
           {
	     console.log("sending disconnect for main device");
             app.io.to(roomId).emit('deviceDisconnect',"Remove All");
	     room.get(roomId).deviceAttached -=1

             //socket.leave(roomId);
             //room.delete(roomId);
           }
           else
           {
	     console.log("room.get(roomId).deviceArryObj",room.get(roomId).deviceArryObj);
	     let finalArray= room.get(roomId).deviceArryObj;
	     console.log()	
             let index = finalArray.findIndex(x => x.socketid===socket.id);
             console.log("====================<><><><<",finalArray[index])
	
	     console.log("sending disconnect for other device");
             app.io.to(roomId).emit('deviceDisconnect',"Remove One",finalArray[index].id,finalArray[index].deviceType);
             socket.leave(roomId);
             room.get(roomId).deviceAttached -=1
           }
         }
       }
       catch(e)
       {
         app.io.to(socket.id).emit("deviceDisconnect","Error while adding in room");
       }
     })

   /* ================== Disconnect call ================ */

   socket.on('disconnectDevice', function()
   {
     try
     {
       let roomId = userRoom.get(socket.id);
       if(room != '')
       {
         if(room.get(roomId).mainDevice == socket.id)
         {
           app.io.to(roomId).emit('deviceDisconnect',"Remove All");
           socket.leave(roomId);
           room.delete(roomId);
	   room.get(roomId).deviceAttached -=1
	
         }
         else
         {
	     console.log("room.get(roomId).deviceArryObj",room.get(roomId).deviceArryObj);
	     let finalArray= room.get(roomId).deviceArryObj;
             let index = finalArray.findIndex(x => x.socketid===socket.id);
             console.log("====================<><><><<",finalArray[index])
	
	   console.log("sending disconnect for other device");
           app.io.to(roomId).emit('deviceDisconnect',finalArray[index].id,finalArray[index].deviceType);
           socket.leave(roomId);
	   room.get(roomId).deviceAttached -=1
         }
       }
     }
     catch(e)
     {
       app.io.to(socket.id).emit("deviceDisconnect","Error while adding in room");
     }
   })





   });
  }
}

/* update user score info in score table*/

function updatePlayerScoreInfo(answerInfo)
{
  let userScoreModel =  app.models.user_score;
  return new Promise(function(resolve, reject)
  {
    userScoreModel.findOne({where:{user_game_id:answerInfo.gameId,user_child_id:answerInfo.childId}},function(err,userScoreInfo)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        if(userScoreInfo)
        {
          let timeConsumed ;
          if(userScoreInfo.individualTimeConsumed ==  null)
          {
            timeConsumed = answerInfo.timeTaken;
          }
          else
          {
            timeConsumed = userScoreInfo.individualTimeConsumed +','+ answerInfo.timeTaken;
          }

          userScoreInfo.updateAttributes({questionCorrect:parseInt(userScoreInfo.questionCorrect)+parseInt(answerInfo.answerGiven) ,TotalTimeConsumed:parseInt(userScoreInfo.TotalTimeConsumed) +parseInt(answerInfo.timeTaken),individualTimeConsumed:timeConsumed ,questionAskedCount:parseInt(userScoreInfo.questionAskedCount) + 1
          }, function(err, userInstance)
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
        }
        else
        {
          reject(0);
        }
      }
    })
  })
}

/* update user Rings */

function updatePlayerRings(info)
{
  let userScoreModel =  app.models.user_score;
  let userRingsModel =  app.models.user_rings;
  let obj ={};
  return new Promise(function(resolve, reject)
  {
    userScoreModel.findOne({where:{user_game_id:info.gameId,user_child_id:info.childId},fields:{id:true,user_game_id:true,user_child_id:true,totalRings:true}},function(err,userScoreInfo)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        if(userScoreInfo)
        {
          console.log(",,,,,,,,,,,,,,,,,",info.ringNo);
          console.log(",,,,,,,,,,,,,,,,,",userScoreInfo.id);
          userRingsModel.findOne({where:{user_score_id:userScoreInfo.id,ringType:info.ringNo}},function(err,userRings)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              if(userRings)
              {
                cb(null,{status:"already"})
              }
              else
              {
                userRingsModel.create({user_score_id:userScoreInfo.id,ringType:info.ringNo,created:new Date(),modified:new Date()},function(err,userRings)
                {
                  if(err)
                  {
                    cb(null,{status:"fail",message:err});
                  }
                  else
                  {
                   userScoreInfo.updateAttributes({totalRings:userScoreInfo.totalRings+1}, function(err, userInstance)
                   {
                     if(err)
                     {
                       reject(err);
                     }
                     else
                     {
                       cb(null,{status:"created and updated rings"})
                     }
                   });
                  }
                })
              }
            }
          })
        }
      }
    })
  })
}

/* leaderBoard */

function leaderBoard(info)
{
  return new Promise(function(resolve, reject)
  {
    console.log("leader board Game",info)
    let userScoreModel =  app.models.user_score;
    /* getting userscore join with user_child and userRings */
    if(info.gameMode == 1 )
    {
      userScoreModel.find({include:['user_childs', 'user_rings'],where:{user_game_id:info.gameId},order:"totalRings DESC, questionCorrect DESC"},function(err,userScoreInfo)
      {
        if(err)
        {
          reject(err);
        }
        else
        {
          if(userScoreInfo)
          {
              let leaderBoardArray = [];
              /* setting data */
              for(let i=0;i<userScoreInfo.length;i++)
              {
                let firstName = "",lastName="",profilePic="",userChild;

                 console.log("val pics",userScoreInfo[i].toJSON().user_childs.profilePic);
                  if(userScoreInfo[i].toJSON().user_childs.profilePic != null)
                  {
                    profilePic= userScoreInfo[i].toJSON().user_childs.profilePic;
                  }
                  else
                  {
                    profilePic="";
                  }
                  console.log(profilePic);

                  userChild =
                  {
                    firstName:userScoreInfo[i].toJSON().user_childs.firstName,
                    lastName:userScoreInfo[i].toJSON().user_childs.lastName,
                    profilePic:profilePic
                  }

                let obj = {
                            user_game_id: userScoreInfo[i].user_game_id,
                            user_child_id: userScoreInfo[i].user_child_id,
                            questionCount: userScoreInfo[i].questionAskedCount,
                            questionCorrect: userScoreInfo[i].questionCorrect,
                            wronge : userScoreInfo[i].questionAskedCount-userScoreInfo[i].questionCorrect,
                            TotalTimeConsumed: userScoreInfo[i].TotalTimeConsumed,
                            accuracyRate:Math.round((userScoreInfo[i].questionCorrect/userScoreInfo[i].questionAskedCount)*100),
                            totalRings: userScoreInfo[i].totalRings,
                            id: userScoreInfo[i].id,
                            teamName: "",
                            teamProfile: "",
                            user_childs:[userChild] ,
                            rings: [],
                          }

                          if(userScoreInfo[i].toJSON().user_rings)
                          {
                            for(let j=0;j<userScoreInfo[i].toJSON().user_rings.length;j++)
                            {
                              obj.rings.push(userScoreInfo[i].toJSON().user_rings[j].ringType)
                            }
                          }
                  leaderBoardArray.push(obj);
              }

              resolve(leaderBoardArray);
          }
          else
          {
            reject(0);
          }
        }
      })
    }
    else
    {
      userScoreModel.find({include:[{user_teams:{user_team_childs:'user_childs'}}, 'user_rings'],where:{user_game_id:info.gameId},order:"totalRings DESC, questionCorrect DESC", fields:{created:false,modified:false,status:false}},function(err,userScoreInfo)
      {
        console.log(">>>>>>>>>>>userScoreInfo<<<<<<<<<<<<<",userScoreInfo);
         let finalArray =[];

        for(let i=0;i<userScoreInfo.length;i++)
        {
          let obj = {"user_game_id": '',"user_child_id": '',"questionCount":'',"questionCorrect": '',"accuracyRate":'',"TotalTimeConsumed": '',
          "wronge":'', "totalRings": '',"id":'',"teamName":"","teamProfile":"" ,"user_childs":[],"rings": []};

          obj.user_game_id = userScoreInfo[i].user_game_id;
          obj.user_child_id = userScoreInfo[i].user_child_id;
          obj.questionCount = userScoreInfo[i].questionAskedCount;
          obj.questionCorrect = userScoreInfo[i].questionCorrect;
          obj.wronge = userScoreInfo[i].questionAskedCount-userScoreInfo[i].questionCorrect;
          obj.accuracyRate = Math.round((userScoreInfo[i].questionCorrect/userScoreInfo[i].questionAskedCount)*100);
          obj.TotalTimeConsumed =userScoreInfo[i].TotalTimeConsumed;
          obj.totalRings =userScoreInfo[i].totalRings;
          obj.id =userScoreInfo[i].id;
          obj.teamName = userScoreInfo[i].toJSON().user_teams.teamName;
          obj.teamProfile = userScoreInfo[i].toJSON().user_teams.logoId;
          let teamchildData =userScoreInfo[i].toJSON().user_teams.user_team_childs
          for(let j=0;j<teamchildData.length;j++)
          {
            if(teamchildData[j].user_childs.profilePic != null)
            {
              profilePic:teamchildData[j].user_childs.profilePic;
            }
            else
            {
              profilePic:"";
            }
            profilePic=teamchildData[j].user_childs.profilePic;
            let userChild = {firstName:teamchildData[j].user_childs.firstName,
            lastName:teamchildData[j].user_childs.lastName,
            profilePic:profilePic
            }

            obj.user_childs.push(userChild);
          }
          if(userScoreInfo[i].toJSON().user_rings)
          {
            for(let j=0;j<userScoreInfo[i].toJSON().user_rings.length;j++)
            {
              obj.rings.push(userScoreInfo[i].toJSON().user_rings[j].ringType)
            }
          }
          //console.log("ssssssssssssss",obj);
          finalArray.push(obj)
        }

        console.log(">>>>>>>>>>>finalArray<<<<<<<<<<<<<",finalArray);
        resolve(finalArray);
      })
    }
  })
}


/* ==================== Get User Score Data  =================   */

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


/* ==================== check / insert user Ring  =================   */

function checkOrInsert(info,userScoreData)
{
  console.log("info",info);
  console.log("info2",userScoreData);
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
            console.log("errrrrrrr",err);
            console.log("errrrrrrr",userRingsCount);
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
                console.log("errrrrrrr",err);
                console.log("errrrrrrr",userRingsCount);
                resolve(userRingsCount)
              })

            }
          })
        }
      }
    })
  });
}


/* ==================== update Rings  =================   */

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


/* ==================== Deduct Rings =================   */

function deductUserRings(info)
{
  return new Promise(function(resolve, reject)
  {
    console.log(info);
    let userScoreModel =  app.models.user_score;
    let userRingsModel =  app.models.user_rings;
    userScoreModel.findOne({where:{user_game_id:info.gameId,user_child_id:info.childId}}, function(err, userScoreData)
    {
      if(err)
      {
        let data = {status:"Fail",message:"Error"+err}
        reject(data);
      }
      else
      {
        console.log("userScoreData.totalRings",userScoreData.totalRings);
        if(userScoreData.totalRings > 0 )
        {
          userScoreData.updateAttributes({totalRings:userScoreData.totalRings-1}, function(err, userInstance)
          {
            if(err)
            {
              let data = {status:"Fail",message:"Error"+err}
              reject(data);
            }
            else
            {
              console.log("userInstance",userInstance);
              userRingsModel.find({where:{user_score_id:userScoreData.id}}, function(err, userRings)
              {
                if(err)
                {
                  let data = {status:"Fail",message:"Error"+err}
                  reject(data);
                }
                else
                {

                  let random = random_item(userRings);
                  console.log("random Ring",random);
                  if(random)
                  {
                    userRingsModel.deleteAll({id:random.id},function(err,deletData){
                        if(err)
                        {
                          let data = {status:"Fail",message:"Error"+err}
                          reject(data);
                        }
                        else
                        {
                          let data = {status:"success",message:"Deducted",duductedRing:random.ringType,childId:info.childId}
                          resolve(data);
                        }
                    })
                  }
                }
              })
              //resolve(1)
            }
          });
        }
        else
        {
          let data = {status:"success",message:"no rings"}
          resolve(data);
        }
      }
    });
  });
}

function random_item(items)
{
  return items[Math.floor(Math.random()*items.length)];
}
