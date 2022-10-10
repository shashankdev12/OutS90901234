'use strict';
var app = require('../../server/server');
var loopback =  require('loopback');
let randomstring = require("randomstring");
let async = require('async');
let HashMap = require('hashmap');
global.room = new HashMap();

module.exports = function(Usergames)
{

  /* ================ Get players stats ============= */

  Usergames.getPlayersStats = function (req, cb) {
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
    console.log("=====stats requested=====");
    // let aData = reqObject.body.data;
    if (reqObject.accessToken) {
      try {
        if (aData.type == 'Player') {
          let games = app.models.user_games;
          let ds1 = games.dataSource;
          ds1.connector.query('SELECT user_childs.games_played AS gamePlayed, user_childs.profilePic AS profilePic, user_childs.games_won AS wins, user_childs.firstName AS userName, user_childs.lastName AS lastName, user_games.user_id, SUM(user_score.questionAskedCount) AS questionAskedCount, SUM(user_score.questionCorrect) AS questionCorrect, user_score.user_child_id FROM user_games INNER JOIN user_score ON user_games.id = user_score.user_game_id LEFT JOIN user_childs ON user_childs.id = user_score.user_child_id WHERE user_childs.status = 1 AND  user_games.user_id =' + aData.userId + ' AND user_score.gameType=1 GROUP BY user_score.user_child_id LIMIT 10;', function (err, details) {
            if (err) {
              console.log("error in player stats ", err)
              cb(null, { status: "fail", message: "Exception Error" + err });
            }
            else {
              //console.log("success in player stats ", details)
              cb(null, { status: "success", message: "success", data: details });
            }
          });
        }
        else if (aData.type == 'Team') {
          let games = app.models.user_teams;
          let user_team_childs = app.models.user_team_childs;
          let ds2 = user_team_childs.dataSource;
          console.log("team stats requested");
          let ds1 = games.dataSource;
          ds1.connector.query('SELECT user_teams.id AS teamId,user_teams.teamName AS userName, user_teams.logoId AS teamLogo, user_teams.games_played AS gamePlayed, user_teams.games_won AS wins, SUM(user_score.questionAskedCount) AS questionAskedCount, SUM(user_score.questionCorrect) AS questionCorrect FROM user_teams LEFT JOIN user_score ON user_teams.id = user_score.user_child_id WHERE user_id = ' + aData.userId + ' AND user_score.gameType=2 GROUP BY user_score.user_child_id;', function (err, details) {// user_team_childs.user_child_id AS childId                  INNER JOIN user_team_childs ON user_teams.id = user_team_childs.user_team_id
            if (err)
            {
              console.log("error in team stats ", err);
              cb(null, { status: "fail", message: "Exception Error" + err });
            }
            else 
            {
              console.log(details)
	      if(details.length > 0)
              {	
              let i=0;
              let detailsNew = []
              async.eachSeries(details, function(data, cback)
              {
                //console.log("details",details.length);
                let obj = {"teamId": data.teamId,
                            "userName": data.userName,
                            "teamLogo": data.teamLogo,
                            "gamePlayed": data.gamePlayed,
                            "wins": data.wins,
                            "questionAskedCount": data.questionAskedCount,
                            "questionCorrect": data.questionCorrect,
                            "playerList":[]
                          }
                i++
                ds1.connector.query('SELECT user_childs.id,user_childs.firstName,user_childs.lastName,user_childs.profilePic,user_team_childs.id,user_team_childs.user_child_id FROM user_team_childs LEFT JOIN user_childs ON  user_childs.id = user_team_childs.user_child_id WHERE user_team_childs.user_team_id ='+data.teamId+'',
                function(err,userChildInfo){
                  
                  if(i == details.length)
                  {
                    
                    obj.playerList = userChildInfo;
                    detailsNew.push(obj)
                    cb(null, { status: "success", message: "success", data: detailsNew });
                  }
                  else
                  {
                    obj.playerList = userChildInfo;
                    detailsNew.push(obj)
                    cback()
                  }
                })
              })
	     }
	     else
	     {
		            cb(null, { status: "success", message: "success", data: [] });

	     }	
            }
          });
        }
      }
      catch (e) {
        cb(null, { status: "fail", message: "Exception Error" + e });
      }
    }
    else {
      cb(null, { status: "fail", message: "AccessToken Error" });
    }
  }

  Usergames.remoteMethod(
    'getPlayersStats', {
      accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
      returns: [{arg: 'data',type: 'Object'}],
      http: {path: '/getPlayersStats',verb: 'post'}
    });

  /* ================ End of Get players stats ============= */


  /* ================ Add User Game ================= */

Usergames.addGame = function (req, cb)
  {
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
console.log("====",aData);
    //let aData = reqObject.body;
    console.log("===============add game =============================");
    let userInfoInRoom=[];
    // if(reqObject.accessToken)
    // {
      let userGamesModel = app.models.user_games;
      let userScoresModel = app.models.user_score;
      let userChildsModel = app.models.user_childs;
      let userTeamsModel = app.models.user_teams;
      let saveGameModel = app.models.saved_games;
      let gameName = randomstring.generate();
      //let roomId = randomstring.generate(5);
      let roomId = randomstring.generate({length: 5,charset: 'alphabetic'});
      roomId = roomId.toLowerCase()
      let userList = aData.userList.split(",");
      let packagesSelected = [];
	//console.log("ssss",aData.changedCategories)
//	console.log("ssssssssssss",aData.toJSON().changedCategories)

      userGamesModel.create({user_id:aData.userParentId,game:gameName,
        gameType:aData.gameType,gameMode:aData.gameMode,roomId:roomId,
        questionAsked:0,status:1,created:new Date(),modified:new Date()
        ,pack_Id:aData.userPackages,replacedCategory:JSON.stringify(aData.changedCategories),game_start:1},function(err,saveUserData)
      {
        if(err)
        {
          cb(null,{status:"fail",message:"Error while Adding game",error:err})
        }
        else
        {
          for(let i=0;i<userList.length;i++)
          {
            let usersInfo ={
                              id : userList[i],
                              position:i,
                              questionAsked:0,
                              questionCorrect:0,
                              TotalTimeConsumed:0,
                              individualTimeConsumed:0,
                              color:0
                           }
              userInfoInRoom.push(usersInfo);
              userScoresModel.create({user_game_id:saveUserData.id,user_child_id:userList[i],gameType:parseInt(aData.gameType),questionAsked:0,questionCorrect:0,TotalTimeConsumed:0,individualTimeConsumed:null,status:1,created:new Date(),modified:new Date()},function(err,USdata)
              {
                if (!err) {
                  if (aData.gameType == '1') 
                  {
                    userChildsModel.findOne({where:{ id:userList[i],user_id:aData.userParentId}}, function (err, foundParameter) {
                      if (!err) {
                        //console.log("====================",foundParameter);
                        // let numberOfGames = foundParameter.games_played + 1;
                        if(foundParameter)
                        {	
                          foundParameter.updateAttributes( { games_played: foundParameter.games_played + 1 }, function (err, updatedInfo) {
                          if (err) {
                            console.log("error in update");
                          }
                          else 
                          {
                            console.log("added players entry successfully ", aData.gameType);
                            let packagesSelected = [];
                            let questions =  app.models.questions;
                            let ds1 = questions.dataSource;
                            let userScoresModel = app.models.user_score;
                            //console.log("======ssssssssss==================",packagesSelected);
                              if(packagesSelected.length > 1)
                              {
                                let x = 0;
                                let packQues= [];
                                let packRatio;
                                async.eachSeries(packagesSelected, function(packagesV, callback)
                                {
                                    ds1.connector.query('SELECT COUNT(*) As packC FROM questions WHERE pack_ID='+packagesV+' AND status=0', function (err, data)
                                    {
                                      if(err)
                                      {
                                        callback()
                                      }
                                      else
                                      {
                                        packQues.push(data[0].packC)
                                        console.log(data[0].packC);
                                        x++; 
                                        if(packagesSelected.length == x)
                                        {
                                          const min = Math.min(...packQues)
                                          let packRatio=[];
                                          let packCount=[];
                                          for(let i=0;i<packQues.length;i++)
                                          {
                                            packRatio.push(Math.ceil((packQues[i]/min)));
                                            packCount.push(0);
                                          } 




                                            userScoresModel.updateAll({id:USdata.id},{packagesRatio:packRatio,packagesCount:packCount},function(err,update)
                                            {
                                            if(err)
                                            {
                                                
                                            }
                                            else
                                            {
                                              console.log("updated");
                                            }
                                          }) 

                                        }
                                        else
                                        {
                                          callback()
                                        }
                                      }
                                    })
                                  
                                })
                              }
                            }
                          });
                        }
                        else
                        {
                            console.log("Not found");
                        }	 
                      }
                      else {
                        console.log("error in find ", err);
                      }
                    });
                  }
                  else if (aData.gameType == '2') 
                  {
                    userTeamsModel.findOne({ where: { id: userList[i], user_id: aData.userParentId } }, function (err, foundObject) {
                      if (err) {
                        console.log("error team ", err)
                      }
                      else {
                        if(foundObject)
                        {
                            foundObject.updateAttributes({ games_played: foundObject.games_played + 1 }, function (err, updatedInfo) {
                              console.log("added players entry successfully ", aData.gameType);
                            let packagesSelected = [];
                            let questions =  app.models.questions;
                            let ds1 = questions.dataSource;
                            let userScoresModel = app.models.user_score;
                            //console.log("======ssssssssss==================",packagesSelected);
                              if(packagesSelected.length > 1)
                              {
                                let x = 0;
                                let packQues= [];
                                let packRatio;
                                async.eachSeries(packagesSelected, function(packagesV, callback)
                                {
                                    ds1.connector.query('SELECT COUNT(*) As packC FROM questions WHERE pack_ID='+packagesV+' AND status=0', function (err, data)
                                    {
                                      if(err)
                                      {
                                        callback()
                                      }
                                      else
                                      {
                                        packQues.push(data[0].packC)
                                        console.log(data[0].packC);
                                        x++; 
                                        if(packagesSelected.length == x)
                                        {
                                          const min = Math.min(...packQues)
                                          let packRatio=[];
                                          let packCount=[];
                                          for(let i=0;i<packQues.length;i++)
                                          {
                                            packRatio.push(Math.ceil((packQues[i]/min)));
                                            packCount.push(0);
                                          } 




                                            userScoresModel.updateAll({id:USdata.id},{packagesRatio:packRatio,packagesCount:packCount},function(err,update)
                                            {
                                            if(err)
                                            {
                                                
                                            }
                                            else
                                            {
                                              console.log("updated");
                                            }
                                          }) 

                                        }
                                        else
                                        {
                                          callback()
                                        }
                                      }
                                    })
                                  
                                })
                              }
                            });
                          }
                      }
                    });
                  }
                  else {
                    console.log("invalid game type");
                  }
                }
                else {
                  console.log("error in create");
                }
                
              })
            


          }

          let roomData=
          {
              roomInfo: roomId,
              gameInfo:userInfoInRoom,
              mainDevice: "",
              deviceAttached:0,
              deviceArryObj:[]
          }
          /* creating hash map for game info */
	 	
        	//console.log("Device Room Data=======================",roomData);

          room.set(roomId, roomData);

	        //console.log("Device Room Data=======================",room.get(roomId));
          saveGameModel.findOne({where:{user_id:aData.userParentId}},function
          (err,saveDataInfo)
            {
            if(err)
            {
              cb(null,{status:"fail",message:"Failure"})
            }
            else
            {
              if(saveDataInfo)
              {
                cb(null,{status:"success",message:"Successfully created game",gameId:saveUserData.id})
              }
              else
              {
                cb(null,{status:"success",message:"Successfully created game",gameId:saveUserData.id})
              }
            }

          })
          
        }
      })
    // }
    // else
    // {
    //   cb(null,{status:"fail",message:"AccessToken Error"});
    // }
  }

  Usergames.remoteMethod(
      'addGame', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/addGame',verb: 'post'}
      });


Usergames.loadLastGame = function (req, cb)
  {
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
	console.log("=========loadLastGame ===========================")

    //let aData = reqObject.body.data;
    //console.log("starting game ", aData);
    let userInfoInRoom=[];
    if(reqObject.accessToken)
    {
      let userGamesModel = app.models.user_games;
      let userScoresModel = app.models.user_score;
      let userChildsModel = app.models.user_childs;
      let userTeamsModel = app.models.user_teams;
      let saveGameModel = app.models.saved_games;
      let gameName = randomstring.generate();
      //let roomId = randomstring.generate(5);
      let roomId = randomstring.generate({length: 5,charset: 'alphabetic'});
      roomId = roomId.toLowerCase()
      let userList = aData.userList.split(",");

      
          let onceIncremented = false;
          for(let i=0;i<userList.length;i++)
          {
            /* setting info for room */
            let usersInfo ={
                              id : userList[i],
                              position:i,
                              questionAsked:0,
                              questionCorrect:0,
                              TotalTimeConsumed:0,
                              individualTimeConsumed:0,
                              color:0
                           }
            userInfoInRoom.push(usersInfo);
          }

          let roomData=
          {
              roomInfo: roomId,
              gameInfo:userInfoInRoom,
              mainDevice: "",
              deviceAttached:0,
              deviceArryObj:[]
          }
          /* creating hash map for game info */
          room.set(roomId, roomData);
          

          cb(null,{status:"success",message:"Successfully created game",roomId:roomId})

      
    }
    else
    {
      cb(null,{status:"fail",message:"AccessToken Error"});
    }
  }

  Usergames.remoteMethod(
      'loadLastGame', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/loadLastGame',verb: 'post'}
      });



  Usergames.addTeam = function (req, cb)
  {
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
	console.log("===============Add Team====================")
    //let aData = reqObject.body.data;
    if(reqObject.accessToken)
    {
      async.waterfall([
        function(callback) {
          checkTeamName(aData).then(function(gameInfo)
          {
            callback(null, gameInfo);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(gameInfo, callback)
        {
          if(gameInfo.status  == 0)
          {
            setTeamInfo(aData).then(function(result)
            {
              callback(null, result);
            })
            .catch(function(err)
            {
              callback(err);
            })
          }
          else
          {
            callback(null, gameInfo);
          }
        }
      ], function (err, result)
      {
        if(err)
        {
          cb(null,{status:"fail",message:"Error while getting error",error:err})
        }
        else
        {
	  if(result.status == 1)
	  {
	   cb(null,{status:"fail",data:result.message})
          }
	  else
	  {
	    cb(null,{status:"success",data:result})
          }
          
        }
      });
    }
    else
    {
      cb(null,{status:"fail",message:"AccessToken Error"});
    }
  }

  Usergames.remoteMethod(
      'addTeam', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/addTeam',verb: 'post'}
      });

  /* =============== Get User Team Info ============== */

  Usergames.getTeamInfo = function (req, cb)
  {
		console.log("===============get TeamInfo ====================")

      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
      //let aData = reqObject.body.data;
      let userTeamModel = app.models.user_teams;
      if(reqObject.accessToken)
      {
        userTeamModel.find({include:{
            relation: 'user_team_childs', // include the owner object
            scope: { // further filter the owner object
            fields: ['id','user_child_id'],
            where: {status: {neq:0}},
            include: { // include orders for the owner
            relation: 'user_childs',
            scope:{
              fields: ['id','firstName','lastName','age','profilePic'],
              where: {status: {neq:0}} // only select order with id 5
            }
           }
         }
       },where:{user_id:aData.userId},fields:{id:true,user_id:true,user_child_id:true,teamName:true,logoId:true}},function(err,userTeamInfo)
        {
          if(err)
          {
            console.log("data > < <  < < < ><< > < > <",err);
          }
          else
          {
		cb(null,{status:"success",data:userTeamInfo})

            //console.log("userTeamInfo",userTeamInfo)
            //let finalArray = [];
            //for(let i=0;i<=userTeamInfo.length;i++)
            //{
              //if(i == userTeamInfo.length)
              //{
                //cb(null,{status:"success",data:finalArray})
              //}
              //else
              //{
                //console.log('userTeamInfo[i].user_team_childs',userTeamInfo[i].toJSON().user_team_childs)

                //if(userTeamInfo[i].toJSON().user_team_childs.length != 0)
                //{
                  //finalArray.push(userTeamInfo[i]);
                //}
              //}
            //}
          }
        })
      }
      else
      {
        cb(null,{status:"fail",message:"AccessToken Error"});
      }

  }

  Usergames.remoteMethod(
      'getTeamInfo', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getTeamInfo',verb: 'post'}
      });

  /* =============== Edit/ update Team =============== */
  Usergames.updateTeam = function (req, cb)
  {
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
	console.log("===============updateTeam  ====================",aData )
    //let aData = reqObject.body.data;
    if(reqObject.accessToken)
    {
      async.waterfall([
        function(callback) {
          if(aData.teamNameUpdate == 1)
          {
            checkUpdateTeamName(aData).then(function(gameInfo)
            {
              callback(null, gameInfo);
            })
            .catch(function(err)
            {
              callback(err);
            });
          }
          else
          {
            callback(null, {status:0});
          }
        },
        function(gameInfo, callback)
        {
          if(gameInfo.status  == 0)
          {
            updateTeamInfo(aData).then(function(result)
            {
              callback(null, result);
            })
            .catch(function(err)
            {
              callback(err);
            })
          }
          else
          {
            callback(null, gameInfo);
          }
        }
      ], function (err, result)
      {
        if(err)
        {
          cb(null,{status:"fail",message:"Error while getting error",error:err})
        }
        else
        {
           if(result.status == 1)
	   {
	     cb(null,{status:"fail",data:result.message})
           }
	   else
	  {
	    cb(null,{status:"success",data:result})
          }
        }
      });
    }
    else
    {
      cb(null,{status:"fail",message:"AccessToken Error"});
    }

  }

  Usergames.remoteMethod(
      'updateTeam', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/updateTeam',verb: 'post'}
      });

  /* =============== Delete Team ===================== */

  Usergames.deleteTeam = function (req, cb)
  {
	
    try
    {
      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
	console.log("==================deleteTeam===============")
      //let aData = reqObject.body.data;
      let userTeamModel = app.models.user_teams;
      let userTeamChildModel = app.models.user_team_childs;
       if(reqObject.accessToken)
       {
         //let aData = {teamId:'1'}
        if(aData.teamId != null)
        {
            userTeamModel.findOne({where:{id:parseInt(aData.teamId)}},function(err,info)
            {
              if(err)
              {
                cb(null,{status:"fail",message:"Error while getting "+err})
              }
              else
              {

                if(info)
                {
                  userTeamModel.destroyAll({id:parseInt(info.id)},function(err,deleted)
                  {
                      if(err)
                      {
                        cb(null,{status:"fail",message:"Error while deleting team"})
                      }
                      else
                      {
                        userTeamChildModel.destroyAll({user_team_id:parseInt(info.id)},function(err,deleted)
                        {
                            if(err)
                            {
                              cb(null,{status:"fail",message:"Error while deleting team child info"})
                            }
                            else
                            {
                              cb(null,{status:"success",message:"successfully Deleted team and child"})
                            }
                        })
                      }
                  })
                }
                else
                {
                  cb(null,{status:"fail",message:"No team found"})
                }
              }
            })
        }
        else
        {
            cb(null,{status:"fail",message:"No team found"})
        }
       }
       else
       {
         cb(null,{status:"fail",message:"AccessToken Error"});
       }
    }catch(e)
    {
      cb(null,{status:"fail",message:"Exception Error"+e});
    }
  }

  Usergames.remoteMethod(
      'deleteTeam', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/deleteTeam',verb: 'post'}
      });

  Usergames.test = function (req, cb)
  {
    let data = {packages:"0,1"};
    let packagesSelected = data.packages.split(",");
    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    let userScoresModel = app.models.user_score;
    if(packagesSelected.length > 1)
    {
      let x = 0;
      let packQues= [];
      let packRatio;
      async.eachSeries(packagesSelected, function(packagesV, callback)
      {
          ds1.connector.query('SELECT COUNT(*) As packC FROM questions WHERE age_id=1 AND  region=1 AND pack_ID='+packagesV+' AND questionGroupId NOT IN ("0","298","10952")', function (err, data)
          {
            if(err)
            {
              callback()
            }
            else
            {
              packQues.push(data[0].packC)
              x++; 
              if(packagesSelected.length == x)
              {
                const min = Math.min(...packQues)
                let packRatio=[];
                let packCount=[];
                for(let i=0;i<packQues.length;i++)
                {
                  packRatio.push(Math.ceil((packQues[i]/min)));
                  packCount.push(0);
                } 
                
                userScoresModel.updateAll({id:1},{packagesRatio:packRatio,packagesCount:packCount},function(err,update){
                  if(err)
                  {

                  }
                  else
                  {
                    console.log("updated");
                  }
                }) 

              }
              else
              {
                callback()
              }
            }
          })
        
      })
    }


  }
    
  Usergames.remoteMethod(
      'test', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/test',verb: 'post'}
      });


 /* =============== Delete Team ===================== */

 Usergames.saveGamesDetails = function (req, cb)
 {
 
   try
   {
     let reqObject = req.res.req;
     let aData = JSON.parse(reqObject.body.data);
      			     //console.log(aData);
                //  let aData =  {"userId":14,"gameId":180,"winner":41,
                //  "category":[{"categoryId":1,"Questions":"20,30"}],
                //  "child":[{"id":41,"questionplayed":10,"correct":5,"timeConsumed":200}]}
      console.log(aData)
      //let aData = {"userId":14,"gameId":247217,"winner":71595,
        //          "category":[{"categoryId":1,"Questions":"20,30"}]
          //      ,"child":[{"id":71595,"questionplayed":10,"correct":5,"timeConsumed":200}]}
      // if(reqObject.accessToken)
      // {
        let gameModel =app.models.user_games; 
        let userScoreModel =app.models.user_score; 
        let userModel = app.models.user;
        let userCategoryModel = app.models.user_categories;
        let userChildModel = app.models.user_childs;

	      let userTeamModel = app.models.user_teams;

        if(aData.winner != "" && aData.winner != null)
        {
          gameModel.updateAll({id:aData.gameId},{game_end:1})
        }        

                              
        gameModel.findOne({where:{id:aData.gameId}},function(err,gameInfoDe){
        async.waterfall([
          function(callback) 
          {
            if(aData.category.length>0)
            {
              let x=0;
              async.eachSeries(aData.category, function(fields, callback2)
              {
                x++
                if(fields.categoryId == 1 ||  fields.categoryId == 2 ||  fields.categoryId == 3
                  ||  fields.categoryId == 4||  fields.categoryId == 5||  fields.categoryId == 6)
                  {
                    userModel.findOne({where:{id:aData.userId},field:{PubQuizQuestionAsked:true,BKSQuestionAsked:true,
                      QTQuestionAsked:true,SNMQuestionAsked:true,TVBQuestionAsked:true,BKNQuestionAsked:true}},function(err,uInfo){
                        if(err)
                        {
                          if(aData.category.length  == x)
                          {
                            callback(null, 0);
                          }
                          else
                          {
                            callback2()
                          }
                        }
                        else
                        {
                          
                           if(fields.categoryId == 1)
                           {
                             let quest  = uInfo.PubQuizQuestionAsked+','+fields.Questions
                             userModel.updateAll({id:aData.userId},{PubQuizQuestionAsked:quest},function(err,udata)
                             {
                               if(aData.category.length  == x)
                               {
                                callback(null, 0);
                               }
                               else
                               {
                                callback2()
                               }
                                
                             })

                           } 
                           else if(fields.categoryId == 2)
                           {
                            let quest  = uInfo.BKSQuestionAsked+','+fields.Questions
                            userModel.updateAll({id:aData.userId},{BKSQuestionAsked:quest},function(err,udata)
                             {
                              if(aData.category.length  == x)
                              {
                                callback(null, 0);
                              }
                              else
                              {
                               callback2()
                              }
                             })
                           }
                           else if(fields.categoryId == 3)
                           {
                            let quest  = uInfo.QTQuestionAsked+','+fields.Questions
                            userModel.updateAll({id:aData.userId},{QTQuestionAsked:quest},function(err,udata)
                             {
                              if(aData.category.length  == x)
                              {
                                callback(null, 0);
                              }
                              else
                              {
                               callback2()
                              }
                             })
                           }
                           else if(fields.categoryId == 4)
                           {
                            let quest  = uInfo.SNMQuestionAsked+','+fields.Questions
                            userModel.updateAll({id:aData.userId},{SNMQuestionAsked:quest},function(err,udata)
                             {
                              if(aData.category.length  == x)
                              {
                                callback(null, 1);
                              }
                              else
                              {
                               callback2()
                              }
                             })
                           }
                           else if(fields.categoryId == 5)
                           {
                            let quest  = uInfo.TVBQuestionAsked+','+fields.Questions
                            userModel.updateAll({id:aData.userId},{TVBQuestionAsked:quest},function(err,udata)
                             {
                              if(aData.category.length  == x)
                              {
                                callback(null, 1);
                              }
                              else
                              {
                               callback2()
                              }
                             })
                           }
                           else if(fields.categoryId == 6)
                           {
                            let quest  = uInfo.BKNQuestionAsked+','+fields.Questions
                            userModel.updateAll({id:aData.userId},{BKNQuestionAsked:quest},function(err,udata)
                            {
                              if(aData.category.length  == x)
                               {
                                callback(null, 1);
                               }
                               else
                               {
                                
                                callback2()
                               }
                            })
                           }
                        }
                      })
                  }
                  else
                  { 
                    userCategoryModel.findOne({where:{user_id:aData.userId,category_id:fields.categoryId}},function(err,UCdata){
                      if(err)
                      {

                      }
                      else
                      {
                        if(UCdata)
                        {
                          let quest  = UCdata.questionAsked+','+fields.Questions
                          userCategoryModel.updateAll({user_id:aData.userId,category_id:fields.categoryId},{questionAsked:quest},function(err,uucdata){
                            if(err)
                            {
                              if(aData.category.length  == x)
                               {
                                callback(null, 1);
                               }
                               else
                               {
                                callback2()
                               }
                            }
                            else
                            {
                              if(aData.category.length  == x)
                               {
                                callback(null, 1);
                               }
                               else
                               {
                                callback2()
                               }
                            }
                          })
                        }
                        else
                        {
                          let quest  = fields.Questions
                          userCategoryModel.create({user_id:aData.userId,category_id:fields.categoryId,questionAsked:quest},function(err,uucdata){
                            if(err)
                            {

                            }
                            else
                            {
                              if(aData.category.length  == x)
                              {
                                callback(null, 1);
                              }
                              else
                              {
                               callback2()
                              }
                            }
                          })
                        }
                      }
                    })
                  }
              })
            }
            else
            {
              callback(null, 0);
            }
          },
          function(gameInfo, callback)
          {
            let y=0;
            async.eachSeries(aData.child, function(fields, callback2)
            {
              y++;
              userScoreModel.findOne({where:{user_game_id:aData.gameId,user_child_id:fields.id}},function(err,userScore){
                if(err)
                {
                  console.log(err);
                  if(aData.child.length  == y)
                  {
                    callback(null, 0);
                  }
                  else
                  {
                    callback2()
                  }
                }
                else
                {
                  if(userScore)
                  {
                    userScoreModel.updateAll({user_game_id:aData.gameId,user_child_id:fields.id},{questionAskedCount:userScore.questionAskedCount+fields.questionplayed,
                      questionCorrect:userScore.questionCorrect+fields.correct,TotalTimeConsumed:userScore.TotalTimeConsumed+fields.timeConsumed},function(err,userUpdateScore){
                        if(err)
                        {
                          console.log(err);
                          if(aData.child.length  == y)
                          {
                            callback(null, 0);
                          }
                          else
                          {
                            callback2()
                          }
                        }
                        else
                        {
                          console.log("gameInfoDe",gameInfoDe);
                          if(aData.child.length  == y)
                          {
                            if(gameInfoDe.gameType== 2)
                            {
                              userTeamModel.findOne({where:{id:fields.id}},function(errr,uchildInfo){
                                if(err)
                                {
                                  console.log(err)
                                }
                                else
                                {
                                  if(fields.id == aData.winner)
                                  {
                                    console.log("4444",uchildInfo)
                                    userTeamModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1,games_won:parseInt(uchildInfo.games_won)+1},function(err,uUpdateChild){
                                      callback(null, 0); 
                                    })
                                    
                                  }
                                  else
                                  {
                                    console.log("3333")
                                    userTeamModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1},function(err,uUpdateChild){
                                      callback(null, 0);  
                                    })
                                  }
                                  
                                }
                              })
                            }
                            else
                            {
                              userChildModel.findOne({where:{id:fields.id}},function(errr,uchildInfo){
                                if(err)
                                {
                                  console.log(err)
                                }
                                else
                                {
                                  if(fields.id == aData.winner)
                                  {
                                    console.log(uchildInfo)
                                    userChildModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1,games_won:parseInt(uchildInfo.games_won)+1},function(err,uUpdateChild){
                                      callback(null, 0); 
                                    })
                                    
                                  }
                                  else
                                  {
                                    
                                    userChildModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1},function(err,uUpdateChild){
                                      callback(null, 0);  
                                    })
                                  }
                                  
                                }
                              })
                            }
                           
                          }
                          else
                          {
                            if(gameInfoDe.gameType == 2)
                            {
                                userTeamModel.findOne({where:{id:fields.id}},function(errr,uchildInfo){
                                  if(err)
                                  {
                                    console.log(err)
                                  }
                                  else
                                  {
                                    if(fields.id == aData.winner)
                                    {
                                      console.log("4444",uchildInfo)
                                      userTeamModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1,games_won:parseInt(uchildInfo.games_won)+1},function(err,uUpdateChild){
                                        callback2()  
                                      })
                                      
                                    }
                                    else
                                    {
                                      console.log("3333")
                                      userTeamModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1},function(err,uUpdateChild){
                                        callback2()  
                                      })
                                    }
                                    
                                  }
                                })

                              }
                              else
                              {
                                userChildModel.findOne({where:{id:fields.id}},function(errr,uchildInfo){
                                  if(err)
                                  {
                                    console.log(err)
                                  }
                                  else
                                  {
                                    if(fields.id == aData.winner)
                                    {
                                      console.log("4444",uchildInfo)
                                      userChildModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1,games_won:parseInt(uchildInfo.games_won)+1},function(err,uUpdateChild){
                                        callback2()  
                                      })
                                      
                                    }
                                    else
                                    {
                                      console.log("3333")
                                      userChildModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1},function(err,uUpdateChild){
                                        callback2()  
                                      })
                                    }
                                    
                                  }
                                })
                              }
                            
                          }

                        }
                      })
                    }
                    else
                    {
                      if(aData.child.length  == y)
                      {
                       

                        userChildModel.findOne({where:{id:fields.id}},function(errr,uchildInfo){
                          if(err)
                          {
                            console.log(err)
                          }
                          else
                          {
                            if(fields.id == aData.winner)
                            {
                              console.log("4444",uchildInfo)
                              userChildModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1,games_won:parseInt(uchildInfo.games_won)+1},function(err,uUpdateChild){
                                callback(null, 0); 
                              })
                              
                            }
                            else
                            {
                              console.log("3333")
                              userChildModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1},function(err,uUpdateChild){
                                callback(null, 0);  
                              })
                            }
                            
                          }
                        })
                      }
                      else
                      {
                        userChildModel.findOne({where:{id:fields.id}},function(errr,uchildInfo){
                          if(err)
                          {

                          }
                          else
                          {
                            if(fields.id == aData.winner)
                            {
                              
                              userChildModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1,games_won:uchildInfo.games_won+1},function(err,uUpdateChild){
                                callback2()  
                              })
                              
                            }
                            else
                            {
                              console.log("66666")
                              userChildModel.updateAll({id:fields.id},{games_played:uchildInfo.games_played+1},function(err,uUpdateChild){
                                callback2()  
                              })
                            }
                            
                          }
                        })
                      }
                    }
                }
              })
            })
          },
          
        ], function (err, result)
        {
          if(err)
          {
            cb(null,{status:"fail",message:"Error while getting error",error:err})
          }
          else
          {
            cb(null,{status:"success",message:"Updated"});
          }
        });
      })
      // }
      // else
      // {
      //   cb(null,{status:"fail",message:"AccessToken Error"});
      // }
   }catch(e)
   {
     cb(null,{status:"fail",message:"Exception Error"+e});
   }
 }

 Usergames.remoteMethod(
     'saveGamesDetails', {
       accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
       returns: [{arg: 'data',type: 'Object'}],
       http: {path: '/saveGamesDetails',verb: 'post'}
     });     
  };

/* ==================== Check team name  ================= */

function checkTeamName(aData) {
  return new Promise(function(resolve, reject)
  {
    let userTeamModel = app.models.user_teams;
    userTeamModel.findOne({where:{user_id:aData.userId,teamName:aData.teamName}},function(err,userTeamInfo)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        if(userTeamInfo)
        {
          let obj = {status:1,message:"TeamName already exist. Please Delete the team first"};
          resolve(obj);
        }
        else
        {
          let obj = {status:0};
          resolve(obj);
        }
      }
    })
  });
}

function checkUpdateTeamName(aData) {
  return new Promise(function(resolve, reject)
  {
    let userTeamModel = app.models.user_teams;

      userTeamModel.findOne({where:{user_id:aData.userId,teamName:aData.teamName}},function(err,userTeamInfo)
      {
        if(err)
        {
          reject(err);
        }
        else
        {
	  console.log(userTeamInfo);

	  //console.log(aData);

          if(userTeamInfo)
          {
            if(userTeamInfo.id != aData.teamId)
            {
              let obj = {status:1,message:"TeamName already exist. Please Delete the team first"};
              resolve(obj);
            }
            else
            {
              let obj = {status:0};
              resolve(obj);
            }
          }
          else
          {
            let obj = {status:0};
            resolve(obj);
          }
        }
      })

  });
}

/* ==================== Set Team Info ==================== */

function setTeamInfo(aData) {
  return new Promise(function(resolve, reject)
  {
    let userTeamModel = app.models.user_teams;
    let userTeamChildModel = app.models.user_team_childs;
    let teamList = aData.userList.split(",");
    userTeamModel.create({user_id:aData.userId,teamName:aData.teamName,logoId:aData.logoId,status:1,created:new Date(),modified:new Date()},function(err,userTeamInfo)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        for(let i=0;i<teamList.length;i++)
        {
          userTeamChildModel.create({user_team_id:userTeamInfo.id,user_child_id:teamList[i],status:1,created:new Date(),modified:new Date()},function(err,data)
          {})
        }
        resolve("Team successfully created ");
      }
    })
  });
}

/* =================== Update Team info ================== */

function updateTeamInfo(aData) {
  return new Promise(function(resolve, reject)
  {
    console.log("userData=====",aData);
    let userTeamModel = app.models.user_teams;
    let userTeamChildModel = app.models.user_team_childs;
    let teamList = aData.userList.split(",");
	 //console.log("TeamList");
    if(aData.teamId != null)
    {
      userTeamModel.updateAll({id:parseInt(aData.teamId)},{teamName:aData.teamName,logoId:aData.logoId,modified:new Date()},function(err,userTeamInfo)
      {
        if(err)
        {
          reject(err);
        }
        else
        {
          userTeamChildModel.destroyAll({user_team_id:parseInt(aData.teamId)},function(err,teamDelete)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              for(let i=0;i<teamList.length;i++)
              {
                userTeamChildModel.create({user_team_id:aData.teamId,user_child_id:teamList[i],status:1,created:new Date(),modified:new Date()},function(err,data)
                {
  		              console.log("Error",err);
  	             })
              }
              resolve(" Team updated successfully ");
            }
          })
        }
      })
    }
    else
    {
      reject("Team id not found");
    }
  });
}