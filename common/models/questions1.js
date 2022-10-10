'use strict';
var app = require('../../server/server');
var loopback =  require('loopback');
let randomstring = require("randomstring");
var path = require('path');
let serverUrl = require('../js/config');
let async = require("async");

module.exports = function(Questions)
{
  /* ========= Question asked for user ========= */

  Questions.getQuestions = function (req, cb)
  {
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
    //let aData = reqObject.body.data;
    if(reqObject.accessToken)
    {
      async.waterfall([
        function(callback) {
          getUserScoreInfo(aData).then(function(gameInfo)
          {
            //console.log("game Info >>>>>>>>>>>>>",gameInfo);
            callback(null, gameInfo);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(gameInfo, callback)
        {
          getUniqueSubCategory(aData,gameInfo).then(function(subCategory)
          {
            callback(null, gameInfo,subCategory);
          })
          .catch(function(err)
          {
            callback(err);
          })
        },
        function(gameInfo,subCategory, callback)
        {
          getUniqueQuestion(aData,gameInfo,subCategory).then(function(uniqueQuestion)
          {
            callback(null,uniqueQuestion);
          })
          .catch(function(err)
          {
            callback(err);
          })
        }
    ], function (err, result)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Error while getting error",error:err})
      }
      else
      {
        cb(null,{status:"success",data:result})
      }
    });
  }
  else
  {
    cb(null,{status:"fail",message:"AccessToken Error"});
  }
  }

  Questions.remoteMethod(
      'getQuestions', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getQuestions',verb:'post'}
      });

  /* ========= Question asked for user (Socket) ========= */

  Questions.setAnswer = function (req, cb)
  {
    let reqObject = req.res.req;
    //let aData = JSON.parse(reqObject.body.data);
    let aData = reqObject.body.data;
    let userScoreModel =  app.models.user_score;

    if(reqObject.accessToken)
    {
      userScoreModel.findOne({where:{user_game_id:aData.gameId,user_child_id:aData.childId}},function(err,userScoreInfo)
      {
        if(err)
        {
          cb(null,{status:"fail",message:"Error Occured While Getting user Score info"})
        }
        else
        {
          if(userScoreInfo)
          {
            let timeConsumed ;
            if(userScoreInfo.individualTimeConsumed ==  null)
            {
              timeConsumed = aData.timeTaken;
            }
            else
            {
              timeConsumed = userScoreInfo.individualTimeConsumed +','+ aData.timeTaken;
            }

            userScoreInfo.updateAttributes({questionCorrect: aData.answerGiven,TotalTimeConsumed:userScoreInfo.TotalTimeConsumed + aData.timeTaken,individualTimeConsumed:timeConsumed
            }, function(err, userInstance)
            {
              if(err)
              {
                cb(null,{status:"fail",message:"Error while updating score"});
              }
              else
              {
                cb(null,{status:"success",message:"user score info updated"});
              }
            });
          }
          else
          {
            cb(null,{status:"fail",message:"user not found"});
          }
        }
      })
    }
    else
    {
      cb(null,{status:"fail",message:"AccessToken Error"});
    }
  }

  Questions.remoteMethod(
      'setAnswer', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/setAnswer',verb:'post'}
      });


  Questions.finalRound = function (req, cb)
  {
    let reqObject = req.res.req;
    //let aData = JSON.parse(reqObject.body.data);
    //let aData = reqObject.body.data;

    let aData = {userId:4,gameId:3,}

    if(reqObject.accessToken)
    {
      async.waterfall([
        function(callback) {
          getUserScoreInfo(aData).then(function(gameInfo)
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
          getfinalSubcategory(aData,gameInfo).then(function(subCategory)
          {
            callback(null, gameInfo,subCategory);
          })
          .catch(function(err)
          {
            callback(err);
          })
        },
        function(gameInfo,subCategory, callback)
        {
          getUniqueQuestion(aData,gameInfo,subCategory).then(function(uniqueQuestion)
          {
            callback(null,uniqueQuestion);
          })
          .catch(function(err)
          {
            callback(err);
          })
        }
    ], function (err, result)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Error while getting error",error:err})
      }
      else
      {
        cb(null,{status:"success",data:result})
      }
    });
  }
  else
  {
    cb(null,{status:"fail",message:"AccessToken Error"});
  }
  }

  Questions.remoteMethod(
      'finalRound', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/finalRound',verb:'post'}
      });
};

  /* ==================== Get User Score Data  =================   */

  /* ==================== Get User Score Data  =================   */

  function getUserScoreInfo(aData) {
  return new Promise(function(resolve, reject)
  {
    let userScoreModel = app.models.user_score;
    let userGamesModel = app.models.user_games;
    userGamesModel.findOne({where:{id:aData.gameId},fields:{id:true,questionAsked:true,pack_Id:true,gameType:true}},function(err,userGameInfo)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        if(userGameInfo.gameType == 1)
        {
          userScoreModel.findOne({include:"user_childs",where:{user_game_id:aData.gameId,user_child_id:aData.userId}},function(err,userScoreData)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              console.log("UserInfo ",userScoreData);

              if(userScoreData)
              {
                let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null,questionAskedCount:userScoreData.questionAskedCount,ageId:null,countryId:null};

                gameInfo.questionsAsked = userGameInfo.questionAsked;
                gameInfo.packageId = userGameInfo.pack_Id;
                gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
                gameInfo.countryId = userScoreData.toJSON().user_childs.country_id;
                resolve(gameInfo);
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
        userScoreModel.findOne({include:[{user_teams:{user_team_childs:'user_childs'}}],where:{user_game_id:aData.gameId,user_child_id:aData.userId}},function(err,userScoreData)
        {
          if(err)
          {
            reject(err);
          }
          else
          {
            if(userScoreData)
            {

                console.log("UserInfo >>>>>>>>>>>>>>>>",userScoreData);
              let xyz = userScoreData.toJSON().user_teams.user_team_childs;
              let ageArray = [];
              for(let i=0;i<xyz.length;i++)
              {
                ageArray.push(xyz[i].user_childs.age_id);
              }
              let randomSubCate = random_item(ageArray);

              let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null,questionAskedCount:userScoreData.questionAskedCount,ageId:null,countryId:null};

              gameInfo.questionsAsked = userGameInfo.questionAsked;
              gameInfo.packageId = userGameInfo.pack_Id;
              gameInfo.ageId = randomSubCate;
              gameInfo.countryId = xyz[0].user_childs.country_id;
              resolve(gameInfo);
            }
            else
            {
              reject(0);
            }
          }
        })
      }
      }
    })
  });
  }

  /* ====================  Get Unique Sub category  =================   */

  function getUniqueSubCategory(aData,gameInfo)
  {
    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    return new Promise(function(resolve, reject)
    {
      let packID = gameInfo.packageId.split(',');

      ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND id NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+') AND age = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+'', function (err, subCategory)
      {
        if(err)
        {
          reject(err);
        }
        else
        {

          if(subCategory)
          {
            if(subCategory.length > 0)
            {
              let randomSubCate = random_item(subCategory)
              if(randomSubCate)
                resolve(randomSubCate)
            }
            else
            {
              let userGamesModel = app.models.user_games;
              userGamesModel.updateAll({id:aData.gameId},{questionAsked:0},function(err,data){
                if(err)
                {
                  cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                }
                else
                {
                  gameInfo.questionsAsked = '0';
                  ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND id NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+')  AND age = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+'', function (err, subCategory)
                  {
                    if(err)
                    {
                      reject(err);
                    }
                    else
                    {
                      if(subCategory)
                      {
                        let randomSubCate = random_item(subCategory)
                        if(randomSubCate)
                          resolve(randomSubCate)
                      }
                    }
                  })
                }
              })
            }
          }
          else
          {
            reject(0);
          }
        }
      })
    });
  }

  /* ============ Final ================= */

  function getfinalSubcategory(aData,gameInfo)
  {
    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    return new Promise(function(resolve, reject)
    {
      let packID = gameInfo.packageId.split(',');

      ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE id NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+') AND age = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+'', function (err, subCategory)
      {
        if(err)
        {
          reject(err);
        }
        else
        {

          console.log(subCategory);
          // if(subCategory)
          // {
          //   if(subCategory.length > 0)
          //   {
          //     let randomSubCate = random_item(subCategory)
          //     if(randomSubCate)
          //       resolve(randomSubCate)
          //   }
          //   else
          //   {
          //     let userGamesModel = app.models.user_games;
          //     userGamesModel.updateAll({id:aData.gameId},{questionAsked:0},function(err,data){
          //       if(err)
          //       {
          //         cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
          //       }
          //       else
          //       {
          //         gameInfo.questionsAsked = '0';
          //         ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE id NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+')  AND age = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+'', function (err, subCategory)
          //         {
          //           if(err)
          //           {
          //             reject(err);
          //           }
          //           else
          //           {
          //             if(subCategory)
          //             {
          //               let randomSubCate = random_item(subCategory)
          //               if(randomSubCate)
          //                 resolve(randomSubCate)
          //             }
          //           }
          //         })
          //       }
          //     })
          //   }
          // }
          // else
          // {
          //   reject(0);
          // }
        }
      })
    });
  }

  /* ==================== Get Unique Questions =======================*/

  function getUniqueQuestion(aData,gameInfo,subCategory)
  {
    return new Promise(function(resolve, reject)
    {
      let questionAlAsked = gameInfo.questionsAsked.split(',');
      let notIn = {nin:questionAlAsked};
      let questions =  app.models.questions;
      let userScoreModel = app.models.user_score;
      let userGameModel = app.models.user_games;
      questions.find({where:{category_id:aData.categoryId,age:gameInfo.ageId,region:gameInfo.countryId,sub_category_id:subCategory.sub_category_id,id:notIn,pack_ID:{inq:{packID}} },fields:{time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true}},function(err,questionData)
      {
          if(err)
          {
            reject(err);
          }
          else
          {
            if(questionData.length > 0)
            {
              let ranQuestion =random_item(questionData)
              let questionSaved ;
              questionSaved = gameInfo.questionsAsked+','+ranQuestion.id;

               userScoreModel.updateAll({id:gameInfo.id},{questionAskedCount:gameInfo.questionAskedCount + 1},function(err,updateScore){
                if(err)
                {
                  reject(err);
                }
                else
                {
                  userGameModel.updateAll({id:aData.gameId},{questionAsked:questionSaved},function(err,updateScore){
                    if(err)
                    {
                      reject(err);
                    }
                    else
                    {
                      resolve(ranQuestion);
                    }
                  })
                }
              })
            }
            else
            {
              //console.log("helllllllllllllllllllllllll >>>>>>>>>>> ");
              //repeatQuestion(aData,gameInfo,subCategory)
              reject(0);
            }
          }
      })
    })
  }

  /**/

  function getFinalRoundQuestions(aData,gameInfo,subCategory)
  {
    return new Promise(function(resolve, reject)
    {
      let questionAlAsked = gameInfo.questionsAsked.split(',');
      let notIn = {nin:questionAlAsked};
      let questions =  app.models.questions;
      let userScoreModel = app.models.user_score;
      let userGameModel = app.models.user_games;
      questions.find({where:{category_id:aData.categoryId,age:gameInfo.ageId,region:gameInfo.countryId,id:notIn,pack_ID:{inq:{packID}} },fields:{time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true}},function(err,questionData)
      {
          if(err)
          {
            reject(err);
          }
          else
          {
            if(questionData.length > 0)
            {
              let ranQuestion =random_item(questionData)
              let questionSaved ;
              questionSaved = gameInfo.questionsAsked+','+ranQuestion.id;

               userScoreModel.updateAll({id:gameInfo.id},{questionAskedCount:gameInfo.questionAskedCount + 1},function(err,updateScore){
                if(err)
                {
                  reject(err);
                }
                else
                {
                  userGameModel.updateAll({id:aData.gameId},{questionAsked:questionSaved},function(err,updateScore){
                    if(err)
                    {
                      reject(err);
                    }
                    else
                    {
                      resolve(ranQuestion);
                    }
                  })
                }
              })
            }
            else
            {
              //console.log("helllllllllllllllllllllllll >>>>>>>>>>> ");
              //repeatQuestion(aData,gameInfo,subCategory)
              reject(0);
            }
          }
      })
    })
  }

  /* getting Random subCategory / Category*/

  function random_item(items)
  {
    return items[Math.floor(Math.random()*items.length)];
  }

  /* ================ repeat Question ====================== */

  function repeatQuestion(aData,gameInfo,subCategory)
  {
    let userGamesModel = app.models.user_games;
    userGamesModel.updateAll({id:aData.gameId},{questionAsked:0},function(err,data){
      if(err)
      {
        console.log(err);
        cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
      }
      else
      {
        console.log("HHHHHHHHHHHHHHHHHHHHHHHHHH");
        gameInfo.questionsAsked = '0';
        getUniqueSubCategory(aData,gameInfo,subCategory);
      }
    })
  }
