'use strict';
let app = require('../../server/server');

module.exports = function(Userscore) {


    Userscore.leaderBoard = function (req, cb)
    {
	console.log("Hit===========================")
        try
        {
	    let reqObject = req.res.req;
            let aData = JSON.parse(reqObject.body.data);
	    console.log("aData==============<><><",aData)
            //let aData =  {gameId: 1,gameMode:1}
            leaderBoard(aData).then(function(leaderBoard)
            {
		console.log("leaderboard =========",leaderBoard);
              cb(null,{status:"success",data:leaderBoard})
              //app.io.to(userRoom.get(socket.id)).emit('leaderBoard',leaderBoard);
            })
            .catch(function(err)
            {
		console.log("leaderboard =========",err);
              cb(null,{status:"fail",data:err})
              //app.io.to(userRoom.get(socket.id)).emit('leaderBoard',"Error while getting leaderboard");
            });
        }
        catch(e)
        {
            cb(null,{status:"fail"})
        }
    }

    Userscore.remoteMethod(
        'leaderBoard', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/leaderBoard',verb: 'post'}
        });


   Userscore.winner = function (req, cb)
    {
        try
        {
            let reqObject = req.res.req;
            let aData = JSON.parse(reqObject.body.data);
            //let aData =  {GameType: 1,WinnerId: 1}
            try 
            {
              updateUserWin(aData).then(function (update) 
              {
                cb(null,{status:"success"})
              })
              .catch(function (err) 
              {
                cb(null,{status:"fail"})
              });
            }
            catch(e)
            {
              cb(null,{status:"fail"})
            }
        }
        catch(e)
        {
            cb(null,{status:"fail"})
        }
    }

    Userscore.remoteMethod(
        'winner', {
            accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
            returns: [{arg: 'data',type: 'Object'}],
            http: {path: '/winner',verb: 'post'}
        }); 


    Userscore.answerGivenByPlayer = function (req, cb)
    {
        try
        {
            let reqObject = req.res.req;
            let aData = JSON.parse(reqObject.body.data);
            //let aData =  {gameId: 235030,answerGiven:0,category_id:1,childId:163884,timeTaken:10}
console.log("aData=============",aData);
            let categoryAgeStatsModel =  app.models.category_age_stats;
            let userChildsModel =  app.models.user_childs;
            try 
            {
              updatePlayerScoreInfo(aData).then(function(dataStatus)
              {
                userChildsModel.findOne({where:{id:parseInt(aData.childId)}},function(err,userChildInfo){
                  if(err)
                  {
                    cb(null,{status:"fail",message:"Error While getting UserChildsInfo"});
                  }
                  else
                  {
			//console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrr',userChildInfo);
                    if(userChildInfo)
                    {
                      categoryAgeStatsModel.findOne({where:{category_id:parseInt(aData.category),age_id:parseInt(userChildInfo.age_id)}},function(err,data){
                        if(err)
                        {
                          cb(null,{status:"fail"});
                        }
                        else
                        {
				//console.log("HHHHHHHHHHHHHHHHHHHHHH",data)
                          if(data)
                          {
                            categoryAgeStatsModel.updateAll({id:parseInt(data.id)},{questionCount:parseInt(data.questionCount)+1,answerCount:parseInt(data.answerCount)+parseInt(aData.answerGiven)},function(err,updateV){
                              if(err)
                              {
                                console.log(err);
                                cb(null,{status:"fail"});
                              }
                              else
                              {
                                cb(null,{status:"success"})
                              }
                            }) 
                          }
                          else
                          {
//console.log("userChildInfo.age_id",aData.category);
//console.log("userChildInfo.age_id",userChildInfo.age_id);
                            categoryAgeStatsModel.create({category_id:aData.category,age_id:userChildInfo.age_id,questionCount:1,answerCount:aData.answerGiven,
                              created:new Date(),modified:new Date()},function(err,data){
                              if(err)
                              {
                                console.log('err',err);
                                cb(null,{status:"fail"});
                              }
                              else
                              {
                                cb(null,{status:"success"})
                              }
                            })
                            
                          }
                        }
                      }) 
                    }
                    else
                    {
                      cb(null,{status:"fial",message:"not getting userchild"})
                    }
                  }
                })
                
              })
              .catch(function(err)
              {
                console.log("1",err);
                cb(null,{status:"fail"})
                //app.io.to(userRoom.get(socket.id)).emit('answerGivenByPlayer',"Error while updating");
              });
            }
            catch(e)
            {
              console.log("2",e);
              cb(null,{status:"fail"})
            }
        }
        catch(e)
        {
          console.log("3",e);
            cb(null,{status:"fail"})
        }
    }

    Userscore.remoteMethod(
        'answerGivenByPlayer', {
            accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
            returns: [{arg: 'data',type: 'Object'}],
            http: {path: '/answerGivenByPlayer',verb: 'post'}
        });   


     function leaderBoard(info)
    {
        return new Promise(function(resolve, reject)
        {
        
        let userScoreModel =  app.models.user_score;
        /* getting userscore join with user_child and userRings */

        if(info.gameType == 'Point_Based')
        {

          async.waterfall([
            function(callbackWater) 
            {
              //let sortedPoints = info.gamePointData.sort(compare_qty);

              callbackWater(null, info.gamePointData.sort(compare_qty));

            },
            function(sortedPointArray,callbackWater) 
            {
              console.log(sortedPointArray);
              let x=0; let leaderBoardArray = [];
              async.eachSeries(sortedPointArray, function(value, callback)
              {
                //console.log(value);
                if(info.gameMode == 1)
                {
                    userScoreModel.findOne({include:['user_childs', 'user_rings'],where:{user_game_id:parseInt(info.gameId),user_child_id:parseInt(value.playerId)}},function(err,scoreINfo){
                    if(err)
                    {
                      console.log(err);
                        x++
                        if(x != info.gamePointData.length)
                        {
                          callback();
                        }
                        else
                        {
                          callbackWater(err)
                        }
                    }
                    else
                    {
                      //console.log("scoreINfo",scoreINfo);
                      if(scoreINfo)
                      { 
                          userScoreModel.updateAll({user_game_id:info.gameId,user_child_id:value.playerId},{points:value.playerPoints},function(err,updateScoreInfo)
                          {
                            if(err)
                            {
                              x++
                              if(x != info.gamePointData.length)
                              {
                                callback();
                              }
                              else
                              {
                                callbackWater(err)
                              }
                            }
                            else
                            {
                              x++
                              
                                let firstName = "",lastName="",profilePic="",userChild;
        
                                //console.log("val pics",userScoreInfo[i].toJSON().user_childs.profilePic);
                                if(scoreINfo.toJSON().user_childs.profilePic != null)
                                {
                                profilePic= scoreINfo.toJSON().user_childs.profilePic;
                                }
                                else
                                {
                                profilePic="";
                                }
    
                                userChild ={
                                  firstName:scoreINfo.toJSON().user_childs.firstName,
                                  lastName:scoreINfo.toJSON().user_childs.lastName,
                                  profilePic:profilePic
                                  }
    
    
                                let obj = {
                                  user_game_id: scoreINfo.user_game_id,
                                  user_child_id: scoreINfo.user_child_id,
                                  questionCount: scoreINfo.questionAskedCount,
                                  questionCorrect: scoreINfo.questionCorrect,
                                  wronge : scoreINfo.questionAskedCount-scoreINfo.questionCorrect,
                                  TotalTimeConsumed: scoreINfo.TotalTimeConsumed,
                                  accuracyRate:Math.round((scoreINfo.questionCorrect/scoreINfo.questionAskedCount)*100),
                                  totalRings: scoreINfo.totalRings,
                                  id: scoreINfo.id,
                                  teamName: "",
                                  teamProfile: "",
                                  points:value.playerPoints,
                                  user_childs:[userChild] ,
                                  rings: [],
                                  //pointsInfo:info.gamePointData.sort(compare_qty)
                                  }
      
                                  if(scoreINfo.toJSON().user_rings)
                                  {
                                    for(let j=0;j<scoreINfo.toJSON().user_rings.length;j++)
                                    {
                                        obj.rings.push(scoreINfo.toJSON().user_rings[j].ringType)
                                    }
                                  }
                                //console.log('value',value)
                                leaderBoardArray.push(obj);
                                
                                callback();
    
                              
                              if(x == info.gamePointData.length )
                              {
                                //let obj2 = {leader:leaderBoardArray,point:info.gamePointData.sort(compare_qty)}
                                callbackWater(null,leaderBoardArray);
                              }
                            }
                          })
                        }
                        else
                        {
                          x++
                          if(x != info.gamePointData.length)
                          {
                            callback();
                          }
                          else
                          {
                            callbackWater(err)
                          }
                        }
                    }
                  })
                }
                else
                {
                  userScoreModel.findOne({include:[{user_teams:{user_team_childs:'user_childs'}}, 'user_rings'],where:{user_game_id:parseInt(info.gameId),user_child_id:parseInt(value.playerId)}},function(err,scoreINfo){
                    if(err)
                    {
                      console.log(err);
                        x++
                        if(x != info.gamePointData.length)
                        {
                          callback();
                        }
                        else
                        {
                          callbackWater(err)
                        }
                    }
                    else
                    {
                      let profilePic=""
                      //console.log("scoreINfo",scoreINfo);
                      if(scoreINfo)
                      { 
                          userScoreModel.updateAll({user_game_id:info.gameId,user_child_id:value.playerId},{points:value.playerPoints},function(err,updateScoreInfo)
                          {
                            if(err)
                            {
                              x++
                              if(x != info.gamePointData.length)
                              {
                                callback();
                              }
                              else
                              {
                                callbackWater(err)
                              }
                            }
                            else
                            {
                              x++
                              
                              let obj = {"user_game_id": '',"user_child_id": '',"questionCount":'',"questionCorrect": '',"accuracyRate":'',"TotalTimeConsumed": '',
                              "wronge":'', "totalRings": '',"id":'',"teamName":"","teamProfile":"" ,"user_childs":[],"rings": [],"point":0};
                  
                              obj.user_game_id = scoreINfo.user_game_id;
                              obj.user_child_id = scoreINfo.user_child_id;
                              obj.questionCount = scoreINfo.questionAskedCount;
                              obj.questionCorrect = scoreINfo.questionCorrect;
                              obj.wronge = scoreINfo.questionAskedCount-scoreINfo.questionCorrect;
                              obj.accuracyRate = Math.round((scoreINfo.questionCorrect/scoreINfo.questionAskedCount)*100);
                              obj.TotalTimeConsumed =scoreINfo.TotalTimeConsumed;
                              obj.totalRings =scoreINfo.totalRings;
                              obj.id =scoreINfo.id;
                              obj.teamName = scoreINfo.toJSON().user_teams.teamName;
                              obj.teamProfile = scoreINfo.toJSON().user_teams.logoId;
                              obj.points =value.playerPoints;
                              let teamchildData =scoreINfo.toJSON().user_teams.user_team_childs

                              for(let j=0;j<teamchildData.length;j++)
                              {
                              if(teamchildData[j].user_childs.profilePic != null)
                              {
                                  profilePic=teamchildData[j].user_childs.profilePic;
                              }
                              else
                              {
                                  profilePic="";
                              }
                              profilePic=teamchildData[j].user_childs.profilePic;
                              let userChild = {firstName:teamchildData[j].user_childs.firstName,
                              lastName:teamchildData[j].user_childs.lastName,
                              profilePic:profilePic
                              }
                  
                              obj.user_childs.push(userChild);
                              }
                              if(scoreINfo.toJSON().user_rings)
                              {
                              for(let j=0;j<scoreINfo.toJSON().user_rings.length;j++)
                              {
                                  obj.rings.push(scoreINfo.toJSON().user_rings[j].ringType)
                              }
                              }
                                //console.log('value',value)
                                leaderBoardArray.push(obj);
                                
                                callback();
    
                              
                              if(x == info.gamePointData.length )
                              {
                                //let obj2 = {leader:leaderBoardArray}
                                callbackWater(null,leaderBoardArray);
                              }
                            }
                          })
                        }
                        else
                        {
                          x++
                          if(x != info.gamePointData.length)
                          {
                            callback();
                          }
                          else
                          {
                            callbackWater(err)
                          }
                        }
                    }
                  })
                }
              })
            }
            
          ], function (err, result)
          {
            if(err)
            {
              reject(err);
              //cb(null,{status:"fail",message:err.message});
            } 
            else
            {
              resolve(result)
              //cb(null,{status:"success",message:result})
            }   
        
          });



          
          
        }
        else
        {
       
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
    
                        //console.log("val pics",userScoreInfo[i].toJSON().user_childs.profilePic);
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
                                points:0
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
                let finalArray =[];
                let profilePic=""
    
            for(let i=0;i<userScoreInfo.length;i++)
            {
                let obj = {"user_game_id": '',"user_child_id": '',"questionCount":'',"questionCorrect": '',"accuracyRate":'',"TotalTimeConsumed": '',
                "wronge":'', "totalRings": '',"id":'',"teamName":"","teamProfile":"" ,"user_childs":[],"rings": [],"points":0};
    
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
                
                let teamchildData =userScoreInfo[i].toJSON().user_teams.user_team_childs;
                
                for(let j=0;j<teamchildData.length;j++)
                {
                if(teamchildData[j].user_childs.profilePic != null)
                {
                    profilePic=teamchildData[j].user_childs.profilePic;
                }
                else
                {
                    profilePic="";
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
            resolve(finalArray);
            })
        }
      }
      })
    } 

    
    
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

 function compare_qty(a,b)
   {
      // a should come before b in the sorted order
      if(a.playerPoints > b.playerPoints){
        return -1;
      // a should come after b in the sorted order
      }else if(a.playerPoints < b.playerPoints){
              return 1;
      // a and b are the same
      }else{
              return 0;
      }
   } 	


};
