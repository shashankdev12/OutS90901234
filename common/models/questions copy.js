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
AWS.config.loadFromPath('./server/aws_config.json');


module.exports = function(Questions)
{
  /* ========= Question asked for free play ========= */
  
  Questions.getFreeplayQuestion = function (req, cb) {
	console.log("===================Get Free Questions ==================")
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
              Questions.find({ where: { category_id: aData.categoryId, pack_ID: 0,age_id:parseInt(aData.ageId),region:parseInt(aData.countryId) ,questionGroupId:notIn,status:0,questionActiveStatus:1}, fields: {questionActiveStatus:true, time_Allowed: true, question: true, answer1: true, answer2: true, answer3: true, answer4: true, correct_Answer: true, id: true, image_URL: true, video_URL: true, sound_URL: true, fileType: true, time_Allowed: true, questionGroupId: true,creditBy:true,status:true } }, function (err, questionData) {
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
			console.log("ranQuestion2 ",ranQuestion )

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
			console.log("ranQuestion2 ",ranQuestion )

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
                          Questions.find({ where: { category_id: aData.categoryId, pack_ID: 0,age_id:parseInt(aData.ageId),region:parseInt(aData.countryId),status:0,questionActiveStatus:1 }, fields: {hint:true,time_Allowed: true,questionActiveStatus:true, question: true, answer1: true, answer2: true, answer3: true, answer4: true, correct_Answer: true, id: true, image_URL: true, video_URL: true, sound_URL: true, fileType: true, time_Allowed: true, questionGroupId: true ,creditBy:true,status:true} }, function (err, questionData) {
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
						console.log("ranQuestion2 ",ranQuestion )

				      cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })	
                                    }).on('error',function(error){
                                      ranQuestion.fileType=0;
					console.log("ranQuestion2 ",ranQuestion )

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
				    console.log("ranQuestion ",ranQuestion )	
				    cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })	
                                  }
                                  
//                                  cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })
                                })
                              }
                              else {
                                cb(null, { status: "fail", message: "Question list is null" })
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
                  Questions.find({ where: { category_id: aData.categoryId, pack_ID: 0,age_id:parseInt(aData.ageId),region:parseInt(aData.countryId),status:0,questionActiveStatus:1 }, fields: {hint:true, time_Allowed: true,questionActiveStatus:true, question: true, answer1: true, answer2: true, answer3: true, answer4: true, correct_Answer: true, id: true, image_URL: true, video_URL: true, sound_URL: true, fileType: true, time_Allowed: true, questionGroupId: true,creditBy:true,status:true } }, function (err, questionData) {
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
console.log("ranQuestion ",ranQuestion )
			      cb(null, { status: "success", message: "Successfully found free play question", data: ranQuestion })
                            }).on('error',function(error){
                              ranQuestion.fileType=0;
			console.log("ranQuestion2 ",ranQuestion )
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
			    console.log("ranQuestion ",ranQuestion )	
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

      //let aData = reqObject.body.data;
      //console.log("aData=======================",aData);
      //let aData = {gameId:1001,categoryId:5,userId:796};
      //let aData = {gameId:512,categoryId:1,userId:106};
      
      // if(reqObject.accessToken)
      // {
        getUserScoreInfo(aData).then(function(gameInfo)
        {
          //console.log("gameInfo",gameInfo)
          getUniqueSubCategory(aData,gameInfo).then(function(packData)
          {
     	        let pack =packData;
              if(typeof packData=== 'object')
              {
                gameInfo = packData.gameInfo ;
                pack= packData.pack;
              }
	    	
            getUniqueQuestion(aData,gameInfo,pack).then(function(newUniqueQuestion)
            {
              //console.log("pack1========================",pack)
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
      let aData = {gameId:31,categoryId:7,userId:106};
      console.log("Git");
      
      getUserScoreInfo(aData).then(function(gameInfo)
      {
        //console.log('sssssssssssssss',gameInfo);
        getUniqueSubCategory(aData,gameInfo).then(function(subCategory)
        {
          //console.log("kkk",subCategory);
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
	console.log("===============Set Answer ================")
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
      //let aData = {gameId:512,categoryId:1,userId:106};
      
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
      //let aData = JSON.parse(reqObject.body.data);
      let aData = {questionID:48966};
      //console.log("=====================Question===============",aData)
      //if(reqObject.accessToken)
      //{
      Questions.findOne({where:{questionGroupId:aData.questionID},fields:{time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}},function(err,data){
        if(err)
        {
          //console.log("=============err========",err);
          cb(null,{status:"fail"})
        }
        else
        {
          //console.log("data=======================",data);
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
      //console.log(aData);
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
      //console.log("aData==================",aData)
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
              if(userInfo)
              {
                //questionModel.findOne({where:{id:parseInt(aData.question_id)}},function(err,questionInfo)
                //{
                let questionSaved  = userInfo.FinalRound+','+parseInt(aData.question_id);
                userModel.updateAll({id:userInfo.id},{FinalRound:questionSaved},function(err,updated)
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
	//console.log("====================	call again>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      return new Promise(function(resolve, reject)
      {
        let userScoreModel = app.models.user_score;
        let userModel = app.models.user;
        let userGamesModel = app.models.user_games;
        let userCategoriesModel = app.models.user_categories;
        userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo)
        {
          if(err)
          {
            reject("Something went wronge");
          }
          else
          {
            userModel.findOne({where:{id:parseInt(userGameInfo.user_id)},fields:{id:true,purchaseStatus:true,
                    PubQuizQuestionAsked:true,BKSQuestionAsked:true,QTQuestionAsked:true,SNMQuestionAsked:true,
                    TVBQuestionAsked:true,BKNQuestionAsked:true,country_id:true}},
            function(err,userInfo)
            {
              
              if(userGameInfo.gameType == 1)
              {
              //console.log("Hhhhheee",aData);
                userScoreModel.findOne({include:"user_childs",where:{user_game_id:aData.gameId,user_child_id:aData.userId}},
                function(err,userScoreData)
                {
                  //console.log("userScoreData",userScoreData)
                  if(err)
                  {
                    console.log(err)
                    reject(err);
                  }
                  else
                  {
                    if(userScoreData)
                    {
                      let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null
                        ,questionAskedCount:userScoreData.questionAskedCount,ageId:null,countryId:null
                        ,purchaseStatus:userInfo.purchaseStatus,questionPackRatio:userScoreData.packagesRatio,
                        questionPackCount:userScoreData.packagesCount,replacedType:0,replacedCategory:0,category:0};


                        //console.log(userGameInfo.replacedCategory);
                        let xyz = JSON.parse(userGameInfo.replacedCategory);
                             	  
                        //console.log("========================================")
                        //console.log(aData.categoryId);
                        //console.log(xyz );
                        //console.log("========================================")


                
                         //let 
                        for(let i=0;i<xyz.length;i++)
                        {
                          if(parseInt(xyz[i].replaced) ==  parseInt(aData.categoryId))
                          {
                            gameInfo.replacedCategory =  xyz[i].category
                            gameInfo.category =  xyz[i].replaced
                            break;
                          }
                        }

                       // console.log("game Info ---->......>>>>>",gameInfo);
                      
                      //console.log("userInfo.PubQuizQuestionAsked",userInfo.PubQuizQuestionAsked)
                      
                      if(gameInfo.category == 0)
                      {
			console.log("============================================Inside A ==================================")
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
                        else
                        {
                          //gameInfo.replacedCat = 1;
                          gameInfo.questionsAsked = '0';
                        }
                        gameInfo.packageId = userGameInfo.pack_Id;
                        gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
                        gameInfo.countryId = userInfo.country_id;
                        //console.log("gameInfo=========>",gameInfo);
                        resolve(gameInfo);
                      }
                      else
                      {
			console.log("===========================Helll is here ==========================")
                        userCategoriesModel.findOne({where:{user_id:userGameInfo.user_id,category_id:aData.categoryId}},function(err,userSecCategories)
                        {
                          if(err)
                          {
                            reject(0);
                          }
                          else
                          {
                            if(userSecCategories)
                            {
                              gameInfo.replacedType = 1;
                              gameInfo.questionsAsked = userSecCategories.questionAsked;
                              gameInfo.packageId = userGameInfo.pack_Id;
                              gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
                              gameInfo.countryId = userInfo.country_id;
                              resolve(gameInfo);
                            }
                            else
                            {
                              userCategoriesModel.create({user_id:userGameInfo.user_id,category_id:aData.categoryId,categoryRepeat:0
                              ,status:1,created:new Date(),modified:new Date()},function(err,userSecCategories)
                              {
                                if(err)
                                {
                                  reject(0)
                                }
                                else
                                {
                                  console.log("2222");
                                  gameInfo.replacedType = 1;
                                  gameInfo.questionsAsked = '0';
                                }
                                gameInfo.packageId = userGameInfo.pack_Id;
                                gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
                                gameInfo.countryId = userInfo.country_id;
                                //console.log("gameInfo=========>",gameInfo);
                                resolve(gameInfo);
                              })
                            }
                          }
                        })
                      }

                     
                    }
                    else
                    {
                      console.log('hellllllll')
                      reject(0);
                    }
                  }
                })
              }
              else
              {



		//console.log("----------------------------------------------------------------")
                userScoreModel.findOne({include:[{user_teams:{user_team_childs:'user_childs'}}],where:{user_game_id:aData.gameId,user_child_id:aData.userId}},function(err,userScoreData)
                {
                  if(err)
                  {
                    console.log(err)
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
                      
                      let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null,questionAskedCount:userScoreData.questionAskedCount,ageId:null,countryId:null,purchaseStatus:userInfo.purchaseStatus
					                ,questionPackRatio:userScoreData.packagesRatio,questionPackCount:userScoreData.packagesCount,replacedType:0,replacedCategory:0,category:0};


                          //console.log(userGameInfo.replacedCategory);
                          let repCat = JSON.parse(userGameInfo.replacedCategory);
                           //console.log("repCat ",repCat );                      	
                           //let 
                          for(let i=0;i<repCat.length;i++)
                          {
                            if(parseInt(repCat[i].replaced) ==  parseInt(aData.categoryId))
                            {
                              gameInfo.replacedCategory =  repCat[i].category
                              gameInfo.category =  repCat[i].replaced
                              break;
                            }
                          };


			

			

				





                        
                       if(gameInfo.category == 0)
                      {
					//console.log("-------------------------------------22222---------------------------")

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
                            else
                            {
                              gameInfo.questionsAsked = '0';
                            }
                            
                            gameInfo.packageId = userGameInfo.pack_Id;
                            gameInfo.ageId = randomSubCate;
                            gameInfo.countryId = userInfo.country_id;
                            resolve(gameInfo);
                      }
                      else
                      {

					//console.log("-------------------------------222222222222222222222222---------------------------------",userGameInfo)

                        userCategoriesModel.findOne({where:{user_id:userGameInfo.user_id,category_id:aData.categoryId}},function(err,userSecCategories)
                        {
                          if(err)
                          {
                            reject(0);
                          }
                          else
                          {
                            if(userSecCategories)
                            {
                              gameInfo.replacedType = 1;
                              gameInfo.questionsAsked = userSecCategories.questionAsked;
                              gameInfo.packageId = userGameInfo.pack_Id;
                              gameInfo.ageId = randomSubCate;
                              gameInfo.countryId = userInfo.country_id;
                              resolve(gameInfo);
                            }
                            else
                            {
                              userCategoriesModel.create({user_id:userGameInfo.user_id,category_id:aData.categoryId,categoryRepeat:0
                              ,status:1,created:new Date(),modified:new Date()},function(err,userSecCategories)
                              {
                                if(err)
                                {
                                  reject(0)
                                }
                                else
                                {
                                  console.log("2222");
                                  gameInfo.replacedType = 1;
                                  gameInfo.questionsAsked = '0';
                                }
                                gameInfo.packageId = userGameInfo.pack_Id;
                                gameInfo.ageId = randomSubCate;
                                gameInfo.countryId = userInfo.country_id;
                                //console.log("gameInfo=========>",gameInfo);
                                resolve(gameInfo);
                              })
                            }
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
            //console.log(gameInfo);
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
        let categoriesModel = app.models.categories;
        
        userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo)
        {
          if(err)
          {
            reject(err);
          }
          else
          {
            categoriesModel.find({where:{type:1},fields:{id:true}},function(err,cateData)
            {
              if(err)
              {

              }
              else
              {
                console.log(cateData);
                let xyz = JSON.parse(userGameInfo.replacedCategory);
                let categArray= []
                 for(let j=0;j<cateData.length;j++)
                 {
                    for(let i=0;i<xyz.length;i++)
                    {
                      if(parseInt(cateData[j].id) ==  parseInt(xyz[i].replaced))
                      {
                        cateData[j].id = xyz[i].category;
                      }
                    }
                 }
                       
                 categArray = [cateData[0].id,cateData[1].id,cateData[2].id,cateData[3].id,cateData[4].id,cateData[5].id] 
                //console.log(categArray);
                userModel.findOne({where:{id:parseInt(userGameInfo.user_id)}},function(err,userInfo)
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
                        if(userScoreData)
                        {
                          let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null,
                                          questionAskedCount:userScoreData.questionAskedCount
                                          ,ageId:null,countryId:null,categoryArray:categArray};
                          gameInfo.questionsAsked = userInfo.FinalRound;
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
                      let xyz = userScoreData.toJSON().user_teams.user_team_childs;
                      let ageArray = [];
                      for(let i=0;i<xyz.length;i++)
                      {
                        ageArray.push(xyz[i].user_childs.age_id);
                      }
                      let randomSubCate = random_item(ageArray);
                      
                      let gameInfo = {id:userScoreData.id,questionsAsked:null,packageId:null,
                                      questionAskedCount:userScoreData.questionAskedCount,
                                      ageId:null,countryId:null,categoryArray:categArray};
                      
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
      //console.log("00000000000000000'",gameInfo)
      return new Promise(function(resolve, reject)
      {
        let packID = [];
        packID = gameInfo.packageId.split(',');
        if(packID.length == 1)
        {
            if(gameInfo.purchaseStatus == 0)
            {
              //console.log('22222');
              getFreeUniqueSubcategoary(aData,gameInfo).then(function(pack)
              {
                resolve(pack);
              }).catch(function(err)
              { 
                console.log(err);
                reject(err)
              })
                
            }
            else
            {
		//console.log("456000000000000000000000000------------------------------")

              if(gameInfo.replacedType == 0)
              {
		//console.log("456------------------------------")
                getSinglePackage(aData,gameInfo).then(function(pack)
                {
                  resolve(pack);
                }).catch(function(err)
                { 
                  reject(err)
                })
              }
              else
              {
                //console.log("456")
                getSinglePackReplacedCate(aData,gameInfo).then(function(pack)
                {
			//console.log("---------------------------------------------------------------------------------------gameInfo",gameInfo)
                  resolve(pack);
                }).catch(function(err)
                { 
                  reject(err)
                })
              }
              
          }
        }
        else
        {
         //console.log("45699999999999")
           if(gameInfo.replacedType == 0)
          {
         //console.log("4568888")

            getMultiplePackage(aData,gameInfo).then(function(pack)
            {
              resolve(pack);
            }).catch(function(err)
            { 
              reject(err)
            })
          }
          else
          {
            //console.log("4562222")
            getMuliplePackReplacedCate(aData,gameInfo).then(function(pack)
            {
              resolve(pack);
            }).catch(function(err)
            { 
              reject(err)
            })
          }          



          
              
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
        ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE id NOT IN ('+gameInfo.questionsAsked+') AND questionActiveStatus=1 AND pack_ID IN ('+packID+') AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+'', function (err, subCategory)
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
                        ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND questionActiveStatus=1 AND pack_ID IN ('+packID+')  AND age = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+'', function (err, subCategory)
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
	//console.log("====================",gameInfo);
      return new Promise(function(resolve, reject)
      {
        let questionAlAsked = gameInfo.questionsAsked.split(',');
        let notIn = {nin:questionAlAsked};
        let questions =  app.models.questions;
        let userGameModel = app.models.user_games;
        let userModel = app.models.user;
        let userCategoriesModel = app.models.user_categories;
        //let packID = gameInfo.packageId.split(',');
        let condition={};
        //console.log("=======================",notIn )
        //console.log("packd ===========<><",gameInfo);
        //condition ={where:{
        //      questionGroupId:39231},fields:{time_Allowed:true,
        //        question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
        //      video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true,status:true,pack_ID:true}};

	      condition ={where:{category_id:aData.categoryId,age_id:gameInfo.ageId,region:gameInfo.countryId,pack_ID:pack,status:0,questionActiveStatus:1,
          questionGroupId:notIn },fields:{hint:true,time_Allowed:true,questionActiveStatus:true,
                category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
              video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true,status:true,pack_ID:true}};

                //console.log("cond",condition);
          
          questions.find(condition,function(err,questionData)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
		          //console.log("=======================",questionData.length)
              if(questionData.length > 0)
              {
                //console.log("00000000000000000000000000000");
                let ranQuestion = random_item(questionData);
                //console.log("questionData============",gameInfo.questionsAsked);
                let questionSaved ;
                questionSaved = gameInfo.questionsAsked+','+ranQuestion.questionGroupId;
                userGameModel.findOne({where:{id:aData.gameId}},function(err,userDetailss){
                  if(err)
                  {
                    reject(err);
                  }
                  else
                  {
                    if(gameInfo.replacedType == 0)
                    {
                     // console.log("heeeellllll",questionSaved);
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
                        else
                        {
                          updateV= {BKNQuestionAsked:questionSaved}
                        }
			//console.log("===========================breaking new ==================",questionSaved)
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
                              if(ranQuestion.fileType == 1 )
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
                              else if(ranQuestion.fileType == 4)
                              {
                                ranQuestion.fileType=4;	 
                              }
                              
                                resolve(ranQuestion);
                              
                            }).on('error',function(error){
                              ranQuestion.fileType=0;
                                resolve(ranQuestion);
                              //error return a object with status code 404
                          }).send()
                          //resolve(ranQuestion);
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
                    else
                    {
                      //console.log("heeeellllll2",questionSaved);
                      let updateV;
                      updateV= {questionAsked:questionSaved}

                      userCategoriesModel.updateAll({user_id:userDetailss.user_id,category_id:aData.categoryId},updateV,function(err,updateScore)
                      {
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
                              if(ranQuestion.fileType == 1 )
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
                              else if(ranQuestion.fileType == 4)
                              {
                                ranQuestion.fileType=4;	 
                              }
                              
                                resolve(ranQuestion);
                              
                            }).on('error',function(error){
                              ranQuestion.fileType=0;
                                resolve(ranQuestion);
                              //error return a object with status code 404
                          }).send()
                          //resolve(ranQuestion);
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
        condition ={limit:"5",where:{category_id:aData.categoryId,age_id:parseInt(aData.age_id),region:parseInt(aData.regionId),questionGroupId:notIn,pack_ID:packIn,fileType:aData.fileType,questionActiveStatus:1 },fields:{hint:true,time_Allowed:true,questionActiveStatus:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}};
        //console.log("=======================",condition)
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
                  //console.log("randon2",ranQuestion);
                  
                }
              })
            }
            else
            {
              condition ={limit:"5",where:{category_id:aData.categoryId,age_id:parseInt(aData.age_id),region:parseInt(aData.regionId),pack_ID:packIn,fileType:aData.fileType,questionActiveStatus:1 },fields:{hint:true,time_Allowed:true,questionActiveStatus:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}};
              questions.find(condition,function(err,questionData)
              {
                if(err)
                {
                  reject(err);
                }
                else
                {
                  //console.log("questionData2222",questionData)
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
        //console.log("s",gameInfo);
        let categories = {inq:gameInfo.categoryArray}
        
        
        questions.count({age_id:gameInfo.ageId,category_id:categories,region:gameInfo.countryId,questionGroupId:notIn,fileType:0,status:1 ,questionActiveStatus:1},function(err,questionDataCount)
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
              condition ={limit:"25",skip: skip,where:{age_id:gameInfo.ageId,category_id:categories,region:gameInfo.countryId,fileType:0,status:1,questionGroupId:notIn,questionActiveStatus:1 },fields:{hint:true,age_id:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,pack_ID:true,questionGroupId:true,creditBy:true}};
            }
            else
            {
              condition ={limit:"25",where:{age_id:gameInfo.ageId,category_id:categories,region:gameInfo.countryId,fileType:0,status:1,questionGroupId:notIn,questionActiveStatus:1 },fields:{hint:true,age_id:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,pack_ID:true,questionGroupId:true,creditBy:true}};
            }

            //console.log(condition)
            
            questions.find(condition,function(err,questionData)
            {
              if(err)
              {
                reject(err);
              }
              else
              {
               // console.log(questionData);
                let ranQuestion =shuffleArray(questionData)
                let questionToServeTest=[];
                let questionToServe=[];
               
                for(let i=0;i<9;i++)
                {
                  questionToServeTest.push(ranQuestion[i].questionGroupId);
                  questionToServe.push(ranQuestion[i]);
                }
                
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
              condition ={limit:"25",skip: skip,where:{age_id:gameInfo.ageId,category_id:categories,region:gameInfo.countryId,fileType:0,status:1,questionActiveStatus:1 },fields:{hint:true,age_id:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}}
            }
            else
            {
              condition ={limit:"25",where:{age_id:gameInfo.ageId,category_id:categories,region:gameInfo.countryId,fileType:0,status:1,questionActiveStatus:1 },fields:{hint:true,age_id:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}}
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
                  let questionToServe=[];
                  
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
                  //reject("Not Enough Questions");

                  let condition={};
            //console.log("questionDataCount================333");
            if(skip > 0)
            {
              condition ={limit:"25",skip: skip,where:{age_id:gameInfo.ageId,region:gameInfo.countryId,fileType:0,status:1,questionActiveStatus:1 },fields:{hint:true,age_id:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}}
            }
            else
            {
              condition ={limit:"25",where:{age_id:gameInfo.ageId,region:gameInfo.countryId,fileType:0,status:1,questionActiveStatus:1 },fields:{hint:true,age_id:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}}
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
                  let questionToServe=[];
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
      //console.log("calling repeate",aData)
      //console.log("calling repeate",gameInfo)
      return new Promise(function(resolve, reject)
      {
        let userGamesModel = app.models.user_games;
        let userModel = app.models.user;
        let userScoresModel = app.models.user_score;
        userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo)
        {
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
                  
                    
                    let questions =  app.models.questions;
                    let ds1 = questions.dataSource;
                    let x = 0,y=0;
                    let packQues= [];
                      
                    //console.log('SELECT COUNT(*) As packC FROM questions WHERE  pack_ID IN ('+packId+') AND category_id='+aData.categoryId+' AND region='+userInfoData.country_id+' AND age_id='+gameInfo.ageId+' AND STATUS=0 AND questionActiveStatus=1')
                    ds1.connector.query('SELECT COUNT(*) As packC FROM questions WHERE  pack_ID IN ('+packId+') AND category_id='+aData.categoryId+' AND region='+userInfoData.country_id+' AND age_id='+gameInfo.ageId+' AND STATUS=0 AND questionActiveStatus=1', function (err, data)
                    {
                      if(err)
                      {
                        console.log("err",err);
                        //callback()
                      }
                      else
                      {
                        
                        //console.log("--------",data[0].packC);
                        if(data[0].packC > 0)
                        {
                          gameInfo.questionsAsked = '0';
                          let packagesSelected = packId
                          console.log("enter the drage")
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



                          userModel.updateAll({id:userGameInfo.user_id},updateV,function(err,udata){
                            if(err)
                            {
                              reject(0);
                              //cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                            }
                            else
                            {
                            }
                            })



                          async.eachSeries(packagesSelected, function(packagesV, callback)
                          {
                            x++;
                              ds1.connector.query('SELECT COUNT(*) As packC FROM questions WHERE  pack_ID='+packagesV+'  AND category_id='+aData.categoryId+' AND region='+userInfoData.country_id+' AND age_id='+gameInfo.ageId+' AND STATUS=0 AND questionActiveStatus=1', function (err, dataIndi)
                              {
                                if(err)
                                {
                                  console.log(err);
                                  callback()
                                }
                                else
                                {
                                  if(packagesSelected.length == x)
                                  {
                                    //console.log("nnnn2")
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
                                    console.log("nnnn")

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
                          //console.log("lemon chus lo")
                          resolve(1);
                        }
                      }
                    })
                     
                  //}
                //})
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

      return new Promise(function(resolve, reject)
      {
        questions.count({age_id:gameInfo.ageId,category_id:aData.categoryId,region:gameInfo.countryId
          ,questionGroupId:notIn,pack_ID:packId[j],status:0,questionActiveStatus:1},function(err,questionDataCount)
        {
          //console.log("========Count===========",questionDataCount);
          if(questionDataCount > 0)
          {
             obj = {iteration:j,packid:packId[j]}
            resolve(obj);
          }
          else
          {
            //console.log("num=============",num)
            num++;
            if(num == packId.length)
            {
                repeatQuestion(aData,gameInfo,packId).then(function(intetrate)
                {
                  //console.log("packId[intetrate]",packId[intetrate]);
                  obj = {iteration:intetrate,packid:intetrate}
                  resolve(obj);
                })
                .catch(function(err)
                {
                  reject(0)
                  //callback(err);
                });
            }
            else
            {
              //console.log("jjjjjjjj",j);
              console.log(packId.length);
              if(j+1==packId.length)
              {
                checkPackCount(aData,gameInfo,packId,0,num).then(function(intetrate)
                {
                  console.log("intetrate1=========",intetrate)
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
                  console.log("intetrate2=========",intetrate)
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

    /* ============= Free Package Question ============*/

    function getFreeUniqueSubcategoary(aData,gameInfo)
    {
      let questions =  app.models.questions;
      let userModel =  app.models.user;
      let userScoreModel = app.models.user_score;
      let ds1 = questions.dataSource;
      let userGamesModel = app.models.user_games;

      let packID = [];
      packID = gameInfo.packageId.split(',');

      console.log(gameInfo);

      return new Promise(function(resolve, reject)
      {
        
        ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1 AND questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND pack_ID = 0 AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' AND status=0 limit 100', function (err, subCategory)
        {
          if(err)
          {
            console.log(err);
            reject("Something went wronge")
          }
          else
          {
            console.log("subCategory",subCategory)
            if(subCategory)
            {
              if(subCategory.length > 0)
              {
                  resolve(0);
              }
              else
              {
                userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo)
                {
                  if(err)
                  {
                    console.log(err);
                    reject("while updating userGamesModel")
                    //cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                  }
                  else
                  {
                    userModel.findOne({where:{id:userGameInfo.user_id}},function(err,userInfoData)
                    {
                      if(err)
                      {
                        console.log(err)                        
                        reject("Something went wronge")
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

                        ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1 AND pack_ID = 0  AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' limit 100', function (err, subCategory)
                        {
                          if(err)
                          {
                            reject(err);
                          }
                          else
                          {
                            if(subCategory.length)
                            {
                              gameInfo.questionsAsked = '0';
                              userModel.updateAll({id:userGameInfo.user_id},updateV,function(err,data){
                                if(err)
                                {
                                  //console.log(err);
                                  //cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                                }
                                else
                                {
                                  
                                }
                              })
                              resolve(0)
                            }
                            else
                            {
                              reject("Sorry there are no questions in this category. Try another category.")
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
      })
    }

    /* ============ Single Package Sub category ====== */

    function getSinglePackage(aData,gameInfo)
    {
      console.log("calling single ")
      let questions =  app.models.questions;
      let userModel =  app.models.user;
      let userScoreModel = app.models.user_score;
      let ds1 = questions.dataSource;
      let userGamesModel = app.models.user_games;
      let packID = [];
      packID = gameInfo.packageId.split(',');

      //console.log("aData =>>>",aData);

      return new Promise(function(resolve, reject)
      {
        ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1 AND questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND pack_ID = '+packID+' AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' AND status=0 limit 100', function (err, subCategory)
        {
        if(err)
        {
          reject("Something went wrong please try again");
        }
        else
        {
          if(subCategory)
          {
            console.log('11111')
            if(subCategory.length > 0)
            {
               console.log(packID[0]); 
                resolve(packID[0]);
            }
            else
            {
              console.log('2222')
              let userGamesModel = app.models.user_games;
              userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo){
                if(err)
                {
                  cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                }
                else
                {
                  userModel.findOne({where:{id:userGameInfo.user_id}},function(err,userInfoData)
                  {
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

                       
                      ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1 AND pack_ID IN ('+packID+')  AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' limit 100', function (err, subCategory)
                      {
                        if(err)
                        {
                          reject(err);
                        }
                        else
                        {
                          
                          if(subCategory)
                          {
                            console.log("ssss",subCategory.length);
                            if(subCategory.length > 0 )
                            {
                              gameInfo.questionsAsked = '0';
                              userModel.updateAll({id:userGameInfo.user_id},updateV,function(err,data){
                                if(err)
                                {
                                  //console.log(err);
                                  cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                                }
                                else
                                {
                                  
                                }
                              })
                              console.log("helll2",packID[0]);
                              resolve(packID[0])
                            }
                            else
                            {
                              console.log("helll");
                              gameInfo.packageId='1';
                              ds1.connector.query('SELECT distinct(sub_category_id) FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1 AND questionGroupId NOT IN ('+gameInfo.questionsAsked+') AND pack_ID = 1 AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' AND status=0 limit 100', function (err, checkAgainPack1)
                              {
                                if(checkAgainPack1.length > 0 )
                                {
				                          resolve(1);
                                 
                                }
                                else
                                {
				                          gameInfo.questionsAsked = '0';
                             	   userModel.updateAll({id:userGameInfo.user_id},updateV,function(err,data){
                                   if(err)
                                   {
                                    //console.log(err);
                                    //cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                                   }
                                   else
                                   {
                                  
                                   }
                                  })
                                  resolve(1)
                                }
                              })                              
                            }
                          }
                          else
                          {
                            console.log("22222222222222222");
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
            console.log("Errrrrrrr");
            reject(0);
          }
        }
        })
      })
    }


    /* ============ Single Package category replaced ====== */

    function getSinglePackReplacedCate(aData,gameInfo)
    {
      //console.log("====================",gameInfo)
      let questions =  app.models.questions;
      let userCategoriesModel =  app.models.user_categories;
      let ds1 = questions.dataSource;
      let userGamesModel = app.models.user_games;
     

      return new Promise(function(resolve, reject)
      {
        ds1.connector.query('SELECT * FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1 AND questionGroupId NOT IN ('+gameInfo.questionsAsked+')  AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' AND status=0 limit 100', function (err, subCategory)
        {
        if(err)
        {
          reject("Something went wrong please try again");
        }
        else
        {
          if(subCategory)
          {
            if(subCategory.length > 0)
            {
               resolve(subCategory[0].pack_ID);
            }
            else
            {
              userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo){
                if(err)
                {
                  reject(0)
                  //cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                }
                else
                {
                  userCategoriesModel.findOne({where:{user_id:userGameInfo.user_id,category_id:aData.category_id}},function(err,userInfoData)
                  {
                    if(err)
                    {
                      reject(0);
                    }
                    else
                    {
			console.log("------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",userInfoData)
                      let updateV;
//                      updateV= {questionAsked:0,categoryRepeat:userInfoData.categoryRepeat+1}

                       console.log('SELECT * FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1   AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' limit 100');
                      ds1.connector.query('SELECT * FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1   AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' limit 100', function (err, subCategory)
                      {
                        if(err)
                        {
                          reject(err);
                        }
                        else
                        {
				//console.log("===========================")
				//console.log("===========================",subCategory)
				//console.log("===========================")
                          if(subCategory)
                          {
                            if(subCategory.length > 0 )
                            {
                              gameInfo.questionsAsked = '0';
                              
                              userCategoriesModel.updateAll({id:userInfoData.id},updateV,function(err,data){
                                if(err)
                                {
                                  reject(0);
                                  //cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                                }
                                else
                                {
                                  
                                }
                              })
				//console.log("subCategory[0].pack_ID",subCategory[0].pack_ID);
                              resolve(subCategory[0].pack_ID);
                            }
                            else
                            {
				console.log("0000000000000",gameInfo.replacedCategory);
                              aData.categoryId = gameInfo.replacedCategory;
                              gameInfo.replacedType =0;
				console.log(aData);
                              //getUniqueSubCategory(aData,gameInfo).then(function(pack)
			      getUserScoreInfo(aData).then(function(gameInfo1)
                              {
                                if(err)
                                {
                                  reject(0)
                                }
                                else
                                {
                                  console.log("pack===============",gameInfo1)
                                  //resolve(gameInfo)
				  getUniqueSubCategory(aData,gameInfo1).then(function(pack){
				   if(err)
                               	   {
                                  	reject(0)
                                   }
                                   else
                                   {
					let obj = {gameInfo:gameInfo1,pack:pack}
					resolve(obj)
				   }
				})

				

                                }
                              })                           
                            }
                          }
                          else
                          {
                            reject(0)
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
            console.log("Errrrrrrr");
            reject(0);
          }
        }
        })
      })
    }


    /* ============ Single Package Sub category ====== */

    function getMultiplePackage(aData,gameInfo)
    {
      let questions =  app.models.questions;
      let userModel =  app.models.user;
      let userScoreModel = app.models.user_score;
      let ds1 = questions.dataSource;
      let userGamesModel = app.models.user_games;
      let packID = [];
      packID = gameInfo.packageId.split(',');

      return new Promise(function(resolve, reject)
      {
        //console.log("================",gameInfo);
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

        checkPackCount(aData,gameInfo,packID,j,n).then(function(obbj)
        {
          console.log(obbj)
          if(packRatioCount[obbj.iteration] == packRatio[obbj.iteration])
          {
            packRatioCount[obbj.iteration]= 0;
          }
          else
          {
            packRatioCount[obbj.iteration]= (parseInt(packRatioCount[obbj.iteration])+1).toString();
          }
          packRatioCount.toString();
          
          userScoreModel.updateAll({user_game_id:parseInt(aData.gameId)},{packagesCount:packRatioCount},
            function(err,updateScore)
          {
            console.log("hellllll===============");
            resolve(obbj.packid);
          }) 
        })
        .catch(function(err)
        {
          callback(err);
        });
      })
    }


/* ============ Single Package category replaced ====== */

    function getMuliplePackReplacedCate(aData,gameInfo)
    {
      let questions =  app.models.questions;
      let userCategoriesModel =  app.models.user_categories;
      let ds1 = questions.dataSource;
      let userGamesModel = app.models.user_games;

      return new Promise(function(resolve, reject)
      {
        ds1.connector.query('SELECT * FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1 AND questionGroupId NOT IN ('+gameInfo.questionsAsked+')  AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' AND status=0 limit 100', function (err, subCategory)
        {
        if(err)
        {
          reject("Something went wrong please try again");
        }
        else
        {
          if(subCategory)
          {
            if(subCategory.length > 0)
            {
               resolve(subCategory[0].pack_ID);
            }
            else
            {
              userGamesModel.findOne({where:{id:aData.gameId}},function(err,userGameInfo){
                if(err)
                {
                  reject(0)
                  //cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                }
                else
                {
                  userCategoriesModel.findOne({where:{user_id:userGameInfo.user_id,category_id:aData.category_id}},function(err,userInfoData)
                  {
                    if(err)
                    {
                      reject(0);
                    }
                    else
                    {
                      let updateV;
                      updateV= {questionAsked:0,categoryRepeat:userInfoData.categoryRepeat+1}

                       
                      ds1.connector.query('SELECT * FROM questions WHERE category_id = '+aData.categoryId+' AND questionActiveStatus=1   AND age_id = '+gameInfo.ageId+' AND region = '+gameInfo.countryId+' limit 100', function (err, subCategory)
                      {
                        if(err)
                        {
                          reject(err);
                        }
                        else
                        {
                          if(subCategory)
                          {
                            if(subCategory.length > 0 )
                            {
                              gameInfo.questionsAsked = '0';
                              
                              userCategoriesModel.updateAll({id:userInfoData.id},updateV,function(err,data){
                                if(err)
                                {
                                  //console.log(err);
                                  //cb(null,{status:"fail",message:"Error while updating userGamesModel"+err})
                                }
                                else
                                {
                                  
                                }
                              })
                              resolve(subCategory[0].pack_ID);
                            }
                            else
                            {
                              aData.categoryId = gameInfo.replacedCategory
                              gameInfo.replacedType =0;
                              getUserScoreInfo(aData).then(function(gameInfo1)
                              {
                                if(err)
                                {
                                  reject(0)
                                }
                                else
                                {
                                  console.log("pack===============",gameInfo1)
                                  //resolve(gameInfo)
				  getUniqueSubCategory(aData,gameInfo1).then(function(pack){
				   if(err)
                               	   {
                                  	reject(0)
                                   }
                                   else
                                   {
					let obj = {gameInfo:gameInfo1,pack:pack}
					resolve(obj)
				   }
				})

				

                                }
                              })                           
                            }
                          }
                          else
                          {
                            reject(0)
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
            console.log("Errrrrrrr");
            reject(0);
          }
        }
        })
      })
    }


    
   // function repeat()
