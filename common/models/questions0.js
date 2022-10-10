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
      //let aData = JSON.parse(reqObject.body.data);
      let aData = reqObject.body.data;
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
                console.log(err);
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

};

  /* ==================== Get User Score Data  =================   */

function getUserScoreInfo(aData)
{
  return new Promise(function(resolve, reject)
  {
    let userScoreModel = app.models.user_score;
    let userGamesModel = app.models.user_games;
    userScoreModel.findOne({include:"user_childs",where:{user_game_id:aData.gameId,user_child_id:aData.userId},fields:{id:true,pubQuizQuestion:true,backToSchoolQuestion:true,iQQuestion:true,soundNMusicQuestion:true,tvFilmBookQuestion:true,theNewsQuestion:true,questionAskedCount:true}},function(err,userScoreData)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        if(userScoreData)
        {
          let gameInfo = {id:userScoreData.id,questionsAsked:null,questionAskedCount:userScoreData.questionAskedCount};
          userGamesModel.findOne({where:{id:aData.gameId},fields:{id:true,questionAsked:true}},function(err,userGameInfo)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              gameInfo.questionsAsked = userGameInfo.questionAsked;
              resolve(gameInfo);
            }
          })
        }
        else
        {
          reject(0);
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
    ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND id NOT IN ('+gameInfo.questionsAsked+')', function (err, subCategory)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        if(subCategory)
        {
          resolve(subCategory)
        }
        else
        {
          reject(0);
        }
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
    questions.findOne({where:{category_id:aData.categoryId,sub_category_id:subCategory[0].sub_category_id,id:notIn },fields:{time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true}},function(err,questionData)
    {
        if(err)
        {
          reject(err);
        }
        else
        {
          if(questionData)
          {

            let questionSaved ;
            questionSaved = gameInfo.questionsAsked+','+questionData.id;

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
                    resolve(questionData);
                  }
                })
              }
            })

          }
          else
          {
            reject(0);
          }
        }
    })
  })
}
