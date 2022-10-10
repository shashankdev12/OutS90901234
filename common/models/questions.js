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
//AWS.config.loadFromPath('./server/aws_config.json');
AWS.config.loadFromPath('./server/aws_config.json');



module.exports = function(Questions)
{
  Questions.getQuestions = function (req, cb)
    {
      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
	console.log(aData );
      //let aData = {region:"EN",user_id:106,gameId:512,categoryId:11}
      // if(reqObject.accessToken)
      // {
	aData["user_id"] = aData.child_id;
        getUserScoreInfo(aData).then(function(gameInfo)
        {
          
            getUniqueQuestion(aData,gameInfo).then(function(newUniqueQuestion)
            {
              
                cb(null,{status:"success",data:newUniqueQuestion,askedQuestionslist:gameInfo.questionsAsked})
              
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
        //console.log("Acce INside=============");
        //cb(null,{status:"fail",message:"AccessToken Error"});
     // }
    }
    
    Questions.remoteMethod(
      'getQuestions', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getQuestions',verb:'post'}
      });  

    // Reset questions 

    Questions.resetQuestions = function (req, cb)
    {
      let reqObject = req.res.req;
      //let aData = JSON.parse(reqObject.body.data);

      let aData = {region:"EN",user_id:31,gameId:512,categoryId:1}
      // if(reqObject.accessToken)
      // {
        getUserScoreInfo(aData).then(function(gameInfo)
        {
            console.log(gameInfo);
            resetNewQuestion(aData,gameInfo).then(function(newUniqueQuestion)
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
        });
      // }
      // else
      // {
        //console.log("Acce INside=============");
        //cb(null,{status:"fail",message:"AccessToken Error"});
      // }
    }
    
    Questions.remoteMethod(
      'resetQuestions', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/resetQuestions',verb:'post'}
      });    
      
           
      Questions.finalRound = function (req, cb)
      {
        let reqObject = req.res.req;
        //let aData = JSON.parse(reqObject.body.data);
        //let aData = {child_id:"273060",region:"UK",gameId:247884};
        //{user_game_id:aData.gameId,user_child_id:aData.userId}
        aData["userId"] = aData.child_id;

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
              
                callback(null,uniqueQuestion,gameInfo.questionsAsked);
                
              
              
            })
            .catch(function(err)
            {
		console.log(err);
              callback(err);
            })
          }
        ], function (err, result,questionsAsked)
        {
          if(err)
          {
            console.log(err);
            cb(null,{status:"fail",message:"Error while getting error",error:err})
          }
          else
          {

            cb(null,{status:"success",data:result,askedQuestionslist:questionsAsked})
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


  /* Get credit by search */


    Questions.searchData = function (req, cb)
    {
      console.log("search Dtaa");
      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
      //let aData = {searchBy:"xyz",region:"EN"};
      let questions =  app.models.questions;
      let ds1 = questions.dataSource;
      aData.searchBy =  "%"+aData.searchBy+"%";

      console.log(aData)
          
      ds1.connector.query('SELECT * FROM questions_'+aData.region+' WHERE creditBy LIKE  "'+aData.searchBy+'" ', function (err, data)	
        {	
        if(err){
          console.log(err);
          cb(null,{status:"fail",data:[],count:0})
        }else{
          
          cb(null,{status:"success",data:data,count:data.length})
        }
      })
	        
      
    }
    
    Questions.remoteMethod(
      'searchData', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/searchData',verb:'post'}
    }); 

 Questions.searchQuestionsData = function (req, cb)
    {
      //console.log("search Dtaa");
      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
	console.log(aData);
      //let aData = {searchBy:"The first Harry",region:"EN"};
      let questions =  app.models.questions;
      let ds1 = questions.dataSource;
      aData.searchBy =  "%"+aData.searchBy+"%";

      console.log('SELECT * FROM questions_'+aData.region+' WHERE question LIKE  "'+aData.searchBy+'" ')
          
      ds1.connector.query('SELECT * FROM questions_'+aData.region+' WHERE UPPER(question) LIKE  UPPER("'+aData.searchBy+'") ', function (err, data)	
        {	
        if(err){
          console.log(err);
          cb(null,{status:"fail",data:[],count:0})
        }else{
          
          cb(null,{status:"success",data:data,count:data.length})
        }
      })
	        
      
    }
    
    Questions.remoteMethod(
      'searchQuestionsData', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/searchQuestionsData',verb:'post'}
    }); 

Questions.filterQuestion = function (req, cb)
    {

    let
      countryModel = app.models.countries,
      userGameModel = app.models.user_games;
      categoryAgeStatsModel = app.models.category_age_stats
      userNewCategoriesModel = app.models.user_categories
      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
      //let aData = {regionCode:"EN",category:1,subCategory:0,package:1,age:1,
        //          region:4,fileType:2,type:0,questionStatus:1,questionState:0
          //        ,supportUrl:0,answerOrder:0,page_number:2};
     
        let skipV = aData.page_number;	
         
       
        ////////console.log("aData===========",aData)
        //////console.log("aData===========",aData.regionCode)
        let questions =  app.models.questions;
        let ds1 = questions.dataSource;
        let finalQuestion = [];	
        async.waterfall([	
          function(callbackWater) {	
    
    let cond="",type=0,pack="questions_"+aData.regionCode+".pack_ID != 0",regionCondition='' , searchRegion = aData.regionCode;
    
    countryModel.findOne({where:{id:aData.region}},function(err,countryData)
    {
        if(countryData)
        {
        searchRegion = countryData.language;
        }
        else
        {
        searchRegion = aData.regionCode;
        }


        let categoryCond =""
        let ageCond=""
        let fileCond=""
        let regionCond=""
        let questionState=""
        let questionStatus=""
        let supportUrl=""
        let answerOrder=""
            //////console.log("searchEngin============>>>",searchRegion)
        if(aData.category != 0)
        {
            categoryCond = "and questions_"+searchRegion+".category_id="+aData.category+"";
        }

        if(aData.age != 0)
        {
           ageCond ="and  CONCAT(',', age_id, ',') LIKE '%,"+aData.age+",%'" 
        }
        if(aData.region != 0)
        {
            regionCond = "and CONCAT(',', region, ',') LIKE '%,"+aData.region+",%'"
        }
        else
        {
            regionCond = "and CONCAT(',', region, ',') LIKE '%,"+4+",%'"
        } 

        if(aData.fileType != 0)
        {
            fileCond ="and questions_"+searchRegion+".fileType="+aData.fileType+""
        }
        
        if(aData.questionState == 1)
        {
            questionState = "and questions_"+searchRegion+".questionState = "+aData.questionState+""
        }
        else if(aData.questionState == 2)
        {
            questionState = "and questions_"+searchRegion+".questionState = 0"
        }

        if(aData.questionStatus == 1)
        {
            questionStatus = "and questions_"+searchRegion+".questionActiveStatus = "+aData.questionStatus+""
        }
        else if(aData.questionStatus == 2)
        {
            questionStatus = "and questions_"+searchRegion+".questionActiveStatus = 0"
        }

        if(aData.type == 1)
        {
            type ="and questions_"+searchRegion+".status = 1 "
        }
        else
        {
          type  ="and questions_"+searchRegion+".status =0"
        }


        cond = "where pack_ID=1 "+regionCond+" "+categoryCond+" "+ageCond+" "+fileCond+" "+questionState+" "+questionStatus+" "+type+""

        if(aData.supportUrl != 0  && aData.answerOrder != 0)
        {
            cond = cond +" and  questions_"+searchRegion+".SupportVideoURL is not null and questions_"+searchRegion+".AnswerOrder is not null"
        }
        else if(aData.supportUrl == 0  && aData.answerOrder != 0)
        {
            cond = cond +" and questions_"+searchRegion+".AnswerOrder is not null"
        }
        else if(aData.supportUrl != 0  && aData.answerOrder == 0)
        {
            cond = cond +" and  questions_"+searchRegion+".SupportVideoURL is not null "
        }
            
            ds1.connector.query('SELECT * from questions_'+searchRegion+' '+cond+' GROUP BY questionMasterId', function (err, data)	
            {	
              if(err)	
              {	
                console.log(err);	
              }	
              else	
              {
                  // for(let i=0;i<data.length;i++)	
                  // {	
                  //   let question = { id:data[i].id,questionActiveStatus:data[i].questionActiveStatus,category:data[i].category,
                  //     subCategory:data[i].subCategory,packageName:data[i].packageName,
                  //     multiple:data[i].multiple,age:data[i].age_id,country:data[i].region,image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,
                  //     video_URL:data[i].video_URL,question:data[i].question,answer1:data[i].answer1,
                  //     answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,
                  //     created:data[i].created,questionMasterId:data[i].questionMasterId,questionState:data[i].questionState,
                  //     timeAllowed:data[i].time_Allowed,hint:data[i].hint,fileType:data[i].fileType,time_Allowed:data[i].time_Allowed,
                  //     priority:data[i].priority,countryCreated:data[i].countryCreated
                  //   }	
                  //   finalQuestion.push(question);	
                  //  }	
                   //console.log(finalQuestion);	
                   finalQuestion = data
                  callbackWater(null,finalQuestion);		
              }	
            })	
          })
    
    
    
          },	
            
          function(finalQuestion, callbackWater)	
          {	
            let cond="",type=0,pack="questions_"+aData.regionCode+".pack_ID != 0",regionCondition='' , searchRegion = aData.regionCode;
    
    countryModel.findOne({where:{id:aData.region}},function(err,countryData)
    {
        if(countryData)
        {
        searchRegion = countryData.language;
        }
        else
        {
        searchRegion = aData.regionCode;
        }


        let categoryCond =""
        let ageCond=""
        let fileCond=""
        let regionCond=""
        let questionState=""
        let questionStatus=""
        let supportUrl=""
        let answerOrder=""
            //////console.log("searchEngin============>>>",searchRegion)
        if(aData.category != 0)
        {
            categoryCond = "and questions_"+searchRegion+".category_id="+aData.category+"";
        }

        if(aData.age != 0)
        {
           ageCond ="and  CONCAT(',', age_id, ',') LIKE '%,"+aData.age+",%'" 
        }
        if(aData.region != 0)
        {
            regionCond = "and CONCAT(',', region, ',') LIKE '%,"+aData.region+",%'"
        }
        else
        {
            regionCond = "and CONCAT(',', region, ',') LIKE '%,"+4+",%'"
        } 

        if(aData.fileType != 0)
        {
            fileCond ="and questions_"+searchRegion+".fileType="+aData.fileType+""
        }
        
        if(aData.questionState == 1)
        {
            questionState = "and questions_"+searchRegion+".questionState = "+aData.questionState+""
        }
        else if(aData.questionState == 2)
        {
            questionState = "and questions_"+searchRegion+".questionState = 0"
        }

        if(aData.questionStatus == 1)
        {
            questionStatus = "and questions_"+searchRegion+".questionActiveStatus = "+aData.questionStatus+""
        }
        else if(aData.questionStatus == 2)
        {
            questionStatus = "and questions_"+searchRegion+".questionActiveStatus = 0"
        }

        if(aData.type == 1)
        {
            type ="and questions_"+searchRegion+".status = 1 "
        }
        else
        {
          type  ="and questions_"+searchRegion+".status =0"
        }


        cond = "where pack_ID=1 "+regionCond+" "+categoryCond+" "+ageCond+" "+fileCond+" "+questionState+" "+questionStatus+" "+type+""

        if(aData.supportUrl != 0  && aData.answerOrder != 0)
        {
            cond = cond +" and  questions_"+searchRegion+".SupportVideoURL is not null and questions_"+searchRegion+".AnswerOrder is not null"
        }
        else if(aData.supportUrl == 0  && aData.answerOrder != 0)
        {
            cond = cond +" and questions_"+searchRegion+".AnswerOrder is not null"
        }
        else if(aData.supportUrl != 0  && aData.answerOrder == 0)
        {
            cond = cond +" and  questions_"+searchRegion+".SupportVideoURL is not null "
        }
            
            ds1.connector.query('SELECT COUNT(a.cnt) as count FROM ( SELECT COUNT(id) AS cnt FROM questions_'+searchRegion+' '+cond+' GROUP BY questionMasterId) AS a', function (err, questionCount)	
            {	
              if(err)	
              {	
                console.log(err);
                //////console.log(err);
              }	
              else	
              {	
                console.log("questionCount",questionCount)
                callbackWater(null, finalQuestion , questionCount);	
              }	
            })	
          })
          }	
          ,	
          function(value,count, callback)	
          {	
            getCategory().then(function(category)	
            {	
              callback(null,value,count,category);	
            })	
            .catch(function(err)	
            {	
              callback(err);	
            });	
          },	
          function(value,count,category, callback)	
          {	
            getPackagesDataWithoutLimt().then(function(package1)	
            {	
              callback(null, value,count,category,package1);	
            })	
            .catch(function(err)	
            {	
              callback(err);	
            });	
          },	
          function(value,count,category,package1, callback)	
          {	
            // if(aData.adminUserType ==2)
            // {
            //     getAllCountryLimit(aData.region).then(function(country)
            //     {
            //     callback(null, value,count,category,package,country);
            //     })
            //     .catch(function(err)
            //     {
            //     //////console.log(err);
            //     callback(err);
            //     });
            // }
            // else
            // {
              getAllCountry(0).then(function(country)
                {
                callback(null, value,count,category,package1,country);
                })
                .catch(function(err)
                {
                //////console.log(err);
                callback(err);
                });
            //}
    
            },	
              function(value,count,category,package1,country, callback)	
              {	
                getUserAgeData(0).then(function(age)
                  {
                    callback(null, value,count,category,package1,country,age);
                  })
                  .catch(function(err)
                  {
                    callback(err);
                  });
              }
                
          ], function (err,value,count,category,package1,country,age)	
          {	

            cb(null,{status:"success",data:finalQuestion,count:count[0]["count"],
              category:category,package1:package1,countries:country,age:age});	
          });	
      	
	        
      
    }
    
    Questions.remoteMethod(
      'filterQuestion', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/filterQuestion',verb:'post'}
    });
      
}




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
        		console.log("========================new",cateData)
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

		console.log("========================",userGameInfo.replacedCategory)

		

		console.log("========================",cateData)
                   
             categArray = [cateData[0].id,cateData[1].id,cateData[2].id,cateData[3].id,cateData[4].id,cateData[5].id] 
            //console.log(categArray);
            userModel.findOne({where:{id:parseInt(userGameInfo.user_id)}},function(err,userInfo)
            {
              if(userGameInfo.gameType == 1)
              {
                console.log("{user_game_id:aData.gameId,user_child_id:aData.userId}",{user_game_id:aData.gameId,user_child_id:aData.userId});
                userScoreModel.findOne({include:"user_childs",where:{user_game_id:aData.gameId,user_child_id:aData.userId}},function(err,userScoreData)
                {
                  if(err)
                  {
                    reject(err);
                  }
                  else
                  {
                    console.log("userScoreData",userScoreData)
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



function getFinalRoundQuestions(aData,gameInfo)
{
  return new Promise(function(resolve, reject)
  {
    let questionAlAsked=[];
    
      questionAlAsked.push(gameInfo.questionsAsked);
    console.log("gameInfo=====================",aData);

    console.log("gameInfo=====================",gameInfo);
    
    let questions = app.models["questions_"+aData.region];
    let userScoreModel = app.models.user_score;
    let userGameModel = app.models.user_games;
    let userModel = app.models.user;
    //let packID = gameInfo.packageId.split(',');
    //let packIn = {inq:packID}
    
    let packID = [];
    
    //console.log("s",gameInfo);
    let categories = {inq:gameInfo.categoryArray}
    
    
    questions.count({age_id:gameInfo.ageId,category_id:categories,region:gameInfo.countryId,fileType:0,status:1 ,questionActiveStatus:1},function(err,questionDataCount)
    {
      console.log("questionDataCount====",err);
      let countRound = Math.floor(questionDataCount/25);
      let skip = Math.floor(Math.random() * (countRound-1));
      console.log("questionDataCount================",questionDataCount);
      if(questionDataCount >= 9)
      {
        //console.log("questionDataCount================1111");
        let condition={};
        // if(skip > 0)
        // {
        //   condition ={where:{age_id:gameInfo.ageId,category_id:categories,region:gameInfo.countryId,fileType:0,status:1,questionActiveStatus:1 },fields:{hint:true,age_id:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,pack_ID:true,questionGroupId:true,creditBy:true}};
        // }
        // else
        // {
          condition ={where:{fileType:0,status:1,questionActiveStatus:1 }
          ,fields:{hint:true,age_id:true,SupportVideoURL:true,AnswerOrder:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,pack_ID:true,questionGroupId:true,creditBy:true}};
        //}

        //console.log(condition)
        
        questions.find(condition,function(err,questionData)
        {
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
      else
      {
        let condition={};
          condition ={where:{fileType:0,status:1,questionActiveStatus:1 },fields:{hint:true,age_id:true,SupportVideoURL:true,AnswerOrder:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}}

        
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
              //let ranQuestion =shuffleArray(questionData)
              let questionToServe=[];
              
              //for(let i=0;i<9;i++)
              //{
                //questionSaved =ranQuestion[i].id;
                
                
                questionToServe.push(questionData);
              
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
                            resolve(questionData);
                          }
                          else
                          {
                            resolve(questionData);
                          }
                          
                        })
                        
                      }
                      else
                      {
                        resolve(questionData);
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
       
          condition ={limit:"25",where:{fileType:0,status:1,questionActiveStatus:1 },fields:{hint:true,SupportVideoURL:true,AnswerOrder:true,age_id:true,questionActiveStatus:true,region:true,category_id:true,time_Allowed:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,questionGroupId:true,creditBy:true}}
       
        
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
                            resolve(questionData);
                          }
                          else
                          {
                            resolve(questionData);
                          }
                          
                        })
                        
                      }
                      else
                      {
                        resolve(questionData);
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
              //console.log(userInfo);
              if(userGameInfo.gameType == 1)
              {
              
                userScoreModel.findOne({include:"user_childs",where:{user_game_id:aData.gameId,user_child_id:aData.userId}},
                function(err,userScoreData)
                {
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
                        questionPackCount:userScoreData.packagesCount,replacedType:0,replacedCategory:0,category:0};
                        let xyz = JSON.parse(userGameInfo.replacedCategory);

                        for(let i=0;i<xyz.length;i++)
                        {
                          if(parseInt(xyz[i].replaced) ==  parseInt(aData.categoryId))
                          {
                            gameInfo.replacedCategory =  xyz[i].category
                            gameInfo.category =  xyz[i].replaced
                            break;
                          }
                        }

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
                        //gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
                        gameInfo.countryId = userInfo.country_id;
                        console.log("gameInfo=========>",gameInfo);
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
                              //gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
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
                                  gameInfo.replacedType = 1;
                                  gameInfo.questionsAsked = '0';
                                }
                                gameInfo.packageId = userGameInfo.pack_Id;
                                //gameInfo.ageId = userScoreData.toJSON().user_childs.age_id;
                                gameInfo.countryId = userInfo.country_id;
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
              else
              {
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



    function getUniqueQuestion(aData,gameInfo)
    {
      return new Promise(function(resolve, reject)
      {
        if(gameInfo.replacedType == 1)
        {
          let questionAlAsked = gameInfo.questionsAsked.split(',');
          let notIn = {nin:questionAlAsked};
          let questions = app.models["questions_"+aData.region];
          //let questions =  app.models.questions_EN;
          let condition={};

	        condition ={where:{category_id:gameInfo.category,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
          category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
          video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,SupportVideoURL:true,AnswerOrder:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};

          questions.find(condition,function(err,questionData)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              console.log("================",questionData.length)
              if(questionData.length > 0)
              {
                resolve(questionData);
              }
              else
              {
                condition ={where:{category_id:gameInfo.category,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
                category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
                video_URL:true,sound_URL:true,fileType:true,time_Allowed:true,SupportVideoURL:true,AnswerOrder:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};
        
                  questions.find(condition,function(err,questionData)
                  {
                    if(err)
                    {
                      console.log(err);
                      reject(err);
                    }
                    else
                    {
                      console.log("================",questionData.length)
                      if(questionData.length > 0)
                      {
                        resolve(questionData);
                      }
                      else
                      {
                        condition ={where:{category_id:gameInfo.replacedCategory,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
                          category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
                          video_URL:true,sound_URL:true,fileType:true,SupportVideoURL:true,AnswerOrder:true,time_Allowed:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};
                  
                            questions.find(condition,function(err,questionData)
                            {
                              if(err)
                              {
                                console.log(err);
                                reject(err);
                              }
                              else
                              {
                                console.log("================",questionData.length)
                                if(questionData.length > 0)
                                {
                                  resolve(questionData);
                                }
                                else
                                {
                                  reject("Sorry there are no questions in this category. Try another category.");
                                }
                              }
                            })
                      }
                    }
                  })
              }
            }
          })
        }
        else
        {
          let questionAlAsked = gameInfo.questionsAsked.split(',');
          let notIn = {nin:questionAlAsked};
          let questions = app.models["questions_"+aData.region];
          let condition={};
          console.log("=======================",notIn )

	        condition ={where:{category_id:aData.categoryId,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
          category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
          video_URL:true,sound_URL:true,SupportVideoURL:true,AnswerOrder:true,fileType:true,time_Allowed:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};

          questions.find(condition,function(err,questionData)
          {
            if(err)
            {
              console.log(err);
              reject(err);
            }
            else
            {
              console.log("================",questionData.length)
              if(questionData.length > 0)
              {
                resolve(questionData);
              }
              else
              {
                condition ={where:{category_id:aData.categoryId,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
                category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
                video_URL:true,sound_URL:true,SupportVideoURL:true,AnswerOrder:true,fileType:true,time_Allowed:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};
        
                  questions.find(condition,function(err,questionData)
                  {
                    if(err)
                    {
                      console.log(err);
                      reject(err);
                    }
                    else
                    {
                      console.log("================",questionData.length)
                      if(questionData.length > 0)
                      {
                        resolve(questionData);
                      }
                      else
                      {
                        reject("Sorry there are no questions in this category. Try another category.");
                      }
                    }
                  })
              }
            }
          })
        }
        
      })
    }



    function resetNewQuestion(aData,gameInfo)
    {
      return new Promise(function(resolve, reject)
      {
        if(gameInfo.replacedType == 1)
        {
          let questions = app.models["questions_"+aData.region];
          let userCategory = app.models.user_categories;
          let condition={};

	        condition ={where:{category_id:gameInfo.category,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
          category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
          video_URL:true,sound_URL:true,SupportVideoURL:true,AnswerOrder:true,fileType:true,time_Allowed:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};

          questions.find(condition,function(err,questionData)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              console.log("================2",questionData.length)
              if(questionData.length > 0)
              {
                userCategory.findOne({where:{user_id:aData.userId,category_id:gameInfo.category}},function(err,data)
                {
                  if(err)
                  {

                  }
                  else
                  {
                    if(data)
                    {
                      userCategory.updateAll({user_id:aData.userId,category_id:gameInfo.category},{questionAsked:0})
                      resolve(questionData);
                    }
                    else
                    {
                      userCategory.create({user_id:aData.userId,category_id:gameInfo.category,questionAsked:0})
                      resolve(questionData);
                    }
                    
                  }
                  
                })
                
              }
              else
              {
                condition ={where:{category_id:gameInfo.category,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
                category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
                video_URL:true,sound_URL:true,SupportVideoURL:true,AnswerOrder:true,fileType:true,time_Allowed:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};
        
                  questions.find(condition,function(err,questionData)
                  {
                    if(err)
                    {
                      console.log(err);
                      reject(err);
                    }
                    else
                    {
                      console.log("================1",questionData.length)
                      if(questionData.length > 0)
                      {

                        userCategory.findOne({where:{user_id:aData.userId,category_id:gameInfo.category}},function(err,data)
                        {
                          if(err)
                          {

                          }
                          else
                          {
                            if(data)
                            {
                              userCategory.updateAll({user_id:aData.userId,category_id:gameInfo.category},{questionAsked:0})
                              resolve(questionData);
                            }
                            else
                            {
                              userCategory.create({user_id:aData.userId,category_id:gameInfo.category,questionAsked:0})
                              resolve(questionData);
                            }
                            
                          }
                          
                        })
                      }
                      else
                      {
                        condition ={where:{category_id:gameInfo.replacedCategory,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
                          category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
                          video_URL:true,sound_URL:true,SupportVideoURL:true,AnswerOrder:true,fileType:true,time_Allowed:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};
                  
                            questions.find(condition,function(err,questionData)
                            {
                              if(err)
                              {
                                console.log(err);
                                reject(err);
                              }
                              else
                              {
                                console.log("================3",questionData.length)
                                if(questionData.length > 0)
                                {
                                  userCategory.findOne({where:{user_id:aData.userId,category_id:gameInfo.category}},function(err,data)
                                  {
                                    if(err)
                                    {

                                    }
                                    else
                                    {
                                      if(data)
                                      {
                                        userCategory.updateAll({user_id:aData.userId,category_id:gameInfo.category},{questionAsked:0})
                                        resolve(questionData);
                                      }
                                      else
                                      {
                                        userCategory.create({user_id:aData.userId,category_id:gameInfo.category,questionAsked:0})
                                        resolve(questionData);
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
                      }
                    }
                  })
              }
            }
          })
        }
        else
        {
          let questionAlAsked = gameInfo.questionsAsked.split(',');
          let notIn = {nin:questionAlAsked};
          let questions =  app.models["questions_"+aData.region];
          let userModel =  app.models.user;
          let condition={};

	        condition ={where:{category_id:aData.categoryId,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
          category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
          video_URL:true,sound_URL:true,SupportVideoURL:true,AnswerOrder:true,fileType:true,time_Allowed:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};

          questions.find(condition,function(err,questionData)
          {
            if(err)
            {
              console.log(err);
              reject(err);
            }
            else
            {
              console.log("================43",questionData.length)
              if(questionData.length > 0)
              {
                if(aData.categoryId == 1)
                {
                  userModel.updateAll({id:aData.userId},{PubQuizQuestionAsked:0})
                }
                else if(aData.categoryId == 2)
                {
                  userModel.updateAll({id:aData.userId},{BKSQuestionAsked:0})
                } 
                else if(aData.categoryId == 3)
                {
                  userModel.updateAll({id:aData.userId},{QTQuestionAsked:0})
                }
                else if(aData.categoryId == 4)
                {
                  userModel.updateAll({id:aData.userId},{SNMQuestionAsked:0})
                }
                else if(aData.categoryId == 5)
                {
                  userModel.updateAll({id:aData.userId},{TVBQuestionAsked:0})
                }
                else if(aData.categoryId == 6)
                {
                  userModel.updateAll({id:aData.userId},{BKNQuestionAsked:0})
                }
                resolve(questionData);
              }
              else
              {
                condition ={where:{category_id:aData.categoryId,status:0,questionActiveStatus:1},fields:{age_id:true,hint:true,time_Allowed:true,questionActiveStatus:true,
                category_id:true,question:true,answer1:true,answer2:true,answer3:true,answer4:true,correct_Answer:true,id:true,image_URL:true,
                video_URL:true,sound_URL:true,SupportVideoURL:true,AnswerOrder:true,fileType:true,time_Allowed:true,questionMasterId:true,creditBy:true,status:true,pack_ID:true}};
        
                  questions.find(condition,function(err,questionData)
                  {
                    if(err)
                    {
                      console.log(err);
                      reject(err);
                    }
                    else
                    {
                      console.log("================5",questionData.length)
                      if(questionData.length > 0)
                      {
                        if(aData.categoryId == 1)
                          {
                            userModel.updateAll({id:aData.userId},{PubQuizQuestionAsked:0})
                          }
                          else if(aData.categoryId == 2)
                          {
                            userModel.updateAll({id:aData.userId},{BKSQuestionAsked:0})
                          } 
                          else if(aData.categoryId == 3)
                          {
                            userModel.updateAll({id:aData.userId},{QTQuestionAsked:0})
                          }
                          else if(aData.categoryId == 4)
                          {
                            userModel.updateAll({id:aData.userId},{SNMQuestionAsked:0})
                          }
                          else if(aData.categoryId == 5)
                          {
                            userModel.updateAll({id:aData.userId},{TVBQuestionAsked:0})
                          }
                          else if(aData.categoryId == 6)
                          {
                            userModel.updateAll({id:aData.userId},{BKNQuestionAsked:0})
                          }
                          resolve(questionData);
                      }
                      else
                      {
                        reject("Sorry there are no questions in this category. Try another category.");
                      }
                    }
                  })
              }
            }
          })
        }
        
      })
    }

function getCategory()
  {
    let userCategoriesModel = app.models.categories;
    return new Promise(function(resolve, reject)
    {
      /* Getting all countries from table */
      userCategoriesModel.find({},function(err,categories)
      {
          if(err)
          {
            //////console.log(err);
            reject(0);
          }
          else
          {
            resolve(categories);
          }
      })
    });
  }

  function getPackagesDataWithoutLimt()
  {
    let userPackagesModel = app.models.question_packages;
      return new Promise(function(resolve, reject)
      {
          /* Getting all packages from table */
          userPackagesModel.find({order:'id desc'},function(err,userAgeData)
          {
              if(err)
              {
                reject(0);
              }
              else
              {
                resolve(userAgeData);
              }
          })
      });
  }


  function getAllCountry(skipV)
  {
    return new Promise(function(resolve, reject)
    {
      let countryModel = app.models.countries
      /* Getting all countries from table */
	  ////////console.log("session",req.session)
      countryModel.find({order:'id desc'},function(err,countriesData)
      {

          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(countriesData);
          }
      })
    });
  }



  function getUserAgeData(skipV)
  {
   let userAgeModel = app.models.age_categories;
      return new Promise(function(resolve, reject)
      {
          /* Getting all Ages from table */
          userAgeModel.find({order:'id desc',limit: 10, skip: skipV},function(err,userAgeData)
          {
              if(err)
              {
                reject(0);
              }
              else
              {
                resolve(userAgeData);
              }
          })
      });
  }   

function random_item(items)
    {
      //console.log(items.length);
      //console.log(items[Math.floor(Math.random()*items.length)]);
      return items[Math.floor(Math.random()*items.length)];
    }
       