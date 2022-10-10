'use strict';
var app = require('../../server/server');
var loopback =  require('loopback');
let randomstring = require("randomstring");
var path = require('path');
let serverUrl = require('../js/config');
let async = require("async");
const fs = require('fs')
var AWS = require('aws-sdk');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

AWS.config.loadFromPath('/home/ubuntu/boardGameTest/board_game/server/aws_config.json');

module.exports = function(Questions)
{
  /* ========= Question asked for free play ========= */
  
  Questions.getFreeplayQuestion = function (req, cb) {
    let reqObject = req.res.req;
    
    let aData = JSON.parse(reqObject.body.data);
    //let aData = {deviceId:"ssss",categoryId:1,ageId:3,countryId:4}
    let deviceId = aData.deviceId;
    let userFreeQuestionModel =  app.models.free_play_user_questions;
    let subCategoryModel = app.models.sub_categories;
    //console.log("aData------------------------------",aData);
    userFreeQuestionModel.findOne({where:{deviceToken :deviceId}},function(err,userFreeQuestions){
      if(err)
      {
        cb(null,{status:"failure1"})
      }
      else
      {
        if(userFreeQuestions)
        {
          subCategoryModel.find({ where: { category_id: aData.categoryId } }, function (err, subCategories) {
            if (err) {
              cb(null, { status: "fail", message: "Error in finding subcategory" + err })
            }
            else
            {
              let questionAlAsked = userFreeQuestions.questionAsked.split(',');
              
              //console.log(questionAlAsked);
              let notIn = {nin:questionAlAsked};
              
              
              let ranSubcategory = random_item(subCategories);
              Questions.find({ where: { category_id: aData.categoryId, pack_ID: 0,age_id:parseInt(aData.ageId),region:parseInt(aData.countryId) ,questionGroupId:notIn,status:0}, fields: { time_Allowed: true, question: true, answer1: true, answer2: true, answer3: true, answer4: true, correct_Answer: true, id: true, image_URL: true, video_URL: true, sound_URL: true, fileType: true, time_Allowed: true, questionGroupId: true,creditBy:true,status:true } }, function (err, questionData) {
                if (err) {
                  cb(null, { status: "fail", message: "Error in finding question" + err })
                }
                else {
                  if (questionData.length > 0) {
                    let ranQuestion = random_item(questionData);
                    let upQuestion  = userFreeQuestions.questionAsked+','+ranQuestion.questionGroupId;
                    
                    userFreeQuestionModel.updateAll({deviceToken:deviceId},{questionAsked:upQuestion},function(err,update)
                    {
                      let path = '';
                      let filePt ;
                      let s3Bucket = new AWS.S3();
                      let param;
                      if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
                      {
                        //path = '../client/'+ranQuestion.image_URL
                        path = ranQuestion.image_URL;
                        filePt= ranQuestion.image_URL.split("/");
                        param={Bucket:'outsmarted/storage/questions/images',Key:filePt[3]}
                      }
                      else if(ranQuestion.fileType == 2)
                      {
                        //path = '../client/'+ranQuestion.sound_URL
                        path = ranQuestion.sound_URL;
                        filePt= ranQuestion.sound_URL.split("/");
                        param={Bucket:'outsmarted/storage/questions/sounds',Key:filePt[3]}
                        
                        
                      }
                      else if(ranQuestion.fileType == 3)
                      {
                        //path = '../client/'+ranQuestion.video_URL;
                        path = ranQuestion.video_URL;
                        filePt= ranQuestion.video_URL.split("/");
                        param={Bucket:'outsmarted/storage/questions/videos',Key:filePt[3]}
                      }
                      //console.log(path);
                      if(path != '')
                      {
                        s3Bucket.headObject(param).on('success', function(response) {
                          if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
					{
					  ranQuestion.fileType=1;
					}
					else if(ranQuestion.fileType == 2)
					{
					  ranQuestion.fileType=2;	
					}
					else if(ranQuestion.fileType == 3)
					{
					  ranQuestion.fileType=3;	
					
					}
			  cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })	
                        }).on('error',function(error){
                          ranQuestion.fileType=0;
			  cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })
                          //error return a object with status code 404
                        }                  ).send()
                        
                        //console.log(fs.existsSync(path));
                        //if (!fs.existsSync(path))
                        //{
                        //ranQuestion.fileType=0;
                        //}
                      }
                      else
                      {
                        ranQuestion.fileType=0;
			cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })
                      }
                      //resolve(ranQuestion);
                      
                      //cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })
                    })
                    
                  }
                  else
                  {
                    userFreeQuestionModel.updateAll({deviceToken:deviceId},{questionAsked:0},function(err,update)
                    {
                      subCategoryModel.find({ where: { category_id: aData.categoryId } }, function (err, subCategories) {
                        if (err) {
                          cb(null, { status: "fail", message: "Error in finding subcategory" + err })
                        }
                        else
                        {
                          let ranSubcategory = random_item(subCategories);
                          Questions.find({ where: { category_id: aData.categoryId, pack_ID: 0,age_id:parseInt(aData.ageId),region:parseInt(aData.countryId),status:0 }, fields: { time_Allowed: true, question: true, answer1: true, answer2: true, answer3: true, answer4: true, correct_Answer: true, id: true, image_URL: true, video_URL: true, sound_URL: true, fileType: true, time_Allowed: true, questionGroupId: true ,creditBy:true,status:true} }, function (err, questionData) {
                            if (err) {
                              cb(null, { status: "fail", message: "Error in finding question" + err })
                            }
                            else {
                              
                              if (questionData.length > 0) {
                                let ranQuestion = random_item(questionData);
                                userFreeQuestionModel.updateAll({deviceToken:deviceId},{questionAsked:ranQuestion.questionGroupId},function(err,update)
                                {
                                  let path = '';
                                  let filePt ;
                                  //let imageFile = data.image_URL.split("/");
                                  
                                  let s3Bucket = new AWS.S3();
                                  
                                  let param;
                                  
                                  
                                  
                                  if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
                                  {
                                    //path = '../client/'+ranQuestion.image_URL
                                    path = ranQuestion.image_URL;
                                    filePt= ranQuestion.image_URL.split("/");
                                    param={Bucket:'outsmarted/storage/questions/images',Key:filePt[3]}
                                  }
                                  else if(ranQuestion.fileType == 2)
                                  {
                                    //path = '../client/'+ranQuestion.sound_URL
                                    path = ranQuestion.sound_URL;
                                    filePt= ranQuestion.sound_URL.split("/");
                                    param={Bucket:'outsmarted/storage/questions/sounds',Key:filePt[3]}
                                    
                                    
                                  }
                                  else if(ranQuestion.fileType == 3)
                                  {
                                    //path = '../client/'+ranQuestion.video_URL;
                                    path = ranQuestion.video_URL;
                                    filePt= ranQuestion.video_URL.split("/");
                                    param={Bucket:'outsmarted/storage/questions/videos',Key:filePt[3]}
                                  }
                                  //console.log(path);
                                  if(path != '')
                                  {
                                    s3Bucket.headObject(param).on('success', function(response) {
                                      if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
					{
					  ranQuestion.fileType=1;
					}
					else if(ranQuestion.fileType == 2)
					{
					  ranQuestion.fileType=2;	
					}
					else if(ranQuestion.fileType == 3)
					{
					  ranQuestion.fileType=3;	
					
					}
				      cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })	
                                    }).on('error',function(error){
                                      ranQuestion.fileType=0;
				      cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })	
                                      //error return a object with status code 404
                                    }                  ).send()
                                    
                                    
                                    //console.log(fs.existsSync(path));
                                    //if (!fs.existsSync(path))
                                    //{
                                    //ranQuestion.fileType=0;
                                    //}
                                  }
                                  else
                                  {
                                    ranQuestion.fileType=0;
				    cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })	
                                  }
                                  
//                                  cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })
                                })
                              }
                              else {
                                cb(null, { status: "success", message: "Question list is null" })
                              }
                            }
                          })
                        }
                      });
                    })
                    //cb(null, { status: "success", message: "Question list is null" })
                  }
                }
              })
            }
          });
        }
        else
        {
          userFreeQuestionModel.create({deviceToken:deviceId,questionsAsked:0,status:1,questionAsked:0,created:new Date(), modified:new Date()},function(err,newEntry)
          {
            if(err)
            {
              cb(null,{status:"failure2"+err})
            }
            else
            {
              subCategoryModel.find({ where: { category_id: aData.categoryId } }, function (err, subCategories) {
                if (err) {
                  cb(null, { status: "fail", message: "Error in finding subcategory" + err })
                }
                else
                {
                  let ranSubcategory = random_item(subCategories);
                  Questions.find({ where: { category_id: aData.categoryId, pack_ID: 0,age_id:parseInt(aData.ageId),region:parseInt(aData.countryId),status:0 }, fields: { time_Allowed: true, question: true, answer1: true, answer2: true, answer3: true, answer4: true, correct_Answer: true, id: true, image_URL: true, video_URL: true, sound_URL: true, fileType: true, time_Allowed: true, questionGroupId: true,creditBy:true,status:true } }, function (err, questionData) {
                    if (err) {
                      cb(null, { status: "fail", message: "Error in finding question" + err })
                    }
                    else {
                      
                      if (questionData.length > 0) {
                        let ranQuestion = random_item(questionData);
                        userFreeQuestionModel.updateAll({deviceToken:deviceId},{questionAsked:ranQuestion.questionGroupId},function(err,update)
                        {
                          let path = '';
                          let filePt ;
                          //let imageFile = data.image_URL.split("/");
                          
                          let s3Bucket = new AWS.S3();
                          
                          let param;
                          
                          
                          
                          if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
                          {
                            //path = '../client/'+ranQuestion.image_URL
                            path = ranQuestion.image_URL;
                            filePt= ranQuestion.image_URL.split("/");
                            param={Bucket:'outsmarted/storage/questions/images',Key:filePt[3]}
                          }
                          else if(ranQuestion.fileType == 2)
                          {
                            //path = '../client/'+ranQuestion.sound_URL
                            path = ranQuestion.sound_URL;
                            filePt= ranQuestion.sound_URL.split("/");
                            param={Bucket:'outsmarted/storage/questions/sounds',Key:filePt[3]}
                            
                            
                          }
                          else if(ranQuestion.fileType == 3)
                          {
                            //path = '../client/'+ranQuestion.video_URL;
                            path = ranQuestion.video_URL;
                            filePt= ranQuestion.video_URL.split("/");
                            param={Bucket:'outsmarted/storage/questions/videos',Key:filePt[3]}
                          }
                          //console.log(path);
                          if(path != '')
                          {
                            s3Bucket.headObject(param).on('success', function(response) {
                             if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
					{
					  ranQuestion.fileType=1;
					}
					else if(ranQuestion.fileType == 2)
					{
					  ranQuestion.fileType=2;	
					}
					else if(ranQuestion.fileType == 3)
					{
					  ranQuestion.fileType=3;	
					
					}
			      cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })
                            }).on('error',function(error){
                              ranQuestion.fileType=0;
			      cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })	
                              //error return a object with status code 404
                            }                  ).send()
                            
                            
                            //console.log(fs.existsSync(path));
                            //if (!fs.existsSync(path))
                            //{
                            //ranQuestion.fileType=0;
                            //}
                          }
                          else
                          {
                            ranQuestion.fileType=0;
			    cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })	
                          }
                          //resolve(ranQuestion);
                          
                          
                          
                        })
                      }
                      else {
                        cb(null, { status: "success", message: "Question list is null" })
                      }
                    }
                  })
                }
              });
            }
          })
        }
      }
    })
    
    
    
    
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
      console.log("aData=======================",aData);
      //let aData = {gameId:1001,categoryId:5,userId:796};
      //let aData = {gameId:2008,categoryId:3,userId:1};
      
      // if(reqObject.accessToken)
      // {
        getUserScoreInfo(aData).then(function(gameInfo)
        {
          getUniqueSubCategory(aData,gameInfo).then(function(pack)
          {
            getUniqueQuestion(aData,gameInfo,pack).then(function(newUniqueQuestion)
            {
              cb(null,{status:"success",data:newUniqueQuestion})
            }).catch(function(err)
            {
              
              cb(null,{status:"fail",message:err})
            })
          })
          .catch(function(err)
          {
            cb(null,{status:"fail",message:err})
          })
        })
        .catch(function(err)
        {
          cb(null,{status:"fail",message:err})
        });
      // }
      // else
      // {
      //   //console.log("Acce INside=============");
      //   cb(null,{status:"fail",message:"AccessToken Error"});
      // }
    }
    
    Questions.remoteMethod(
      'getQuestions', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getQuestions',verb:'post'}
      });
      
      
    Questions.getQuestionsTest= function (req, cb)
    {
      
      let reqObject = req.res.req;
      //console.log("------------------------------",reqObject.body);
      //let aData = JSON.parse(reqObject.body.data);
      //console.log("aData=======================",aData);
      let aData = {gameId:1001,categoryId:5,userId:796};
      console.log("Git");
      
      getUserScoreInfo(aData).then(function(gameInfo)
      {
        getUniqueSubCategory(aData,gameInfo).then(function(subCategory)
        {
          getUniqueQuestion(aData,gameInfo,pack).then(function(newUniqueQuestion)
          {
            cb(null,{status:"success",data:newUniqueQuestion})
          }).catch(function(err)
          {
            
            cb(null,{status:"fail1",message:"Error while getting error",error:err})
          })
        })
        .catch(function(err)
        {
          cb(null,{status:"fail2",message:"Error while getting error",error:err})
        })
      })
      .catch(function(err)
      {
        cb(null,{status:"fail3",message:"Error while getting error",error:err})
      });
    }
    
    Questions.remoteMethod(
      'getQuestionsTest', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getQuestionsTest',verb:'post'}
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
      //let aData = {gameId:1,userId:1};
      
      // if(reqObject.accessToken)
      // {
      async.waterfall([
        function(callback) {
          getUserScoreInfoFinal(aData).then(function(gameInfo)
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
          console.log(err);
          cb(null,{status:"fail",message:"Error while getting error",error:err})
        }
        else
        {
          cb(null,{status:"success",data:result})
        }
      });
      // }
      // else
      // {
      //   cb(null,{status:"fail",message:"AccessToken Error"});
      // }
    }
    
    Questions.remoteMethod(
      'finalRound', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/finalRound',verb:'post'}
      });
          
          
    Questions.questionById = function (req, cb)
    {
      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
      //let aData = {questionID:182};
      console.log("=====================Question===============",aData)
      //if(reqObject.accessToken)
      //{
      Questions.findOne({where:{questionGroupId:aData.questionId},fields:{time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}},function(err,data){
        if(err)
        {
          console.log("=============err========",err);
          cb(null,{status:"fail"})
        }
        else
        {
          console.log("data=======================",data);
          cb(null,{status:"success",data:data})
        }
      })
      //}
      //else
      //{
      //cb(null,{status:"fail",message:"AccessToken Error"});
      //}
    }
    
    Questions.remoteMethod(
      'questionById', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/questionById',verb:'post'}
      });
            
            
    Questions.questionByCategory = function (req, cb)
    {
      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
      console.log(aData);
      //let aData = {categoryId:1,age_id:'3',regionId:4,packageID:'1',deviceToken:'YQfDQmsd',fileType:0}
      // if(reqObject.accessToken)
      // {
      getTestUserScoreInfo(aData).then(function(gameInfo)
      {
        getUniqueQuestionUserTest(aData,gameInfo).then(function(newUniqueQuestion)
        {
          cb(null,{status:"success",data:newUniqueQuestion})
        }).catch(function(err)
        {
          cb(null,{status:"fail",message:err})
        })
        
      })
      .catch(function(err)
      {
        cb(null,{status:"fail",message:err})
      });
      // }
      // else
      // {
      //   cb(null,{status:"fail",message:"AccessToken Error"});
      // }
    }
    
    Questions.remoteMethod(
      'questionByCategory', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/questionByCategory',verb:'post'}
      });
                
                
    Questions.setFinalRoundQuestion = function (req, cb)
    {
      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
      let questionModel =  app.models.questions;
      console.log("aData==================",aData)
      let userModel = app.models.user;
      //let aData = {question_id:2,user_id:11}
      if(reqObject.accessToken)
      {
        if((aData.user_id != '') || (aData.user_id != null))
        {
          userModel.findOne({where:{id:parseInt(aData.user_id)}},function(err,userInfo)
          {
            if(err)
            {
              cb(null,{status:"fail",message:"Error While Getting userinfo"})
            }
            else
            {
		console.log("--------------------------",userInfo);
              if(userInfo)
              {
		console.log("--------------------------",userInfo);
                //questionModel.findOne({where:{id:parseInt(aData.question_id)}},function(err,questionInfo)
                //{
                let questionSaved  = userInfo.FinalRound+','+parseInt(aData.question_id);
		console.log("==========================",questionSaved)

                userModel.updateAll({id:parseInt(aData.user_id)},{FinalRound:questionSaved},function(err,updated)
                {
		
                  if(err)
                  {
                    cb(null,{status:"fail",messsage:"Error While Update"})
                  }
                  else
                  {
                    cb(null,{status:"success",messsage:"Successfully Updated "})
                  }
                })
		//cb(null,{status:"success",messsage:"Successfully Updated "})

                //})
              }
              else
              {
                cb(null,{status:"fail",message:"No user Exist on such Id"})
              }
            }
          })
        }
        else
        {
          cb(null,{status:"fail",message:"Userid is blank"})
        }
      }
      else
      {
        cb(null,{status:"fail",message:"AccessToken Error"});
      }
    }
    
    Questions.remoteMethod(
      'setFinalRoundQuestion', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/setFinalRoundQuestion',verb:'post'}
      });
      
    };
                
    /* ==================== Get User Score Data  =================   */
    
    /* ==================== Get User Score Data  =================   */
    
    function getUserScoreInfo(aData) {
      return new Promise(function(resolve, reject)
      {
        let userScoreModel = app.models.user_score;
        let userModel = app.models.user;
        let userGamesModel = app.models.user_games;
        
        userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo)
        {
          if(err)
          {
            console.log(err);
            reject(err);
          }
          else
          {
            userModel.findOne({where:{id:parseInt(userGameInfo.user_id)}},function(err,userInfo){
            if(userGameInfo.gameType == 1)
            {
                userScoreModel.findOne({include:"user_childs",where:{user_game_id:aData.gameId,user_child_id:aData.userId}},
                function(err,userScoreData)
                {
                  //console.log("userScoreData",userScoreData)
                  if(err)
                  {
                    reject(err);
                  }
                  else
                  {
                    if(userScoreData)
                    {
                      let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null
                        ,questionAskedCount:userScoreData.questionAskedCount,ageId:null,countryId:null
                        ,purchaseStatus:userInfo.purchaseStatus,questionPackRatio:userScoreData.packagesRatio,
                        questionPackCount:userScoreData.packagesCount};
                      
                      //console.log("userInfo.PubQuizQuestionAsked",userInfo.PubQuizQuestionAsked)
                      
                      if(aData.categoryId ==  1)
                      {
                        gameInfo.questionsAsked = userInfo.PubQuizQuestionAsked;
                      }
                      else if(aData.categoryId ==  2)
                      {
                        gameInfo.questionsAsked = userInfo.BKSQuestionAsked;
                      }
                      else if(aData.categoryId ==  3)
                      {
                        gameInfo.questionsAsked = userInfo.QTQuestionAsked;
                      }
                      else if(aData.categoryId ==  4)
                      {
                        gameInfo.questionsAsked = userInfo.SNMQuestionAsked;
                      }
                      else if(aData.categoryId ==  5)
                      {
                        gameInfo.questionsAsked = userInfo.TVBQuestionAsked;
                      }
                      else if(aData.categoryId ==  6)
                      {
                        gameInfo.questionsAsked = userInfo.BKNQuestionAsked;
                      }
                      gameInfo.packageId = userGameInfo.pack_Id;
                      gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
                      gameInfo.countryId = userScoreData.toJSON().user_childs.country_id;
                      
                      //console.log("gameMode=================",gameInfo);
                      
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
                      
                      let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null,questionAskedCount:userScoreData.questionAskedCount,ageId:null,countryId:null,purchaseStatus:userInfo.purchaseStatus};
                      
                      if(aData.categoryId ==  1)
                      {
                        gameInfo.questionsAsked = userInfo.PubQuizQuestionAsked;
                      }
                      else if(aData.categoryId ==  2)
                      {
                        gameInfo.questionsAsked = userInfo.BKSQuestionAsked;
                      }
                      else if(aData.categoryId ==  3)
                      {
                        gameInfo.questionsAsked = userInfo.QTQuestionAsked;
                      }
                      else if(aData.categoryId ==  4)
                      {
                        gameInfo.questionsAsked = userInfo.SNMQuestionAsked;
                      }
                      else if(aData.categoryId ==  5)
                      {
                        gameInfo.questionsAsked = userInfo.TVBQuestionAsked;
                      }
                      else if(aData.categoryId ==  6)
                      {
                        gameInfo.questionsAsked = userInfo.BKNQuestionAsked;
                      }
                      
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
            })
          }
        })
      });
    }
    
    /* ==================== Get Test User Score Data  =================   */
    
    function getTestUserScoreInfo(aData) {
      return new Promise(function(resolve, reject)
      {
        let userTestModel = app.models.test_users;
        userTestModel.findOne({where:{genratedUserName:aData.deviceID}},function(err,usersTestInfo)
        {
          if(err)
          {
            console.log(err);
            reject(err);
          }
          else
          {
            let gameInfo = {id:usersTestInfo.id,questionsAsked:null};
            
            if(aData.categoryId ==  1)
            {
              gameInfo.questionsAsked = usersTestInfo.PubQuizQuestionAsked;
            }
            else if(aData.categoryId ==  2)
            {
              gameInfo.questionsAsked = usersTestInfo.BKSQuestionAsked;
            }
            else if(aData.categoryId ==  3)
            {
              gameInfo.questionsAsked = usersTestInfo.QTQuestionAsked;
            }
            else if(aData.categoryId ==  4)
            {
              gameInfo.questionsAsked = usersTestInfo.SNMQuestionAsked;
            }
            else if(aData.categoryId ==  5)
            {
              gameInfo.questionsAsked = usersTestInfo.TVBQuestionAsked;
            }
            else if(aData.categoryId ==  6)
            {
              gameInfo.questionsAsked = usersTestInfo.BKNQuestionAsked;
            }
            console.log(gameInfo);
            resolve(gameInfo);
          }
        })
      });
    }
    
    /* ==================== Get User Score Data  =================   */
    
    function getUserScoreInfoFinal(aData) {
      return new Promise(function(resolve, reject)
      {
        let userScoreModel = app.models.user_score;
        let userModel = app.models.user;
        let userGamesModel = app.models.user_games;
        
        userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo)
        {
          if(err)
          {
            console.log(err);
            reject(err);
          }
          else
          {
            //console.log("userGameInfo=============",userGameInfo);
            userModel.findOne({where:{id:parseInt(userGameInfo.user_id)}},function(err,userInfo){
              // console.log(userInfo);
              //console.log(userGameInfo);
              if(userGameInfo.gameType == 1)
              {
                userScoreModel.findOne({include:"user_childs",where:{user_game_id:aData.gameId,user_child_id:aData.userId}},function(err,userScoreData)
                {
                  //console.log("userScoreData",userScoreData)
                  if(err)
                  {
                    reject(err);
                  }
                  else
                  {
                    if(userScoreData)
                    {
                      let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null,questionAskedCount:userScoreData.questionAskedCount,ageId:null,countryId:null};
                      
                      //console.log("userInfo.PubQuizQuestionAsked",userInfo.PubQuizQuestionAsked)
                      gameInfo.questionsAsked = userInfo.FinalRound;
                      gameInfo.packageId = userGameInfo.pack_Id;
                      gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
                      gameInfo.countryId = userScoreData.toJSON().user_childs.country_id;
                      
                      // console.log("gameMode=================",gameInfo);
                      
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
                      
                      gameInfo.questionsAsked = userInfo.FinalRound;
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
            })
          }
        })
      });
    }
                
                /* ====================  Get Unique Sub category  =================   */
                
    function getUniqueSubCategory(aData,gameInfo)
    {
      //console.log("================================ Callllll Unique=============");
      let questions =  app.models.questions;
      let userModel =  app.models.user;
      let userScoreModel = app.models.user_score;
      let ds1 = questions.dataSource;
      let userGamesModel = app.models.user_games;

      return new Promise(function(resolve, reject)
      {
        //console.log("dddddddddddddd222",gameInfo.packageId);
        let packID = [];
        packID = gameInfo.packageId.split(',');
        if(packID.length == 1)
        {
            if(gameInfo.purchaseStatus == 0)
            {
                ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND pack_ID = 0 AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' AND status=0 limit 100', function (err, subCategory)
                {
                  if(err)
                  {
                    reject(err);
                  }
                  else
                  {
                  if(subCategory)
                  {
                    //console.log("subCategory=============",subCategory);
                    if(subCategory.length > 0)
                    {
                        resolve(0);
                    }
                    else
                    {
                      console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
                      userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo){
                        if(err)
                        {
                          //console.log(err);
                          cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                        }
                        else
                        {
                          userModel.findOne({where:{id:userGameInfo.user_id}},function(err,userInfoData){
                            if(err)
                            {
                              
                            }
                            else
                            {
                              let updateV;
                              if(aData.categoryId ==  1)
                              {
                                updateV= {PubQuizQuestionAsked:0,PubQuizRepeat:userInfoData.PubQuizRepeat+1}
                              }
                              else if(aData.categoryId ==  2)
                              {
                                updateV= {BKSQuestionAsked:0,BKSRepeat:userInfoData.BKSRepeat+1}
                              }
                              else if(aData.categoryId ==  3)
                              {
                                updateV= {QTQuestionAsked:0,QTRepeat:userInfoData.QTRepeat+1}
                              }
                              else if(aData.categoryId ==  4)
                              {
                                updateV= {SNMQuestionAsked:0,SNMRepeat:userInfoData.SNMRepeat+1}
                              }
                              else if(aData.categoryId ==  5)
                              {
                                updateV= {TVBQuestionAsked:0,TVBRepeat:userInfoData.TVBRepeat+1}
                              }
                              else if(aData.categoryId ==  6)
                              {
                                updateV= {BKNQuestionAsked:0,BKNRepeat:userInfoData.BKNRepeat+1}
                              }
                              
                              userModel.updateAll({id:userGameInfo.user_id},updateV,function(err,data){
                                if(err)
                                {
                                  //console.log(err);
                                  cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                                }
                                else
                                {
                                  gameInfo.questionsAsked = '0';
                                  ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+')  AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' limit 100', function (err, subCategory)
                                  {
                                    if(err)
                                    {
                                      reject(err);
                                    }
                                    else
                                    {
                                      if(subCategory)
                                      {
                                        if(subCategory.length)
                                        {
                                          resolve(0)
                                        }
                                        else
                                        {
                                          resolve({})
                                        }
                                      }
                                    }
                                  })
                                }
                              })
                            }
                          })
                        }
                      })
                    }
                  }
                  else
                  {
                    console.log("Errrrrrrr");
                    reject(0);
                  }
                }
              })
            }
            else
            {
              console.log("222222222222222222222222222222222222222222222222");
              ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND pack_ID = '+packID+' AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' AND status=0 limit 100', function (err, subCategory)
              {
              if(err)
              {
                reject(err);
              }
              else
              {
                if(subCategory)
                {
                  //console.log("subCategory=============",subCategory);
                  if(subCategory.length > 0)
                  {
		      console.log("Paaaaaaaaaaaaaaaaaaaa",packID[0]);
                      resolve(packID[0]);
                  }
                  else
                  {
                    //console.log(11111);
                    let userGamesModel = app.models.user_games;
                    userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo){
                      if(err)
                      {
                        //console.log(err);
                        cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                      }
                      else
                      {
                        userModel.findOne({where:{id:userGameInfo.user_id}},function(err,userInfoData){
                          if(err)
                          {
                            
                          }
                          else
                          {
                            let updateV;
                            if(aData.categoryId ==  1)
                            {
                              updateV= {PubQuizQuestionAsked:0,PubQuizRepeat:userInfoData.PubQuizRepeat+1}
                            }
                            else if(aData.categoryId ==  2)
                            {
                              updateV= {BKSQuestionAsked:0,BKSRepeat:userInfoData.BKSRepeat+1}
                            }
                            else if(aData.categoryId ==  3)
                            {
                              updateV= {QTQuestionAsked:0,QTRepeat:userInfoData.QTRepeat+1}
                            }
                            else if(aData.categoryId ==  4)
                            {
                              updateV= {SNMQuestionAsked:0,SNMRepeat:userInfoData.SNMRepeat+1}
                            }
                            else if(aData.categoryId ==  5)
                            {
                              updateV= {TVBQuestionAsked:0,TVBRepeat:userInfoData.TVBRepeat+1}
                            }
                            else if(aData.categoryId ==  6)
                            {
                              updateV= {BKNQuestionAsked:0,BKNRepeat:userInfoData.BKNRepeat+1}
                            }
                            
                            userModel.updateAll({id:userGameInfo.user_id},updateV,function(err,data){
                              if(err)
                              {
                                //console.log(err);
                                cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                              }
                              else
                              {
                                gameInfo.questionsAsked = '0';
                                ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+')  AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' limit 100', function (err, subCategory)
                                {
                                  if(err)
                                  {
                                    reject(err);
                                  }
                                  else
                                  {
                                    if(subCategory)
                                    {
                                      if(subCategory.length)
                                      {
                                        resolve(packID[0])
                                      }
                                      else
                                      {
                                        resolve({})
                                      }
                                    }
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                }
                else
                {
                  console.log("Errrrrrrr");
                  reject(0);
                }
              }
            })

            }
        }
        else
        {
          console.log("-=-=================Helis is here =======================");
              let packRatio = gameInfo.questionPackRatio.split(',');
              let packRatioCount = gameInfo.questionPackCount.split(',');
              let packID = [];
              //console.log(gameInfo);
              let j=0,k=0,n=0;
              for(let i=0;i<packRatio.length;i++)
              {

                if(packRatio[i] != packRatioCount[i])
                {
                  j=i;
                  break;
                }
                else
                {
                  k++
                }

                if(k == packRatio.length)
                {
                  packRatioCount=[];
                  for(let j=0;j<packRatio.length;j++)
                  {
                    packRatioCount.push(0);
                    if(packRatio.length == j)
                    {
                      i=0;
                    }
                  }
                }
              }

              packID = gameInfo.packageId.split(',');
              console.log(packID);
              console.log(j);

              checkPackCount(aData,gameInfo,packID,j,n).then(function(obbj)
              {
                console.log(obbj)
                //let obj = {iteration:intetrate,packid:packId[intetrate]}
                
                if(packRatioCount[obbj.iteration] == packRatio[obbj.iteration])
                {
                  packRatioCount[obbj.iteration]= 0;
                }
                else
                {
                  packRatioCount[obbj.iteration]= (parseInt(packRatioCount[obbj.iteration])+1).toString();
                }
                  

                packRatioCount.toString();
                userScoreModel.updateAll({user_game_id:aData.gameId},{packagesCount:packRatioCount},
                  function(err,updateScore)
                {
                  //
                  resolve(obbj.packid);
                }) 
              })
              .catch(function(err)
              {
                console.log(err);
                callback(err);
              });

              


          }        
      });
      
    }
    
    /* ============ Final ================= */
    
    function getfinalSubcategory(aData,gameInfo)
    {
      
      let questions =  app.models.questions;
      let ds1 = questions.dataSource;
      return new Promise(function(resolve, reject)
      {
        let packID = [];
        if(gameInfo.purchaseStatus == 0)
        {
          packID = [0];
        }
        else
        {
          packID = gameInfo.packageId.split(',');
        }
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
                let userModel = app.models.user;
                userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo){
                  if(err)
                  {
                    cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                  }
                  else
                  {
                    userModel.updateAll({id:aData.user_id},{questionAsked:0},function(err,data){
                      if(err)
                      {
                        cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                      }
                      else
                      {
                        gameInfo.questionsAsked = '0';
                        ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND pack_ID IN ('+packID+')  AND age = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+'', function (err, subCategory)
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
    
    
    function getUniqueQuestion(aData,gameInfo,pack)
    {

      return new Promise(function(resolve, reject)
      {
        let questionAlAsked = gameInfo.questionsAsked.split(',');
        let notIn = {nin:questionAlAsked};
        let questions =  app.models.questions;
        let userGameModel = app.models.user_games;
        let userModel = app.models.user;
        //let packID = gameInfo.packageId.split(',');
        let condition={};
        console.log("packd ===========<><",pack);
        condition ={where:{category_id:aData.categoryId,age_id:gameInfo.ageId,region:gameInfo.countryId,
              questionGroupId:notIn,pack_ID:pack,status:0 },fields:{time_Allowed:true,
                question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
                video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true,status:true,pack_ID:true}};
          
          questions.find(condition,function(err,questionData)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              if(questionData.length > 0)
              {
                //console.log("00000000000000000000000000000");
                let ranQuestion = random_item(questionData);
                //console.log("questionData============",ranQuestion);
                let questionSaved ;
                questionSaved = gameInfo.questionsAsked+','+ranQuestion.questionGroupId;
                userGameModel.findOne({where:{id:aData.gameId}},function(err,userDetailss){
                  if(err)
                  {
                    reject(err);
                  }
                  else
                  {
                    let updateV;
                    if(aData.categoryId ==  1)
                    {
                      updateV= {PubQuizQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  2)
                    {
                      updateV= {BKSQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  3)
                    {
                      updateV= {QTQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  4)
                    {
                      updateV= {SNMQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  5)
                    {
                      updateV= {TVBQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  6)
                    {
                      updateV= {BKNQuestionAsked:questionSaved}
                    }
                    userModel.updateAll({id:userDetailss.user_id},updateV,function(err,updateScore){
                      if(err)
                      {
                        reject(err);
                      }
                      else
                      {
                        //console.log(ranQuestion);
                        let path = '';
                        let filePt ;
                        //let imageFile = data.image_URL.split("/");
                        
                        let s3Bucket = new AWS.S3();
                        let param;
                        
                        if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
                        {
                          //path = '../client/'+ranQuestion.image_URL
                          path = ranQuestion.image_URL;
                          filePt= ranQuestion.image_URL.split("/");
                          param={Bucket:'outsmarted/storage/questions/images',Key:filePt[3]}
                        }
                        else if(ranQuestion.fileType == 2)
                        {
                          //path = '../client/'+ranQuestion.sound_URL
                          path = ranQuestion.sound_URL;
                          filePt= ranQuestion.sound_URL.split("/");
                          param={Bucket:'outsmarted/storage/questions/sounds',Key:filePt[3]}
                          
                          
                        }
                        else if(ranQuestion.fileType == 3)
                        {
                          //path = '../client/'+ranQuestion.video_URL;
                          path = ranQuestion.video_URL;
                          filePt= ranQuestion.video_URL.split("/");
                          param={Bucket:'outsmarted/storage/questions/videos',Key:filePt[3]}
                        }
                        if(path != '')
                        {

                          s3Bucket.headObject(param).on('success', function(response) {
                            //console.log("kkkkkkkkkkkkk",response)
                            if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
                            {
                              ranQuestion.fileType=1;
                            }
                            else if(ranQuestion.fileType == 2)
                            {
                              ranQuestion.fileType=2;	
                            }
                            else if(ranQuestion.fileType == 3)
                            {
                              ranQuestion.fileType=3;	
                            }                                        
                            
                              resolve(ranQuestion);
                            
                          }).on('error',function(error){
                            ranQuestion.fileType=0;
                              resolve(ranQuestion);
                            //error return a object with status code 404
                        }).send()
                        }
                        else
                        {
                          ranQuestion.fileType=0;
                          
                          
                            resolve(ranQuestion);
                          
                        }
                        //console.log("question=========",ranQuestion);
                        
                      }
                    })
                  }
                })
              }
              else
              {
                reject("Sorry there are no questions in this category. Try another category.");
              }
            }
          })
        
      })
    }
                
    /* Test */
    
    
    function getUniqueQuestionUserTest(aData,gameInfo)
    {
      console.log(1);
      return new Promise(function(resolve, reject)
      {
        let questionAlAsked = gameInfo.questionsAsked.split(',');
        console.log(questionAlAsked);
        let notIn = {nin:questionAlAsked};
        let questions =  app.models.questions;
        let userTestModel = app.models.test_users;
        let packID = aData.packageID.split(',');
        let packIn = {inq:packID}
        console.log(2,packIn);
        console.log("questionAlAsked",questionAlAsked)
        
        let condition={};
        condition ={limit:"5",where:{category_id:aData.categoryId,age_id:parseInt(aData.age_id),region:parseInt(aData.regionId),questionGroupId:notIn,pack_ID:packIn,fileType:aData.fileType },fields:{time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}};
        console.log("=======================",condition)
        questions.find(condition,function(err,questionData)
        {
          if(err)
          {
            console.log(err);
            reject(err);
          }
          else
          {
            console.log("questionData",questionData)
            if(questionData.length > 0)
            {
              let ranQuestion =random_item(questionData);
              let questionSaved ;
              questionSaved = gameInfo.questionsAsked+','+ranQuestion.questionGroupId;
              
              let updateV;
              if(aData.categoryId ==  1)
              {
                updateV= {PubQuizQuestionAsked:questionSaved}
              }
              else if(aData.categoryId ==  2)
              {
                updateV= {BKSQuestionAsked:questionSaved}
              }
              else if(aData.categoryId ==  3)
              {
                updateV= {QTQuestionAsked:questionSaved}
              }
              else if(aData.categoryId ==  4)
              {
                updateV= {SNMQuestionAsked:questionSaved}
              }
              else if(aData.categoryId ==  5)
              {
                updateV= {TVBQuestionAsked:questionSaved}
              }
              else if(aData.categoryId ==  6)
              {
                updateV= {BKNQuestionAsked:questionSaved}
              }
              userTestModel.updateAll({id:gameInfo.id},updateV,function(err,updateScore){
                if(err)
                {
                  console.log(err);
                  reject(err);
                }
                else
                {
                  let path = '';
                  let filePt ;
                  //let imageFile = data.image_URL.split("/");
                  
                  let s3Bucket = new AWS.S3();
                  
                  let param;
                  
                  
                  
                  if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
                  {
                    //path = '../client/'+ranQuestion.image_URL
                    path = ranQuestion.image_URL;
                    filePt= ranQuestion.image_URL.split("/");
                    param={Bucket:'outsmarted/storage/questions/images',Key:filePt[3]}
                  }
                  else if(ranQuestion.fileType == 2)
                  {
                    //path = '../client/'+ranQuestion.sound_URL
                    path = ranQuestion.sound_URL;
                    filePt= ranQuestion.sound_URL.split("/");
                    param={Bucket:'outsmarted/storage/questions/sounds',Key:filePt[3]}
                    
                    
                  }
                  else if(ranQuestion.fileType == 3)
                  {
                    //path = '../client/'+ranQuestion.video_URL;
                    path = ranQuestion.video_URL;
                    filePt= ranQuestion.video_URL.split("/");
                    param={Bucket:'outsmarted/storage/questions/videos',Key:filePt[3]}
                  }
                  //console.log(path);
                  if(path != '')
                  {
                    s3Bucket.headObject(param).on('success', function(response) {
                      if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
{
ranQuestion.fileType=1;
}
else if(ranQuestion.fileType == 2)
{
ranQuestion.fileType=2;	
}
else if(ranQuestion.fileType == 3)
{
ranQuestion.fileType=3;	

}
resolve(ranQuestion);
                    }).on('error',function(error){
                      ranQuestion.fileType=0;
resolve(ranQuestion);
                      //error return a object with status code 404
                    }                  ).send()
                    
                    
                    //console.log(fs.existsSync(path));
                    //if (!fs.existsSync(path))
                    //{
                    //ranQuestion.fileType=0;
                    //}
                  }
                  else
                  {
                    ranQuestion.fileType=0;
resolve(ranQuestion);
                  }
                  console.log("randon2",ranQuestion);
                  
                }
              })
            }
            else
            {
              condition ={limit:"5",where:{category_id:aData.categoryId,age_id:parseInt(aData.age_id),region:parseInt(aData.regionId),pack_ID:packIn,fileType:aData.fileType },fields:{time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}};
              questions.find(condition,function(err,questionData)
              {
                if(err)
                {
                  reject(err);
                }
                else
                {
                  console.log("questionData2222",questionData)
                  if(questionData.length > 0)
                  {
                    let ranQuestion =random_item(questionData);
                    let questionSaved ;
                    questionSaved = ranQuestion.questionGroupId;
                    
                    let updateV;
                    if(aData.categoryId ==  1)
                    {
                      updateV= {PubQuizQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  2)
                    {
                      updateV= {BKSQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  3)
                    {
                      updateV= {QTQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  4)
                    {
                      updateV= {SNMQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  5)
                    {
                      updateV= {TVBQuestionAsked:questionSaved}
                    }
                    else if(aData.categoryId ==  6)
                    {
                      updateV= {BKNQuestionAsked:questionSaved}
                    }
                    userTestModel.updateAll({id:gameInfo.id},updateV,function(err,updateScore){
                      if(err)
                      {
                        reject(err);
                      }
                      else
                      {
                        let path = '';
                        let filePt ;
                        //let imageFile = data.image_URL.split("/");
                        
                        let s3Bucket = new AWS.S3();
                        
                        let param;
                        
                        
                        
                        if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
                        {
                          //path = '../client/'+ranQuestion.image_URL
                          path = ranQuestion.image_URL;
                          filePt= ranQuestion.image_URL.split("/");
                          param={Bucket:'outsmarted/storage/questions/images',Key:filePt[3]}
                        }
                        else if(ranQuestion.fileType == 2)
                        {
                          //path = '../client/'+ranQuestion.sound_URL
                          path = ranQuestion.sound_URL;
                          filePt= ranQuestion.sound_URL.split("/");
                          param={Bucket:'outsmarted/storage/questions/sounds',Key:filePt[3]}
                          
                          
                        }
                        else if(ranQuestion.fileType == 3)
                        {
                          //path = '../client/'+ranQuestion.video_URL;
                          path = ranQuestion.video_URL;
                          filePt= ranQuestion.video_URL.split("/");
                          param={Bucket:'outsmarted/storage/questions/videos',Key:filePt[3]}
                        }
                        //console.log(path);
                        if(path != '')
                        {
                          s3Bucket.headObject(param).on('success', function(response) {
                            if(ranQuestion.fileType == 1 || ranQuestion.fileType == 4)
{
ranQuestion.fileType=1;
}
else if(ranQuestion.fileType == 2)
{
ranQuestion.fileType=2;	
}
else if(ranQuestion.fileType == 3)
{
ranQuestion.fileType=3;	

}
resolve(ranQuestion);
                          }).on('error',function(error){
                            ranQuestion.fileType=0;
resolve(ranQuestion);
                            //error return a object with status code 404
                          }                  ).send()
                          
                          
                          //console.log(fs.existsSync(path));
                          //if (!fs.existsSync(path))
                          //{
                          //ranQuestion.fileType=0;
                          //}
                        }
                        else
                        {
                          ranQuestion.fileType=0;
  resolve(ranQuestion);	
                        }
                        //console.log("randon",ranQuestion);
                        
                        //resolve(ranQuestion);
                      }
                    })
                  }
                  else
                  {
                    reject("Conditions Not match/ No question available")
                  }
                }
              })
            }
          }
        })
        
      })
    }
    
    /* Get 9 Questions */
    
    function getFinalRoundQuestions(aData,gameInfo)
    {
      return new Promise(function(resolve, reject)
      {
        let questionAlAsked=[];
        if (gameInfo.questionsAsked.indexOf(',') > -1)
        {
          questionAlAsked = gameInfo.questionsAsked.split(',');
        }
        else
        {
          questionAlAsked.push(gameInfo.questionsAsked);
        }
        //console.log("gameInfo=====================",gameInfo);
        let notIn = {nin:questionAlAsked};
        let questions =  app.models.questions;
        let userScoreModel = app.models.user_score;
        let userGameModel = app.models.user_games;
        let userModel = app.models.user;
        //let packID = gameInfo.packageId.split(',');
        //let packIn = {inq:packID}
        
        let packID = [];
        if(gameInfo.purchaseStatus == 0)
        {
          packID = [0];
        }
        else
        {
          packID = gameInfo.packageId.split(',');
        }
        
        let packIn = {inq:packID}
        
        
        questions.count({age_id:gameInfo.ageId,region:gameInfo.countryId,questionGroupId:notIn,fileType:0,status:1 },function(err,questionDataCount)
        {
          //console.log("questionDataCount====",questionDataCount);
          let countRound = Math.floor(questionDataCount/25);
          let skip = Math.floor(Math.random() * (countRound-1));
          //console.log("questionDataCount================",questionDataCount);
          if(questionDataCount >= 9)
          {
            //console.log("questionDataCount================1111");
            let condition={};
            if(skip > 0)
            {
              condition ={limit:"25",skip: skip,where:{age_id:gameInfo.ageId,region:gameInfo.countryId,fileType:0,status:1,questionGroupId:notIn },fields:{age_id:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,pack_ID:true,questionGroupId:true,creditBy:true}};
            }
            else
            {
              condition ={limit:"25",where:{age_id:gameInfo.ageId,region:gameInfo.countryId,fileType:0,status:1,questionGroupId:notIn },fields:{age_id:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,pack_ID:true,questionGroupId:true,creditBy:true}};
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
                let questionToServeTest=[];
                let questionSavedPub="",questionSavedBKS="",questionSavedQT="",questionSavedSNM="",questionSavedTVB="",questionSavedBKN="",questionToServe=[] ;
                for(let i=0;i<9;i++)
                {
                  
                  
                  questionToServeTest.push(ranQuestion[i].questionGroupId);
                  questionToServe.push(ranQuestion[i]);
                }
                
                console.log("notIn=========",notIn)
                console.log("questionToServe===============",questionToServeTest)
                resolve(questionToServe);
                
              }
            })
            
          }
          else
          {
            let condition={};
            //console.log("questionDataCount================222");
            if(skip > 0)
            {
              condition ={limit:"25",skip: skip,where:{age_id:gameInfo.ageId,region:gameInfo.countryId,fileType:0,status:1 },fields:{age_id:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}}
            }
            else
            {
              condition ={limit:"25",where:{age_id:gameInfo.ageId,region:gameInfo.countryId,fileType:0,status:1 },fields:{age_id:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}}
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
                  let questionSavedPub="",questionSavedBKS="",questionSavedQT="",questionSavedSNM="",questionSavedTVB="",questionSavedBKN="",questionToServe=[] ;
                  for(let i=0;i<9;i++)
                  {
                    //questionSaved =ranQuestion[i].id;
                    
                    
                    questionToServe.push(ranQuestion[i]);
                  }
                  //userModel.findOne({where:{id}})
                  userGameModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo){
                    if(err)
                    {
                      reject(err);
                    }
                    else
                    {
                      
                      userModel.findOne({where:{id:parseInt(userGameInfo.user_id)}},function(err,userInfo){
                        if(err)
                        {
                          reject(err);
                        }
                        else
                        {
                          if(userInfo)
                          {
                            userModel.updateAll({id:parseInt(userGameInfo.user_id)},{FinalRoundRepeat:userInfo.FinalRoundRepeat+1},function(err,userInfo)
                            {
                              if(err)
                              {
                                resolve(questionToServe);
                              }
                              else
                              {
                                resolve(questionToServe);
                              }
                              
                            })
                            
                          }
                          else
                          {
                            resolve(questionToServe);
                          }
                        }
                      })
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
    
     function repeatQuestion(aData,gameInfo,packId)
    {
      return new Promise(function(resolve, reject)
      {
        let userGamesModel = app.models.user_games;
        let userModel = app.models.user;
        let userScoresModel = app.models.user_score;
        userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo){
          if(err)
          {
            //console.log(err);
            cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
          }
          else
          {
            userModel.findOne({where:{id:userGameInfo.user_id}},function(err,userInfoData){
            if(err)
            {
              
            }
            else
            {
                let updateV;
                if(aData.categoryId ==  1)
                {
                  updateV= {PubQuizQuestionAsked:0,PubQuizRepeat:userInfoData.PubQuizRepeat+1}
                }
                else if(aData.categoryId ==  2)
                {
                  updateV= {BKSQuestionAsked:0,BKSRepeat:userInfoData.BKSRepeat+1}
                }
                else if(aData.categoryId ==  3)
                {
                  updateV= {QTQuestionAsked:0,QTRepeat:userInfoData.QTRepeat+1}
                }
                else if(aData.categoryId ==  4)
                {
                  updateV= {SNMQuestionAsked:0,SNMRepeat:userInfoData.SNMRepeat+1}
                }
                else if(aData.categoryId ==  5)
                {
                  updateV= {TVBQuestionAsked:0,TVBRepeat:userInfoData.TVBRepeat+1}
                }
                else if(aData.categoryId ==  6)
                {
                  updateV= {BKNQuestionAsked:0,BKNRepeat:userInfoData.BKNRepeat+1}
                }
                
                  userModel.updateAll({id:userGameInfo.user_id},updateV,function(err,data){
                  if(err)
                  {
                    //console.log(err);
                    cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                  }
                  else
                  {
                    gameInfo.questionsAsked = '0';
                    let packagesSelected = packId
                    let questions =  app.models.questions;
                    let ds1 = questions.dataSource;
                    let x = 0,y=0;
                    let packQues= [];
                      
                    ds1.connector.query('SELECT COUNT(*) As packC FROM questions WHERE  pack_ID IN ('+packId+') AND category_id=6 AND age_id=1 AND STATUS=0', function (err, data)
                    {
                      if(err)
                      {
                        //callback()
                      }
                      else
                      {
                        if(data.packC > 0)
                        {
                          async.eachSeries(packagesSelected, function(packagesV, callback)
                          {
                              ds1.connector.query('SELECT COUNT(*) As packC FROM questions WHERE  pack_ID='+packagesV+'  AND category_id=6 AND age_id=1 AND STATUS=0', function (err, dataIndi)
                              {
                                if(err)
                                {
                                  callback()
                                }
                                else
                                {
                                  if(packagesSelected.length == x)
                                  {
                                    if(dataIndi>0)
                                    {
                                      resolve(packagesV)
                                    }
                                    else
                                    {
                                      resolve(1)
                                    }
                                  }
                                  else
                                  {

                                    if(dataIndi > 0)
                                    {
                                      resolve(packagesV)
                                    }
                                    else
                                    {
                                      callback()
                                    }
                                    
                                  }
                                }
                              })
                          })
                        }
                        else
                        {
                          resolve(1);
                        }
                      }
                    })
                     
                  }
                })
              }
            })
          }
        })
      })
    }
    
    function checkPackCount(aData,gameInfo,packId,j,num)
    {
      let questions =app.models.questions;
      let questionAlAsked = gameInfo.questionsAsked.split(',');
      let notIn = {nin:questionAlAsked};
      let obj ={};
      console.log("hellllll",packId[j])
      return new Promise(function(resolve, reject)
      {
        questions.count({age_id:gameInfo.ageId,category_id:aData.categoryId,region:gameInfo.countryId
          ,questionGroupId:notIn,pack_ID:packId[j],status:0},function(err,questionDataCount)
        {
          console.log("========Count===========",questionDataCount);
          if(questionDataCount > 0)
          {
             obj = {iteration:j,packid:packId[j]}
            resolve(obj);
          }
          else
          {
            console.log("num=============",num)
            num++;
            if(num == packId.length)
            {
                repeatQuestion(aData,gameInfo,packId).then(function(intetrate)
                {
                  console.log("packId[intetrate]",packId[intetrate]);
                  obj = {iteration:intetrate,packid:intetrate}
                  resolve(obj);
                })
                .catch(function(err)
                {
                  callback(err);
                });
            }
            else
            {
              console.log("jjjjjjjj",j);
              console.log(packId.length);
              if(j+1==packId.length)
              {
                checkPackCount(aData,gameInfo,packId,0,num).then(function(intetrate)
                {
                   resolve(intetrate);
                })
                .catch(function(err)
                {
                  callback(err);
                });
              }
              else
              {
                console.log("ssssssssss");
                checkPackCount(aData,gameInfo,packId,j+1,num).then(function(intetrate)
                {
                   
                  resolve(intetrate);
                })
                .catch(function(err)
                {
                  callback(err);
                });
              }
            }
          }
        })
      });
    }



   // function repeat()
