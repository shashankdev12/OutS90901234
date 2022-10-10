'use strict';
let app = require('../../server/server');
let loopback =  require('loopback');
let path = require('path');
let async = require('async');

module.exports = function(Questionpackages) {

  /* ============== Get All Packages ============= */

  Questionpackages.getPackages = function (req, cb)
  {
    try
    {
      let reqObject = req.res.req;
      let questionPackagesModel =  app.models.question_packages;
      let questionModel = app.models.questions;
      let userModel = app.models.user;

      // if(reqObject.accessToken)
      // {
        userModel.findOne({where:{id:reqObject.accessToken.userId}},function(err,userInfo)
        {
          if(err)
          {
             cb(null,{status:"fail",message:"Error while Getting userinfo "})
          }
          else
          {
		        //console.log("userInfo==========",userInfo);
            if(userInfo)
            {
              questionPackagesModel.find({where:{status:1},fields:{created:false,modified:false}},function(err,packages)
              {
                if(err)
                {
                  cb(null,{status:"fail",message:"Error while getting packages info"});
                }
                else
                {
                  let array = [];
                  let userPackage = userInfo.packages.split(",");
		              console.log("userPackage",userPackage);
                  for(let i=0;i<packages.length;i++)
                  {
                    let obj = {packageName:null,packageDescription:null,packageLogo:null,packageSubcategory:null,index:null,cost:null,status:0,id:null,
                               purchased:0,countries:'',categories:'',age:''}
                    obj.packageName = packages[i].packageName;
                    obj.packageDescription = packages[i].packageDescription;
                    obj.packageLogo = packages[i].packageLogo;
                    obj.packageSubcategory = packages[i].packageSubcategory;
                    obj.index = packages[i].costIndex;
                    obj.cost = packages[i].cost;
                    obj.status = packages[i].status;
                    obj.id = packages[i].id;
                    obj.countries = packages[i].countries;
                    obj.categories = packages[i].categories;
                    obj.age = packages[i].age;

                    for(let j=0;j<userPackage.length;j++)
                    {
                      if(packages[i].id == userPackage[j])
                      {
                        obj.purchased = 1;
                      }
                    }
             		    let questions =  app.models.questions;
       		         let ds1 = questions.dataSource;
                    ds1.connector.query('SELECT COUNT(DISTINCT questionGroupId) as pkID FROM questions  WHERE pack_ID = '+packages[i].id+' ', function (err, questionCount)
                    {
                      if(!err)
                    {
                        //console.log("entries ",questionCount[0].pkID);
                        obj.questionCount = questionCount[0].pkID;
                        
                        array.push(obj);
                        if(array.length == packages.length) {
                          cb(null,{status:"success",packages:array});
                        }		        
                      }
                      else {
			                  obj.questionCount = 0;

                        cb(null,{status:"success",packages:array});
                      }
                    });
                  }
                }
              })
            }
            else
            {
              cb(null,{status:"fail",message:"userInfo not found"})
            }
          }
        })
      // }
      // else
      // {
      //   cb(null,{status:"fail",message:"Access Token not found"})
      // }
    }
    catch (e)
    {
      cb(null,{status:"fail",message:"Exception Error",err:e});
    }
  }

  Questionpackages.remoteMethod(
      'getPackages', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getPackages',verb: 'post'}
  });

  /* Package by region */

    Questionpackages.getPackages2 = function (req, cb)
  {
    try
    {
      let reqObject = req.res.req;
      let questionPackagesModel =  app.models.question_packages;
      let questionModel = app.models.questions;
      let userModel = app.models.user;
      let questions =  app.models.questions;
      let ds1 = questions.dataSource;
      let categoryModel = app.models.categories;

      // if(reqObject.accessToken)
      // {        
		userModel.findOne({where:{id:reqObject.accessToken.userId},fields:{id:true,country_id:true,packages:true}},function(err,userInfo)
        {
          if(err)
          {
             cb(null,{status:"fail",message:"Error while Getting userinfo "})
          }
          else
          {
            if(userInfo)
            {
              categoryModel.find({fields:{id:true,iconImage:true}},function(err,cateInfo){

              
              questionPackagesModel.find({order:"costIndex ASC",where:{status:1},fields:{created:false,modified:false}},function(err,packages)
              {
                if(err)
                {
                  cb(null,{status:"fail"})
                }
                else
                {
                  if(packages.length > 0 )
                  {
                    let userPack=[];
                    let i=0
                    async.eachSeries(packages, function(packInfo, callback)
                    {
                      i++;
                      let countries = packInfo.countries.split(',');

                      if(countries.includes(userInfo.country_id.toString()))
                      {
                        userPack.push(packInfo);
                      }

                      if(packages.length == i)
                      {
                        let j=0;
                        let userFinalPacks =[];
                        let userPurchasePackages =userInfo.packages.split(',')
                        //console.log(userPack);
                        //console.log(1);
			                if(userPack.length > 0 )
                        {
                        async.eachSeries(userPack, function(userPackValue, callback2)
                        { 
                          //console.log(userPackValue);
                          let obj = {packageName:"",packageDescription:"",packageLogo:"",packageSubcategory:"",index:"",cost:"",status:0
                          ,id:0,purchased:0,countries:"",categories:"",age:"",questionCount:""}
                          
                          //console.log('userInfo',userInfo);
                          
                            ds1.connector.query('SELECT COUNT(DISTINCT questionGroupId) as pkID FROM questions  WHERE pack_ID = '+userPackValue.id+' ', function (err, questionCount)
                            {
                              if(!err)
                              {
                                obj.packageName = userPackValue.packageName;
                                obj.packageDescription = userPackValue.packageDescription;
                                obj.packageLogo = userPackValue.packageLogo;
                                obj.packageSubcategory = userPackValue.packageSubcategory;
                                obj.costIndex = userPackValue.costIndex;
                                obj.cost = userPackValue.cost;
                                obj.countries = userPackValue.countries;
                                obj.age = userPackValue.age;
                                obj.categories = userPackValue.categories;
                                obj.corePack = userPackValue.corePack;
                                obj.questionCount = questionCount[0].pkID;
                                obj.id = userPackValue.id;
                                
                                  if(userPackValue.corePack == 1)
                                  {
                                    obj.purchased =1
                                    userFinalPacks.push(obj);
                                  }
                                  else
                                  {
                                    if(userPurchasePackages.includes(userPackValue.id.toString()))
                                    {
                                        if(!userFinalPacks.includes(userPackValue.id.toString()))
                                        {
                                          obj.purchased =1
                                          userFinalPacks.push(obj);
                                        }
                                    }
                                    else
                                    {
                                      if(!userFinalPacks.includes(userPackValue.id.toString()))
                                        {
                                          obj.purchased =0
                                          userFinalPacks.push(obj);
                                        }
                                    }
                                  }
                                  j++;		
                                  callback2();        
                              }
                              else {
                                obj.packageName = userPackValue.packageName;
                                obj.packageDescription = userPackValue.packageDescription;
                                obj.packageLogo = userPackValue.packageLogo;
                                obj.packageSubcategory = userPackValue.packageSubcategory;
                                obj.costIndex = userPackValue.costIndex;
                                obj.cost = userPackValue.cost;
                                obj.age = userPackValue.age;
                                obj.countries = userPackValue.countries;
                                obj.categories = userPackValue.categories;
                                obj.corePack = userPackValue.corePack;
                                obj.questionCount = 0;
                                obj.id = userPackValue.id;

                                if(userPackValue.corePack == 1)
                                  {
                                    obj.purchased =1
                                    userFinalPacks.push(obj);
                                  }
                                  else
                                  {
                                    if(userPurchasePackages.includes(userPackValue.id.toString()))
                                    {
                                        if(!userFinalPacks.includes(userPackValue.id.toString()))
                                        {
                                          obj.purchased =1
                                          userFinalPacks.push(obj);
                                        }
                                    }
                                    else
                                    {
                                      if(!userFinalPacks.includes(userPackValue.id.toString()))
                                        {
                                          obj.purchased =0
                                          userFinalPacks.push(obj);
                                        }
                                    }
                                }
                                j++;
                                callback2();
                              }
                              if(j == userPack.length)
                              {

				                        userFinalPacks.sort((a, b) => 
                                {
                                  return  b.purchased - a.purchased;
                                });


                                // categoryModel.find({where:{status:1}},function(err,cateInfo)
                                // {

                                   cb(null,{status:"success",packages:userFinalPacks,category:cateInfo})  
                                // })
                                
                              }
                            });
                        })
                 
                      }
                      else
                      {
                        cb(null,{status:"success",packages:[],category:cateInfo}) 
                      }
                        //cb(null,{status:"success",data:userPack})
                      } 
                      else
                      {
                        
                        callback();
                      }
                    })
                      //console.log("----------------------",countries)
                      //console.log('userPack======>',userPack)
                    //console.log("-----------------------",packages);
                  }
                  else
                  {
                    cb(null,{status:"fail",message:"Can not get packages"})
                  }
                }
              })
            })
            }
          }
            
        })
      // }
      // else
      // {
      //   cb(null,{status:"fail",message:"Access Token not found"})
      // }
    }
    catch (e)
    {
      cb(null,{status:"fail",message:"Exception Error",err:e});
    }
  }

  Questionpackages.remoteMethod(
      'getPackages2', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getPackages2',verb: 'post'}
  });


 /* ============= Purchase Packages ================= */

 Questionpackages.purchasePackage = function (req, cb)
 {
     let userModel = app.models.user;
     let reqObject = req.res.req;
     let aData = JSON.parse(reqObject.body.data);
     //let aData = reqObject.body.data;
     try
     {
       /* checking the valid user */
       if(reqObject.accessToken)
       {
         /* getting useralready packages */
         userModel.findOne({where:{id:reqObject.accessToken.userId}},function(err,userInfo)
         {
            if(err)
            {
              cb(null,{status:"fail",message:"Error while getting userInfo"});
            }
            else
            {
              /* checking exist / not*/
              if(userInfo)
              {
                /* adding new package with current package */
                let userPackage = userInfo.packages+","+aData.packageId;
                /* updating package to user */
                userInfo.updateAttributes({packages:userPackage,purchaseStatus:1},function(err,updated)
                {
                  if(err)
                  {
                    cb(null,{status:"fail",message:"Error while updating packages"})
                  }
                  else
                  {
                    cb(null,{status:"success",message:"Successfully updated the package"})
                  }
                })
              }
              else
              {
                cb(null,{status:"fail",message:"No user found"});
              }
            }
         })
       }
       else
       {
         cb(null,{status:"fail",message:"Access Token not found"});
       }
     }
     catch (e)
     {
       cb(null,{status:"fail",message:"Exception Error",err:e});
     }
 }

 Questionpackages.remoteMethod(
     'purchasePackage', {
       accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
       returns: [{arg: 'data',type: 'Object'}],
       http: {path: '/purchasePackage',verb: 'post'}
  });

  /* ===================         ==================== */

 Questionpackages.addUserPack = function (req, cb)
 {
     let userModel = app.models.user;
     let questionPackagesModel = app.models.question_packages;
     let reqObject = req.res.req;
     let aData = reqObject.body;
     //let aData = {licenceName:"UK5daaba33581122a",packCode:"HHHHH"};
     try
     {
       
       questionPackagesModel.findOne({where:{packageName:aData.packCode}},function(err,packInfo)
       {
         if(err)
         {
           cb(null,{status:"fail",message:"Error while fetching Package"})
         }
         else
         {
           if(packInfo)
           {
             userModel.findOne({where:{licenceName:aData.licenceName}},function(err,userInfo)
             {
               if(err)
               {
                 cb(null,{status:0})
               }
               else
               {
		console.log()
                 if(userInfo)
                 {
                   let userExistPack = userInfo.packages.split(',');
                   let userPack;
                   console.log(userExistPack);
                   if(userExistPack.includes(packInfo.id.toString()))
                   {
                       userPack = userInfo.packages;
                   }
                   else
                   {
                     userPack = userInfo.packages+',' + packInfo.id;
                   }
                   console.log(userPack);
                   userModel.updateAll({id:userInfo.id},{packages:userPack},function(err,userInfo)
                   {
                     cb(null,{status:1})
                   })
                 }
               }
             })
           }
           else
           {
             cb(null,{status:"Fail",message:"No Package Found"});
           }
         }

       })
     }
     catch (e)
     {
       cb(null,{status:"fail",message:"Exception Error",err:e});
     }
 }

 Questionpackages.remoteMethod(
     'addUserPack', {
       accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
       returns: [{arg: 'data',type: 'Object'}],
       http: {path: '/addUserPack',verb: 'post'}
  });

};