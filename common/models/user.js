'use strict';
let app = require('../../server/server');
let loopback =  require('loopback');
let randomstring = require("randomstring");
let path = require('path');
let sharp = require('sharp');
let serverUrl = require('../js/config');
let modelPath = require('../js/models');
let async = require('async');
var nodemailer = require('nodemailer');
var zlib = require('zlib');

var AWS = require('aws-sdk');
//AWS.config.loadFromPath('E:/Daljeet/outsmarted/server/aws_config.json');
    AWS.config.loadFromPath('./server/aws_config.json');







module.exports = function (User) {
  delete User.validations.email;
    /* ============== Registration ============= */

    User.register = function (req, cb)
    {
      try
      {
          let reqObject = req.res.req;
          let aData = JSON.parse(reqObject.body.data);
	//console.log("aData===================",aData)
          async.waterfall([
            function(callback) {
              // Checking licence
              checkLicence(aData).then(function(licenceValue)
              {
                callback(null, licenceValue);
              })
              .catch(function(err)
              {
                callback(err);
              });
            },
            function(licenceValue, callback)
            {
              // checking count of licence used by user
              checkUserLicencesCount(aData,licenceValue).then(function(userInfo)
              {
                callback(null,userInfo,licenceValue);
              })
              .catch(function(err)
              {
                callback(err);
              });
            },
            function(userInfo,licenceValue, callback)
            {
              // checking count of licence used by user
              checkUserLicences(aData,userInfo,licenceValue).then(function(userData)
              {
                //console.log("userData>>>>>>>>>>>>>>>>>>>>>>>",userData)
                callback(null, userData);
              })
              .catch(function(err)
              {
                callback(err);
              });
            },

        ], function (err, result)
        {
          if(err)
          {
            cb(null,{status:"fail",message:err})
          }
          else
          {
            //console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhh",result);
            cb(null,{status:"success",data:result})
          }
        });
      }
      catch (err)
      {
        cb(null,{status:0,message:"Exception Error",err:err});
      }
    }

    User.remoteMethod(
        'register', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/register',verb: 'post'}
        });


    User.iosRegister = function (req, cb)
    {
      try
      {
          let reqObject = req.res.req;
          let aData = JSON.parse(reqObject.body.data);
	  console.log('===============aData',aData );	
          //let aData = {deviceToken:"kkkkkkssskkkkkkkkkkkkkkk"};
          async.waterfall([
            function(callback) {
              // Checking licence
              checkIosUser(aData).then(function(checkUser)
              {
                callback(null, checkUser);
              })
              .catch(function(err)
              {
                callback(err);
              });
            },
          ], function (err, result)
        {
          if(err)
          {
            cb(null,{status:"fail",message:err})
          }
          else
          {
            cb(null,{status:"success",data:result});
          }
        });
      }
      catch (err)
      {
        cb(null,{status:0,message:"Exception Error",err:err});
      }
    }

    User.remoteMethod(
      'iosRegister', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/iosRegister',verb: 'post'}
      });

    /* ============== Add child user ============= */

        User.addUser = function (req, cb)
    {
      try
      {
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
	      console.log("============ Add User=============");
         if(reqObject.accessToken)
         {
          let userChildsModel = app.models.user_childs;
          userChildsModel.create({user_id:aData.userParentId,firstName:aData.firstName,lastName:aData.lastName,country_id:aData.country_id,countryCode:aData.country,age_id:aData.age_id,age:aData.age,username:aData.username,status:1,games_played:0,games_won:0,created:new Date(),modified:new Date()},function(err,saveUserData)
          {
            if(err)
            {
              cb(null,{status:"fail",message:"Error while Adding child User",error:err})
            }
            else
            {

              if(aData.profilePic != '')
              {
                uploadImage2(aData.profilePic,saveUserData.id).then(function(value)
                {
                  cb(null,{status:"success",message:"Child User Created"})
                }).catch(function(err) {
			console.log(err);
                  cb(null,{status:"fail",message:"Something is wrong please try again"})
                });
              }
              else
              {
                cb(null,{status:"success",message:"Child User Created"})
              }
            }
          })
         }
         else
         {
           cb(null,{status:"fail",message:"AccessToken Error"});
         }
      }
      catch (e)
      {
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

    User.remoteMethod(
        'addUser', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/addUser',verb: 'post'}
        });

    /* ============== Get child user ============= */

    User.getChildList = function (req, cb)
    {
      try
      {
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
	console.log("===================Get Child list ===============",aData)
	//let aData = {userParentId:31};

	
        if(reqObject.accessToken)
        {
          let userChildsModel = app.models.user_childs;
          userChildsModel.find({where:{user_id:aData.userParentId,status:{neq:0}},fields:{user_id:true,firstName:true,lastName:true,profilePic:true,age:true,id:true,status:true}},function(err,childList)
          {
            if(err)
            {
              cb(null,{status:"fail",message:"Error while Adding child User",error:err})
            }
            else
            {
              if(childList.length)
              {
                cb(null,{status:"success",childList:childList});
              }
              else
              {
                cb(null,{status:"success",childList:[]});
              }
            }
          })
        }
        else
        {
          cb(null,{status:"fail",message:"AccessToken Error"});
        }
      }
      catch (e)
      {
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

    User.remoteMethod(
        'getChildList', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/getChildList',verb:'post'}
        });



    User.getChildListTest = function (req, cb)
    {
      try
      {
        let reqObject = req.res.req;
        let aData = reqObject.body.data;
	       console.log("Get Child list ===============",aData)
        //if(reqObject.accessToken)
        //{
          let userChildsModel = app.models.user_childs;
          userChildsModel.find({where:{user_id:aData.userParentId,status:{neq:0}},fields:{user_id:true,firstName:true,lastName:true,profilePic:true,age:true,id:true,status:true}},function(err,childList)
          {
            if(err)
            {
              cb(null,{status:"fail",message:"Error while Adding child User",error:err})
            }
            else
            {
              if(childList.length)
              {
                cb(null,{status:"success",childList:childList});
              }
              else
              {
                cb(null,{status:"success",childList:[]});
              }
            }
          })
        //}
        //else
        //{
          //cb(null,{status:"fail",message:"AccessToken Error"});
        //}
      }
      catch (e)
      {
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

    User.remoteMethod(
        'getChildListTest', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/getChildListTest',verb:'post'}
        });


    /* ============== Delete child User ================ */

    User.deleteChildUser = function (req, cb)
    {
      try
      {
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
        let userChildModel = app.models.user_childs;
        let userTeamChildModel = app.models.user_team_childs;
	//console.log("Delete Child A data ==========",aData);
        if((reqObject.accessToken))
        {
            if(aData.childId != null)
            {
              userChildModel.findOne({where:{id:parseInt(aData.childId)}},function(err,childData){
                if(err)
                {
                    cb(null,{status:"fail",message:"Error"})
                }
                else
                {
			//console.log("childData",childData)
                  if(childData)
                  {
                    childData.updateAttributes({status:0},function(err,updateUserChild)
                    {
                      if(err)
                      {
                        cb(null,{status:"fail",message:"Error while updating"});
                      }
                      else
                      {
                        userTeamChildModel.findOne({where:{user_child_id:aData.childId}},function(err,teamChildData){
                          if(err)
                          {
                              cb(null,{status:"fail",message:"Error"})
                          }
                          else
                          {
                            if(teamChildData)
                            {
                              userTeamChildModel.updateAll({user_child_id:teamChildData.user_child_id},{status:0},function(err,updateUserChild)
                              {
                                if(err)
                                {
                                  cb(null,{status:"success",message:"Successfully disable the child"});
                                }
                                else
                                {
                                  cb(null,{status:"success",message:"Successfully disable the child"});
                                }
                              })
                            }
                            else
                            {
                              cb(null,{status:"success",message:"Successfully disable the child"});
                            }
                        }
                    })
                    }
                  })
              }
              else
              {
                cb(null,{status:"fail",message:"User not Found"})
              }
            }
          })
          }
          else
          {
            cb(null,{status:"fail",message:"User not Found"})
          }
        }
        else
        {
          cb(null,{status:"fail",message:"AccessToken Error"});
        }
      }
      catch (e)
      {
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

    User.remoteMethod(
        'deleteChildUser', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/deleteChildUser',verb:'post'}
        });

    /* ================= Edit User =============== */

   User.editChildUser = function (req, cb)
    {
      try
      {
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
        //console.log("data",aData);
        let userChildModel = app.models.user_childs;
        if(reqObject.accessToken)
        {
          userChildModel.updateAll({id:aData.childId},{firstName:aData.firstName,lastName:aData.lastName,age_id:aData.age_id,age:aData.age,country_id:aData.country_id,countryCode:aData.country},function(err,updateUserChild)
          {
            if(err)
            {
              cb(null,{status:"fail",message:"Error while updating"});
            }
            else
            {
              if(aData.profilePic != '')
              {
                uploadImage2(aData.profilePic,aData.childId).then(function(value)
                {
                  cb(null,{status:"success",message:"Child User updated"})
                }).catch(function(err) {
			console.log(err);
                  cb(null,{status:"fail",message:"Errosr"})
                });
              }
              else
              {
                cb(null,{status:"success",message:"Child User updated"})
              }
            }
          })
        }
        else
        {
          cb(null,{status:"fail",message:"AccessToken Error"});
        }
      }
      catch (e)
      {
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

   User.remoteMethod(
      'editChildUser', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/editChildUser',verb:'post'}
      });

    /* ================= check User =============== */

    User.checkLogin = function (req, cb)
    {
      try
      {
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
        let saveGameModel = app.models.saved_games;
        //console.log("aData >>>>>>>>>>>>>>>>>>>>>> ",aData);

        async.waterfall([
          function(callback) {
            // Checking licence
            checkLicence(aData).then(function(licenceValue)
            {
              callback(null, licenceValue);
            })
            .catch(function(err)
            {
              callback(err);
            });
          },
          function(licenceValue, callback)
          {
            // checking count of licence used by user
            checkUserLogin(aData,licenceValue).then(function(userInfo)
            {
              callback(null,userInfo);
            })
            .catch(function(err)
            {
              callback(err);
            });
          }
        ], function (err, result)
        {
          if(err)
          {
            console.log(err);
            cb(null,{status:"fail",message:err})
          }
          else
          {

            saveGameModel.findOne({where:{user_id:aData.id}},function
            (err,saveDataInfo)
              {
              if(err)
              {
                cb(null,{status:"fail",message:"Failure"})
              }
              else
              {
		console.log("saveGame<<<<<<<>>>>>>>>> ",result);
                if(saveDataInfo)
                {
                  cb(null,
                    {status:"success",data:result,PreviousGameData:saveDataInfo.game})
                }
                else
                {
                  cb(null,
                    {status:"success",data:result,PreviousGameData:""})
                }
              }
            })
          }
        });
      }
      catch (e)
      {
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

   User.remoteMethod(
        'checkLogin', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/checkLogin',verb:'post'}
        });


/* ================= check User =============== */

   User.checkIosLogin = function (req, cb)
    {
      try
      {
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
        //let aData = {id:16,deviceToken:'kkkkkkssskkkkkkkkkkkkkkk'};
        let saveGameModel = app.models.saved_games;
        async.waterfall([
          function(callback) {
            checkIosUserLogin(aData).then(function(userInfo)
            {
              callback(null,userInfo);
            })
            .catch(function(err)
            {
              callback(err);
            });
          }
        ], function (err, result,saveDataInfo)
        {
          if(err)
          {
            cb(null,{status:"fail",message:err})
          }
          else
          {
            saveGameModel.findOne({where:{user_id:aData.id}},function
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
                  cb(null,
                    {status:"success",data:result,saveString:saveDataInfo.game})
                }
                else
                {
                  cb(null,
                    {status:"success",data:result,saveString:saveDataInfo.game})
                }
              }
            })
          }
        });
      }
      catch (e)
      {
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

   User.remoteMethod(
        'checkIosLogin', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/checkIosLogin',verb:'post'}
        });


   /* ================= Delete device Token ====================*/

   User.deleteAllDevice = function (req, cb)
   {
      try
      {
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
        let licenceModel =  app.models.licences;
        let userModel = app.models.user;
        let userInfoModel =  app.models.user_info;
        licenceModel.findOne({where:{licence:aData.license}},function(err,licenceInfo){
            if(err)
            {
                cb(null,{status:"fail",message:"error"});
            }
            else
            {
              if(licenceInfo)
              {
                userModel.findOne({where:{licence_id:licenceInfo.id,emailVerified:1}},function(err,userInfo)
                {
                    if(err)
                    {
                      cb(null,{status:"fail",message:"error2"})
                    }
                    else
                    {
                      if(userInfo)
                      {


                        userInfoModel.destroyAll({user_id:userInfo.id},function(err,deleteUserInfo)
                        {
                          if(err)
                          {
                            cb(null,{status:"fail",message:"Error while deleting Data from user info"});
                          }
                          else
                          {
                            if(userInfo.lastName == 'ioUser')
                            {
                              userInfo.updateAttributes({purchaseStatus:0},function(err,update)
                              {
                                  if(err)
                                  {
                                    cb(null,{status:"fail",message:"Error while deleting Data from user info"});
                                  }
                                  else
                                  {
                                      cb(null,{status:"success",message:"Successfully deleted"});
                                  }
                              })
                            }
                            else
                            {
                              cb(null,{status:"success",message:"Successfully deleted"});
                            }                          }
                        })


                      }
                      else
                      {
                        cb(null,{status:"fail",message:"User Not found"});
                      }
                    }
                })
              }
              else
              {
                  cb(null,{status:"fail",message:"No licence Found"});
              }
            }
        })
      }
      catch (e)
      {
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

   User.remoteMethod(
        'deleteAllDevice', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/deleteAllDevice',verb:'post'}
        });

  /* ================== Get Countries ========================== */

   User.generalUserData = function (req, cb)
   {
     try
     {
console.log("==============genraldata ====================")
       let countryModel = app.models.countries;
       async.waterfall([
         function(callback) {
           getCountries().then(function(countryInfo)
           {
             callback(null, countryInfo);
           })
           .catch(function(err)
           {
             callback(err);
           });
         },
         function(countryInfo, callback)
         {
           getAgeCategaory(countryInfo).then(function(age)
           {
             callback(null, countryInfo,age);
           })
           .catch(function(err)
           {
             callback(err);
           })
         },
         function(countryInfo,age, callback)
         {
           getVersion(countryInfo,age).then(function(genearalDataWithVersion)
           {
             callback(null, genearalDataWithVersion);
           })
           .catch(function(err)
           {
             callback(err);
           })
         }
       ], function (err, genearalDataWithVersion)
       {
         if(err)
         {
           cb(null,{status:"fail",message:"Error while getting error",error:err})
         }
         else
         {
		//console.log("========genearalDataWithVersion===============",genearalDataWithVersion);
           cb(null,{status:"success",data:genearalDataWithVersion})
         }
       });
     }
     catch (e)
     {
       cb(null,{status:"fail",message:"Exception Error",err:e});
     }
   }

   User.remoteMethod(
       'generalUserData', {
         accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
         returns: [{arg: 'data',type: 'Object'}],
         http: {path: '/generalUserData',verb:'post'}
       });

   /* ================== Get Countries ========================== */

   User.sendEmail = function (req, cb)
   {
      try
      {
        let aData = {firstName:"shashank",lastName:"shashank",email:"shashank.shahi1705@gmail.com"}
        sendEmail(aData);
      }
      catch (e)
      {
        cb(null,{status:"fail",message:"Exception Error",err:e});
      }
    }

   User.remoteMethod(
        'sendEmail', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{arg: 'data',type: 'Object'}],
          http: {path: '/sendEmail',verb:'post'}
        });

    /* =============== Authenticate Email  ====================== */

   User.approveAuthUser = function (req, cb)
   {
       let reqObject = req.res.req;
       let aData = JSON.parse(reqObject.body.data);
       //let aData = reqObject.body.data;
       let userInfoModel = app.models.user_info;
	//console.log("approveAuthUser ",aData);
       User.updateAll({id:aData.userID},{emailVerified:1},function(err,updated)
       {
          if(err)
          {
            cb(null,{status:"fail",message:"Error While updating"})
          }
          else
          {
            userInfoModel.updateAll({user_id:aData.userID},{status:1},function(err,updated)
            {
              if(err)
              {
                cb(null,{status:"fail",message:"Error While updating"})
              }
              else
              {
                cb(null,{status:"success",message:"Successfully updated"})
              }
            })
          }
       })

   }

   User.remoteMethod(
         'approveAuthUser', {
           accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
           returns: [{arg: 'data',type: 'Object'}],
           http: {path: '/approveAuthUser',verb:'post'}
         });


  User.updateCountry = function (req, cb)
  {
    try
    {
      let reqObject = req.res.req;
      let aData = JSON.parse(reqObject.body.data);
      let userChildModel =  app.models.user_childs;
	//console.log("data============",aData);
	 if(reqObject.accessToken)
      {
	//console.log(reqObject.accessToken);
        User.findOne({where:{id:parseInt(aData.userId)}},function(err,data)
        {
          if(err)
          {
            cb(null,{status:"failure"});
          }
          else
          {
		//console.log(data);
            if(data)
            {
              User.updateAll({id:data.id},{country_id:parseInt(aData.countryId),countryCode:aData.countryName},function(err,update){
                if(err)
                {
                  cb(null,{status:"update failure"})
                }
                else
                {
                  userChildModel.updateAll({user_id:data.id},{country_id:parseInt(aData.countryId),countryCode:aData.countryName},function(err,update){
                    if(err)
                    {
                      cb(null,{status:"update failure"})
                    }
                    else
                    {
                      cb(null,{status:"success"})
                    }
                  })
                }
              })
            }
          }
        })
      }
      else
      {
        cb(null,{status:"failure"});
      }

    }
    catch (e)
    {
      cb(null,{status:"fail",message:"Exception Error",err:e});
    }
  }

  User.remoteMethod(
      'updateCountry', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/updateCountry',verb:'post'}
      });


  /* ================ iosLogin =============*/

  User.iosLogin = function (req, cb)
  {
   try
   {
     let reqObject = req.res.req;
     let aData = JSON.parse(reqObject.body.data);
     //let aData = {userId:1,userName:"shashank",licence:"UK72db1o8111a1252"}
     let licenceModel =  app.models.licences;
     let userInfoModel =  app.models.user_info;
     // if(reqObject.accessToken)
     // {
         async.waterfall([
           function(callback)
           {
             checkLicence(aData).then(function(licenceValue)
             {
               callback(null, licenceValue);
             })
             .catch(function(err)
             {
               callback(err);
             });
           },
           function(licenceValue, callback)
           {
             checkUserLicencesCount(aData,licenceValue).then(function(userInfo)
             {
               callback(null,userInfo,licenceValue);
             })
             .catch(function(err)
             {
               callback(err);
             });
           },
           function(userInfo,licenceValue, callback)
           {
             checkUserLicencesIos(aData,userInfo,licenceValue).then(function(userData)
             {
               //console.log(userData);
               callback(null, userData);
             })
             .catch(function(err)
             {
               callback(err);
             });
           },
       ], function (err, result)
       {
         if(err)
         {
		console.log(err);
           cb(null,{status:"fail",message:err})
         }
         else
         {
	   console.log("result ===================",result)
           cb(null,{status:"success",data:result})
         }
       });
     // }
     // else
     // {
     //   cb(null,{status:"failure"});
     // }

   }
   catch (e)
   {
console.log("err",e);

     cb(null,{status:"fail",message:"Exception Error",err:e});
   }
 }

  User.remoteMethod(
       'iosLogin', {
         accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
         returns: [{arg: 'data',type: 'Object'}],
         http: {path: '/iosLogin',verb:'post'}
       });


 /* ========= Register purchase shop ios user =============== */

 User.registerPurcahaseShop = function (req, cb)
 {
  try
  {
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
    //let aData = {country_id:4,countryCode:"UK",email:"shashank.shahi1705@gmail.com",
    //userID:11,userName:"shashank"}
    let licenceModel =  app.models.licences;
    let userInfoModel =  app.models.user_info;
     if(reqObject.accessToken)
     {

        async.waterfall([
          function(callback)
          {
            addLicence(aData).then(function(licenceValue)
            {
              callback(null, licenceValue);
            })
            .catch(function(err)
            {
              callback(err);
            });
          },
          function(licenceValue, callback)
          {
            updateUserLicenceEmail(aData,licenceValue).then(function(userInfo)
            {
              callback(null,userInfo,licenceValue);
            })
            .catch(function(err)
            {
              callback(err);
            });
          },
          function(userInfo,licenceValue, callback)
          {
             sendLicenceEmail(aData,licenceValue)
             callback(null,1);
             //.then(function(userData)
            // {
            //   callback(null, userData);
            // })
            // .catch(function(err)
            // {
            //   callback(err);
            // });

          },
      ], function (err, result)
      {
        if(err)
        {
          cb(null,{status:"fail",message:err})
        }
        else
        {
          cb(null,{status:"success",messgae:"Successfully updated and send email"})
        }
      });
     }
     else
     {
       cb(null,{status:"failure"});
     }

  }
  catch (e)
  {
 console.log("err",e);

    cb(null,{status:"fail",message:"Exception Error",err:e});
  }
 }

 User.remoteMethod(
      'registerPurcahaseShop', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/registerPurcahaseShop',verb:'post'}
      });


/* register and check */

User.checkTestUser = function (req, cb)
{
 try
 {
   let reqObject = req.res.req;
   let aData = JSON.parse(reqObject.body.data);
   //let aData = {deviceToken:"asdasdb2125ssds3b"};
   let testUsersmodel = app.models.test_users;
    testUsersmodel.findOne({where:{deviceToken:aData.deviceToken}},function(err,testUserInfo){
      if(err)
      {
        cb(null,{status:"fail"})
      }
      else
      {
        if(testUserInfo)
        {
          cb(null,{status:"success",data:testUserInfo.genratedUserName})
        }
        else
        {
          let auth = randomstring.generate(8);
          testUsersmodel.create({deviceToken:aData.deviceToken,genratedUserName:auth,created:new Date(),modified:new Date()},function(err,testCreated)
          {
              if(err)
              {
                cb(null,{status:"fail"})
              }
              else
              {
                cb(null,{status:"success",data:auth})
              }
          })
        }
      }
    })
 }
 catch (e)
 {
   cb(null,{status:"fail",message:"Exception Error",err:e});
 }
}

User.remoteMethod(
     'checkTestUser', {
       accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
       returns: [{arg: 'data',type: 'Object'}],
       http: {path: '/checkTestUser',verb:'post'}
     });





};

/* ===============  Upload Image =================== */

function uploadImage(image,id)
{
  return new Promise(function(resolve, reject)
  {
    let userChildModel = app.models.user_childs;
    let random = randomstring.generate();
    let pic_ext = 'png';
    let picname = random + '.' + pic_ext;
    let path = serverUrl.profile_storage + picname;
    let savePath = serverUrl.get_profile_storage + random + '.' + pic_ext;
    const fs = require('fs');
    sharp(new Buffer(image,"base64")).resize(250).toFile(path) .then(function(output)
    {
      userChildModel.findOne({where:{id:id}}, function(err, userData)
      {
        if(err)
        {
          reject(0)
        }
        else
        {
          try
          {
            fs.unlinkSync("client/"+userData.profileImage);
          }
          catch(err)
          {

          }
          userChildModel.updateAll({id:id},{profilePic:savePath}, function(err, Udata)
          {
            if (err)
            {
              reject(0)
            }
            else
            {
              resolve(1)
            }
          });
        }
      })
    });
  })
}



function uploadImage1(image,id)
{
  console.log("HIt")
  return new Promise(function(resolve, reject)
  {
    let userChildModel = app.models.user_childs;
    //let reqObject = req.res.req;
    //let aData = JSON.parse(reqObject.body.data);
    //console.log(aData.imageData);

    const img = image;
    //var dimensions = sizeOf(img);
    //console.log(dimensions.width, dimensions.height);

    const buffer = Buffer.from(img.substring(img.indexOf(',') + 1));

    let s3Bucket = new AWS.S3( { params: {Bucket:'outsmarted/storage/profile/child'}});

   // let s3Bucket = new AWS.S3( { params: {Bucket:'outsmarted/profile'}});
    let randomS = randomstring.generate();
    let url = 'outsmarted/profile';
    //console.log(s3Bucket);
    // try
    // {
      // if(reqObject.accessToken !== null)
      // {
        userChildModel.findOne({where:{id:id}},function(err,data)
        {
          //console.log(err);
          if(err)
          {
            console.log(err);
            cb(null,{status:0,message:"Error"})
          }
          else
          {
            let imageFile;
            if(data.profilePic != null)
            {
              imageFile = data.profilePic.split("/");
		//console.log("file-Image===",imageFile);
              //deleteFile(url,imageFile[4]);
            }

             let picname = randomS  + ".png";
             let path = serverUrl.facebook_storage + picname;
	     let savePath = "storage/profile/child/" + randomS +  ".png";
	           //console.log("console.log",aData.imageRotation);

            sharp(new Buffer(image, "base64")).resize(250).toBuffer().then(image =>
             {

                let params =  {}
                params.Key = randomS + ".png";
                params.Body = image;
                params.ContentType = 'binary';
                params.ACL = 'public-read';

                s3Bucket.putObject(params, function(err,data1)
                {
                  if (err)
                  {
                    cb(null,{status:0})
                  }
                  else
                  {
                    data.updateAttribute('profilePic', savePath, function(err, updateUserImage)
                    {
                      if(err)
                      {
                        reject(0);
                        //cb(null,{status:0,message:"Error uploading Image"});
                      }
                      else
                      {
                        resolve(1);
                        //cb(null,{status:1,image:savePath});
                      }
                    })
                  }
                })
              })
          }
        })
      // }
      // else
      // {
      //   cb(null,{status:0,message:"Access Token Error"});
      // }
    // }
    // catch(e)
    // {
    //   cb(null,{status:0,message:"Exception"});
    // }
  })
}



async function uploadImage2(image,id)
{
  console.log("========================== Asyn call Image HIt==========================")
  
    let userChildModel = app.models.user_childs;
    //let reqObject = req.res.req;
    //let aData = JSON.parse(reqObject.body.data);
    //console.log(aData.imageData);

    const img = image;
    //var dimensions = sizeOf(img);
    //console.log(dimensions.width, dimensions.height);

    let buffer =  await zlib.unzipSync(Buffer.from(image, 'base64'));

    let s3Bucket = new AWS.S3( { params: {Bucket:'outsmarted/storage/profile/child'}});

   // let s3Bucket = new AWS.S3( { params: {Bucket:'outsmarted/profile'}});
    let randomS = randomstring.generate();
    let url = 'outsmarted/profile';
    //console.log(s3Bucket);
    // try
    // {
      // if(reqObject.accessToken !== null)
      // {
        userChildModel.findOne({where:{id:id}},function(err,data)
        {
          //console.log(err);
          if(err)
          {
            console.log(err);
            cb(null,{status:0,message:"Error"})
          }
          else
          {
            let imageFile;
            if(data.profilePic != null)
            {
              imageFile = data.profilePic.split("/");
		          //console.log("file-Image===",imageFile);
              //deleteFile(url,imageFile[4]);
            }

             let picname = randomS  + ".png";
             let path = serverUrl.facebook_storage + picname;
	           let savePath = "storage/profile/child/" + randomS +  ".png";
	           //console.log("console.log",aData.imageRotation);
             //sharp(new Buffer(image, "base64")).resize(250).toBuffer().then(image =>
              //{
                //console.log(buffer);
             sharp(buffer).resize(200).toBuffer().then(image =>
             {

                let params =  {}
                params.Key = randomS + ".png";
                params.Body = image;
                params.ContentType = 'binary';
                params.ACL = 'public-read';

                s3Bucket.putObject(params, function(err,data1)
                {
                  if (err)
                  {
                    cb(null,{status:0})
                  }
                  else
                  {
                    data.updateAttribute('profilePic', savePath, function(err, updateUserImage)
                    {
                      if(err)
                      {
			console.log("err==================",err);
                        //reject(0);
                        //cb(null,{status:0,message:"Error uploading Image"});
                      }
                      else
                      {
			
			//console.log("err",err);
                        //resolve(1);
                        //cb(null,{status:1,image:savePath});
                      }
                    })
                  }
                })
              })
            }
        })
      // }
      // else
      // {
      //   cb(null,{status:0,message:"Access Token Error"});
      // }
    // }
    // catch(e)
    // {
    //   cb(null,{status:0,message:"Exception"});
    // }
 
}


/* ============== Check Licence is valid or not ====== */

function checkLicence(aData) {
  return new Promise(function(resolve, reject)
  {
    let licenceModel = app.models.licences;
    licenceModel.findOne({where:{licence:aData.licence.trim(),status:1}},function(err,licenceData)
    {
        if(err)
        {
		console.log("error 1",err);
          reject(err);
        }
        else
        {
          if(licenceData)
          {
            resolve(licenceData);
          }
          else
          {
		
            reject("Unauthorized Licence Key");
          }
        }
      })
  });
}

/* ====================  Check User licence Count  =================   */

function checkUserLicencesCount(aData,licenceData)
{
	
  return new Promise(function(resolve, reject)
  {
    let userModel = app.models.user;
    let userInfoModel = app.models.user_info;
    /* checking licence already exist / not */
    userModel.findOne({where:{licence_id:licenceData.id,emailVerified:1,userType:1}},function(err,userInfo)
    {
      if(err)
      {
        console.log("999999999999999999999999",err);
        reject(err);
      }
      else
      {
        if(userInfo)
        {
          userInfoModel.count({user_id:userInfo.id,status:1},function(err,userLicenceCount)
          {
            if(err)
            {
                reject(err);
            }
            else
            {
              console.log(444)
              if(userLicenceCount <= 2)
              {
                //console.log(113)
                let obj = {userCount:userLicenceCount,userId:userInfo.id,emailVerified:userInfo.emailVerified,countryCode:userInfo.countryCode};
                console.log(obj)
                resolve(obj);
              }
              else
              {
                console.log(555)
                /* checking device already Exist */
                userInfoModel.findOne({where:{user_id:userInfo.id,deviceToken:aData.deviceToken}},function(err,deviceExist)
                {
                  if(err)
                  {
                    reject(err);
                  }
                  else
                  {
                    console.log(777)
                    /* checking device already Exist */
                    if(deviceExist && ((userLicenceCount == 1) || (userLicenceCount == 2) || (userLicenceCount == 3) ))
                    {
                      let obj = {userCount:1,userId:deviceExist.user_id,emailVerified:userInfo.emailVerified,countryCode:userInfo.countryCode};
                      resolve(obj);
                    }
                    else
                    {
                      /* if more than 2 then user has reached max device limite */
                      reject("You have already reached maximum device list")
                    }
                  }
                })
              }
            }
          })
        }
        else
        {
	  //console.log("licnec ========",licenceData);

          /* for First Time user  */
          userModel.findOne({where:{licence_id:licenceData.id,emailVerified:null,userType:1}},function(err,userInfoDataUnverified)
          {
            if(err)
            {
              console.log(err);
              reject(err);
            }
            else
            {
//console.log("userInfoDataUnverified=============",userInfoDataUnverified);
              if(userInfoDataUnverified)
              {
                let obj = {userCount:1,userId:userInfoDataUnverified.id,emailVerified:null};
                resolve(obj);
              }
              else
              {
                let obj = {userCount:0,userId:null,emailVerified:null};
                resolve(obj);
              }
            }
          })
        }
      }
    })
});
}

/* ================== Check User  ==================*/

function checkUserLicences(aData,userInfo,licenceValue)
{
//console.log("userInfo",userInfo);

return new Promise(function(resolve, reject)
{
    let userModel = app.models.user;
    let userInfoModel = app.models.user_info;

    /* Adding first device for licence */
    if((userInfo.userCount == 0) && (!userInfo.userId))
    {
      userModel.create({licence_id:licenceValue.id,licenceName:licenceValue.licence,
                        firstName:aData.firstName,lastName:aData.lastName,email:aData.email
                        ,country_id:aData.country_id,countryCode:aData.countryCode,status:1
                        ,questionAsked:0,postcode:aData.postcode,Telephone:aData.Telephone,placeOfPurchase:aData.placeOfPurchase
                        ,hearFrom:aData.hearFrom,marketing:aData.marketing
                        ,created:new Date(),modified:new Date()},function(err,saveUser)
      {
        if(err)
        {
          reject(err);
        }
        else
        {
          userInfoModel.create({user_id:saveUser.id,deviceType:aData.deviceType,deviceToken:aData.deviceToken,status:0,created:new Date(),modified:new Date()},function(err,createUserParentData)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              /* sending authentication token to user */
              getAccessToken(saveUser.id).then(function(token)
              {
                let emailAuth = randomstring.generate(6);
		//if(aData.deviceType == "iOS")
		 	//sendEmail(aData,emailAuth)
                let obj = {message:"Successfully Created and approved",userId:saveUser.id,token:token.id,emailAuth:emailAuth,country:aData.countryCode}
                resolve(obj);
              })
              .catch(function(err)
              {
                reject(err);
              });
            }
          })
        }
      })
    }
    else if((userInfo.userCount == 1) && (userInfo.userId) && (userInfo.emailVerified==null))
    {

     userModel.findOne({where:{id:userInfo.userId}},function(err,userInfoData){
	if(err)
	{
	 console.log(err)
	 reject(err);
	}
	else
	{
	  //console.log(userInfoData)
	  if(userInfoData)
	  {
		userModel.updateAll({id:userInfoData.id},{licence_id:licenceValue.id,licenceName:licenceValue.licence,
          firstName:aData.firstName,lastName:aData.lastName,email:aData.email,country_id:aData.country_id,
          countryCode:aData.countryCode,status:1,questionAsked:0,created:new Date(),
          postcode:aData.postcode,Telephone:aData.Telephone,placeOfPurchase:aData.placeOfPurchase
          ,hearFrom:aData.hearFrom,marketing:aData.marketing,
          modified:new Date()},function(err,saveUser)
      		{
	        if(err)
        	{
	  		console.log(err);
	          reject(err);
        	}
	        else
        	{
			//console.log("222");
	          userInfoModel.updateAll({id:userInfoData.id},{deviceType:aData.deviceType,deviceToken:aData.deviceToken,status:0,created:new Date(),modified:new Date()},function(err,createUserParentData)
        	  {
            		if(err)
            		{
				console.log("Errr",err)
              			reject(err);
            		}
            		else
            		{
			//console.log("232");
             		 	/* sending authentication token to user */
              			getAccessToken(userInfoData.id).then(function(token)
              			{
			//console.log("242");
                			let emailAuth = randomstring.generate(6);
                			//if(aData.deviceType == "iOS")
		 			  //sendEmail(aData,emailAuth)
			                let obj = {message:"Successfully Created and approved",userId:userInfoData.id,token:token.id,emailAuth:emailAuth,country:aData.countryCode}
                			resolve(obj);
              			})
		              .catch(function(err)
              			{
                			reject(err);
              			});
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

    }
     else
    {
      userInfoModel.findOne({where:{user_id:userInfo.userId,deviceToken:aData.deviceToken}},function(err,userOtherInfo)
      {
        if(err)
        {
          reject(err);
        }
        else
        {
          /* checking user device already exist */
          if(userOtherInfo)
          {
            userModel.updateAll({id:userInfo.userId},
              {
              purchaseStatus:1,firstName:aData.firstName,lastName:aData.lastName,postcode:aData.postcode,Telephone:aData.Telephone,placeOfPurchase:aData.placeOfPurchase
              ,hearFrom:aData.hearFrom,marketing:aData.marketing
              ,email:aData.email,modified:new Date()},function(err,saveUser)
            {
              if(err)
              {
                reject(err);
              }
              else
              {
                  getAccessToken(userInfo.userId).then(function(token)
                  {
                    let obj = {message:"approved",userId:userInfo.userId,token:token.id,emailAuth:"",country:userInfo.countryCode}
                    resolve(obj)
                  })
                  .catch(function(err)
                  {
                    reject(err);
                  });
                }
            })
          }
          else
          {
            /* Adding second device for licence */
            userInfoModel.create({user_id:userInfo.userId,deviceToken:aData.deviceToken,deviceType:aData.deviceType,
            status:1,created:new Date(),modified:new Date()},function(err,createUserParentData)
            {
              if(err)
              {
                reject(err);
              }
              else
              {
                  userModel.updateAll({id:userInfo.userId},
                  {purchaseStatus:1,firstName:aData.firstName,lastName:aData.lastName
                    ,postcode:aData.postcode,Telephone:aData.Telephone,placeOfPurchase:aData.placeOfPurchase
                        ,hearFrom:aData.hearFrom,marketing:aData.marketing,
                  email:aData.email,modified:new Date()},function(err,saveUser)
                  {
                    if(err)
                    {
                      reject(err);
                    }
                    else
                    {
                      getAccessToken(userInfo.userId).then(function(token)
                      {
                        if((userInfo.userCount == 0) && (userInfo.userId))
                        {
                          let emailAuth = randomstring.generate(6);
                          let obj = {message:"Successfully Created and approved",userId:userInfo.userId,token:token.id,emailAuth:"",country:userInfo.countryCode}
                          resolve(obj)
                        }
                        else
                        {
                          let emailAuth = randomstring.generate(6);
                          let obj = {message:"Successfully Created and approved",userId:userInfo.userId,token:token.id,emailAuth:"",country:userInfo.countryCode}
                          resolve(obj)
                        }
                      })
                      .catch(function(err)
                      {
                        reject(err);
                      });
                    }
                  })
              }
            })
          }
        }
      })
    }
  });
}

/* check User Ios*/

function checkUserLicencesIos(aData,userInfo,licenceValue)
{
  return new Promise(function(resolve, reject)
  {
      let userModel = app.models.user;
      let userInfoModel = app.models.user_info;
	//console.log("userInfo=========",userInfo);
	//console.log("licenceValue======",licenceValue);
      if((userInfo.userCount == 0) && (!userInfo.userId))
    {
      userModel.findOne({where:{id:aData.userId}},function(err,userDataInfo)
      {
        if(err)
        {
          reject(err);
        }
        else
        {
          if(userDataInfo)
          {
            userModel.updateAll({id:aData.userId},{firstName:aData.userName,licence_id:licenceValue.id,licenceName:licenceValue.licence,purchaseStatus:1},function(err,update)
            {
              if(err)
              {
                console.log("eerrrr======================",err);
                reject(err);
              }
              else
              {
                console.log("==2>><<>===============");
                userInfoModel.create({user_id:aData.userId,deviceType:'IOS',deviceToken:aData.deviceToken,status:1,created:new Date(),modified:new Date()},function(err,createUserParentData)
                {
                  if(err)
                  {
                    console.log(err);
                    reject(err);
                  }
                  else
                  {
                    getAccessToken(aData.userId).then(function(token)
                    {
                    let obj = {message:"Successfully Created and approved",userId:aData.userId,token:token.id,country:"UK"}
                    resolve(obj);
                    })
                    .catch(function(err)
                    {
                    reject(err);
                    });
                  }
                })
              }
             })
            }
            else
            {
              reject("user not found");
            }
          }
      })
     }
     else
      {
	console.log("ssssssss")
        userInfoModel.findOne({where:{user_id:userInfo.userId,deviceToken:aData.deviceToken}},function(err,userOtherInfo)
        {
          if(err)
          {
	    console.log("2223eee",err);
            reject(err);
          }
          else
          {
            /* checking user device already exist */
	    console.log(userOtherInfo);
            if(userOtherInfo)
            {
              getAccessToken(userInfo.userId).then(function(token)
              {
                let obj = {message:"approved",userId:userInfo.userId,token:token.id,emailAuth:"",country:userInfo.countryCode}
                resolve(obj)
              })
              .catch(function(err)
              {
                reject(err);
              });
            }
            else
            {
console.log("enter to gddd================")
              /* Adding second device for licence */
              userInfoModel.create({user_id:userInfo.userId,deviceToken:aData.deviceToken,deviceType:"IOS",status:1,created:new Date(),modified:new Date()},function(err,createUserParentData)
              {
                if(err)
                {
console.log("2222223333eee",err);
                  reject(err);
                }
                else
                {
console.log("deviceToken")
                  getAccessToken(userInfo.userId).then(function(token)
                  {
                    if((userInfo.userCount == 0) && (userInfo.userId))
                    {
console.log("deviceToken2",token)
                      let obj = {message:"Successfully Created and approved",userId:userInfo.userId,token:token.id,country:"UK"}
                      resolve(obj)
                    }
                    else
                    {
		      console.log("deviceToken1s",token)

                      let obj = {message:"Successfully Created and approved",userId:userInfo.userId,token:token.id,country:"UK"}
                      resolve(obj)
                    }
                  })
                  .catch(function(err)
                  {
                    reject(err);
                  });
                }
              })
            }
          }
        })
      }
    });
}


/* ================== Generating Access Token =================== */

function getAccessToken(data,cb)
{
console.log("AccessToken Data==============",data);
  return new Promise(function(resolve, reject)
  {
    let userModel =  app.models.user;
    userModel.findOne({where: {id: data}}, function(err, userData)
    {
      if (err)
      {
        reject(err);
      }
      else
      {
        userData.createAccessToken(86400000, function(err, token)
        {
          if (err)
          {
            reject(err);
          }
          else
          {
            resolve(token);
          }
       })
      }
    })
  });
}

/* ============== check login for new accessToken ================== */

function checkUserLogin(aData,licenceValue)
{
  let userModel = app.models.user;
  let userInfoModel = app.models.user_info;
  return new Promise(function(resolve, reject)
  {
    userModel.findOne({where:{id:aData.id,licence_id:licenceValue.id}},function(err,userVal)
    {
        if(err)
        {
          reject(err);
        }
        else
        {
          if(userVal)
          {
            userInfoModel.findOne({where:{user_id:aData.id,deviceToken:aData.deviceToken}},function(err,userDevice)
            {
              if(err)
              {

              }
              else
              {
                if(userDevice)
                {
                  userVal.createAccessToken(86400000, function(err, token)
                  {
                    if (err)
                    {
                      reject("An Error has occurred, Please Try Again");
                    }
                    else
                    {
                      let obj = {message: "new access token",country:userVal.countryCode,token:token.id}
                      resolve(obj);
                    }
                  });
                }
                else
                {
                  reject("Device Token Not Exist for particular licence");
                }
              }
            })
          }
          else
          {
            reject("User not found");
          }
        }
    })
  })
}

/* ============== Get Countries ================== */

function getCountries()
{
  let countriesModel = app.models.countries;
  return new Promise(function(resolve, reject)
  {
    countriesModel.find({fields:{name:true,id:true,language:true}},function(err,countryData)
    {
      if(err)
      {
        reject(err)
      }
      else
      {
        let countries =[];
        for(let i=0;i<countryData.length;i++)
        {

          countries.push(countryData[i]);
        }
        //console.log(countries);
        resolve(countries)
      }
    })
  })
}

/* ==================== Get Age Category ================ */

function getAgeCategaory(countryInfo)
{
  let ageModel = app.models.age_categories;
  return new Promise(function(resolve, reject)
  {
    ageModel.find({fields:{age:true,id:true}},function(err,ageData)
    {
      if(err)
      {
        reject(err)
      }
      else
      {
        let age = [];
        for(let i=0;i<ageData.length;i++)
        {
          //age.push(ageData[i].age);
          age.push(ageData[i]);
        }

        // let obj = {
        //             country:countryInfo,
        //             age:age
        //           }
        resolve(age)
      }
    })
  })
}

/* ==================== Get Versions ================ */

function getVersion(countryInfo,age)
{
  let appVersionsModel = app.models.app_versions;
  return new Promise(function(resolve, reject)
  {
    appVersionsModel.find({fields:{device:true,gameVersion:true,heading:true,message:true,status:true}},function(err,version)
    {
      if(err)
      {
        reject(err)
      }
      else
      {
        let versionArr = [];
        for(let i=0;i<version.length;i++)
        {
          //age.push(ageData[i].age);
          versionArr.push(version[i]);
        }

        let obj = {
                    country:countryInfo,
                    age:age,
                    version:versionArr
                  }
        resolve(obj)
      }
    })
  })
}


/* ============== Send Email for Authentication =========*/

function sendLicenceEmail(aData,licence)
{
  return new Promise(function(resolve, reject)
  {
    let myMessage = { firstName: aData.userName, auth: licence.licence };
    let renderer = loopback.template(path.resolve(__dirname, '../../server/views/email/licenceConfirm.html'));
    let html_body = renderer(myMessage);
    nodemailer.createTransport({ sendmail: true })
    loopback.Email.send({
      to: aData.email,
      from: '"Outsmarted" <registration@outsmarted.co.uk>',
      subject: "Authentication",
      html: html_body,
    }, function (err, result) {
        if (err)
        {
          console.log("err",err);
          //reject(0)
        }
        else
        {
          console.log(result);
          //resolve(1);
        }
      });
  })
}

/* ============== Send Email for Authentication =========*/

function sendEmail(aData,emailAuth)
{
  return new Promise(function(resolve, reject)
  {
    let myMessage = { firstName: aData.firstName, auth: emailAuth };
    let renderer = loopback.template(path.resolve(__dirname, '../../server/views/email/registrationConfirm.html'));
    let html_body = renderer(myMessage);
    nodemailer.createTransport({ sendmail: true })
    loopback.Email.send({
      to: aData.email,
      from: '"Outsmarted" <registration@outsmarted.co.uk>',
      subject: "Authentication",
      html: html_body,
    }, function (err, result) {
        if (err)
        {
          console.log(err);
        }
        else
        {
          console.log("send", result);
        }
      });
  })
}


function checkIosUserLogin(aData)
{
  let userModel = app.models.user;
  let userInfoModel = app.models.user_info;
  return new Promise(function(resolve, reject)
  {
    userModel.findOne({where:{id:aData.id,token:aData.deviceToken}},function(err,userVal)
    {
        if(err)
        {
          reject(err);
        }
        else
        {
          if(userVal)
          {
              userVal.createAccessToken(86400000, function(err, token)
              {
                if (err)
                {
                  reject("An Error has occurred, Please Try Again");
                }
                else
                {
                  let obj = {message: "new access token",token:token.id}
                  resolve(obj);
                }
              });
          }
          else
          {
            reject("User not found");
          }
        }
    })
  })
}

/* =================== Send   ==========================*/

function checkIosUser(aData)
{
  return new Promise(function(resolve, reject)
  {
    let userModel = app.models.user;
    let saveGameModel= app.models.saved_games;
    userModel.findOne({where:{deviceToken:aData.deviceToken}},function(err,data)
    {
      if(err)
      {
        reject(0)
      }
      else
      {
        if(data)
        {
          getAccessToken(data.id).then(function(token)
          {
      	    let obj = {message:"approved",userId:data.id,token:token.id,country:data.countryCode,PreviousGameData:""}
            saveGameModel.findOne({where:{user_id:data.id}},function
            (err,saveDataInfo)
              {
              if(err)
              {
	        reject(0)
              }
              else
              {
		            //console.log("saveGame ",saveDataInfo);
                if(saveDataInfo)
                {
                  obj = {message:"approved",userId:data.id,purchaseStatus:data.purchaseStatus,token:token.id,country:data.countryCode,PreviousGameData:saveDataInfo.game}
		                resolve(obj)
                }
                else
                {
                  obj = {message:"approved",userId:data.id,purchaseStatus:data.purchaseStatus,token:token.id,country:data.countryCode,PreviousGameData:""}
		  resolve(obj)
                }
              }
            });
          })
          .catch(function(err)
          {
            reject(err);
          });
        }
        else
        {
          userModel.create({deviceToken:aData.deviceToken,firstName:'iosUser',lastName:'ioUser',email:'ioUserTest',country_id:4,countryCode:'United Kingdom',status:1,created:new Date(),modified:new Date(),emailVerified:1,purchaseStatus:0},function(err,saveUser)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              getAccessToken(saveUser.id).then(function(token)
              {
        	let obj = {message:"Register and approved",userId:saveUser.id,token:token.id,country:'United Kingdom',PreviousGameData:"",purchaseStatus:0}
                resolve(obj);
              })
              .catch(function(err)
              {
                reject(err);
              });
            }
          })
        }
      }
    })
  })
}

/* Add licence*/

function addLicence(aData)
{
  return new Promise(function(resolve, reject)
  {
    let licenceModel =  app.models.licences;
    let countryModel =  app.models.countries;
    let todayDate = Date.now();
    var chars = "board"+todayDate.toString();
    var randomstring = '';
    countryModel.findOne({where:{id:aData.country_id}},function(err,countryInfo){
      if(err)
      {
        reject(0)
      }
      else
      {
        let obj = {licence:"",country_id:aData.country_id,countryCode:countryInfo.code,distributor_id:4,distributorName:"Testers",status:1,created:new Date(),modified:new Date()};

        var string_length = 15;
        for (var i = 0; i < string_length; i++)
        {
          var rnum = Math.floor(Math.random() * chars.length);
          randomstring += chars.substring(rnum, rnum + 1);
        }
        obj.licence = aData.countryCode+randomstring;

        console.log(obj)

        licenceModel.create(obj,function(err,data)
        {
          if(err)
          {
            console.log(err);
            reject(0)
          }
          else
          {
            let licecneobj = {licence:obj.licence,id:data.id}
            resolve(licecneobj)
          }
        })
      }
    })
  })
}

/* update user email info */


function updateUserLicenceEmail(aData,licenceInfo)
{
  return new Promise(function(resolve, reject)
  {
    let userModel =  app.models.user;
    userModel.findOne({where:{id:aData.userID}},function(err,userInfo)
    {
      if(err)
      {
          reject(0)
      }
      else
      {
        userInfo.updateAttributes( { emial: aData.email,firstName:aData.userName,licence_id:licenceInfo.id,licenceName:licenceInfo.licence}, function (err, updatedInfo)
        {
          if (err)
          {
            reject(0)
          }
          else
          {
            resolve(1);
          }
       });
      }
    })
  })
}


function deleteFile(url,fileName)
{
  let cont = app.models.Container;
  cont.removeFile(url, fileName, function (err, data)
  {
    if (err)
    {
      console.log("Check if you have sufficient permissions : "+err);
    }
    else
    {
      console.log("File deleted successfully");
    }
  });
}

