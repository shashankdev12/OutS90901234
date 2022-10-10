'use strict';
var app = require('../../server/server');
var loopback =  require('loopback');
let randomstring = require("randomstring");
var path = require('path');
let serverUrl = require('../js/config');
let async = require("async");

module.exports = function(Questions)
{

  /* ========= Question asked for free play ========= */

  Questions.getFreeplayQuestion = function (req, cb) {
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
    // let aData = reqObject.body.data;
    let deviceId = aData.deviceId;
	console.log("ok",aData);

    let subCategoryModel = app.models.sub_categories;
    subCategoryModel.find({ where: { category_id: aData.categoryId } }, function (err, subCategories) {
      if (err) {
        cb(null, { status: "fail", message: "Error in finding subcategory" + err })
      }
      else {
        let ranSubcategory = random_item(subCategories);
        console.log("ran sub ", ranSubcategory);
        Questions.find({ where: { category_id: aData.categoryId, pack_ID: 0,age_id:parseInt(aData.ageId),region:parseInt(aData.countryId) }, fields: { time_Allowed: true, question: true, answer1: true, answer2: true, answer3: true, answer4: true, correct_Answer: true, id: true, image_URL: true, video_URL: true, sound_URL: true, fileType: true, time_Allowed: true, questionGroupId: true,creditBy:true} }, function (err, questionData) {
          if (err) {
            cb(null, { status: "fail", message: "Error in finding question" + err })
          }
          else {
	console.log(questionData);
            if (questionData.length > 0) {
              let ranQuestion = random_item(questionData);
	console.log(ranQuestion);
              cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })
            }
            else {
              cb(null, { status: "success", message: "Question list is null" })
            }
          }
        })
      }
    });
   
  }

  Questions.remoteMethod(
    'getFreeplayQuestion', {
      accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
      returns: [{arg: 'data',type: 'Object'}],
      http: {path: '/getFreeplayQuestion',verb: 'post'}
  });
  /* ========= Question asked for user ========= */

  Questions.getQuestions = function (req, cb)
  {

    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);

    //let aData = {gameId:1,categoryId:1,userId:1};
    console.log("data=========================",aData);

console.log("data6666666666=========================",reqObject.accessToken.userId);

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
	    if(uniqueQuestion == 0) {
              getUniqueQuestion(aData,gameInfo,subCategory).then(function(newUniqueQuestion)
              {
                callback(null,newUniqueQuestion);
              });
            }
            else {
              console.log("success in 3rd");
              callback(null,uniqueQuestion);
            }          
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
    let aData = JSON.parse(reqObject.body.data);
    //let aData = reqObject.body.data;
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

  /* ===================== Final round questions======================== */

  Questions.finalRound = function (req, cb)
  {
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
    //let aData = {gameId:1,categoryId:1,userId:1};
    //let aData = reqObject.body.data;

    //let aData = {userId:4,gameId:3}

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
          getFinalRoundQuestions(aData,gameInfo).then(function(uniqueQuestion)
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
              //console.log("UserInfo ",userScoreData);

              if(userScoreData)
              {
                let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null,questionAskedCount:userScoreData.questionAskedCount,ageId:null,countryId:null};

                gameInfo.questionsAsked = userGameInfo.questionAsked;
                gameInfo.packageId = userGameInfo.pack_Id;
                gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
                gameInfo.countryId = userScoreData.toJSON().user_childs.country_id;

                //console.log("gameMode",gameInfo);

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

      ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+') AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' limit 100', function (err, subCategory)
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
                  ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND id NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+')  AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' limit 100', function (err, subCategory)
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
      ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE id NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+') AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+'', function (err, subCategory)
      {
        if(err)
        {
          reject(err);
        }
        else
        {
          //console.log(subCategory);
          if(subCategory)
          {
            if(subCategory.length > 0)
            {
              let subCategoryId=[];
              for(let i =0;i<subCategory.length;i++)
              {
                subCategoryId.push(subCategory[i].sub_category_id)
              }
              //console.log(subCategoryId);
              let randomSubCate = shuffleArray(subCategoryId)
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
                  ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE id NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+')  AND age = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+'', function (err, subCategory)
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

  /* ==================== Get Unique Questions =======================*/

function getUniqueQuestion(aData, gameInfo, subCategory) {
  return new Promise(function (resolve, reject) {
    let questionAlAsked = gameInfo.questionsAsked.split(',');
    console.log("questionAlAsked ", questionAlAsked, "gameInfo ", gameInfo);
    // let notIn = {nin:questionAlAsked};
    let questions = app.models.questions;
    let userScoreModel = app.models.user_score;
    let userGameModel = app.models.user_games;
    let packID = gameInfo.packageId.split(',');

    let packIn = { inq: packID }
    console.log(packIn, aData);

    let ds1 = userGameModel.dataSource;
    ds1.connector.query('SELECT user_games.id, questionAsked, user_id, user_child_id FROM user_games LEFT JOIN user_score ON user_score.user_game_id = user_games.id WHERE user_score.user_child_id = ' + aData.userId + ';', function (err, returnedDetails) {
      let totalQuestionsString = '';
      if (err) {
        reject(err);
      }
      else {
        console.log("returnedDetails ", returnedDetails);
        for (let i = 0; i < returnedDetails.length; i++) {
          if (returnedDetails[i].questionAsked != '') {
            if (totalQuestionsString.length == 0) {
              totalQuestionsString += returnedDetails[i].questionAsked;
            }
            else {
              totalQuestionsString += ',' + returnedDetails[i].questionAsked;
            }
          }
        }
        var questionsParsedIntoArray = totalQuestionsString.split(',').map(function (item) {
          return parseInt(item, 10);
        });
        let notIn = { nin: questionsParsedIntoArray };
        questions.find({ where: { category_id: aData.categoryId, age_id: gameInfo.ageId, region: gameInfo.countryId, sub_category_id: subCategory.sub_category_id, questionGroupId: notIn, pack_ID: packIn }, fields: { time_Allowed: true, question: true, answer1: true, answer2: true, answer3: true, answer4: true, correct_Answer: true, id: true, image_URL: true, video_URL: true, sound_URL: true, fileType: true, time_Allowed: true, questionGroupId: true, creditBy: true } }, function (err, questionData) {
          if (err) {
            reject(err);
          }
          else {
            if (questionData.length > 0) {
              let ranQuestion = random_item(questionData);
              let questionSaved;
              questionSaved = gameInfo.questionsAsked + ',' + ranQuestion.questionGroupId;
              userGameModel.updateAll({ id: aData.gameId }, { questionAsked: questionSaved }, function (err, updateScore) {
                if (err) {
                  reject(err);
                }
                else {
                  resolve(ranQuestion);
                }
              })
            }
            else {
              console.log("length is 0");
              ds1.connector.query("UPDATE user_games LEFT JOIN user_score ON user_score.user_game_id = user_games.id SET user_games.questionAsked = 0 WHERE user_score.user_child_id = " + aData.userId + ";", function (err, returnedDetails) {
                if (err) {
                  reject(err);
                }
                else {
                  resolve(0);
                }
              })
            }
          }
        });
      }
    });
  });
}


 /* function getUniqueQuestion(aData,gameInfo,subCategory)
  {
    return new Promise(function(resolve, reject)
    {
      let questionAlAsked = gameInfo.questionsAsked.split(',');
      //console.log(questionAlAsked);
      let notIn = {nin:questionAlAsked};
      let questions =  app.models.questions;
      let userScoreModel = app.models.user_score;
      let userGameModel = app.models.user_games;
      let packID = gameInfo.packageId.split(',');

      let packIn = {inq:packID}
      console.log(packIn);
      console.log(notIn);
      questions.find({where:{category_id:aData.categoryId,age_id:gameInfo.ageId,region:gameInfo.countryId,sub_category_id:subCategory.sub_category_id,questionGroupId:notIn,pack_ID:packIn },fields:{time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true}},function(err,questionData)
      {
          if(err)
          {
            reject(err);
          }
          else
          {
            //console.log("Question",)
            if(questionData.length > 0)
            {
              let ranQuestion =random_item(questionData);
              let questionSaved ;
              questionSaved = gameInfo.questionsAsked+','+ranQuestion.questionGroupId;
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
            else
            {
              reject(0);
            }
          }
      })
    })
  }
*/

  /* Get 9 Questions */

  function getFinalRoundQuestions(aData,gameInfo)
  {
    //console.log("data",gameInfo.questionsAsked);
    return new Promise(function(resolve, reject)
    {
      let questionAlAsked = gameInfo.questionsAsked.split(',');
      let notIn = {nin:questionAlAsked};
      let questions =  app.models.questions;
      let userScoreModel = app.models.user_score;
      let userGameModel = app.models.user_games;
      let packID = gameInfo.packageId.split(',');
      let packIn = {inq:packID}

      questions.count({age_id:gameInfo.ageId,region:gameInfo.countryId,id:notIn,fileType:0,pack_ID:packIn },function(err,questionDataCount)
      {
        //console.log(questionDataCount);
        let countRound = Math.floor(questionDataCount/25);
        let skip = Math.floor(Math.random() * (countRound-1));

        if(questionDataCount > 9)
        {
          let condition={};
          if(skip > 0)
          {
            condition ={limit:"25",limit:"25",skip: skip,where:{age_id:gameInfo.ageId,region:gameInfo.countryId,questionGroupId:notIn,fileType:0,pack_ID:packIn },fields:{category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,pack_ID:true,questionGroupId:true}}
          }
          else
          {
            condition ={limit:"25",where:{age_id:gameInfo.ageId,region:gameInfo.countryId,id:notIn,fileType:0,pack_ID:packIn },fields:{category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,pack_ID:true,questionGroupId:true}};
          }

          questions.find(condition,function(err,questionData)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              let ranQuestion =shuffleArray(questionData)
              let questionSaved="",questionToServe=[] ;
              for(let i=0;i<9;i++)
              {
                if(i == 0)
                {
                  questionSaved =ranQuestion[i].questionGroupId;
                }
                else
                {
                  questionSaved = questionSaved+','+ranQuestion[i].questionGroupId;
                }

                questionToServe.push(ranQuestion[i]);
              }

              questionSaved = gameInfo.questionsAsked+','+questionSaved;
               userGameModel.updateAll({id:aData.gameId},{questionAsked:questionSaved},function(err,updateScore){
                if(err)
                {
                  reject(err);
                }
                else
                {
                  resolve(questionToServe);
                }
              })
            }
          })
        }
        else
        {
          let condition={};
          if(skip > 0)
          {
            condition ={limit:"25",skip: skip,where:{age_id:gameInfo.ageId,region:gameInfo.countryId,fileType:0 },fields:{category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true}}
          }
          else
          {
            condition ={limit:"25",where:{age_id:gameInfo.ageId,region:gameInfo.countryId,fileType:0 },fields:{category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true}};
          }
            questions.find(condition,function(err,questionData)
            {
              if(err)
              {
                reject(err);
              }
              else
              {
                if(questionData.length > 9)
                {
                  let ranQuestion =shuffleArray(questionData)
                  let questionSaved="",questionToServe=[] ;
                  for(let i=0;i<9;i++)
                  {
                    questionSaved =ranQuestion[i].id;
                    questionToServe.push(ranQuestion[i]);
                  }

                  questionSaved = gameInfo.questionsAsked+','+questionSaved;
                   userGameModel.updateAll({id:aData.gameId},{questionAsked:questionSaved},function(err,updateScore){
                    if(err)
                    {
                      reject(err);
                    }
                    else
                    {
                      resolve(questionToServe);
                    }
                  })
                }
                else
                {
                  reject("Not Enough Questions");
                }
              }
            })
        }

      })

    })


  }

  /* getting Random subCategory / Category*/

  function random_item(items)
  {
    //console.log(items.length);
    //console.log(items[Math.floor(Math.random()*items.length)]);
    return items[Math.floor(Math.random()*items.length)];
  }

  /**/

  function shuffleArray ( array ) {
    var temp = [];
    var len=array.length;
    while(len){
      temp.push(array.splice(Math.floor(Math.random()*array.length),1)[0]);
      len--;
    }

    //console.log(temp);
    return temp;
    //return array;
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
