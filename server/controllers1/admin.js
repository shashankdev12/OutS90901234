let dsConfig = require('../datasources.json'),
    express = require('express'),
    router = express.Router(),
    methods = {},
    app = require('../server.js');
    async = require('async');
    http = require('http');
    formidable = require('formidable'),
    fs = require('fs');
    randomstring = require("randomstring");
    mv = require('mv');
    sizeOf = require('image-size');
    http = require('http'),
    util = require('util');
    AWS = require('aws-sdk');
    sharp = require('sharp');
    AWS.config.loadFromPath('/home/ubuntu/boardGameTest/board_game/server/aws_config.json');
    var bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

/*============== Models Used ================ */

let licenceModel = app.models.licences,
    countryModel = app.models.countries,
    userModel = app.models.user,
    userInfoModel = app.models.user_info,
    userChildsModel = app.models.user_childs,
    userAgeModel = app.models.age_categories,
    userPackagesModel = app.models.question_packages,
    userQuestionModel = app.models.questions,
    userCategoriesModel = app.models.categories,
    subCategoriesModel = app.models.sub_categories;
    distributorsModel = app.models.distributors;
    messageModel = app.models.messages;
    userGameModel = app.models.user_games;
    userTeamModel = app.models.user_teams;
    userTeamChildModel = app.models.user_team_childs;
    errorLogsModel = app.models.errorlogs;
    tempQuestionModel = app.models.tempquestions
    categoryAgeStatsModel = app.models.category_age_stats
    
    path = require('path');

const csv=require('csvtojson');

  /* ==================== Get adminDashBoard ========================== */

  methods.getDashboard = function(req,res,cb)
  {
    //console.log("sssssssssssssssssss");
      async.waterfall([
        function(callback) {
          // Checking licence
          getLicencesCount(1).then(function(count)
          {
            //console.log("-----------------",count);
            callback(null,count);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(count,callback) {
          // Checking licence
          userModel.count({},function(err,userCount)
          {
            if(err)
            {
              //console.log(err);
              callback(null,count,0);
            }
            else
            {
              //console.log(userCount);
              callback(null,count,userCount);
            }
          })
        }
        ,
        function(count,userCount,callback) {
          // Checking licence
          userChildsModel.count({age_id:1},function(err,juniorCount)
          {
            if(err)
            {
              //console.log(err);
              callback(null,count,0,0);
            }
            else
            {

              callback(null,count,userCount,juniorCount);
            }
          })
        }
        ,
        function(count,userCount,juniorCount,callback) {
          // Checking licence
          userChildsModel.count({age_id:2},function(err,teenCount)
          {
            if(err)
            {
              //console.log(err);
              callback(null,count,0);
            }
            else
            {
              //console.log(userCount);
              callback(null,count,userCount,juniorCount,teenCount);
            }
          })
        }
        ,
        function(count,userCount,juniorCount,teenCount,callback) {
          // Checking licence
          userChildsModel.count({age_id:3},function(err,AdultCount)
          {
            if(err)
            {
              //console.log(err);
              callback(null,count,0);
            }
            else
            {
              //console.log(userCount);
              callback(null,count,userCount,juniorCount,teenCount,AdultCount);
            }
          })
        }
    ], function (err,count,userCount,juniorCount,teenCount,AdultCount)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        //console.log("userCount=====================",userCount);
        cb(null,{status:"success",message:"Successfully get data",licenceCount:count,userCount:userCount,jCount:juniorCount,
        tCount:teenCount,aCount:AdultCount})
      }
    });
  }

  /* ==================== Get licences ========================== */

  methods.getDistributor = function(req,res,cb)
  {
    let sk;
    if(req.query.filter)
    {
      skipV = req.query.filter.skip;
    }
    else
    {
      skipV = 0;
    }

    // calling getGame Data function
    getDistributorData(skipV,req.params).then(function(value)
    {
      getDistributorCount(req.params).then(function(count)
      {
        getAllCountry(0).then(function(country)
        {
          getSpecificDistributorData(req).then(function(info)
          {
            ////consolelog("info>>>>>>>>>>>>>>>>>>>>>",info);
            cb(null,{status:"success",message:"Successfully get data",distributorData:value,distributorCount:count,countryData:country,distributorInfo:info})
          })
          .catch(function(err)
          {
            cb(null,{status:"fail",message:"Fail to get asddddddddddddddddata from licence table",data:null})
          });
        })
        .catch(function(err)
        {
          cb(null,{status:"fail",message:"Fail to get data from licence table",data:null})
        });
      }).catch(function(err) {
        cb(null,{status:"fail",message:"Fail to get data from licence table",data:null})
      });
    }).catch(function(err) {
      cb(null,{status:"fail",message:"Fail to get data from licence table",data:null})
    });
  }


  /* ==================== Get licences ========================== */

  methods.getCountryDistributor = function(req,res,cb)
  {
    let countryVal = req.body.country.split(",");
    //////////consolelog(countryVal[1]);
    distributorsModel.find({where:{country_id:countryVal[1]}},function(err,distributorInfo)
    {
        if(err)
        {
          cb(null,{status:'fail',data:null,message:"errr"});
        }
        else
        {
          cb(null,{status:'success',info:distributorInfo,message:"No Issues"});
        }
    })
  }

  /* =================== adding Distributors =================== */

  methods.setDistributors = function(req,res,cb)
  {
      async.waterfall([
        function(callback) {
          // Checking licence
          checkDistributors(req).then(function(existVal)
          {
            callback(null, existVal);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(existVal, callback)
        {
          setDistributorData(req).then(function(created)
          {
            callback(null,created);
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
        cb(null,{status:"fail",message:err})
      }
      else
      {
        cb(null,{status:"success",message:"Distributor Created"})
      }
    });
  }

  /* ==================== Get licences ========================== */

  methods.getLicences = function(req,res,cb)
  {
    let sk;
    if(req.query.filter)
    {
      skipV = req.query.filter.skip;
    }
    else
    {
      skipV = 0;
    }

    // calling getGame Data function
    getLicencesData(skipV,req.params).then(function(value)
    {
      getLicencesCount(req.params).then(function(count)
      {
        getAllCountry(0).then(function(country)
        {
          if(req.params.id !=  0)
          {
            distributorsModel.find({where:{country_id:req.params.id}},function(err,distributorInfo)
            {
                if(err)
                {
                  cb(null,{status:'fail',data:null,message:"errr"});
                }
                else
                {
                  cb(null,{status:"success",message:"Successfully get data",licenceData:value,licenceCount:count,countryData:country,distributor:distributorInfo})
                }
            })
          }
          else
          {
            cb(null,{status:"success",message:"Successfully get data",licenceData:value,licenceCount:count,countryData:country,distributor:null})
          }
        })
        .catch(function(err)
        {
          cb(null,{status:"fail",message:"Fail to get data from licence table",data:null})
        });
      }).catch(function(err) {
        cb(null,{status:"fail",message:"Fail to get data from licence table",data:null})
      });
    }).catch(function(err) {
      cb(null,{status:"fail",message:"Fail to get data from licence table",data:null})
    });
  }

  methods.getExportedLicences = function(req,res,cb)
  {
    let sk;
    if(req.query.filter)
    {
      skipV = req.query.filter.skip;
    }
    else
    {
      skipV = 0;
    }

    // calling getGame Data function
    getExportedLicencesData(skipV,req.params).then(function(value)
    {
      getExportedLicencesCount(req.params).then(function(count)
      {
        getAllCountry(0).then(function(country)
        {
          if(req.params.id !=  0)
          {
            distributorsModel.find({where:{country_id:req.params.id}},function(err,distributorInfo)
            {
              if(err)
              {
                cb(null,{status:'fail',data:null,message:"errr"});
              }
              else
              {
                cb(null,{status:"success",message:"Successfully get data",licenceData:value,licenceCount:count,countryData:country,distributor:distributorInfo})
              }
            })
          }
          else
          {
            cb(null,{status:"success",message:"Successfully get data",licenceData:value,licenceCount:count,countryData:country,distributor:null})
          }

        })
        .catch(function(err)
        {
          cb(null,{status:"fail",message:"Fail to get data from licence table",data:null})
        });
      }).catch(function(err) {
        cb(null,{status:"fail",message:"Fail to get data from licence table",data:null})
      });
    }).catch(function(err) {
      cb(null,{status:"fail",message:"Fail to get data from licence table",data:null})
    });
  }



  methods.exportQuestionData = function(req,res,cb)
  {
  addExportQuestion(res).then(function(value)
  {
    cb(null, {status:1,message:"Success",subCategory:value});
  })
  .catch(function(err)
  {
    cb(err,{status:0,message:"error",subCategory:null});
  });
}

  /* ====================== Set Licences ======================*/

  methods.setLicences = function(req,res,cb)
  {
      async.waterfall([
        function(callback) {
          // Checking licence
          checkLicence(req).then(function(existVal)
          {
            callback(null, existVal);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(existVal, callback)
        {
          setLicencesData(req).then(function(userCreated)
          {
            callback(null,userCreated);
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
        cb(null,{status:"fail",message:err})
      }
      else
      {
        cb(null,{status:"success",message:"Licence Created"})
      }
    });
  }

  /* ====================== Set Licences ======================*/

  methods.setBulkLicences = function(req,res,cb)
  {
    let countryVal = req.body.country.split(",");
    let distributorVal = req.body.distributor.split(",");
    let finalArray = [];
    for(let j=0;j<req.body.count;j++)
    {
      let todayDate = Date.now();
      var chars = "board"+todayDate.toString();
      var randomstring = '';
      let obj = {licence:"",country_id:countryVal[1],countryCode:countryVal[0],distributor_id:distributorVal[0],distributorName:distributorVal[1],status:1,created:new Date(),modified:new Date()};

      var string_length = 15;
      for (var i = 0; i < string_length; i++)
      {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
      }
      obj.licence = countryVal[0]+randomstring;
      finalArray.push(obj);
    }

      licenceModel.create(finalArray,function(err,data)
      {
        if(err)
        {
          cb(null,{status:"Error while creating licences"})
        }
        else
        {
          cb(null,{status:"Successfully created licences"})
        }
      })


  }

  /* ====================== Set Licences ======================*/

  methods.updateLicenceStatus = function(req,res,cb)
  {
    updateUserStatus(req).then(function(updated)
    {
      cb(null,{status:"success",data: updated});
    })
    .catch(function(err)
    {
      cb(null,{status:"Fail",data: updated});
    });
  }

  /* ==================== Get Countries ========================== */

  methods.getCountries = function(req,res,cb)
  {
      let skipV;
      if(req.query.filter)
      {
        skipV = req.query.filter.skip;
      }
      else
      {
        skipV = 0;
      }

      async.waterfall([
        function(callback) {
          // Checking licence
          getAllCountry(skipV).then(function(value)
          {
            callback(null, value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(value, callback)
        {
          getCountriesCount().then(function(count)
          {
            callback(null,count,value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(count,value, callback)
        {
          getSpecificCountry(req).then(function(countryInfo)
          {
            callback(null,count,value,countryInfo);
          })
          .catch(function(err)
          {
            callback(err);
          });
        }
    ], function (err, count,value,countryInfo)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        cb(null,{status:"success",message:"Successfully get data",countryData:value,countryCount:count,countryInfo:countryInfo})
      }
    });
  }

  /* ====================== Set Country ======================*/

  methods.setCountry = function(req,res,cb)
  {
    if(req.body.id == 0)
    {
      countryModel.create({name:req.body.name,code:req.body.code.toUpperCase(),language:req.body.languages.toUpperCase(),status:1,created:new Date(),modified:new Date()},function(err,data)
      {
        if(err)
        {
          cb(null,{status:"fail",message:"Error While creating country, please try again"})
        }
        else
        {
          cb(null,{status:"success",message:"Country is created successfully"});
        }
      })
    }
    else
    {
      countryModel.updateAll({id:req.body.id},{name:req.body.name,code:req.body.code.toUpperCase(),language:req.body.languages.toUpperCase(),modified:new Date()},function(err,data)
      {
        if(err)
        {
          cb(null,{status:"fail",message:"Error While updating country, please try again"})
        }
        else
        {

          userModel.updateAll({country_id:req.body.id},{countryCode:req.body.name},function(err,updateUserAge){
            //consolelog(err);
          })

          userChildsModel.updateAll({country_id:req.body.id},{countryCode:req.body.name},function(err,updateAge){

          })
          cb(null,{status:"success",message:"Country is updated successfully"});
        }
      })
    }
  }

  /* ==================== Get users ========================== */

  methods.getUsers = function(req,res,cb)
  {
      let skipV;
      if(req.query.filter)
      {
        skipV = req.query.filter.skip;
      }
      else
      {
        skipV = 0;
      }

      async.waterfall([
        function(callback) {
          // Checking licence
          getUsersData(skipV).then(function(value)
          {
            callback(null, value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(value, callback)
        {
          getUsersCount().then(function(count)
          {
            callback(null,count,value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        }
    ], function (err, count,value,countryInfo)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from users table",data:null})
      }
      else
      {
        cb(null,{status:"success",message:"Successfully get data",userData:value,userCount:count})
      }
    });
  }

  /* ==================== Get users Details ========================== */

  methods.getUserDetails = function(req,res,cb)
  {
    async.waterfall([
      function(callback) {
        // Checking user Details
        userDetails(req).then(function(value)
        {
          callback(null, value);
        })
        .catch(function(err)
        {
          callback(err);
        });
      },
      function(value,callback) {
        // Checking user Details
        userDevices(req).then(function(devicesAttached)
        {
          callback(null, value,devicesAttached);
        })
        .catch(function(err)
        {
          callback(err);
        });
      },
      function(value,devicesAttached,callback) {
        // Checking user Details
        userChilds(req).then(function(childs)
        {
          callback(null, value,devicesAttached,childs);
        })
        .catch(function(err)
        {
          callback(err);
        });
      },
      function(value,devicesAttached,childs,callback) {
        // Checking user Details
        getUserPackagesData(req).then(function(allPack)
        {
          callback(null, value,devicesAttached,childs,allPack);
        })
        .catch(function(err)
        {
          //consolelog(err);
          callback(err);
        });
      }
      ,
      function(value,devicesAttached,childs,allPack,callback) {
        // Checking user Details
        getUserGameCount(req).then(function(count)
        {
          callback(null, value,devicesAttached,childs,allPack,count);
        })
        .catch(function(err)
        {
          callback(err);
        });
      },
      function(value,devicesAttached,childs,allPack,count,callback) {
        // Checking user Details
        getUserteamInfo(req).then(function(teamInfo)
        {
          callback(null, value,devicesAttached,childs,allPack,count,teamInfo);
        })
        .catch(function(err)
        {
          //console.log(err);
          callback(err);
        });
      },
      function(value,devicesAttached,childs,allPack,count,teamInfo,callback) {
        // Checking user Details
        getUserCategoryData(req).then(function(categoriesData)
        {
          callback(null, value,devicesAttached,childs,allPack,count,teamInfo,categoriesData);
        })
        .catch(function(err)
        {
          //console.log(err);
          callback(err);
        });
      }
    ], function (err,value,devicesAttached,childs,allPack,count,teamInfo,categoriesData)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from users table",data:null})
      }
      else
      {
        //console.log(teamInfo);
        cb(null,{status:"success",message:"Successfully get data",userDetails:value,devicesAttached:devicesAttached,
        childs:childs,package:allPack,gameCount:count,teamInfo:teamInfo,categories:categoriesData})
      }
    });
  }

  /* =================== Get User Age ===================== */

  methods.getUserAge = function(req,res,cb)
  {
      let skipV;
      if(req.query.filter)
      {
        skipV = req.query.filter.skip;
      }
      else
      {
        skipV = 0;
      }

      async.waterfall([
        function(callback) {
          // Checking licence
          getUserAgeData(skipV).then(function(value)
          {
            callback(null, value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(value, callback)
        {
          getUserAgeCount().then(function(count)
          {
            callback(null,count,value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(count,value, callback)
        {
          getSpecificAge(req).then(function(ageInfo)
          {
            callback(null,count,value,ageInfo);
          })
          .catch(function(err)
          {
            callback(err);
          });
        }
    ], function (err, count,value,ageInfo)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        cb(null,{status:"success",message:"Successfully get data",ageData:value,ageCount:count,ageInfo:ageInfo})
      }
    });
  }

  /* ====================== Set Age ======================*/

  methods.setAge = function(req,res,cb)
  {
    /* check id value if id =0 age while create while if id greater than 0 update will occure */
    ////consolelog("sssssssssssssssssssssss")


    if(req.body.id == 0)
    {
      /* creating new age */
      userAgeModel.create({age:req.body.age,created:new Date(),modified:new Date()},function(err,data)
      {
        if(err)
        {
          cb(null,{status:"fail",message:"Error While creating age, please try again"})
        }
        else
        {
          cb(null,{status:"success",message:"Age is created successfully"});
        }
      })
    }
    else
    {
      ////consolelog(2222222222222222);
      /* creating new age */
      userAgeModel.updateAll({id:req.body.id},{age:req.body.age,modified:new Date},function(err,data)
      {
        if(err)
        {
        }
        else
        {
          userModel.updateAll({age_id:req.body.id},{age:req.body.age},function(err,updateUserAge){
            //consolelog(err);
          })


          userChildsModel.updateAll({age_id:req.body.id},{age:req.body.age},function(err,updateAge){

          })



          // cb(null,{status:"fail",message:"Error While updating age, please try again"})

          cb(null,{status:"success",message:"Age is updated successfully"});
        }
      })
    }
  }

  /* =================== Get packages ===================== */

  methods.getPackages = function(req,res,cb)
  {
      let skipV;
      if(req.query.filter)
      {
        skipV = req.query.filter.skip;
      }
      else
      {
        skipV = 0;
      }

      async.waterfall([
        function(callback) {
          // Checking licence
          getPackagesData(skipV).then(function(value)
          {
            callback(null, value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(value, callback)
        {
          getPackagesCount().then(function(count)
          {
            callback(null,count,value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(count,value, callback)
        {
          if(req.params.id != 0)
          {
            getSpecificPackages(req).then(function(info)
            {
              callback(null,count,value,info);
            })
            .catch(function(err)
            {
              callback(err);
            });
          }
          else
          {
            callback(null,count,value,null);
          }
        },
        function(count,value,info, callback)
        {
          setQuestionCount(value).then(function(packageQuestionCount)
          {
            ////////////consolelog(packageQuestionCount);
            callback(null,count,packageQuestionCount,info);
          })
          .catch(function(err)
          {

            //callback(err);
          });
          //callback(null,count,value,null);
        },
        function(count,packageQuestionCount,infos, callback)
        {
          getAllCountry(0).then(function(country)
          {
            callback(null,count,packageQuestionCount,infos,country);
          })
          .catch(function(err)
          {
            callback(err);
          });
          //callback(null,count,value,null);
        },
        function(count,packageQuestionCount,infos,country, callback)
        {
          getCategory().then(function(category)
          {
            callback(null,count,packageQuestionCount,infos,country,category);
          })
          .catch(function(err)
          {
            callback(err);
          });
          //callback(null,count,value,null);
        }
        ,
        function(count,packageQuestionCount,infos,country,category,callback)
        {
          getUserAgeData(0).then(function(age)
          {
            console.log(age)
            callback(null,count,packageQuestionCount,infos,country,category,age);
          })
          .catch(function(err)
          {
            console.log(err);
            callback(err);
          });
          //callback(null,count,value,null);
        }

    ], function (err, count,value,info,country,category,age)
    {

      if(err)
      {
        console.log("sssssssssssssssssssssssssss",err);
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        console.log("bbbbbbbbbbb",value);
        cb(null,{status:"success",message:"Successfully get data",packagesData:value,
        packagesCount:count,packagesInfo:info,countryInfo:country,categories:category,ageInfo:age})
      }
    });
  }

  /* ====================== Set/Add package ======================*/

  methods.setPackage = function(req,res,cb)
  {
    if (req.url == '/addPackage')
    {
       var form = new formidable.IncomingForm();
       form.parse(req, function (err, fields, files)
       {
         if(err)
         {
           cb(null,{status:"fail",message:"Error while saving Data"})
         }
         else
         {
           if(fields.id == '0')
           {
             console.log("sssssssssssssssssss",files)
             setPackagesData(fields,files).then(function(value)
             {
               cb(null, {status:"success",message:"Successfully upload Image"});
             })
             .catch(function(err)
             {
               console.log(err);
               cb(null, {status:"fail",message:err});
             });
           }
           else
           {
             editPackagesData(fields,files).then(function(value)
             {
               cb(null, {status:"success",message:"Successfully upload Image"});
             })
             .catch(function(err)
             {
              console.log(err);
               cb(null, {status:"fail",message:err});
             });
           }
         }
       });
    }
  }

  /* ====================== Get Question ======================*/

  methods.getQuestions = function(req,res,cb)
  {
      let skipV;
      if(req.query.filter)
      {
        skipV = req.query.filter.skip;
      }
      else
      {
        skipV = 0;
      }
      async.waterfall([
        function(callback) {
          // Checking licence
          getQuestionsData(skipV,req.params).then(function(value)
          {
            callback(null, value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(value, callback)
        {
          getQuestionsCount(req.params).then(function(count)
          {
            callback(null,value,count);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
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
          getPackagesData(0).then(function(package)
          {
            callback(null, value,count,category,package);
          })
          .catch(function(err)
          {
            callback(err);
          });
        }
    ], function (err,value,count,category,package)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        cb(null,{status:"success",message:"Successfully get data",questionsData:value,questionsCount:count,category:category,package:package})
      }
    });
  }

 /* Get free play questions */


methods.getFreePlayQuestions = function(req,res,cb)
 {
   let skipV;
   if(req.query.filter)
   {
     skipV = req.query.filter.skip;
   }
   else
   {
     skipV = 0;
   }

   let questions =  app.models.questions;
   let ds1 = questions.dataSource;
   let finalQuestion = [];
   async.waterfall([
     function(callbackWater) {
       let cond="",regionCondition='';
       if(req.session.adminUserType == 1)
       {
        regionCondition ='';
       }
       else
       {
        regionCondition ="and questions.region="+region+""
       }
       
        if((req.params.category != 0) && (req.params.subCategory != 0) )
        {
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.sub_category_id = "+req.params.subCategory+" and questions.pack_ID = 0 and questions.status=0"
        }
        else if((req.params.category !=0) && (req.params.subCategory ==0) )
        {
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = 0 and questions.status=0"
        }
        else if((req.params.category ==0) && (req.params.subCategory ==0) )
        {
          cond = "where questions.pack_ID = 0 and questions.status=0 "+regionCondition+""
        }
       
       ds1.connector.query('SELECT questions.id,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionGroupId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id '+cond+' GROUP BY questionGroupId ORDER BY id DESC LIMIT '+skipV+',10', function (err, data)
       {
         if(err)
         {
           //////////consolelog(err);
         }
         else
         {
           ////consolelog(data);
             for(let i=0;i<data.length;i++)
             {
               let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,question:data[i].question,answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionGroupId:data[i].questionGroupId}

               finalQuestion.push(question);
              }
             callbackWater(null,finalQuestion);

         }
       })
     },
     function(questionData, callbackWater)
     {
      ////consolelog("question data for free play ", questionData);
       if(questionData.length > 0)
       {
        ////consolelog("length is greater than 0 ");
         let x=0;id=0;
         async.eachSeries(questionData, function(question, callback)
         {

           ////consolelog("question group id ",question.questionGroupId);
           ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionGroupId ='+question.questionGroupId+'  GROUP BY age_id', function (err, ageData)
           {
             if(err)
             {
               callbackwater(err);
             }
             else
             {
               for(let j=0;j<ageData.length;j++)
               {
                 question.age.push(ageData[j].age);
               }
               x++;

               if(questionData.length ==  x)
               {
                 //consolelog(3);
                 callbackWater(null, question);
               }
               else
               {
                 callback()
               }
             }
           })
         })
       }
       else
       {
         callbackWater(null, []);
       }
     },
     function(questionAgeData, callbackWater)
     {
       if(finalQuestion.length > 0)
       {
         let x=0;id=0;
         async.eachSeries(finalQuestion, function(questionAge, callback)
         {
           ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id WHERE questionGroupId ='+questionAge.questionGroupId+'  GROUP BY region', function (err, countryData)
           {
             if(err)
             {
               callbackwater(err);
             }
             else
             {
               for(let j=0;j<countryData.length;j++)
               {
                 questionAge.country.push(countryData[j].name);
               }
               x++;

               if(finalQuestion.length ==  x)
               {
                 ////consolelog(4,questionAge);
                 callbackWater(null, questionAge);
               }
               else
               {
                 ////////////consolelog(question)
                 callback()
               }
             }
           })
         })
       }
       else
       {
         callbackWater(null, []);
       }
     },
     function(questionAgeData, callbackWater)
     {
      let cond="",regionCondition='';
      if(req.session.adminUserType == 1)
      {
       regionCondition ='';
      }
      else
      {
       regionCondition ='and questions.region="+region+"'
      }

        if((req.params.category != 0) && (req.params.subCategory != 0) )
        {
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.sub_category_id = "+req.params.subCategory+" and questions.pack_ID = 0 and questions.status=0"
        }
        else if((req.params.category !=0) && (req.params.subCategory ==0) )
        {
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = 0 and questions.status=0"
        }
        else if((req.params.category ==0) && (req.params.subCategory ==0) )
        {
          cond = "where questions.pack_ID = 0 and questions.status=0 "+regionCondition+""
        }
       ds1.connector.query('SELECT COUNT(a.cnt) as count FROM ( SELECT COUNT(id) AS cnt FROM questions '+cond+' GROUP BY questionGroupId) AS a', function (err, questionCount)
       {
         if(err)
         {

         }
         else
         {
           callbackWater(null, finalQuestion , questionCount);
         }
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
       getPackagesData(0).then(function(package)
       {
         callback(null, value,count,category,package);
       })
       .catch(function(err)
       {
         callback(err);
       });
     }
 ], function (err,value,questionCount,category,package)
 {
   ////consolelog("sending questions ", finalQuestion);
   cb(null,{questionsData:finalQuestion,count:questionCount[0].count,category:category,package:package});
 });
 }

  /**/

   
   methods.getQuestions1 = function(req,res,cb)	
  {	
    let skipV;	
    if(req.query.filter)	
    {	
      skipV = req.query.filter.skip;	
    }	
    else	
    {	
      skipV = 0;	
    }	
    console.log("req.params===========",req.params)
    console.log("req.params===========",req.session)
    let questions =  app.models.questions;	
    let ds1 = questions.dataSource;	
    let finalQuestion = [];	
    async.waterfall([	
      function(callbackWater) {	
        let cond="",type=0,pack="questions.pack_ID != 0",questionStatus=1,questionState="",regionCondition='';
        if(req.session.adminUserType == 1)
        {
          console.log('121212')
            
            if(req.params.type == 1)
            {
              type = 1
              pack="questions.pack_ID != -1"
            }
            else if(req.params.type == 2)
            {
              type = 0
              pack="questions.pack_ID = 0"
            }
            else
            {
              if(req.params.package !=0)
              {
                pack="questions.pack_ID = "+req.params.package+""
              }
            }

            if(req.params.region == 0)
            {
              regionCondition='';
            }
            else
            {
              regionCondition ="and questions.region="+req.params.region+"";
            }
        }
        else
        {
          console.log('one============><><>',)
            if(req.params.type == 1)
            {
              type = 1
	             pack="questions.pack_ID != -1"	
            }
	          else
	          {
	             pack="questions.pack_ID = "+req.params.package+""
	          }
	          regionCondition ="and questions.region="+req.session.region+""
        }

        console.log("======= 9999999999999999999999 ==============",req.session);

        if(req.params.questionStatus == 0)
        {
          questionStatus = ""
        }
        else if(req.params.questionStatus == 1)
        {
          questionStatus = "and questions.questionActiveStatus = "+req.params.questionStatus+""
        }
        else if(req.params.questionStatus == 2)
        {
          questionStatus = "and questions.questionActiveStatus = 0"
        }


        if(req.params.questionState == 0)
        {
          questionState = ""
        }
        else if(req.params.questionState == 1)
        {
          questionState = "and questions.questionState = "+req.params.questionState+""
        }
        else if(req.params.questionState == 2)
        {
          questionState = "and questions.questionState = 0"
        }



        if((req.params.category != 0) && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww11");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.status = "+type+"  "+questionStatus+" "+questionState+" ";
        }	
        else if((req.params.category != 0) && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww12");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+" and questions.status =  "+type+" "+questionStatus+" "+questionState+" "	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww13");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status = "+type+" and questions.age_id="+req.params.age+" "+questionStatus+" "+questionState+""	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww14");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww15");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww156");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+" "+questionStatus+" "+questionState+""			
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww17");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0) && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww18");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww19");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww20");
          cond = "where questions.status =  "+type+" "+regionCondition+" and questions.age_id="+req.params.age+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww21");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.status =  "+type+" and questions.age_id="+req.params.age+" "+questionStatus+" "+questionState+"";		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww3331");
          cond = "where questions.status =  "+type+" "+regionCondition+"  and questions.age_id="+req.params.age+" and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww4441");
          cond = "where questions.status =  "+type+" "+regionCondition+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww200");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww199");
          cond = "where questions.status =  "+type+" "+regionCondition+" and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""		
        }	
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww188");
          cond = "where questions.category_id="+req.params.category+" and questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+"  and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww177");
          cond = "where  questions.status =  "+type+" "+regionCondition+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww166");
          cond = "where questions.status =  "+type+" "+regionCondition+" and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww155");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.status =  "+type+" and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww133");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww1212");
          cond = "where questions.status =  "+type+" "+regionCondition+"  and questions.age_id="+req.params.age+" and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {
          console.log("wwwwwwwwwww7");	
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww6");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww5");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww4");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww333");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("ww23wwwwwwwww");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwww2wwww");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+"   and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww");
          cond = "where "+pack+" and questions.category_id="+req.params.category+" and  questions.status = "+type+" "+regionCondition+"  "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww");
          cond = "where "+pack+" and  questions.status = "+type+" and questions.fileType="+req.params.fileType+" "+regionCondition+"  "+questionStatus+" "+questionState+""		
        }
        else	
        {	
          console.log("helll is here");
          cond ="where "+pack+" and  questions.status = "+type+" "+regionCondition+" "+questionStatus+" "+questionState+""	
        }	
        
        ds1.connector.query('SELECT questions.id,questions.time_Allowed,questions.questionActiveStatus,questions.questionState,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.status,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionGroupId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age,question_packages.packageName, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id  LEFT JOIN question_packages ON pack_ID = question_packages.id '+cond+' GROUP BY questionGroupId ORDER BY id DESC LIMIT '+skipV+',40', function (err, data)	
        {	
          if(err)	
          {	
            console.log(err);	
          }	
          else	
          {
            
            //console.log(data);

              for(let i=0;i<data.length;i++)	
              {	
                let question = { id:data[i].id,questionActiveStatus:data[i].questionActiveStatus,category:data[i].category,
                  subCategory:data[i].subCategory,packageName:data[i].packageName,
                  multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,
                  video_URL:data[i].video_URL,question:data[i].question,answer1:data[i].answer1,
                  answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,
                  created:data[i].created,questionGroupId:data[i].questionGroupId,questionState:data[i].questionState,timeAllowed:data[i].time_Allowed}	
                finalQuestion.push(question);	
               }	
               //consolelog(2);	
              callbackWater(null,finalQuestion);	
          }	
        })	
      },	
      function(questionData, callbackWater)	
      {	
        if(questionData.length > 0)	
        {	
          let x=0;id=0;	
          let cond;
          async.eachSeries(questionData, function(question, callback)	
          {	
            
            if(req.params.age != 0)	
            {	
              cond = "where questions.age_id="+req.params.age+" and questionGroupId ="+question.questionGroupId+" GROUP BY age_id";		
            }
            else
            {
              cond = "where questionGroupId ="+question.questionGroupId+" GROUP BY age_id";		
            }

            ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id '+cond+'', function (err, ageData)	
            {	
              if(err)	
              {	
                callbackwater(err);	
              }	
              else	
              {	
                for(let j=0;j<ageData.length;j++)	
                {	
                  question.age.push(ageData[j].age);	
                }	
                x++;	
                if(questionData.length ==  x)	
                {	
                  //consolelog(3);	
                  callbackWater(null, question);	
                }	
                else	
                {	
                  callback()	
                }	
              }	
            })	
          })	
        }	
        else	
        {	
          callbackWater(null, []);	
        }	
      },	
      function(questionAgeData, callbackWater)	
      {	
        if(finalQuestion.length > 0)	
        {	
          let x=0;id=0;	
          let cond;

          async.eachSeries(finalQuestion, function(questionAge, callback)	
          {	
            if(req.params.region != 0)	
            {	
              cond = "where questions.region="+req.params.region+" and questionGroupId ="+questionAge.questionGroupId+" GROUP BY region";		
            }
            else
            {
              cond = "where questionGroupId ="+questionAge.questionGroupId+" GROUP BY region";		
            }
            
            ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id '+cond+'', function (err, countryData)	
            {	
              if(err)	
              {	
                console.log(err);
                callbackwater(err);	
              }	
              else	
              {	

                for(let j=0;j<countryData.length;j++)	
                {	
                  questionAge.country.push(countryData[j].name);	
                }	
                x++;	
                if(finalQuestion.length ==  x)	
                {	
                  ////consolelog(4,questionAge);	
                  callbackWater(null, questionAge);	
                }	
                else	
                {	
                  ////////////consolelog(question)	
                  callback()	
                }	
              }	
            })	
          })	
        }	
        else	
        {	
          callbackWater(null, []);	
        }	
      },	
      function(questionAgeData, callbackWater)	
      {	
        let cond="",type=0,pack="questions.pack_ID != 0",questionStatus=1,questionState="",regionCondition='';
        if(req.session.adminUserType == 1)
        {
          console.log('121212')
            
            if(req.params.type == 1)
            {
              type = 1
              pack="questions.pack_ID != -1"
            }
            else if(req.params.type == 2)
            {
              type = 0
              pack="questions.pack_ID = 0"
            }
            else
            {
              if(req.params.package !=0)
              {
                pack="questions.pack_ID = "+req.params.package+""
              }
            }

            if(req.params.region == 0)
            {
              regionCondition='';
            }
            else
            {
              regionCondition ="and questions.region="+req.params.region+"";
            }
        }
        else
        {
          console.log('one============><><>',)
            if(req.params.type == 1)
            {
              type = 1
	             pack="questions.pack_ID != -1"	
            }
	          else
	          {
	             pack="questions.pack_ID = "+req.params.package+""
	          }
	          regionCondition ="and questions.region="+req.session.region+""
        }

        console.log("======= 9999999999999999999999 ==============",req.session);

        if(req.params.questionStatus == 0)
        {
          questionStatus = ""
        }
        else if(req.params.questionStatus == 1)
        {
          questionStatus = "and questions.questionActiveStatus = "+req.params.questionStatus+""
        }
        else if(req.params.questionStatus == 2)
        {
          questionStatus = "and questions.questionActiveStatus = 0"
        }


        if(req.params.questionState == 0)
        {
          questionState = ""
        }
        else if(req.params.questionState == 1)
        {
          questionState = "and questions.questionState = "+req.params.questionState+""
        }
        else if(req.params.questionState == 2)
        {
          questionState = "and questions.questionState = 0"
        }



        if((req.params.category != 0) && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww11");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.status = "+type+"  "+questionStatus+" "+questionState+" ";
        }	
        else if((req.params.category != 0) && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww12");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+" and questions.status =  "+type+" "+questionStatus+" "+questionState+" "	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww13");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status = "+type+" and questions.age_id="+req.params.age+" "+questionStatus+" "+questionState+""	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww14");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww15");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww156");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+" "+questionStatus+" "+questionState+""			
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww17");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0) && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww18");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww19");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww20");
          cond = "where questions.status =  "+type+" "+regionCondition+" and questions.age_id="+req.params.age+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww21");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.status =  "+type+" and questions.age_id="+req.params.age+" "+questionStatus+" "+questionState+"";		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww3331");
          cond = "where questions.status =  "+type+" "+regionCondition+"  and questions.age_id="+req.params.age+" and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww4441");
          cond = "where questions.status =  "+type+" "+regionCondition+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww200");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww199");
          cond = "where questions.status =  "+type+" "+regionCondition+" and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""		
        }	
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww188");
          cond = "where questions.category_id="+req.params.category+" and questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+"  and questions.region="+req.params.region+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww177");
          cond = "where  questions.status =  "+type+" "+regionCondition+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww166");
          cond = "where questions.status =  "+type+" "+regionCondition+" and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww155");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.status =  "+type+" and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww133");
          cond = "where questions.pack_ID = "+req.params.package+" "+regionCondition+"  and questions.status =  "+type+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww1212");
          cond = "where questions.status =  "+type+" "+regionCondition+"  and questions.age_id="+req.params.age+" and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {
          console.log("wwwwwwwwwww7");	
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww6");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww5");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww4");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww333");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("ww23wwwwwwwww");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+" and questions.pack_ID = "+req.params.package+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+" and questions.region="+req.params.region+"  and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwww2wwww");
          cond = "where questions.category_id="+req.params.category+" "+regionCondition+"  and questions.status =  "+type+" and questions.age_id="+req.params.age+"   and questions.fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww");
          cond = "where "+pack+" and questions.category_id="+req.params.category+" and  questions.status = "+type+" "+regionCondition+"  "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww");
          cond = "where "+pack+" and  questions.status = "+type+" and questions.fileType="+req.params.fileType+" "+regionCondition+"  "+questionStatus+" "+questionState+""		
        }
        else	
        {	
          console.log("helll is here");
          cond ="where "+pack+" and  questions.status = "+type+" "+regionCondition+" "+questionStatus+" "+questionState+""	
        }	
        console.log("sssssssssssssssss",questionStatus);
        console.log(cond);

        
        //console.log(cond);
        ds1.connector.query('SELECT COUNT(a.cnt) as count FROM ( SELECT COUNT(id) AS cnt FROM questions '+cond+' GROUP BY questionGroupId) AS a', function (err, questionCount)	
        {	
          if(err)	
          {	
            console.log(err);
          }	
          else	
          {	
            callbackWater(null, finalQuestion , questionCount);	
          }	
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
        getPackagesDataWithoutLimt().then(function(package)	
        {	
          callback(null, value,count,category,package);	
        })	
        .catch(function(err)	
        {	
          callback(err);	
        });	
      },	
      function(value,count,category,package, callback)	
      {	
        
        getAllCountry(0).then(function(country)
          {
            callback(null, value,count,category,package,country);
          })
          .catch(function(err)
          {
            console.log(err);
            callback(err);
          });
      },	
      function(value,count,category,package,country, callback)	
      {	
        getUserAgeData(0).then(function(age)
          {
            callback(null, value,count,category,package,country,age);
          })
          .catch(function(err)
          {
            callback(err);
          });
      }
      	
  ], function (err,value,questionCount,category,package,country,age)	
  {	
    //console.log(finalQuestion);
    cb(null,{questionsData:finalQuestion,count:questionCount[0].count,category:category,package:package,countries:country,age:age});	
  });	
  }		
	
	





  /**/

  methods.getFinalQuestions = function(req,res,cb)
  {
    let skipV;
    if(req.query.filter)
    {
      skipV = req.query.filter.skip;
    }
    else
    {
      skipV = 0;
    }

    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    let finalQuestion = [];
    async.waterfall([
      function(callbackWater) {
        let cond="";
        if((req.params.category != 0) && (req.params.subCategory != 0) && (req.params.package != 0) )
        {
          cond = "where questions.category_id="+req.params.category+" and questions.sub_category_id = "+req.params.subCategory+" and questions.pack_ID = "+req.params.package+" and questions.status = 1"
        }
        else if((req.params.category !=0) && (req.params.subCategory ==0) &&  (req.params.package !=0))
        {
          cond = "where questions.category_id="+req.params.category+" and questions.pack_ID = "+req.params.package+"  and questions.status = 1 "
        }
        else if((req.params.category !=0) && (req.params.subCategory ==0) &&  (req.params.package ==0))
        {
          cond = "where questions.category_id="+req.params.category+"  and questions.status = 1 "
        }
        else if((req.params.category ==0) && (req.params.subCategory ==0) &&  (req.params.package !=0))
        {
          cond = "where questions.pack_ID = "+req.params.package+"  and questions.status = 1"
        }
        else if((req.params.category !=0) && (req.params.subCategory !=0) &&  (req.params.package ==0))
        {
          cond = "where questions.category_id="+req.params.category+" and questions.sub_category_id = "+req.params.subCategory+"  and questions.status = 1"
        }
        else
        {
          cond ="where questions.status = 1"
        }
        //consolelog("cond=========================",cond)

        ds1.connector.query('SELECT questions.id,questions.time_Allowed,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionGroupId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id   '+cond+' GROUP BY questionGroupId ORDER BY questionGroupId DESC LIMIT '+skipV+',100', function (err, data)
        {
          if(err)
          {
            //consolelog(err);
          }
          else
          {
            ////consolelog(data);
              for(let i=0;i<data.length;i++)
              {
                let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,question:data[i].question,answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionGroupId:data[i].questionGroupId,timeAllowed:data.time_Allowed}

                finalQuestion.push(question);
               }
               ////consolelog(2);
              callbackWater(null,finalQuestion);

          }
        })
      },
      function(questionData, callbackWater)
      {

        if(questionData.length > 0)
        {
          let x=0;id=0;
          async.eachSeries(questionData, function(question, callback)
          {

            //consolelog(question.questionGroupId);
            ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionGroupId ='+question.questionGroupId+'  GROUP BY age_id', function (err, ageData)
            {
              if(err)
              {
                callbackwater(err);
              }
              else
              {
                for(let j=0;j<ageData.length;j++)
                {
                  question.age.push(ageData[j].age);
                }
                x++;

                if(questionData.length ==  x)
                {
                  //consolelog(3);
                  callbackWater(null, question);
                }
                else
                {
                  callback()
                }
              }
            })
          })
        }
        else
        {
          callbackWater(null, []);
        }
      },
      function(questionAgeData, callbackWater)
      {
        if(finalQuestion.length > 0)
        {
          let x=0;id=0;
          async.eachSeries(finalQuestion, function(questionAge, callback)
          {
            ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id WHERE questionGroupId ='+questionAge.questionGroupId+'  GROUP BY region', function (err, countryData)
            {
              if(err)
              {
                callbackwater(err);
              }
              else
              {
                for(let j=0;j<countryData.length;j++)
                {
                  questionAge.country.push(countryData[j].name);
                }
                x++;

                if(finalQuestion.length ==  x)
                {
                  ////consolelog(4,questionAge);
                  callbackWater(null, questionAge);
                }
                else
                {
                  ////////////consolelog(question)
                  callback()
                }
              }
            })
          })
        }
        else
        {
          callbackWater(null, []);
        }
      },
      function(questionAgeData, callbackWater)
      {
        let cond="";
        if((req.params.category != 0) && (req.params.subCategory != 0) && (req.params.package != 0) )
        {
          cond = "where questions.category_id="+req.params.category+" and questions.sub_category_id = "+req.params.subCategory+" and questions.pack_ID = "+req.params.package+" and questions.status=1"
        }
        else if((req.params.category !=0) && (req.params.subCategory ==0) &&  (req.params.package !=0))
        {
          cond = "where questions.category_id="+req.params.category+" and questions.pack_ID = "+req.params.package+" and questions.status=1"
        }
        else if((req.params.category !=0) && (req.params.subCategory ==0) &&  (req.params.package ==0))
        {
          cond = "where questions.category_id="+req.params.category+" and questions.status=1"
        }
        else if((req.params.category ==0) && (req.params.subCategory ==0) &&  (req.params.package !=0))
        {
          cond = "where questions.pack_ID = "+req.params.package+" and questions.status=1"
        }
        else if((req.params.category !=0) && (req.params.subCategory !=0) &&  (req.params.package ==0))
        {
          cond = "where questions.category_id="+req.params.category+" and questions.sub_category_id = "+req.params.subCategory+" and questions.status=1"
        }
	      else
        {
          cond = "where questions.pack_ID !=0 and questions.status=1"
        }

        ds1.connector.query('SELECT COUNT(a.cnt) as count FROM ( SELECT COUNT(id) AS cnt FROM questions '+cond+' GROUP BY questionGroupId) AS a', function (err, questionCount)
        {
          if(err)
          {

          }
          else
          {
            callbackWater(null, finalQuestion , questionCount);
          }
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
        getPackagesData(0).then(function(package)
        {
          callback(null, value,count,category,package);
        })
        .catch(function(err)
        {
          callback(err);
        });
      }
  ], function (err,value,questionCount,category,package)
  {
    //consolelog(finalQuestion);
    cb(null,{questionsData:finalQuestion,count:questionCount[0].count,category:category,package:package});
  });
  }


  /* Get Ajax */


    methods.getAjaxQuestions1 = function(req,res,cb)
  {
    console.log("hit here")
    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    let finalQuestion = [];
    //console.log("question",req.body);
    async.waterfall([
      function(callbackWater) {
        let cond="",regionC="",query ="",pack='',region="";
        console.log(req.session)
        if(parseInt(req.session.adminUserType) == 2)
        {
          regionC = " and region ="+req.session.region+"";
        }

        console.log("------------------------------",regionC)
        if(req.body.page > 0)	
        {	
          skipV = req.body.page*40;	
        }	
        else	
        {	
          skipV = 0;	
        }
        console.log(req.body);
	
	if(req.body.type == 0)
	{
        	if(req.body.package > 0)
        	{
          		pack = " and pack_Id ="+req.body.package+""
        	}
	}


        if(req.body.region != 0)
        {
          region = " and region ="+req.body.region+""
        }


//	if(req.body.region != 0)
        
        cond = "where (question LIKE '%"+req.body.quest+"%' OR answer1 LIKE '%"+req.body.quest+"%' OR answer2 LIKE '%"+req.body.quest+"%' OR answer3 LIKE '%"+req.body.quest+"%' OR answer4 LIKE '%"+req.body.quest+"%') and questions.status="+req.body.type+" "+regionC+"  "+pack+"  ";
        console.log(cond);

        if(req.body.type == 0)
        {
          query = 'SELECT questions.status,questions.time_Allowed,questions.questionState,questions.id,questions.questionActiveStatus,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionGroupId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age,question_packages.packageName, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id  INNER JOIN question_packages ON pack_ID = question_packages.id '+cond+' GROUP BY questionGroupId ORDER BY questionGroupId DESC   LIMIT '+skipV+',40'
        }
        else
        {
          query = 'SELECT questions.status,questions.time_Allowed,questions.questionState,questions.id,questions.questionActiveStatus,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionGroupId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id '+cond+' GROUP BY questionGroupId ORDER BY questionGroupId DESC   LIMIT '+skipV+',40'
        }
        
        //console.log()
        
        
        console.log(query);
        
        
        ds1.connector.query(query, function (err, data)
        {
          if(err)
          {
            console.log(err);
          }
          else
          {
              for(let i=0;i<data.length;i++)
              {
                let question = { totalQuestions:0,page:req.body.page,id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,questionActiveStatus:data[i].questionActiveStatus,question:data[i].question.toString(),answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionGroupId:data[i].questionGroupId,questionState:data[i].questionState,timeAllowed:data[i].time_Allowed}

                finalQuestion.push(question);
               }
               //console.log(finalQuestion);
              callbackWater(null,finalQuestion);

          }
        })
      },
      function(questionData, callbackWater)
      {

        if(questionData.length > 0)
        {
          let x=0;id=0;
          async.eachSeries(questionData, function(question, callback)
          {

            ////consolelog(question.questionGroupId);
            ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionGroupId ='+question.questionGroupId+'  GROUP BY age_id', function (err, ageData)
            {
              if(err)
              {
                callbackwater(err);
              }
              else
              {
                for(let j=0;j<ageData.length;j++)
                {
                  question.age.push(ageData[j].age);
                }
                x++;

                if(questionData.length ==  x)
                {
                  ////consolelog(3);
                  callbackWater(null, question);
                }
                else
                {
                  callback()
                }
              }
            })
          })
        }
        else
        {
          callbackWater(null, []);
        }
      },
      function(questionAgeData, callbackWater)
      {
        if(finalQuestion.length > 0)
        {
          let x=0;id=0;
          async.eachSeries(finalQuestion, function(questionAge, callback)
          {
            ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id WHERE questionGroupId ='+questionAge.questionGroupId+'  GROUP BY region', function (err, countryData)
            {
              if(err)
              {
                callbackwater(err);
              }
              else
              {
                for(let j=0;j<countryData.length;j++)
                {
                  questionAge.country.push(countryData[j].name);
                }
                x++;

                if(finalQuestion.length ==  x)
                {
                  ////consolelog(4,questionAge);
                  callbackWater(null, questionAge);
                }
                else
                {
                  ////////////consolelog(question)
                  callback()
                }
              }
            })
          })
        }
        else
        {
          callbackWater(null, []);
        }
      },
      function(questionAgeData, callbackWater)
      {
        let cond="",regionC="",query ="",pack="";

        if(req.session.adminUserType == 2)
        {
          regionC = " and region ="+region+"";
        }


        if(req.body.package > 0)
        {
          pack = " and pack_Id ="+req.body.package+""
        }
        
        cond = "where (question LIKE '%"+req.body.quest+"%' OR answer1 LIKE '%"+req.body.quest+"%' OR answer2 LIKE '%"+req.body.quest+"%' OR answer3 LIKE '%"+req.body.quest+"%' OR answer4 LIKE '%"+req.body.quest+"%') and questions.status="+req.body.type+" "+regionC+" "+pack+" ";
        if(req.body.type == 0)
        {
          query = 'SELECT COUNT(DISTINCT(questionGroupId)) as countINfo from questions '+cond+' '
        }
        else
        {
          query = 'SELECT COUNT(DISTINCT(questionGroupId)) as countINfo from questions '+cond+' '
        }
        
        
        
        //console.log("query",query)
        
        
        ds1.connector.query(query, function (err, countInfo)
        {
          if(err)
          {
            console.log(err);
          }
          else
          {
            //console.log("<><>?",countInfo.countINfo);
            //console.log("<><>?",countInfo[0].countINfo);
            if(finalQuestion.length>0)
            {
              console.log('count problem ================>',countInfo[0].countINfo)
              finalQuestion[0].totalQuestions=countInfo[0].countINfo;
            }
            
              
              callbackWater(null,finalQuestion);

          }
        })
      }
  ], function (err,value)
  {
    
    cb(null,{questionsData:finalQuestion});
  });
  }

  methods.getAjaxQuestionsFinal = function(req,res,cb)
  {

    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    let finalQuestion = [];
    async.waterfall([
      function(callbackWater) {
        let cond="";
        if(req.body.quest != '' &&  req.body.option != '')
        {
          cond = "where questions.status=1 and questions.question LIKE '%"+req.body.quest+"%' OR questions.answer1 LIKE '%"+req.body.option+"%' OR questions.answer2 LIKE '%"+req.body.option+"%' OR questions.answer3 LIKE '%"+req.body.option+"%' OR questions.answer4 LIKE '%"+req.body.option+"%' ";
        }
        else if(req.body.quest == '' &&  req.body.option != '' )
        {
          cond = "where questions.status=1 and answer1 LIKE '%"+req.body.option+"%' OR questions.answer2 LIKE '%"+req.body.option+"%' OR questions.answer3 LIKE '%"+req.body.option+"%' OR questions.answer4 LIKE '%"+req.body.option+"%' ";
        }
        else if(req.body.quest != '' &&  req.body.option == '' )
        {
          cond = "where questions.status=1 and questions.question LIKE '%"+req.body.quest+"%'";
        }
        /////consolelog("cond",cond);

        ds1.connector.query('SELECT questions.id,questions.questionActiveStatus,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionGroupId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id   '+cond+' GROUP BY questionGroupId ORDER BY questionGroupId DESC', function (err, data)
        {
          if(err)
          {
            //console.log(err);
          }
          else
          {
              for(let i=0;i<data.length;i++)
              {
                let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,questionActiveStatus:data[i].questionActiveStatus.toString(),question:data[i].question.toString(),answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionGroupId:data[i].questionGroupId}

                finalQuestion.push(question);
               }
               //consolelog(2);
              callbackWater(null,finalQuestion);

          }
        })
      },
      function(questionData, callbackWater)
      {

        if(questionData.length > 0)
        {
          let x=0;id=0;
          async.eachSeries(questionData, function(question, callback)
          {

            ////consolelog(question.questionGroupId);
            ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionGroupId ='+question.questionGroupId+'  GROUP BY age_id', function (err, ageData)
            {
              if(err)
              {
                callbackwater(err);
              }
              else
              {
                for(let j=0;j<ageData.length;j++)
                {
                  question.age.push(ageData[j].age);
                }
                x++;

                if(questionData.length ==  x)
                {
                  ////consolelog(3);
                  callbackWater(null, question);
                }
                else
                {
                  callback()
                }
              }
            })
          })
        }
        else
        {
          callbackWater(null, []);
        }
      },
      function(questionAgeData, callbackWater)
      {
        if(finalQuestion.length > 0)
        {
          let x=0;id=0;
          async.eachSeries(finalQuestion, function(questionAge, callback)
          {
            ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id WHERE questionGroupId ='+questionAge.questionGroupId+'  GROUP BY region', function (err, countryData)
            {
              if(err)
              {
                callbackwater(err);
              }
              else
              {
                for(let j=0;j<countryData.length;j++)
                {
                  questionAge.country.push(countryData[j].name);
                }
                x++;

                if(finalQuestion.length ==  x)
                {
                  ////consolelog(4,questionAge);
                  callbackWater(null, questionAge);
                }
                else
                {
                  ////////////consolelog(question)
                  callback()
                }
              }
            })
          })
        }
        else
        {
          callbackWater(null, []);
        }
      }
  ], function (err,value)
  {
    ////consolelog(value);
    
    cb(null,{questionsData:finalQuestion});
  });
  }


  methods.getAjaxFreeplayQuestions1 = function(req,res,cb)
  {
    ////consolelog("Hiiiiii");
    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    let finalQuestion = [];
    async.waterfall([
      function(callbackWater) {
        let cond="";
        if(req.body.quest != '' &&  req.body.option != '')
        {
          cond = "where question LIKE '%"+req.body.quest+"%' OR answer1 LIKE '%"+req.body.option+"%' OR answer2 LIKE '%"+req.body.option+"%' OR answer3 LIKE '%"+req.body.option+"%' OR answer4 LIKE '%"+req.body.option+"%'";
        }
        else if(req.body.quest == '' &&  req.body.option != '' )
        {
          cond = "where answer1 LIKE '%"+req.body.option+"%' OR answer2 LIKE '%"+req.body.option+"%' OR answer3 LIKE '%"+req.body.option+"%' OR answer4 LIKE '%"+req.body.option+"%' ";
        }
        else if(req.body.quest != '' &&  req.body.option == '' )
        {
          cond = "where question LIKE '%"+req.body.quest+"%'";
        }


        ds1.connector.query('SELECT questions.id,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionGroupId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id '+cond+' GROUP BY questionGroupId ORDER BY questionGroupId DESC', function (err, data)
        {
          if(err)
          {
            //consolelog(err);
          }
          else
          {
            //consolelog(data);
              for(let i=0;i<data.length;i++)
              {
                let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,question:data[i].question.toString(),answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionGroupId:data[i].questionGroupId}

                finalQuestion.push(question);
               }
               //consolelog(2);
              callbackWater(null,finalQuestion);

          }
        })
      },
      function(questionData, callbackWater)
      {

        if(questionData.length > 0)
        {
          let x=0;id=0;
          async.eachSeries(questionData, function(question, callback)
          {

            //consolelog(question.questionGroupId);
            ds1.connector.query('SELECT * FROM questions INNER JOIN age_categories ON age_id = age_categories.id WHERE questionGroupId ='+question.questionGroupId+'  GROUP BY age_id', function (err, ageData)
            {
              if(err)
              {
                callbackwater(err);
              }
              else
              {
                for(let j=0;j<ageData.length;j++)
                {
                  question.age.push(ageData[j].age);
                }
                x++;

                if(questionData.length ==  x)
                {
                  //consolelog(3);
                  callbackWater(null, question);
                }
                else
                {
                  callback()
                }
              }
            })
          })
        }
        else
        {
          callbackWater(null, []);
        }
      },
      function(questionAgeData, callbackWater)
      {
        if(finalQuestion.length > 0)
        {
          let x=0;id=0;
          async.eachSeries(finalQuestion, function(questionAge, callback)
          {
            ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id WHERE questionGroupId ='+questionAge.questionGroupId+'  GROUP BY region', function (err, countryData)
            {
              if(err)
              {
                callbackwater(err);
              }
              else
              {
                for(let j=0;j<countryData.length;j++)
                {
                  questionAge.country.push(countryData[j].name);
                }
                x++;

                if(finalQuestion.length ==  x)
                {
                  ////consolelog(4,questionAge);
                  callbackWater(null, questionAge);
                }
                else
                {
                  ////////////consolelog(question)
                  callback()
                }
              }
            })
          })
        }
        else
        {
          callbackWater(null, []);
        }
      }
  ], function (err,value)
  {
    //consolelog(value);
    cb(null,{questionsData:finalQuestion});
  });
  }


  methods.buyPack = function(req,res,cb)
  {
    ////consolelog("Hiiiiii");
    ////consolelog(req.body);
    userModel.findOne({where:{id:req.body.userId}},function(err,userInfo)
    {
      if(err)
      {
        cb(null,{status:0})
      }
      else
      {
        if(userInfo)
        {
          let userPack = userInfo.packages+','+req.body.packId;
          userModel.updateAll({id:req.body.userId},{packages:userPack},function(err,userInfo)
          {
            cb(null,{status:1})
          })
        }
      }
    })
  }



  methods.buyCategory = function(req,res,cb)
  {
    console.log("Hiiiiii00000000000000000000000000000000000");
    console.log(req.body);
    userModel.findOne({where:{id:req.body.userId}},function(err,userInfo)
    {
      if(err)
      {
        cb(null,{status:0})
      }
      else
      {
        if(userInfo)
        {
          let userCategory = userInfo.purchaseCategory+','+req.body.categoryId;
          userModel.updateAll({id:req.body.userId},{purchaseCategory:userCategory},function(err,userInfo)
          {
            cb(null,{status:1})
          })
        }
      }
    })
  }


  methods.buyPackLicence = function(req,res,cb)
  {

    userModel.findOne({where:{licence:req.body.licenceName}},function(err,userInfo)
    {
      if(err)
      {
        cb(null,{status:0})
      }
      else
      {
        if(userInfo)
        {
          let userExistPack = userInfo.packages.split(',');
          let userPack
          if(userExistPack.includes(req.body.packId))
          {
              userPack = userInfo.packages;
          }
          else
          {
            userPack = userInfo.packages+',' + req.body.packId;
          }

          userModel.updateAll({id:req.body.userId},{packages:userPack},function(err,userInfo)
          {
            cb(null,{status:1})
          })
        }
      }
    })
  }

  methods.getUserLicence = function(req,res,cb)
  {
    let user =  app.models.user;
    let ds1 = user.dataSource;


    let licences =  app.models.licences;
    let ds = licences.dataSource;
    
    let cond='';
    // if(req.body.userName != '' && req.body.licence != '' &&  req.body.email != '')
    // {
      cond = "where userType = 1 and (firstName LIKE '%"+req.body.userName+"%' and  lastName LIKE '%"+req.body.lastName+"%' and licenceName LIKE '%"+req.body.licence+"%' and email LIKE '%"+req.body.email+"%') ";
    // }
    // else if(req.body.userName != '' && req.body.email != ''  && req.body.licence == ''  )
    // {
    //   cond = "where userType = 1 and (firstName LIKE '%"+req.body.userName+"%' OR email LIKE '%"+req.body.email+"%') ";
    // }
    // else if(req.body.userName != '' && req.body.email == ''  && req.body.licence == '' )
    // {
    //   cond = "where userType = 1 and firstName LIKE '%"+req.body.userName+"%' ";
    // }
    // else if(req.body.userName == '' && req.body.email != ''  && req.body.licence != '' )
    // {
    //   cond = "where userType = 1 and ( licenceName LIKE '%"+req.body.licence+"%' OR email LIKE '%"+req.body.email+"%') ";
    // }
    // else if(req.body.userName == '' && req.body.email == ''  && req.body.licence != '' )
    // {
    //   cond = "where userType = 1 and licenceName LIKE '%"+req.body.licence+"%' ";
    // }
    // else if(req.body.userName == '' && req.body.email != ''  && req.body.licence == '' )
    // {
    //   cond = "where userType = 1 and email LIKE '%"+req.body.email+"%' ";
    // }
    // else
    // {
    //   cond = "where userType = 1";
    // }

    console.log("===================",cond);

    ds1.connector.query('SELECT * from user '+cond+' LIMIT 100', function (err, data)
    {
        if(err)
        {
          //console.log(err);
          cb(null,{info:null})
        }
        else
        {
          cb(null,{info:data})
        }
    })
  }

  /* ====================== view for add Question ======================*/

  methods.questions = function(req,res,cb)
  {
      let skipV;
      if(req.query.filter)
      {
        skipV = req.query.filter.skip;
      }
      else
      {
        skipV = 0;
      }
      async.waterfall([
        function(callback)
        {
          getCategory().then(function(category)
          {
            callback(null,category);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category, callback)
        {
          getPackagesData(0).then(function(package)
          {
            callback(null,category,package);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category,package, callback)
        {
          getUserAgeData(0).then(function(age)
          {
            callback(null,category,package,age);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category,package,age, callback)
        {
          getAllCountry(0).then(function(country)
          {
            callback(null,category,package,age,country);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category,package,age,country, callback)
        {
          if(req.params.id != 0)
          {
            getSpecificQuestion(req.params).then(function(question)
            {
              callback(null,category,package,age,country,question);
            })
            .catch(function(err)
            {
              ////////////consolelog(err);
              callback(err);
            });
          }
          else
          {
            callback(null,category,package,age,country,null);
          }
        },
        function(category,package,age,country,question, callback)
        {
          if(req.params.id != 0)
          {
            getSubCategoryData(question.category_id).then(function(subCategory)
            {
              callback(null,category,package,age,country,question,subCategory);
            })
            .catch(function(err)
            {
              callback(err);
            });
          }
          else
          {
            callback(null,category,package,age,country,question,null);
          }
        }
    ], function (err,category,package,age,country,question,subCategory)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        cb(null,{status:"success",message:"Successfully get data",category:category,
        package:package,age:age,country:country,question:question,subCategory:subCategory})
      }
    });
  }

  /* ====================== Edit Question ==============================*/

  methods.editQuestions = function(req,res,cb)
  {
      let skipV;
      if(req.query.filter)
      {
        skipV = req.query.filter.skip;
      }
      else
      {
        skipV = 0;
      }
      async.waterfall([
        function(callback)
        {
          getCategory().then(function(category)
          {
            callback(null,category);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category, callback)
        {
	   getPackagesDataWithoutLimt().then(function(package)          
	  {
            callback(null,category,package);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category,package, callback)
        {
          getUserAgeData(0).then(function(age)
          {
            callback(null,category,package,age);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category,package,age, callback)
        {
          getAllCountry(0).then(function(country)
          {
            callback(null,category,package,age,country);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category,package,age,country, callback)
        {
          getEditQuestion(req.params).then(function(question)
          {
            callback(null,category,package,age,country,question);
          })
          .catch(function(err)
          {
            ////////////consolelog(err);
            callback(err);
          });
        },
        function(category,package,age,country,question, callback)
        {
          if(req.params.id != 0)
          {
            getSubCategoryData(question.category_id).then(function(subCategory)
            {
              callback(null,category,package,age,country,question,subCategory);
            })
            .catch(function(err)
            {
              callback(err);
            });
          }
          else
          {
            callback(null,category,package,age,country,question,null);
          }
        }
    ], function (err,category,package,age,country,question,subCategory)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        //consolelog("question,",question)
        cb(null,{status:"success",message:"Successfully get data",category:category,
        package:package,age:age,country:country,question:question,subCategory:subCategory})
      }
    });
  }

  /* ======================  add Question ======================*/

  methods.setQuestions = function(req,res,cb)
  {
    if (req.url == '/addQuestions')
    {
       var form = new formidable.IncomingForm();
       form.parse(req, function (err, fields, files)
       {
         if(fields.id == 0)
         {
          addQuestion(fields,files).then(function(question)
          {
            cb(null,{status:"success",message:"Successfully Saved"});
          })
          .catch(function(err)
          {
            //////////consolelog(err);
            cb(null,{status:"fail",message:"Error"+err});
          });
        }
        else
        {
          if(fields.id)
          {
            userQuestionModel.deleteAll({questionGroupId:fields.id},function(err,data)
            {
              editQuestion(fields,files).then(function(question)
              {
                cb(null,{status:"success",message:"Successfully Saved"});
              })
              .catch(function(err)
              {
                cb(null,{status:"fail",message:"Error"+err});
              });
           })
         }
         else
         {
           cb(null,{status:"fail",message:"Error"+err});
         }
       }
      });
    }
  }

  /* ======================  add Question ======================*/

  methods.addEditQuestionsFile  = function(req,res,cb)
  {
    if (req.url == '/addEditFile')
    {
       var form = new formidable.IncomingForm();
       form.parse(req, function (err, fields, files)
       {
          AddEditUploadFileData(fields,files).then(function(updated)
          {
            cb(null,{status:"success",message:"Successfully Saved"});
          })
          .catch(function(err)
          {
            //////////consolelog(err);
            cb(null,{status:"fail",message:"Error"+err});
          });

      });
    }
  }

  /* ====================== view for add Question ======================*/

  methods.uploadQuestion = function(req,res,cb)
  {
    getPackagesData(0).then(function(value)
    {
      cb(null,{status:"success",message:"successfully Get data",packages:value});
    })
    .catch(function(err)
    {
      cb(null,{status:"fail",message:"Error :"+err,packages:null});
    });
  }

  /* ====================== view for add Question ======================*/

  methods.setQuestionCSV = function(req,res,cb)
  {
    if (req.url == '/addUploadQuestion')
    {
       var form = new formidable.IncomingForm();
       form.parse(req, function (err, fields, files)
       {
         //consolelog(fields);
          uploadCSVFile(fields,files).then(function(question)
          {
            cb(null,{status:"success",message:"Successfully Saved"});
          })
          .catch(function(err)
          {
            //////////consolelog(err);
            cb(null,{status:"fail",message:"Error :  "+err});
          });
      });
    }
  }

  /* ===================== Get Details of specific QUESTION ============ */

  methods.getDetailQuestion = function(req,res,cb)
  {
    getSpecificQuestion(req.params).then(function(value)
    {
      cb(null,{status:"success",questionData:value});
    })
    .catch(function(err)
    {
      ////////////consolelog(err);
      cb(null,{status:"fail",questionData:null});
    });
  }

  methods.getDetailFreeplayQuestion = function(req,res,cb)
  {
    //consolelog("get details method")
    getSpecificFreeplayQuestion(req.params).then(function(value)
    {
      //consolelog("got detials successfully")
      cb(null,{status:"success",questionData:value});
    })
    .catch(function(err)
    {
      ////////////consolelog(err);
      cb(null,{status:"fail",questionData:null});
    });
  }

  /* ===================== Delete Questions ============ */

  methods.deleteQuestions = function(req,res,cb)
  {
    deleteQuest(req.params.id,req.params.type).then(function(value)
    {
      cb(null,{status:"sucess",message:"successfully Deleted"});
    })
    .catch(function(err)
    {
      cb(null,{status:"fail",message:"Error while deleting"});
    });
  }

  /* ===================== Get category ============ */

  methods.getCategories = function(req,res,cb)
  {
    getCategory().then(function(value)
    {
      getSpecificCategory(req.params).then(function(specificCategoryData)
      {
        getAllCountry(0).then(function(country)
        {
          cb(null,{status:"sucess",categoryData:value,specificData:specificCategoryData,countries:country});
        })
        .catch(function(err)
        {
          callback(err);
        });
        
      }).catch(function(err)
      {
        cb(null,{status:"fail",categoryData:null});
      })
    })
    .catch(function(err)
    {
      cb(null,{status:"fail",categoryData:null});
    });
  }

 /* ===================== Edit Category ===================== */

  methods.editCategoryDt = function(req,res,cb)
  {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files)
    {
      console.log('ssssssss',fields);

      if(fields.isPackage)
      {
        console.log("null")
      }
      else
      {
        console.log("null2")
      }


      if(fields.id == 0)
      {
        addCategoryData(fields,files).then(function(specificCategoryData)
        {
          cb(null,{status:"sucess",categoryData:value,specificData:specificCategoryData});
        }).catch(function(err)
        {
	        console.log(err);
          cb(null,{status:"fail",categoryData:null});
        })
      }
      else
      {
        //console.log('fields',fields);
        editCategoryData(fields,files).then(function(specificCategoryData)
        {
          cb(null,{status:"sucess",categoryData:value,specificData:specificCategoryData});
        }).catch(function(err)
        {
          cb(null,{status:"fail",categoryData:null});
        })
      }
      
      
      // editCategoryData(req.body.id,req.body.category).then(function(specificCategoryData)
      // {
      //   cb(null,{status:"sucess",categoryData:value,specificData:specificCategoryData});
      // }).catch(function(err)
      // {
      //   cb(null,{status:"fail",categoryData:null});
      // })
    })
  }

  /* ====================== Get subCategory ======================*/

  methods.getSubCategoryDt = function(req,res,cb)
  {
      let skipV;
      if(req.query.filter)
      {
        skipV = req.query.filter.skip;
      }
      else
      {
        skipV = 0;
      }
      async.waterfall([
        function(callback) {
          // Checking licence
          subCategoryData(skipV,req.params).then(function(value)
          {
            callback(null, value);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(value, callback)
        {
          getSubCategoryCount(req.params).then(function(count)
          {
            callback(null,value,count);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(value,count,callback)
        {
          if(req.params != 0)
          {
            getSpecificSubCategories(req.params).then(function(specificData)
            {
              callback(null,value,count,specificData);
            })
            .catch(function(err)
            {
              callback(err);
            });
          }
          else
          {
            callback(null,value,count,null);
          }
        },
        function(value,count,specificData, callback)
        {
          getCategory().then(function(category)
          {

            callback(null,value,count,specificData,category);
          })
          .catch(function(err)
          {
            callback(err);
          });
        }
    ], function (err,value,count,specificData,category)
    {
      if(err)
      {
        ////////////consolelog(err);
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        //////consolelog("asdjnasdkjanskjdnaksjdnakjsnd");
        cb(null,{status:"success",message:"Successfully get data",subCategoryDate:value,subCategoryCount:count,specificData:specificData,category:category})
      }
    });
  }

  /* ====================== Get Copy Questions ======================*/

  methods.copyQuestionData = function(req,res,cb)
  {
    ////console.log("HHHHHHHHHHHHHHHH");
      async.waterfall([
        function(callback) {
          //consolelog("Getting Question");
          if(req.params.id)
          {
            userQuestionModel.find({where:{questionGroupId:req.params.id}},function(err,questionData)
            {
              if(err)
              {
                callback(err);
              }
              else
              {
                //consolelog("Got the Question ", questionData);
                callback(null, questionData);
              }
            })
          }
        },
        function(questionData, callback)
        {
          let i=0;
          let objDetail=0;
          let questionToUpdate = [];
          async.eachSeries(questionData, function(data, cback)
          {
            //console.log("working on each ", questionData);

          let obj = {
                      category_id:data.category_id,
                      sub_category_id:data.sub_category_id,
                      age_id:data.age_id,
                      time_Allowed:data.time_Allowed,
                      region:data.region,
                      question:data.question,
                      answer1:data.answer1,
                      answer2:data.answer2,
                      answer3:data.answer3,
                      answer4:data.answer4,
                      hint:data.hint,
                      correct_Answer:data.correct_Answer,
                      pack_ID:data.pack_ID,
                      status:data.status,
                      created:new Date(),
                      modified:new Date()
                    }

                    //consolelog("obj to send ", obj);
              userQuestionModel.create(obj,function(err,newCopy)
              {
                i++;
                questionToUpdate.push(newCopy.id);
                if( i ==  1)
                {
                  //consolelog("created successfully ",newCopy);
                  objDetail ={
                                id:newCopy.id,
                                image:questionData[0].image_URL,
                                sound:questionData[0].sound_URL,
                                video:questionData[0].video_URL,
                                fileType:questionData[0].fileType
                              }
                }

                if(i == questionData.length)
                {
                  callback(null, objDetail,questionToUpdate);
                }
                else
                {

                  cback();
                }

              })

          })
          // //consolelog(questionData[0].image_URL);
          //  var fs = require('fs');
          //  fs.createReadStream('client/'+questionData[0].image_URL).pipe(fs.createWriteStream('client/storage/test.png'));
        },
        function(obj,questionToUpdate, callback)
        {
          //console.log("obj ", obj);
          //  var fs = require('fs');
          let randomSt = randomstring.generate(5);
          let saveUrl = '';
          let updateObj ={};
          if(obj.fileType == 0)
          {
            ////consolelog("jjjjjjjjjjjjjjjj");
            // fs.createReadStream('client/'+obj.image).pipe(fs.createWriteStream('client/storage/questions/images/'+randomSt+'.png'));
            // saveUrl = 'storage/questions/images/'+randomSt+'.png';

            updateObj ={questionGroupId:obj.id,image_URL:obj.image,sound_URL:null,video_URL:null,fileType:obj.fileType}


          }
          if(obj.fileType == 1 || obj.fileType == 4 )
          {
            ////consolelog("jjjjjjjjjjjjjjjj");
            // fs.createReadStream('client/'+obj.image).pipe(fs.createWriteStream('client/storage/questions/images/'+randomSt+'.png'));
            // saveUrl = 'storage/questions/images/'+randomSt+'.png';

            updateObj ={questionGroupId:obj.id,image_URL:obj.image,sound_URL:null,video_URL:null,fileType:obj.fileType}


          }
          else if(obj.fileType == 2)
          {
            // fs.createReadStream('client/'+obj.sound).pipe(fs.createWriteStream('client/storage/questions/sounds/'+randomSt+'.mp3'));
            // saveUrl = 'client/storage/questions/sounds/'+randomSt+'.mp3';
            updateObj ={questionGroupId:obj.id,image_URL:null,sound_URL:obj.sound,video_URL:null,fileType:obj.fileType}
          }
          else if(obj.fileType == 3)
          {
            // fs.createReadStream('client/'+obj.video).pipe(fs.createWriteStream('client/storage/questions/videos/'+randomSt+'.mp4'));
            // saveUrl = 'client/storage/questions/sounds/'+randomSt+'.mp4';
            updateObj ={questionGroupId:obj.id,image_URL:null,sound_URL:null,video_URL:obj.video,fileType:obj.fileType}
          }

          for(let i=0;i<questionToUpdate.length;i++)
          {
            userQuestionModel.updateAll({id:questionToUpdate[i]},updateObj);
          }
          //consolelog("22222");
          callback(null,1);

          //userQuestionModel.updateAll({questionGroupId:obj.},{})
        }
    ], function (err,value)
    {
      //consolelog("helll");
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table"})
      }
      else
      {
        //consolelog("111111");
        cb(null,{status:"success",message:"Successfully Copied Question"})
      }
    });
  }

  /* ====================== Set/Add/Edit Sub Category ======================*/

  methods.setSubCategory = function(req,res,cb)
  {
    ////consolelog(" ======= req body ================",req.body);
     if(req.body.id == '0')
     {
       setSubCategoryData(req.body).then(function(value)
       {
         cb(null, {status:"success",message:"Successfully upload Image"});
       })
       .catch(function(err)
       {
         cb(null, {status:"fail",message:err});
       });
     }
     else
     {
       editSubCategoryData(req.body).then(function(value)
       {
         cb(null, {status:"success",message:value});
       })
       .catch(function(err)
       {
         cb(null, {status:"fail",message:err});
       });
     }
  }

  /* Ajax Call */

  methods.getSubCategory = function(req,res,cb)
  {
    getSubCategoryData(req.body.category_id).then(function(value)
    {
      cb(null, {status:1,message:"Success",subCategory:value});
    })
    .catch(function(err)
    {
      cb(err,{status:0,message:"error",subCategory:null});
    });
  }

  /* Ajax licence Call */

  methods.exportLicenceData = function(req,res,cb)
  {
    addExportLicence(req.params.id,req.params.distributor_id,req.params.type,res).then(function(value)
    {
      cb(null, {status:1,message:"Success",subCategory:value});
    })
    .catch(function(err)
    {
      cb(err,{status:0,message:"error",subCategory:null});
    });
  }

 /* Ajax Age call*/

  methods.getMultipleAge = function(req,res,cb)
  {
    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionGroupId ='+req.body.id+'  GROUP BY age_id', function (err, data)
    {
      if(err)
      {
        //////////consolelog(err);
      }
      else
      {
        ////////////consolelog(data)
        cb(null,{age:data})
      }

    })
  }

    /* Ajax Qyestion call*/

   methods.getMultipleQuestion = function(req,res,cb)
   {
     //////////consolelog(req.body.id);
     let questions =  app.models.questions;
     let ds1 = questions.dataSource;
     ds1.connector.query('SELECT questions.id,questions.age_id,questions.region,questions.questionGroupId,countries.name,age_categories.age FROM questions INNER JOIN   age_categories ON age_id = age_categories.id INNER JOIN countries ON region = countries.id WHERE questionGroupId ='+req.body.id+'', function (err, data)
     {
       if(err)
       {
         //////////consolelog(err);
       }
       else
       {
         //////consolelog("data",data);
         cb(null,{multipleQuestionData:data})
       }

     })
   }


   methods.getMessageData = function(req,res,cb)
   {
     let editdata =0
     if(req.params.id != 0)
     {
       editdata=1
     }

       messageModel.find({},function(err,data)
       {
          if(err)
          {
            cb(null,{status:"fail",message:"Error while getting data"});
          }
          else
          {
            cb(null,{status:"success",data:data,edit:editdata});
          }
       })



   }

   methods.setMessageData = function(req,res,cb)
   {

     messageModel.deleteAll({},function(err,data)
     {
        if(err)
        {
          //consolelog(err);
          cb(null,{status:"fail",message:"Error while getting data"});
        }
        else
        {
          if (req.url == '/addMessage')
          {
             var form = new formidable.IncomingForm();
             form.parse(req, function (err, fields, files)
             {
               ////console.log("------------File",files);
                let obj = {}
                if(fields.fileType == 1)
                {
                  obj = {heading:fields.heading,message:fields.message,type:fields.fileType,status:1,messageType:fields.messageType,created:new Date(),modified:new Date()}
                }
                else
                {
                  if(files.image.name != '')
                  {
                    obj ={file:"storage/message/"+files.image.name,type:fields.fileType,messageType:fields.messageType,status:1,created:new Date(),modified:new Date()}
                  }
                  else
                  {
                    obj ={file:fields.imageValue,type:fields.fileType,messageType:fields.messageType,status:1,created:new Date(),modified:new Date()}
                  }
                }


                messageModel.create(obj,function(err,data)
                {
                  if(err)
                  {
                    cb(null,{status:null,message:"Error While Getting data"});
                  }
                  else
                  {
                    if(fields.fileType == 2)
                    {

                      if(files.image.name != '')
                      {
                          let oldpath="";
                          let newpath="";
                          let savePath ="";
                          oldpath = files.image.path;
                          newPath = 'client/storage/message/'+files.image.name;

                          let s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/message'}});


                          sharp(oldpath)
                          .toBuffer()
                          .then( data =>
                           {
                              let randomS = randomstring.generate();
                              let params =  {}
                              params.Key = files.image.name;
                              params.Body = data;
                              params.ContentType = 'binary';
                              s3Bucket.putObject(params, function(err, data)
                              {
                                if (err)
                                {
                                  cb(null,{status:null,message:"Error While Getting data"});
                                }
                                else
                                {
                                  cb(null,{status:null,message:"Successfully Deleted and added"});
                                }
                              })
                            })
                            .catch( err => {
                              //console.log(err);
                            });
                        }
                        else
                        {
                          cb(null,{status:null,message:"Successfully Deleted and added"});
                        }
                    }
                    else
                    {
                      cb(null,{status:null,message:"Successfully Deleted and added"});
                    }
                  }
                })
            })
          }
        }
     })
   }


   methods.getsetting = function(req,res, cb)
   {

    let appVersionModel = app.models.app_versions;
    appVersionModel.find({},function(err,data)
    {
      if(err)
      {
        //console.log(err);
      }
      else
      {
        cb(null,{status:1,appVersion:data});
      }
    })
   }


   methods.gameVersion = function(req,res, cb)
   {
     let appVersionModel = app.models.app_versions;
     appVersionModel.updateAll({device:"android"},{gameVersion:req.body.androidVersion,heading:req.body.heading.trim(),message:req.body.message.trim()},function(err,data)
     {
       if(err)
       {
         //console.log(err);
       }
       else
       {
         appVersionModel.updateAll({device:"iOS"},{gameVersion:req.body.iosVersion,heading:req.body.heading.trim(),message:req.body.message.trim()},function(err,data)
         {
           if(err)
           {
             //console.log(err);
           }
           else
           {

             appVersionModel.updateAll({device:"windows"},{gameVersion:req.body.windowVersion,heading:req.body.heading.trim(),message:req.body.message.trim()},function(err,data)
             {
               if(err)
               {
                 //console.log(err);
               }
               else {

               }
               {
                 cb(null,{status:1})
               }
             })
           }
         })
       }
     })
   }

   /* ==================  Add licence To package ========================== */

   methods.cleanUserRemove = function(req,res, cb)
   {
     
     if(req.params.id && req.params.id != null && req.params.id != undefined)
     {
       //console.log(1)

     userModel.findOne({where:{licence_id:req.params.id}},function(err,data)
     {
        if(err)
        {
          cb(null,{status:"fail"})
        }
        else
        {
          //console.log(2)
          if(data)
          {
            //console.log(3)
              userChildsModel.deleteAll({user_id:parseInt(data.id)},function(err,userChildDelete)
              {
                  if(err)
                  {
                    //console.log(6)
                    cb(null,{status:"fail"})
                  }
                  else
                  {
                    //console.log(4)
                    userModel.deleteAll({id:parseInt(data.id)},function(err,userinfoDelete){
                      if(err)
                      {
                        cb(null,{status:"fail"})
                      }
                      else
                      {
                        //console.log(999)
                          cb(null,{status:"success"})
                      }

                    })
                  }
              })
          }
          else
          {
            cb(null,{status:"fail"})
          }

        }
     })
    }

   }

   /* ==================  Clean licence To package ========================== */

   methods.stopLicence = function(req,res, cb)
   {
     ////console.log(req.params.id)
       if(req.params.id && req.params.id != null && req.params.id != undefined)
       {
         licenceModel.findOne({where:{id:parseInt(req.params.id)}},function(err,licenceInfo){
           if(err)
           {
             cb(null,{status:"fail"});
           }
           else
           {
             if(licenceInfo)
             {
               licenceInfo.updateAttributes({status:0},function(err,updateUserChild){
                 if(err)
                 {
                   cb(null,{status:"fail"})
                 }
                 else
                 {
                   cb(null,{status:"success"});
                 }

               })
             }
             else
             {
               cb(null,{status:"fail"})
             }
           }

         })
       }
    }


       /* ==================  stop licence To package ================= */

    methods.startLicence = function(req,res, cb)
       {
         ////console.log(req.params.id)
           if(req.params.id && req.params.id != null && req.params.id != undefined)
           {
             licenceModel.findOne({where:{id:parseInt(req.params.id)}},function(err,licenceInfo){
               if(err)
               {
                 cb(null,{status:"fail"});
               }
               else
               {
                 if(licenceInfo)
                 {
                   licenceInfo.updateAttributes({status:1},function(err,updateUserChild){
                     if(err)
                     {
                       cb(null,{status:"fail"})
                     }
                     else
                     {
                       cb(null,{status:"success"});
                     }

                   })
                 }
                 else
                 {
                   cb(null,{status:"fail"})
                 }
               }

             })
           }
    }

    /* ==================  search Licence ========================== */

    methods.searchLinceces = function(req,res, cb)
    {
      //console.log(req.body)
      let licence =  app.models.licences;
      let ds1 = licence.dataSource;
      let finalQuestion = [];

      let cond="";
      cond = "where licence LIKE '%"+req.body.licenceName+"%' and status="+req.body.statusType+"";

          //consolelog("cond",cond);

      ds1.connector.query('SELECT * from licences '+cond+' limit 100', function (err, info)
          {
            if(err)
            {
              //console.log(err);
            }
            else
            {
              cb(null,{status:"success",data:info})
            }
          })

     }


     methods.getUserQuestiondetails = function(req,res, cb)
    {
      
      async.waterfall([
        function(callback)
        {
          getCategory().then(function(category)
          {
            callback(null,category);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category, callback)
        {
          getPackagesDataWithoutLimt().then(function(package)
          {
            callback(null,category,package);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category,package, callback)
        {
          getUserAgeData(0).then(function(age)
          {
            callback(null,category,package,age);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category,package,age, callback)
        {
          getAllCountry(0).then(function(country)
          {
            callback(null,category,package,age,country);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(category,package,age,country, callback)
        {
          getEditQuestion(req.body).then(function(question)
          {
            callback(null,category,package,age,country,question);
          })
          .catch(function(err)
          {
            ////////////consolelog(err);
            callback(err);
          });
        },
        function(category,package,age,country,question, callback)
        {
          if(req.params.id != 0)
          {
            getSubCategoryData(question.category_id).then(function(subCategory)
            {
              callback(null,category,package,age,country,question,subCategory);
            })
            .catch(function(err)
            {
              callback(err);
            });
          }
          else
          {
            callback(null,category,package,age,country,question,null);
          }
        }
    ], function (err,category,package,age,country,question,subCategory)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        //consolelog("question,",question)
        cb(null,{status:"success",message:"Successfully get data",category:category,
        package:package,age:age,country:country,question:question,subCategory:subCategory})
      }
    });
    }


    /* ==================  Add licence To package ========================== */

   methods.deleteChildUser = function(req,res, cb)
   {
     
     if(req.params.id && req.params.id != null && req.params.id != undefined)
     {
      userChildsModel.findOne({where:{id:parseInt(req.params.id)}},function(err,data)
      {
        if(err)
        {
          cb(null,{status:"fail"})
        }
        else
        {
          if(data)
          {
            userChildsModel.deleteAll({id:parseInt(data.id)},function(err,userChildDelete)
            {
                if(err)
                {
                  //console.log(6)
                  cb(null,{status:"fail"})
                }
                else
                {
                  cb(null,{status:"success"})
                }
            })
          }
          else
          {
            cb(null,{status:"fail"})
          }

        }
     })
    }

   }

   /**/


   methods.deleteTeam = function(req,res, cb)
   {
     
     if(req.params.id && req.params.id != null && req.params.id != undefined)
     {
      userTeamModel.findOne({where:{id:parseInt(req.params.id)}},function(err,data)
      {
        if(err)
        {
          cb(null,{status:"fail"})
        }
        else
        {
          if(data)
          {
            userTeamModel.deleteAll({id:parseInt(data.id)},function(err,userChildDelete)
            {
                if(err)
                {
                  //console.log(6)
                  cb(null,{status:"fail"})
                }
                else
                {
                     
                  userTeamChildModel.deleteAll({user_team_id:parseInt(data.id)},function(err,userChildDelete)
                  {
                      if(err)
                      {
                        cb(null,{status:"fail"})
                      }
                      else
                      {
                          
                        cb(null,{status:"success"})
                      }
                  })
                }
            })
          }
          else
          {
            cb(null,{status:"fail"})
          }

        }
     })
    }

   }
   

    /* Question Active/ Inactive Status */


    methods.updateActiveInactiveQuestion = function(req,res, cb)
    {
      userQuestionModel.findOne({where:{questionGroupId:parseInt(req.body.id)}},function(err,data)
      {
         if(err)
         {
           cb(null,{status:"fail"})
         }
         else
         {
           if(data)
           {
            
            userQuestionModel.updateAll({questionGroupId:data.questionGroupId},{questionActiveStatus:req.body.type},function(err,updateInfo)
            {
              if(err)
              {
                //console.log(6)
                cb(null,{status:"fail"})
              }
              else
              {
                //console.log("jjjjjjjjjjj"+updateInfo);
              cb(null,{status:"success"})
              }
            })
           }
           else
           {
             cb(null,{status:"fail"})
           }
 
         }
      })
    
 
    }

    /* =================== Multiple update ==============  */

    methods.updateActiveInactiveQuestionMultiple = function(req,res, cb)
    {
      let idArray =  req.body.id.split(",")
      let x=0;
      async.eachSeries(idArray, function(value, callback)
      {
        
        userQuestionModel.findOne({where:{questionGroupId:parseInt(value)}},function(err,data)
        {
          if(err)
          {
            cb(null,{status:"fail"})
          }
          else
          {
            if(data)
            {
              
              //console.log(data);
              userQuestionModel.updateAll({questionGroupId:data.questionGroupId},{questionActiveStatus:req.body.type},function(err,updateInfo)
              {
                if(err)
                {
                  if(idArray.length ==  x)
                  {
                    //console.log(2222);
                    //resolve(obj)
                  }
                  else
                  {
                    
                  }
                }
                else
                {

                  //console.log("idArray.length",idArray.length)
                  //console.log("idArray.lengthxxxxxxxxxxx",x)
                  x++;
                  if(idArray.length ==  x)
                  {
                    cb(null,{status:"success"});
                  }
                  else
                  {
                    callback() 
                  }
                }
              })
            }
            else
            {
              callback()
              if(idArray.length ==  x)
              {
                //console.log(2222);
                //resolve(obj)
              }
              else
              {
                
              }
            }
  
          }
        })
      })
    
 
    }


    /* ========Multiple Delete=========*/


    methods.deleteMultipleQuestions = function(req,res, cb)
    {
      let idArray =  req.body.id.split(",")
      let x=0;
      async.eachSeries(idArray, function(value, callback)
      {
        userQuestionModel.findOne({where:{questionGroupId:parseInt(value)}},function(err,data)
        {
          if(err)
          {
            cb(null,{status:"fail"})
          }
          else
          {
            if(data)
            {
              userQuestionModel.deleteAll({questionGroupId:data.questionGroupId},function(err,updateInfo)
              {
                if(err)
                {
                  if(idArray.length ==  x)
                  {
                    cb(null,{status:"success"});
                    //resolve(obj)
                  }
                  else
                  {
                    callback()
                  }
                }
                else
                {
                  //console.log("idArray.length",idArray.length)
                  //console.log("idArray.lengthxxxxxxxxxxx",x)
                  x++;
                  if(idArray.length ==  x)
                  {
                    cb(null,{status:"success"});
                  }
                  else
                  {
                    callback() 
                  }
                }
              })
            }
            else
            {
              if(idArray.length ==  x)
              {
                cb(null,{status:"success"});
                //resolve(obj)
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
    
    /* ======== Multiple Copy =========*/


    methods.copyMultipleQuestions = function(req,res, cb)
    {
      let idArray =  req.body.id.split(",")
      let x=0;
      //console.log(idArray);
      async.eachSeries(idArray, function(value, callbackAsync)
      {
        async.waterfall([
          function(callback) {
            //consolelog("Getting Question");
            if(value)
            {
              userQuestionModel.find({where:{questionGroupId:value}},function(err,questionData)
              {
                if(err)
                {
                  callback(err);
                }
                else
                {
                  //consolelog("Got the Question ", questionData);
                  callback(null, questionData);
                }
              })
            }
          },
          function(questionData, callback)
          {
            let i=0;
            let objDetail=0;
            let questionToUpdate = [];
            async.eachSeries(questionData, function(data, cback)
            {
  
            let obj = {
                        category_id:data.category_id,
                        sub_category_id:data.sub_category_id,
                        age_id:data.age_id,
                        time_Allowed:data.time_Allowed,
                        region:data.region,
                        question:data.question,
                        answer1:data.answer1,
                        answer2:data.answer2,
                        answer3:data.answer3,
                        answer4:data.answer4,
                        hint:data.hint,
                        correct_Answer:data.correct_Answer,
                        pack_ID:data.pack_ID,
                        status:data.status,
                        created:new Date(),
                        modified:new Date()
                      }
  
                      //consolelog("obj to send ", obj);
                userQuestionModel.create(obj,function(err,newCopy)
                {
                  i++;
                  questionToUpdate.push(newCopy.id);
                  if( i ==  1)
                  {
                    //consolelog("created successfully ",newCopy);
                    objDetail ={
                                  id:newCopy.id,
                                  image:questionData[0].image_URL,
                                  sound:questionData[0].sound_URL,
                                  video:questionData[0].video_URL,
                                  fileType:questionData[0].fileType
                                }
                  }
  
                  if(i == questionData.length)
                  {
                    callback(null, objDetail,questionToUpdate);
                  }
                  else
                  {
  
                    cback();
                  }
  
                })
  
            })
          },
          function(obj,questionToUpdate, callback)
          {
            let randomSt = randomstring.generate(5);
            let saveUrl = '';
            let updateObj ={};
            if(obj.fileType == 0)
            {
              updateObj ={questionGroupId:obj.id,image_URL:obj.image,sound_URL:null,video_URL:null,fileType:obj.fileType}
  
  
            }
            if(obj.fileType == 1 || obj.fileType == 4 )
            {
              updateObj ={questionGroupId:obj.id,image_URL:obj.image,sound_URL:null,video_URL:null,fileType:obj.fileType}
            }
            else if(obj.fileType == 2)
            {
              updateObj ={questionGroupId:obj.id,image_URL:null,sound_URL:obj.sound,video_URL:null,fileType:obj.fileType}
            }
            else if(obj.fileType == 3)
            {
              updateObj ={questionGroupId:obj.id,image_URL:null,sound_URL:null,video_URL:obj.video,fileType:obj.fileType}
            }
  
            for(let i=0;i<questionToUpdate.length;i++)
            {
              userQuestionModel.updateAll({id:questionToUpdate[i]},updateObj);
            }
            callback(null,1);
          }
      ], function (err,value)
      {
        if(err)
        {
          cb(null,{status:"fail",message:"Fail to get data from country table"})
        }
        else
        {
          x++
          if(idArray.length == x)
          {
            cb(null,{status:"success",message:"Successfully Copied Question"})
          }
          else
          {
            callbackAsync()
          }
          
          
        }
      });
      })
    
 
    }



    /* ======== Multiple Copy =========*/


    methods.moveMultipleQuestionsPacakge = function(req,res, cb)
    {
      let idArray =  req.body.id.split(",")
      let x=0;
      async.eachSeries(idArray, function(value, callback)
      {
        userQuestionModel.findOne({where:{questionGroupId:parseInt(value)}},function(err,data)
        {
          if(err)
          {
            cb(null,{status:"fail"})
          }
          else
          {
            if(data)
            {
              userQuestionModel.updateAll({questionGroupId:data.questionGroupId},{pack_ID:req.body.packageId},function(err,updateInfo)
              {
                if(err)
                {
                  //console.log(err);
                  if(idArray.length ==  x)
                  {
                    cb(null,{status:"success"});
                    //resolve(obj)
                  }
                  else
                  {
                    callback()
                  }
                }
                else
                {
                  x++;
                  if(idArray.length ==  x)
                  {
                    cb(null,{status:"success"});
                  }
                  else
                  {
                    callback() 
                  }
                }
              })
            }
            else
            {
              if(idArray.length ==  x)
              {
                cb(null,{status:"success"});
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


    /* ============== Move to Final Round ================ */


    methods.setFinlQuestions = function(req,res, cb)
    {
      let idArray =  req.body.id.split(",")
      let x=0;
      async.eachSeries(idArray, function(value, callback)
      {
        userQuestionModel.findOne({where:{questionGroupId:parseInt(value)}},function(err,data)
        {
          if(err)
          {
            cb(null,{status:"fail"})
          }
          else
          {
            if(data)
            {
              userQuestionModel.updateAll({questionGroupId:data.questionGroupId},{status:1},function(err,updateInfo)
              {
                if(err)
                {
                  //console.log(err);
                  if(idArray.length ==  x)
                  {
                    cb(null,{status:"success"});
                    //resolve(obj)
                  }
                  else
                  {
                    callback()
                  }
                }
                else
                {
                  x++;
                  if(idArray.length ==  x)
                  {
                    cb(null,{status:"success"});
                  }
                  else
                  {
                    callback() 
                  }
                }
              })
            }
            else
            {
              if(idArray.length ==  x)
              {
                cb(null,{status:"success"});
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




     /* ======== Multiple Copy =========*/


     methods.changeQuestionType = function(req,res, cb)
     {
        //console.log("=================req================",req.body);       
         userQuestionModel.findOne({where:{questionGroupId:parseInt(req.body.id)}},function(err,data)
         {
           if(err)
           {
             cb(null,{status:"fail"})
           }
           else
           {
             if(data)
             {
               userQuestionModel.updateAll({questionGroupId:data.questionGroupId},{questionState:parseInt(req.body.type)},function(err,updateInfo)
               {
                 if(err)
                 {
                  cb(null,{status:"fail",message:"error While updating"}); 
                 }
                 else
                 {
                  cb(null,{status:"success",message:"updated"});  
                 }
               })
             }
             else
             {
                cb(null,{status:"fail",message:"Question Id not found"});              
             }
           }
         })
     }



  methods.getTempQuestions = function(req,res,cb)
  {
    //console.log("errrr")
    let skipV;
    if(req.query.filter)
    {
      skipV = req.query.filter.skip;
    }
    else
    {
      skipV = 0;
    }

    let tempquestions =  app.models.tempquestions;
    let ds1 = tempquestions.dataSource;
    let finalQuestion = [];
    async.waterfall([
      function(callbackWater) {
        let cond="";

       ds1.connector.query('SELECT tempquestions.id,tempquestions.category_id,tempquestions.sub_category_id,tempquestions.age_id,tempquestions.time_Allowed,tempquestions.region,tempquestions.question,tempquestions.answer1,tempquestions.answer2,tempquestions.answer3,tempquestions.answer4,tempquestions.hint,tempquestions.correct_Answer,tempquestions.image_URL,tempquestions.sound_URL,tempquestions.video_URL,tempquestions.fileType,tempquestions.pack_ID,tempquestions.questionGroupId,tempquestions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(tempquestions.id) AS multiple FROM tempquestions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id '+cond+' GROUP BY questionGroupId ORDER BY questionGroupId DESC LIMIT '+skipV+',10', function (err, data)
       {
         if(err)
         {
           //console.log(err);
         }
         else
         {
           ////console.log(data);
             for(let i=0;i<data.length;i++)
             {
               let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,question:data[i].question,answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionGroupId:data[i].questionGroupId}

               finalQuestion.push(question);
              }
             callbackWater(null,finalQuestion);

         }
       })
     },
     function(questionData, callbackWater)
     {
      ////consolelog("question data for free play ", questionData);
       if(questionData.length > 0)
       {
        ////consolelog("length is greater than 0 ");
         let x=0;id=0;
         async.eachSeries(questionData, function(question, callback)
         {

           //console.log("question group id ",question.questionGroupId);
           ds1.connector.query('SELECT * FROM tempquestions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionGroupId ='+question.questionGroupId+'  GROUP BY age_id', function (err, ageData)
           {
             if(err)
             {
               //console.log(err);
               callbackwater(err);
             }
             else
             {
               for(let j=0;j<ageData.length;j++)
               {
                 question.age.push(ageData[j].age);
               }
               x++;

               if(questionData.length ==  x)
               {
                 //consolelog(3);
                 callbackWater(null, question);
               }
               else
               {
                 callback()
               }
             }
           })
         })
       }
       else
       {
         callbackWater(null, []);
       }
     },
     function(questionAgeData, callbackWater)
     {
       if(finalQuestion.length > 0)
       {
         let x=0;id=0;
         async.eachSeries(finalQuestion, function(questionAge, callback)
         {
           ds1.connector.query('SELECT * FROM tempquestions INNER JOIN countries ON region = countries.id WHERE questionGroupId ='+questionAge.questionGroupId+'  GROUP BY region', function (err, countryData)
           {
             if(err)
             {
              //console.log(err);
               callbackwater(err);
             }
             else
             {
               for(let j=0;j<countryData.length;j++)
               {
                 questionAge.country.push(countryData[j].name);
               }
               x++;

               if(finalQuestion.length ==  x)
               {
                 ////consolelog(4,questionAge);
                 callbackWater(null, questionAge);
               }
               else
               {
                 ////////////consolelog(question)
                 callback()
               }
             }
           })
         })
       }
       else
       {
         callbackWater(null, []);
       }
     },
     function(questionAgeData, callbackWater)
     {
       let cond="";
        
       ds1.connector.query('SELECT COUNT(a.cnt) as count FROM ( SELECT COUNT(id) AS cnt FROM tempquestions '+cond+' GROUP BY questionGroupId) AS a', function (err, questionCount)
       {
         if(err)
         {
          //console.log(err);
         }
         else
         {
           callbackWater(null, finalQuestion , questionCount);
         }
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
       getPackagesData(0).then(function(package)
       {
         callback(null, value,count,category,package);
       })
       .catch(function(err)
       {
         callback(err);
       });
     }
 ], function (err,value,questionCount,category,package)
 {
   ////consolelog("sending questions ", finalQuestion);
   cb(null,{questionsData:finalQuestion,count:questionCount[0].count,category:category,package:package});
 });
 }


 /* Delete Temp Table Records */
 methods.removeErrorLogsInfo = function(req,res,cb)
 {
   let errorlogsModels =  app.models.errorlogs;
   errorlogsModels.deleteAll({},function(err,data){
     if(err)
     {
      cb(null,{status:0,message:"Error While Deleting Records"})
     }
     else
     {
      cb(null,{status:1,message:"SucccessFully Deleted "});
     }
   })
}


methods.getCateAgeStats = function(req,res,cb)
 {
   
  categoryAgeStatsModel.find({include:["categories","age_categories"]},function(err,data){
     if(err)
     {
      cb(null,{status:0,message:"Error While getting Data"+err})
     }
     else
     {
       //console.log(data);
      cb(null,{status:1,dataInfo:data});
     }
   })
}


 /* Delete Temp Table Records */
 methods.removeQuestionTempInfo = function(req,res,cb)
 {
   let tempquestions =  app.models.tempquestions;
   tempquestions.deleteAll({},function(err,data){
     if(err)
     {
      cb(null,{status:0,message:"Error While Deleting Records"})
     }
     else
     {
      cb(null,{status:1,message:"SucccessFully Deleted "});
     }
   })
}


methods.getRegionAdmins = function(req,res,cb)
{
    //console.log(req.params);
    userModel.find({where:{userType:2}},function(err,data){
    if(err)
    {
      cb(null,{status:0,message:"Error While getting Data"+err})
    }
    else
    {
        countryModel.find({},function(err,countrydata)
          {
            if(err)
            {
              //console.log(err);
              //cb(null,{status:1,dataInfo:data,countryInfo:countryInfo});
            }
            else
            {
              if(req.params.id == 0)
              {
                cb(null,{status:1,dataInfo:data,countryInfo:countrydata,userInf:null});
              }
              else
              {
                userModel.findOne({where:{id:req.params.id,userType:2},fields:{id:true,username:true,passwordDebug:true,country_id:true,countryCode:true}}
                  ,function(err,admiInfo)
                {
                  if(err)
                  {
                    cb(null,{status:0})
                  }
                  else
                  {
                    //console.log(admiInfo);
                    cb(null,{status:1,dataInfo:data,countryInfo:countrydata,userInf:admiInfo});
                  }
                })
              }
              
            }
            
          })  
        
      }
    })
}

/* set Region admin*/

methods.addRegionAdmin = function(req,res,cb)
{
  if(req.body.id == 0)
  {
    userModel.findOne({where:{country_id:req.body.country,userType:2}},function(err,data)
    {
    
      if(err)
      {
        cb(null,{status:0,message:"Error"})
      }
      else
      {
        if(data)
        {
          cb(null,{status:0,message:'already Exist'})
        }
        else
        {
            userModel.create({username:req.body.username,password:req.body.password,passwordDebug:req.body.password,country_id:req.body.country,
                            countryCode:req.body.countryName,created:new Date(),userType:2,modified: new Date()},function(err,addInfo)
            {
              if(err)
              {
                cb(null,{status:0,message:"Error"})
              }
              else
              {
                cb(null,{status:1,message:"Successfully added"})
              }
            })
        
          }
        
        }
     })
    }
    else
    {
      
        userModel.findById(parseInt(req.body.id), function (err, userM)
        {
          if (err)
          {
            res.redirect('./changePassword');
          }
          else
          {
            if(err)
            {
              cb(null,{status:0})
            }
            else
            {
              if(userM)
              {
                userM.updateAttributes({username:req.body.username,password:req.body.password,passwordDebug:req.body.password,country_id:req.body.country,countryCode:req.body.countryName,modified:new Date()}, function (err, user2)
                {
                  if (err)
                  {
                    //console.log(err);
                    cb(null,{status:0,message:""})
                  }
                  else
                  {
                    cb(null,{status:1,message:"Successfully added"})
                  }
                });
              }
              else
              {
                cb(null,{status:0})
              }
           }
          } 
      })
    }

}


/* change password */

methods.deleteAdminUser = function(req,res,cb)
{
  userModel.findOne({where:{id:parseInt(req.params.id),userType:2}},function(err,data)
  {
    if(err)
    {
      //console.log('ssssssssssssssssssssssssssssssssssssssss',err);
      cb(null,{status:0,message:"Error"})
    }
    else
    {
      //console.log("sssssssssssss",data);
      if(data)
      {
        userModel.deleteAll({id:parseInt(data.id),userType:2},function(err,infoData)
        {
          if(err)
          {
            cb(null,{status:0,message:"Error"+err})
          }
          else
          {
            cb(null,{status:1,message:"successfully Remove"})
          }
        })
      }
      else
      {
        cb(null,{status:0,message:"Error"+err})
      }
           
    }
  })
}


/** Update package Status */


methods.updatePackageStatus = function(req,res,cb)
{
  console.log(req.params);
  userPackagesModel.findOne({where:{id:parseInt(req.params.id)}},function(err,data)
  {
    if(err)
    {
      cb(null,{status:0,message:"Error"})
    }
    else
    {
      //console.log("sssssssssssss",data);
      if(data)
      {
        userPackagesModel.updateAll({id:parseInt(data.id)},{status:req.params.type},function(err,infoData)
        {
          if(err)
          {
            console.log(err);
            cb(null,{status:0,message:"Error"+err})
          }
          else
          {
            cb(null,{status:1,message:"successfully Remove"})
          }
        })
      }
      else
      {
        cb(null,{status:0,message:"Error"+err})
      }
           
    }
  })
}


/** Update category Status */


methods.updateCategoryStatus = function(req,res,cb)
{
  console.log(req.params);
  userCategoriesModel.findOne({where:{id:parseInt(req.params.id)}},function(err,data)
  {
    if(err)
    {
      cb(null,{status:0,message:"Error"})
    }
    else
    {
      //console.log("sssssssssssss",data);
      if(data)
      {
        userCategoriesModel.updateAll({id:parseInt(data.id)},{status:req.params.type},function(err,infoData)
        {
          if(err)
          {
            console.log(err);
            cb(null,{status:0,message:"Error"+err})
          }
          else
          {
            cb(null,{status:1,message:"successfully Remove"})
          }
        })
      }
      else
      {
        cb(null,{status:0,message:"Error"+err})
      }
           
    }
  })
}



  /*  ========================================================= */

  /* Getting licence Data */

  function getLicencesData(skipV,param)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all licences from table */

      let cond ={}
      if((param.id != 0) && (param.distributor_id == 0))
      {
        cond ={country_id:param.id,count:0}
      }
      else if((param.id != 0) && (param.distributor_id != 0))
      {
        cond ={country_id:param.id,distributor_id:param.distributor_id,count:0}
      }
      else
      {
        cond ={count:0}
      }

      licenceModel.find({include:["distributors",'countries'],order:'id desc',limit: 15, skip: skipV,where:cond},function(err,licenceData)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(licenceData);
          }
      })
    });
  }

  /* Getting licence Count */

  function getLicencesCount(param)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all licences from table */
      let cond ={}
      if((param.id != 0) && (param.distributor_id == 0))
      {
        cond ={country_id:param.id,count:0}
      }
      else if((param.id != 0) && (param.distributor_id != 0))
      {
        cond ={country_id:param.id,distributor_id:param.distributor_id,count:0}
      }
      else
      {
        cond ={count:0}
      }
      licenceModel.count(cond,function(err,count)
      {
        if(err)
        {
          reject(0);
        }
        else
        {
          resolve(count);
        }
      })
    });
  }

  /* Getting distributor Data */

  function getDistributorData(skipV,param)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all licences from table */

      let cond ={}
      if(param.id != 0)
      {
        cond ={count:0}
      }
      else
      {
        cond ={count:0}
      }

      distributorsModel.find({include:"countries",order:'id desc',limit: 15, skip: skipV,where:cond},function(err,licenceData)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(licenceData);
          }
      })
    });
  }

  /* Getting distributor Count */

  function getDistributorCount(param)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all licences from table */
      let cond ={}
      if(param.id != 0)
      {
        cond ={country_id:param.id,count:0}
      }
      else
      {
        cond ={count:0}
      }
      distributorsModel.count(cond,function(err,count)
      {
        if(err)
        {
          reject(0);
        }
        else
        {
          resolve(count);
        }
      })
    });
  }

  /* Getting specific Data */

  function getSpecificDistributorData(req)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting distributor data from table */
      //////////consolelog(req.params);
      distributorsModel.findOne({where:{id:req.params.id}},function(err,info)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(info);
          }
      })
    });
  }

  /* Getting distributors data from name */

  function checkDistributors(req)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all licences from table */

      //let condi = {}
      ////consolelog("req.body",req.body);
      distributorsModel.findOne({where:{country_id:req.body.country,distributor:req.body.distributor},neq:{id:req.params.id}},function(err,data)
      {
          if(err)
          {
            reject(0);
          }
          else
          {

            ////consolelog("datat ================",data);
            if(data)
            {
              reject(1);
            }
            else
            {
              resolve(0);
            }
          }
      })
    });
  }

  /* Setting Distributor Data */

  function setDistributorData(req)
  {
    ////consolelog("data",req.body);
    return new Promise(function(resolve, reject)
    {
      distributorsModel.create({country_id:req.body.country,distributor:req.body.distributor,status:0,created:new Date(),modified:new Date()},function(err,created){
        if(err)
        {
          //////////consolelog(err);
            reject(0);
        }
        else
        {
          resolve(1);
        }
      })
    });
  }


  /* Getting licence Data */

  function getExportedLicencesData(skipV,param)
  {
    return new Promise(function(resolve, reject)
    {
      ////consolelog("param.distributor_id",param.distributor_id);
      /* Getting all licences from table */
      let cond ={}
      if((param.id != 0) && (param.distributor_id == 0))
      {
        cond ={country_id:param.id,count:1}
      }
      else if((param.id != 0) && (param.distributor_id != 0))
      {
        cond ={country_id:param.id,distributor_id:param.distributor_id,count:1}
      }
      else
      {
        cond ={count:1}
      }

      licenceModel.find({include:"countries",order:'id desc',limit: 15, skip: skipV,where:cond},function(err,licenceData)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(licenceData);
          }
      })
    });
  }

  /* Getting licence Count */

  function getExportedLicencesCount(param)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all licences from table */
      let cond ={}
      if((param.id != 0) && (param.distributor_id == 0))
      {
        cond ={country_id:param.id,count:1}
      }
      else if((param.id != 0) && (param.distributor_id != 0))
      {
        cond ={country_id:param.id,distributor_id:param.distributor_id,count:1}
      }
      else
      {
        cond ={count:1}
      }
      licenceModel.count(cond,function(err,count)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(count);
          }
      })
    });
  }

  /* Getting licence data from name */

  function checkLicence(req)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all licences from table */
      licenceModel.findOne({where:{licence:req.body.licence}},function(err,licenceData)
      {
          if(err)
          {
            reject(0);
          }
          else
          {

            if(licenceData)
            {
              reject(1);
            }
            else
            {
              resolve(0);
            }
          }
      })
    });
  }

  /* Setting Licence Data */

  function setLicencesData(req)
  {
    return new Promise(function(resolve, reject)
    {
      licenceModel.create({licence:req.body.licence,status:0,created:new Date(),modified:new Date()},function(err,createdLicence){
        if(err)
        {
            reject(0);
        }
        else
        {
          resolve(1);
        }
      })
    });
  }

  /* update licence status enable/Disable */

  function updateUserStatus(req)
  {
    return new Promise(function(resolve, reject)
    {
      licenceModel.updateAll({id:req.body.userId},{status:req.body.status},function(err)
      {
        if(err)
        {
          reject(0);
        }
        else
        {
          resolve(1);
        }
      })
    });
  }

  /* Getting countries Data */

  function getAllCountry(skipV)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all countries from table */
      countryModel.find({order:'id desc',limit: 10, skip: skipV},function(err,countriesData)
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

  /* Getting countries Count */

  function getCountriesCount(skipV)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all countries from table */
      countryModel.count({},function(err,countriesCount)
      {
          if(err)
          {
            reject(0);
          }
          else
          {

            resolve(countriesCount);
          }
      })
    });
  }

  /* Get Specific Country*/

  function getSpecificCountry(req)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all countries from table */
      countryModel.findOne({where:{id:req.params.id}},function(err,countryInfo)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(countryInfo);
          }
      })
    });
  }

  /* Getting users Data */

  function getUsersData(skipV)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all users from table */
      userModel.find({include:"licences",order:'id desc',limit: 10, skip: skipV,where:{userType:1,emailVerified:1}},function(err,usersData)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(usersData);
          }
      })
    });
  }

  /* Getting users Count */

  function getUsersCount(skipV)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting count of users */
      userModel.count({userType:1,emailVerified:1},function(err,usersCount)
      {
        if(err)
        {
          reject(0);
        }
        else
        {
          resolve(usersCount);
        }
      })
    });
  }

  /* Getting user details */

  function userDetails(req)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting users info */
      userModel.findOne({include:'licences',where:{id:req.params.id}},function(err,userDetails)
      {
        if(err)
        {
          reject(0);
        }
        else
        {
          resolve(userDetails);
        }
      })
    });
  }

  /* Getting user devices */

  function userDevices(req)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting users info */
      userInfoModel.find({where:{user_id:req.params.id}},function(err,userDevice)
      {
        if(err)
        {
          reject(0);
        }
        else
        {
          resolve(userDevice);
        }
      })
    });
  }

  /* Getting user devices */

  function userChilds(req)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting users info */
      userChildsModel.find({where:{user_id:req.params.id}},function(err,userChild)
      {
        if(err)
        {
          reject(0);
        }
        else
        {
          resolve(userChild);
        }
      })
    });
  }


   /* Getting user devices */

   function getUserteamInfo(req)
   {
     return new Promise(function(resolve, reject)
     {
       /* Getting users info */
       userTeamModel.find({where:{user_id:req.params.id}},function(err,userTeam)
       {
         if(err)
         {
           reject(0);
         }
         else
         {
           resolve(userTeam);
         }
       })
     });
   }

  /* Getting Age Data */

  function getUserAgeData(skipV)
  {
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

  /* Getting Age Count */

  function getUserAgeCount(skipV)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all countries from table */
      userAgeModel.count({},function(err,ageCount)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(ageCount);
          }
      })
    });
  }

  /* Get Specific Age*/

  function getSpecificAge(req)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting specific age from table */
      userAgeModel.findOne({where:{id:req.params.id}},function(err,specificAgeInfo)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(specificAgeInfo);
          }
      })
    });
  }

  /* Getting packages Data */

  function getPackagesData(skipV)
  {
      return new Promise(function(resolve, reject)
      {
          /* Getting all packages from table */
          userPackagesModel.find({order:'id desc',limit: 10, skip: skipV},function(err,userAgeData)
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

  /* Getting packages Data */

  function getUserPackagesData(req)
  {
      return new Promise(function(resolve, reject)
      {
          /* Getting all packages from table */
          userModel.findOne({where:{id:req.params.id}},function(err,userInfo)
          {
            if(err)
            {
               reject(0)
            }
            else
            {
              if(userInfo)
              {
                userPackagesModel.find({where:{status:1},fields:{created:false,modified:false}},function(err,packages)
                {
                  if(err)
                  {
                    reject(0)
                  }
                  else
                  {
                    let array = [];
                    let userPackage = userInfo.packages.split(",");

                    for(let i=0;i<packages.length;i++)
                    {
                      let obj = {packageName:null,packageDescription:null,packageLogo:null,packageSubcategory:null,index:null,cost:null,status:0,id:null,purchased:0}
                      obj.packageName = packages[i].packageName;
                      obj.packageDescription = packages[i].packageDescription;
                      obj.packageLogo = packages[i].packageLogo;
                      obj.packageSubcategory = packages[i].packageSubcategory;
                      obj.index = packages[i].costIndex;
                      obj.cost = packages[i].cost;
                      obj.status = packages[i].status;
                      obj.id = packages[i].id;

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
                          ////consolelog("entries ",questionCount[0].pkID);
                          obj.questionCount = questionCount[0].pkID;

                          array.push(obj);
                          if(array.length == packages.length) {
                            resolve(array)
                          }
                        }
                        else {
  			                      obj.questionCount = 0;

                            resolve(array)
                        }
                      });

                      //array.push(obj);
                    }
                   // cb(null,{status:"success",packages:array});
                  }
                })
              }
              else
              {
                reject(0)
              }
            }
          })
      });
  }




  /* Getting Category Data */

  function getUserCategoryData(req)
  {
      return new Promise(function(resolve, reject)
      {
          /* Getting all packages from table */
          userModel.findOne({where:{id:req.params.id}},function(err,userInfo)
          {
            if(err)
            {
               reject(0)
            }
            else
            {
              if(userInfo)
              {
                userCategoriesModel.find({where:{isPackage:0},fields:{created:false,modified:false}},function(err,categories)
                {
                  if(err)
                  {
                    reject(0)
                  }
                  else
                  {
                    //console.log(categories);
                    let array = [];
                    let userCategory = userInfo.purchaseCategory.split(",");

                    for(let i=0;i<categories.length;i++)
                    {
                      let obj = {categoryName:null,categoryDescription:null,categoryLogo:null,index:null,cost:null,status:0,id:null,purchased:0}
                      obj.categoryName = categories[i].category;
                      obj.categoryDescription = categories[i].description;
                      obj.categoryLogo = categories[i].iconImage;
                      obj.index = categories[i].amountIndex;
                      obj.cost = categories[i].amount;
                      obj.status = categories[i].status;
                      obj.id = categories[i].id;

                      for(let j=0;j<userCategory.length;j++)
                      {
                        if(categories[i].id == userCategory[j])
                        {
                          obj.purchased = 1;
                        }
                      }

                      array.push(obj);
                      console.log(i)
                      console.log(userCategory.length)
                      if(array.length== userCategory.length) {
                        resolve(array)
                      }



                    }
                   // cb(null,{status:"success",packages:array});
                  }
                })
              }
              else
              {
                reject(0)
              }
            }
          })
      });
  }

  /* Getting User Game Data */

  function getUserGameCount(req)
  {
      return new Promise(function(resolve, reject)
      {
        userGameModel.count({user_id:req.params.id},function(err,count){
          if(err)
          {
            reject(0)
          }
          else
          {
            resolve(count)
          }
        })
      });
  }

  /* Getting packages Count */

  function getPackagesCount(skipV)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all countries from table */
      userPackagesModel.count({},function(err,count)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(count);
          }
      })
    });
  }

  /* Get Specific packages*/

  function getSpecificPackages(req)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting specific age from table */
      userPackagesModel.findOne({where:{id:req.params.id}},function(err,specificInfo)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(specificInfo);
          }
      })
    });
  }

 /* Get Question count per package */

 function setQuestionCount(value)
 {
   return new Promise(function(resolve, reject)
   {
     /* Getting specific age from table */
     let finalArray = [],x=0;
     for(let i=0;i<value.length;i++)
     {
       let questions =  app.models.questions;
       let ds1 = questions.dataSource;

       let obj = {packVal:null,count:0}
       ds1.connector.query('SELECT COUNT(DISTINCT questionGroupId) as pkID FROM questions  WHERE pack_ID = '+value[i].id+' ', function (err, questionCount)
       {
           if(err)
           {
             reject(0);
           }
           else
           {
             obj = {packVal:value[i],count:questionCount[0].pkID};
             finalArray.push(obj);
             x++;
             if(x == value.length)
             {
               ////consolelog("hhhhhhh");
               resolve(finalArray);
             }
           }
        })

       }
   });
 }

  /* Getting Questions Data */

  function getQuestionsData(skipV,params)
  {
    return new Promise(function(resolve, reject)
    {
      //////////consolelog(params);
      let cond;
      if((params.category != 0) && (params.subCategory != 0) && (params.package != 0) )
      {
        cond = {
                'category_id':params.category,
                'sub_category_id':params.subCategory,
                'pack_ID':params.package
              }
      }
      else if((params.category !=0) && (params.subCategory ==0) &&  (params.package !=0))
      {
        cond = {'category_id':params.category,
                'pack_ID':params.package
              }
      }
      else if((params.category !=0) && (params.subCategory ==0) &&  (params.package ==0))
      {
        cond = {'category_id':params.category}
      }
      else if((params.category ==0) && (params.subCategory ==0) &&  (params.package !=0))
      {
        cond = {'pack_ID':params.package}
      }
      else if((params.category !=0) && (params.subCategory !=0) &&  (params.package ==0))
      {
        cond = {
                'category_id':params.category,
                'sub_category_id':params.subCategory
              }
      }
      else
      {
        cond = {}
      }
      ////////////consolelog(cond);
      /* Getting all packages from table */
      userQuestionModel.find({include:['categories', 'sub_categories',"question_packages","age_categories","countries"],order:'id desc',limit: 10, skip: skipV,where:cond},function(err,data)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(data);
          }
      })
    });
  }

  /* Getting Question Count */

  function getQuestionsCount(params)
  {
    return new Promise(function(resolve, reject)
    {
      let cond;
      if((params.category !=0) && (params.subCategory !=0))
      {
        cond ={
                'category_id':params.category,
                'sub_category_id':params.subCategory
              }
      }
      else if((params.category !=0) && (params.subCategory ==0))
      {
        cond = {'category_id':params.category}
      }
      else
      {
        cond = {}
      }
      /* Getting all countries from table */
      userQuestionModel.count(cond,function(err,count)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(count);
          }
      })
    });
  }

  /* Getting Category */

  function getCategory()
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all countries from table */
      userCategoriesModel.find({},function(err,categories)
      {
          if(err)
          {
            console.log(err);
            reject(0);
          }
          else
          {
            resolve(categories);
          }
      })
    });
  }

  /* Getting subcategory */

  function getSubCategoryData(category_id)
  {
    return new Promise(function(resolve, reject)
    {
        /* Getting all packages from table */
        subCategoriesModel.find({where:{category_id:category_id}},function(err,data)
        {
            if(err)
            {
              ////////////consolelog(err);
              reject(0);
            }
            else
            {
              resolve(data);
            }
        })
    });
  }

  /* setting package */

  function setPackagesData(fields,files)
  {
    return new Promise(function(resolve, reject)
    {
      let cost =  fields.cost.split(',');
        /* Setting package from table */
        userPackagesModel.create({packageName:fields.package,packageDescription:fields.packageDescription,
          costIndex:cost[0],cost:cost[1],countries:fields.region,categories:fields.category,age:fields.age,status:0,
          created:new Date(),modified:new Date()},function(err,data)
        {
          if(err)
          {
            ////////////consolelog(err);
            reject(0);
          }
          else
          {
            uploadImage(files,data.id).then(function(upload)
            {
              resolve(1);
            }).catch(function(err) {
              reject(err);
            });
          }
        })
    });
  }

  /* Edit package */

  function editPackagesData(fields,files)
  {
    return new Promise(function(resolve, reject)
    {
      console.log(fields);
      let cost =  fields.cost.split(',');
        /* Setting package from table */
        userPackagesModel.updateAll({id:fields.id},{packageName:fields.package,
          packageDescription:fields.packageDescription,costIndex:cost[0],cost:cost[1],countries:fields.region,
          categories:fields.category,age:fields.age,modified:new Date()},function(err,data)
        {
          if(err)
          {
            reject(0);
          }
          else
          {
            if((files.logo.name))
            {
              uploadImage(files,fields.id).then(function(upload)
              {
                resolve(1);
              }).catch(function(err) {
                reject(err);
              });
            }
            else
            {
              resolve(1);
            }
          }
        })
    });
  }

  /* Edit Question */

  function getSpecificQuestion(param)
  {
    return new Promise(function(resolve, reject)
    {
      ////console.log(param);
        /* Setting package from table */
        userQuestionModel.findOne({include:['categories', 'sub_categories',"question_packages","age_categories","countries"],where:{id:param.id}},function(err,data)
        {
          if(err)
          {
            reject(0);
          }
          else
          {
            ////console.log(data);
            resolve(data)
          }
        })
    });
  }


  function getSpecificFreeplayQuestion(param)
  {
    return new Promise(function(resolve, reject)
    {
        /* Setting package from table */
        //consolelog("getting details")
        userQuestionModel.findOne({include:['categories', 'sub_categories',"age_categories","countries"],where:{id:param.id}},function(err,data)
        {
          if(err)
          {
            reject(0);
          }
          else
          {
            //consolelog("got details successfully ", data)
            resolve(data)
          }
        })
    });
  }

  /* ========== Edit Question ===============  */

  function getEditQuestion(param)
  {
    return new Promise(function(resolve, reject)
    {
      let questions =  app.models.questions;
      let ds1 = questions.dataSource;
      ds1.connector.query('SELECT * FROM questions  WHERE questionGroupId ='+param.id+'  GROUP BY age_id,region', function (err, data)
      {
        if(err)
        {
          reject(0);
        }
        else
        {
          let x=0;
          let obj = {}
          async.eachSeries(data, function(value, callback)
          {
            x++;
            if(x == 1)
            {
              
              obj = { category_id:value.category_id,sub_category_id:value.sub_category_id,age_id: [value.age_id],time_Allowed:value.time_Allowed,region:[value.region],question: value.question,answer1:value.answer1,answer2:value.answer2,answer3:value.answer3,answer4: value.answer4,hint:value.hint,correct_Answer:value.correct_Answer,image_URL:value.image_URL,
                video_URL:value.video_URL,sound_URL:value.sound_URL,fileType:value.fileType,
                language:value.language, pack_ID:value.pack_ID,
                questionGroupId: value.questionGroupId,id:value.id,creditBy:value.creditBy,status:value.status,questionActiveStatus:value.questionActiveStatus}
            }
            else
            {
              obj.age_id.push(value.age_id)
              obj.region.push(value.region)
            }


            callback()
            if(data.length ==  x)
            {
              resolve(obj)
            }
          })

          //resolve(data)
        }
      })
    });
  }


  /* get Specific Category */

  function getSpecificCategory(param)
  {
    return new Promise(function(resolve, reject)
    {
        /* Getting Specific Category */
        userCategoriesModel.findOne({where:{id:param.id}},function(err,data)
        {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(data)
          }
        })
    });
  }


  /* get Specific Category Name */

  function getCategoryByName(param)
  {
    let obj = {};
    return new Promise(function(resolve, reject)
    {
        /* Getting Specific Category */
        userCategoriesModel.findOne({where:{category:param.CATEGORY},fields:{id:true,category:true}},function(err,data)
        {
          if(err)
          {
            obj = {status:0,message:err};
            resolve(obj);
          }
          else
          {
            if(data)
            { 
              obj = {status:1,data:data};
              resolve(obj);

            }
            else
            {
              obj = {status:0,message:"Category Not found for question :"+param.QUESTION};
              resolve(obj);
            }
            
          }
        })
    });
  }



  function addCategoryData(fields,files)
  {
    
    //console.log(fields);
    return new Promise(function(resolve, reject)
    { 
          async.waterfall([
            function(callbackwater) 
            {
              let isPack =0;
              if(fields.isPackage)
              {
                isPack =1
              }
              else
              {
                isPack =0
              }
              let userCost = fields.cost.split(',');
              //console.log("sssssssssssssssssssssssssssss",userCost);
              userCategoriesModel.create({category:fields.category,description:fields.description,
                amountIndex:userCost[0],amount:userCost[1],categoryRegion:fields.region
              ,status:1,type:2,isPackage:isPack,created:new Date(),modified:new Date()},function(err,data)
              {
                if(err)
                {
		            	console.log(err);
                  reject(err)
                }
                else
                {
                  callbackwater(null,data.id);
                }
              })
            },
            function(id,callbackwater)
            {
              let randomSt = randomstring.generate(5);
              let date2 = new Date();
              let timeMs = date2.getTime();
              let imageName =randomSt+timeMs;
              let ext = path.extname(files.iconImage.name);
              let oldpath="";
              let saveurl = {iconImage:'storage/categories/'+imageName+ext};
              bucketUrl = "outsmarted/storage/categories";
              imageName =imageName+ext
              
              oldpath = files.iconImage.path;
              
              uploadCategoryFile(files,id,saveurl,imageName,bucketUrl,oldpath).then(function(upload)
                {
                  callbackwater(null,id);
                }).catch(function(err)
                {
                  callbackwater(err);
                });
            },
            function(id,callbackwater)
            {
              let randomSt = randomstring.generate(5);
              let date2 = new Date();
              let timeMs = date2.getTime();
              let imageName =randomSt+timeMs;
              let ext = path.extname(files.buttonImage.name);
              let oldpath="";
              let saveurl = {buttonImage:'storage/categories/'+imageName+ext};
              bucketUrl = "outsmarted/storage/categories";
              imageName =imageName+ext
              oldpath = files.buttonImage.path;

              uploadCategoryFile(files,id,saveurl,imageName,bucketUrl,oldpath).then(function(upload)
                {
                  callbackwater(null,upload);
                }).catch(function(err)
                {
                  callbackwater(err);
                });
            }
        ], function (err, result)
        {
          if(err)
          {
            reject(err);
          }
          else
          {
            resolve("successfully saved");
          }
        });
      
    })
  }

  /* edit Category */

  function editCategoryData(fields,files)
  {
    console.log(files);
    return new Promise(function(resolve, reject)
    { 
          async.waterfall([
            function(callbackwater) 
            {
              let isPack =0;
              if(fields.isPackage)
              {
                isPack =1
              }
              else
              {
                isPack =0
              }

              let userCost = fields.cost.split(',');
              userCategoriesModel.updateAll({id:fields.id},{category:fields.category,description:fields.description,
                amountIndex:userCost[0],amount:userCost[1],categoryRegion:fields.region
              ,status:1,isPackage:isPack,type:fields.type,created:new Date(),modified:new Date()},function(err,data)
              {
                if(err)
                {
                  reject(err)
                }
                else
                {
                  callbackwater(null,fields.id);
                }
              })
            },
            function(id,callbackwater)
            {
              if(files.iconImage.name != '')
              {
                let randomSt = randomstring.generate(5);
                let date2 = new Date();
                let timeMs = date2.getTime();
                let imageName =randomSt+timeMs;
                let ext = path.extname(files.iconImage.name);
                let oldpath="";
                let saveurl = {iconImage:'storage/categories/'+imageName+ext};
                bucketUrl = "outsmarted/storage/categories";
                imageName =imageName+ext
                
                oldpath = files.iconImage.path;
                
                uploadCategoryFile(files,id,saveurl,imageName,bucketUrl,oldpath).then(function(upload)
                  {
                    callbackwater(null,id);
                  }).catch(function(err)
                  {
                    callbackwater(err);
                  });
              }
              else
              {
                callbackwater(null,id);
              }
            },
            function(id,callbackwater)
            {
              if(files.buttonImage.name != '')
              {
                let randomSt = randomstring.generate(5);
                let date2 = new Date();
                let timeMs = date2.getTime();
                let imageName =randomSt+timeMs;
                let ext = path.extname(files.buttonImage.name);
                let oldpath="";
                let saveurl = {buttonImage:'storage/categories/'+imageName+ext};
                bucketUrl = "outsmarted/storage/categories";
                imageName =imageName+ext
                oldpath = files.buttonImage.path;

                uploadCategoryFile(files,id,saveurl,imageName,bucketUrl,oldpath).then(function(upload)
                  {
                    callbackwater(null,upload);
                  }).catch(function(err)
                  {
                    callbackwater(err);
                  });
              }
              else
              {
                callbackwater(null,id);
              }
            }
        ], function (err, result)
        {
          if(err)
          {
            reject(err);
          }
          else
          {
            resolve("successfully saved");
          }
        });
      
    })
  }

  /* View Sub Category */

  function subCategoryData(skipV,param)
  {
    return new Promise(function(resolve, reject)
    {
        /* Getting all Sub Categories from table */
        let condition={};
        if(param.category !=0)
        {
          condition = {category_id:param.category}
        }


        subCategoriesModel.find({include:"categories",order:'id desc',limit: 10,where:condition, skip: skipV},function(err,data)
        {
            if(err)
            {
              reject(0);
            }
            else
            {
              ////////////consolelog(data);
              resolve(data);
            }
        })
    });
  }

  /* Getting Sub Category Count */

  function getSubCategoryCount(param)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all countries from table */
      let condition={};
      if(param.category !=0)
      {
        condition = {category_id:param.category}
      }
      subCategoriesModel.count(condition,function(err,count)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(count);
          }
      })
    });
  }


  function deleteQuest(id,type)
 {
   ////consolelog("type",type);
  return new Promise(function(resolve, reject)
  {
    if(type == 1)
    {
      userQuestionModel.deleteAll({id:id},function(err,data)
      {
        if(err)
        {
          reject(err);
        }
        else
        {
          resolve(1);
        }
      })
    }
    else
    {
      userQuestionModel.deleteAll({questionGroupId:parseInt(id)},function(err,data)
      {
        if(err)
        {
          //////////consolelog(err);
          reject(err);
        }
        else
        {
          resolve(1);
        }
      })
    }
  });
}

  /* Get Specific Sub Category*/

  function getSpecificSubCategories(params)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting Sub Category from table */
      subCategoriesModel.findOne({where:{id:params.id}},function(err,specificInfo)
      {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(specificInfo);
          }
      })
    });
  }

  /* setting SubCategory */

  function setSubCategoryData(fields)
  {
    return new Promise(function(resolve, reject)
    {
        /* checking same subcategory in category */
        subCategoriesModel.findOne({where:{category_id:fields.category,
          subCategory:fields.subCategory}},function(err,data)
         {
           if(err)
           {
             reject(err);
           }
           else
           {
             if(!data)
             {
               /* Setting SubCategory from table */
               subCategoriesModel.create({category_id:fields.category,
                 subCategory:fields.subCategory,status:0,created:new Date(),modified:new Date()},function(err,saved)
                {
                 if(err)
                 {
                   reject(err);
                 }
                 else
                 {
                   let data =  {message:"Successfully Created",subCategory:saved}
                   resolve(data);
                 }
               })
             }
             else
             {
               let dataValue =  {message:"Category has same subcategory",subCategory:data}
               resolve(dataValue);
             }
           }
        })
    });
  }

  /* update SubCategory */

  function editSubCategoryData(fields)
  {
    return new Promise(function(resolve, reject)
    {
        /* checking same subcategory in category */
        subCategoriesModel.findOne({where:{category_id:fields.category,
          subCategory:fields.subCategory}},function(err,data)
         {
           if(err)
           {
             reject(err);
           }
           else
           {
             if(!data)
             {
               /* updating */
               subCategoriesModel.updateAll({id:fields.id},{category_id:fields.category,subCategory:fields.subCategory,modified:new Date()}
                ,function(err,saved)
                {
                 if(err)
                 {
                   reject(err);
                 }
                 else
                 {
                   resolve("Successfully Updated");
                 }
               })
             }
             else
             {
               reject("Category has same subcategory");
             }
           }
        })
    });
  }

  /* Add Questions */

  function addQuestion(fields,files)
  {
    return new Promise(function(resolve, reject)
    {
      let ageArray =  fields.age.split(',');
      let regionArray =  fields.region.split(',');
      let dataIdArray = [];
      async.waterfall([
        function(callbackwater) {

          let x=0;
          async.eachSeries(ageArray, function(file, callback)
          {
            let j =0;
            async.eachSeries(regionArray, function(file1, callback1)
            {
              let idObj = {ageArray:file,regionArray:file1};
              dataIdArray.push(idObj);
              callback1();
            })
            callback()
            x++;
            if(ageArray.length == x)
            {
              callbackwater(null, dataIdArray);
            }
          })
        },
        function(dataIdArray,callbackwater)
        {
          if(dataIdArray.length > 0)
          {
            let userIdArray = [];
            let x=0;id=0;
            async.eachSeries(dataIdArray, function(dataIdArray1, callback)
            {
              let pack_id=0;
              if(fields.finalRound != 1)
              {
                pack_id =fields.package;
              }

              userQuestionModel.create({category_id:fields.category,sub_category_id:fields.subCategory,
                pack_ID:pack_id,time_Allowed:fields.timeAllowed,age_id:dataIdArray1.ageArray,
                region:dataIdArray1.regionArray,question:fields.question.trim(),answer1:fields.option1,
                answer2:fields.option2,answer3:fields.option3,answer4:fields.option4,
                correct_Answer:fields.answer,image_URL:"",video_URL:"",sound_URL:"",status:fields.finalRound,created:new Date(),
                modified:new Date(),creditBy:fields.creditBy,questionActiveStatus:1,questionState:1,hint:fields.hint},function(err,data)
              {
                if(err)
                {
                  //consolelog(err);
                  callbackwater(err);
                }
                else
                {
                  let userIdObj =  {id:data.id}
                  userIdArray.push(userIdObj);

                  x++;
                  if(x == 1)
                  {
                    id = data.id
                  }
                  callback()
                  if(dataIdArray.length ==  x)
                  {
                    callbackwater(null, userIdArray,id);
                  }
                }
              })
            })
          }
          else
          {
            callbackwater(err);
          }
        },function(userIdArray,id,callbackwater)
        {
          //////////consolelog(id);
          //////////consolelog(dataIdArray);

          for(let i=0;i<dataIdArray.length;i++)
          {
            userQuestionModel.updateAll({id:userIdArray[i].id},{questionGroupId:id},function(err,updated)
            {
              if(err)
              {
                //////////consolelog(err);
              }
              else
              {

              }
            })
          }
          callbackwater(null, userIdArray);
        },
        function(userIdArray,callbackwater)
        {
          if(fields.fileType  != 0)
          {
            uploadFile(files,userIdArray,fields.fileType,fields.zoom).then(function(upload)
            {
              callbackwater(null,upload);
            }).catch(function(err)
            {
              callbackwater(err);
            });
          }
          else
          {
            resolve("successfully saved");
          }
        }
    ], function (err, result)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
         resolve("successfully saved");
      }
    });
    });
  }


  /* Export Question */

  function exportAddQuestion(fields,files)
  {
    console.log("Hekkkkkkk",fields);
    return new Promise(function(resolve, reject)
    {
      let dataIdArray = [];
      async.waterfall([
        function(callbackwater) {
          ////console.log("hhhhhhhhhhhhhhhhhh",fields.age);
          
          if(fields.age.length > 0 && fields.region.length >0)
          {
            let x=0;
            async.eachSeries(fields.age, function(file, callback)
            {
              
              let j =0;
              async.eachSeries(fields.region, function(file1, callback1)
              {
                let idObj = {ageArray:file,regionArray:file1};
                dataIdArray.push(idObj);
                callback1();
              })
              callback()
              x++;

              if(fields.age.length == x)
              {
                ////console.log(dataIdArray);
                callbackwater(null, dataIdArray);
              }
            })
          }
          else
          {
            resolve("successfully saved");
            ////console.log("Helll is here");
          }
        },
        function(dataIdArray,callbackwater)
        {
          //console.log(1234);
          if(dataIdArray.length > 0)
          {
            let userIdArray = [];
            let x=0,id=0;
            async.eachSeries(dataIdArray, function(dataIdArray1, callback)
            {
              tempQuestionModel.findOne({where:{question:fields.question.trim(),answer1:fields.option1,answer2:fields.option2,
                answer3:fields.option3,answer4:fields.option4,correct_Answer:fields.answer}},function(err,qdata){
                  if(err)
                  {

                  }
                  else
                  {
                    
                      tempQuestionModel.create({category_id:fields.category,sub_category_id:fields.subCategory,pack_ID:fields.package,time_Allowed:fields.timeAllowed,age_id:dataIdArray1.ageArray,
                        region:dataIdArray1.regionArray,question:fields.question.trim(),answer1:fields.option1,answer2:fields.option2,
                        answer3:fields.option3,answer4:fields.option4,correct_Answer:fields.answer,image_URL:fields.image_URL,
                        video_URL:fields.video_URL,sound_URL:fields.sound_URL,fileType:fields.fileType,creditBy:fields.creditBy,
                        created:new Date(),status:fields.status,questionActiveStatus:fields.questionState,hint:fields.hint,questionActiveStatus:fields.questionState
			,modified:new Date()},function(err,data)
                      {
                        if(err)
                        {
                          //console.log(err);
                          callbackwater(err);
                        }
                        else
                        {
                          
                          let userIdObj =  {id:data.id}
                          userIdArray.push(userIdObj);
                          x++;
                          if(x == 1)
                          {
                            if(qdata)
                            {
                              id = qdata.questionGroupId
                            }
                            else
                            {
                              id = data.id
                            }
                            
                          }
                          callback()
                          if(dataIdArray.length ==  x)
                          {
                            callbackwater(null, userIdArray,id);
                          }
                        }
                      })
                   
                  }

                })


              
            })
          }
          else
          {
            callbackwater(err);
          }
        },function(userIdArray,id,callbackwater)
        {

          for(let i=0;i<dataIdArray.length;i++)
          {
            tempQuestionModel.updateAll({id:userIdArray[i].id},{questionGroupId:id},function(err,updated)
            {
              if(err)
              {
                //////////consolelog(err);
              }
              else
              {

              }
            })
          }
          callbackwater(null, userIdArray);
        }
    ], function (err, result)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
         resolve("successfully saved");
      }
    });
    });
  }

  /* ================== Edit Question ================== */

  function editQuestion(fields,files)
  {
    return new Promise(function(resolve, reject)
    {
      let ageArray =  fields.age.split(',');
      let regionArray =  fields.region.split(',');
      let dataIdArray = [];
      async.waterfall([
        function(callbackwater) {

          let x=0;
          async.eachSeries(ageArray, function(file, callback)
          {
            let j =0;
            async.eachSeries(regionArray, function(file1, callback1)
            {
              let idObj = {ageArray:file,regionArray:file1};
              dataIdArray.push(idObj);
              callback1();
            })
            callback()
            x++;
            if(ageArray.length == x)
            {
              callbackwater(null, dataIdArray);
            }
          })
        },
        function(dataIdArray,callbackwater)
        {
          if(dataIdArray.length > 0)
          {
            let userIdArray = [];
            let x=0;
            async.eachSeries(dataIdArray, function(dataIdArray1, callback)
            {
              let image = fields.imageUrl;
              let sound = fields.soundUrl;
              let video = fields.videoUrl;
              if(files.image.name)
                image = '';
              if(files.Video.name)
                video = '';
              if(files.Sound.name)
                sound = '';
              if(fields.fileType  == 0)
              {
                image = '';
                video = '';
                sound = '';
              }
              else if(fields.fileType  == 1 || fields.fileType  == 4)
              {
                video = '';
                sound = '';
              }
              else if(fields.fileType  == 2)
              {
                image = '';
                video = '';
              }
              else if(fields.fileType  == 3)
              {
                image = '';
                sound = '';
              }

              let pack_id=0;
              if(fields.finalRound != 1)
              {
                pack_id =fields.package;
              }

	      if(fields.zoom == 'on')
              {
                fields.fileType = 4;
              }
              //consolelog("fields",fields);
              userQuestionModel.create({hint:fields.hint,category_id:fields.category,sub_category_id:fields.subCategory,pack_ID:pack_id,time_Allowed:fields.timeAllowed,age_id:dataIdArray1.ageArray,region:dataIdArray1.regionArray,question:fields.question.trim(),answer1:fields.option1,answer2:fields.option2,answer3:fields.option3,answer4:fields.option4,correct_Answer:fields.answer,image_URL:image,video_URL:video,sound_URL:sound,created:new Date(),modified:new Date(),fileType:fields.fileType,creditBy: fields.creditBy,status:fields.finalRound,questionActiveStatus:fields.questionActiveStatus},function(err,data)
              {
                if(err)
                {
                  callbackwater(err);
                }
                else
                {
                  let userIdObj =  {id:data.id}
                  userIdArray.push(userIdObj);

                  x++;
                  if(x == 1)
                  {
                    id = fields.id
                  }
                  callback()
                  if(dataIdArray.length ==  x)
                  {
                    callbackwater(null, userIdArray,id);
                  }
                }
              })
            })
          }
          else
          {
            callbackwater(err);
          }
        },function(userIdArray,id,callbackwater)
        {
          for(let i=0;i<dataIdArray.length;i++)
          {
            userQuestionModel.updateAll({id:userIdArray[i].id},{questionGroupId:id},function(err,updated)
            {
              if(err)
              {
                //////////consolelog(err);
              }
              else
              {

              }
            })
          }
          callbackwater(null, userIdArray);
        },
        function(userIdArray,callbackwater)
        {
          if(fields.fileType  != 0)
          {
            if(files.image.name != '' ||  files.Sound.name != '' || files.Video.name != '')
            {
              editUploadFile(files,userIdArray,fields.fileType,fields.zoom,fields.id).then(function(upload)
              {
                callbackwater(null,upload);
              }).catch(function(err)
              {
                callbackwater(err);
              });
            }
            else
            {
              resolve("successfully saved");
            }
          }
          else
          {
            resolve("successfully saved");
          }
        }
      ], function (err, result)
      {
      if(err)
      {
        reject(err);
      }
      else
      {
         resolve("successfully saved");
      }
      });
      });
  }

  /* Upload Image */

  function uploadImage(files,id)
  {
    console.log("file ==================",files);
    return new Promise(function(resolve, reject)
    {
        let dir = '../client/storage/packages/';
        let oldpath="";
        let newpath="";
        let savePath ="";
        let randomSt = randomstring.generate(5);
        let date2 = new Date();
        let timeMs = date2.getTime();
        let imageName =randomSt+timeMs;
        oldpath = files.logo.path;
        let s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/packages'}});

        //newPath = '../client/storage/packages/'+imageName+".jpg";
        savePath = 'storage/packages/'+imageName+".jpg";

        // mv(oldpath, newPath, function (err)
        // {
        //   if(err)
        //   {
        //     reject(0);
        //   }
        //   else
        //   {
            userPackagesModel.updateAll({id:id},{packageLogo:savePath},function(err,updated)
            {
              if(err)
              {
                reject(0);
              }
              else
              {
                sharp(oldpath)
                .toBuffer()
                .then( data =>
                 {
                    ////console.log("================= image name ================",imageName);
                    let randomS = randomstring.generate();
                    let params =  {}
                    params.Key = imageName+".jpg";
                    params.Body = data;
                    params.ContentType = 'binary';
                    s3Bucket.putObject(params, function(err, data)
                    {
                      if (err)
                      {
                        reject(1);
                      }
                      else
                      {
                        resolve(1);
                      }
                    })
                  })
                  .catch( err => {
                    //console.log(err);
                  });

            //   }
            // })
          }
        });
    })
  }

  /* Upload file */

  function uploadFile(files,idArray,fileType,zoom)
  {
    return new Promise(function(resolve, reject)
    {
        let dir="";
        let saveObj ="";
        let oldpath="";
        let newpath="";
        let ext =""
        let randomSt = randomstring.generate(5);
        let date2 = new Date();
        let timeMs = date2.getTime();
        let imageName =randomSt+timeMs;
        let s3Bucket,type;

        if(fileType == 1 || fileType == 4)
        {
          oldpath = files.image.path;
           ext = path.extname(files.image.name);
          dir = '../client/storage/questions/images/';
            saveObj = {
                        image_URL:'storage/questions/images/'+imageName+ext,
                        fileType :1
                      };

          if(zoom == 'on')
          {
            saveObj.fileType = 4;
          }

          s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/images'}});


          imageName =randomSt+timeMs+ext;

        }
        else if(fileType == 2)
        {
          oldpath = files.Sound.path;
           ext = path.extname(files.Sound.name);
          dir = '../client/storage/questions/sounds/';
          saveObj = {
                      sound_URL:'storage/questions/sounds/'+imageName+ext,
                      fileType :2
                    };
          s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/sounds'}});
          imageName =randomSt+timeMs+ext;
        }
        else
        {
          oldpath = files.Video.path;
          ext = path.extname(files.Video.name);
          dir = '../client/storage/questions/videos/';
          saveObj = {
                      video_URL:'storage/questions/videos/'+imageName+ext,
                      fileType :3
                    };
          s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/videos'}});
          imageName =randomSt+timeMs+ext;
        }
        newPath = dir+imageName+ext;
        // mv(oldpath, newPath, function (err)
        // {
        //   if(err)
        //   {
        //     reject(0);
        //   }
        //   else
        //   {
            ////consolelog("hjbhjbjbj",idArray.length);
            for(let i=0;i<idArray.length;i++)
            {
              //////////consolelog(idArray[i].id);
              userQuestionModel.updateAll({id:idArray[i].id},saveObj,function(err,updated)
              {
                if(err)
                {
                  //////////consolelog(err);
                  reject(0);
                }
                else
                {

                }
              })
            }


            uploadFileInS3(oldpath,s3Bucket,imageName,fileType).then(function(value)
            {
              resolve(1);
            }).catch(function(err)
            {
              //console.log('Caught an error2!', err);
            });
            //uploadFileInS3(oldpath,s3Bucket)



        //   }
        // });
    })
  }

  /* Upload file */

  function editUploadFile(files,idArray,fileType,zoom,id)
  {
  return new Promise(function(resolve, reject)
  {
      let dir="";
      let saveObj ="";
      let oldpath="";
      let newpath="";
      let ext =""
      let randomSt = randomstring.generate(5);
      let date2 = new Date();
      let timeMs = date2.getTime();
      let imageName =randomSt+timeMs;
      let s3Bucket;

      if(fileType == 1 || fileType == 4)
      {
        oldpath = files.image.path;
         ext = path.extname(files.image.name);
        dir = '../client/storage/questions/images/';
          saveObj = {
                      image_URL:'storage/questions/images/'+imageName+ext,
                      fileType :1
                    };

        if(zoom == 'on')
        {
          saveObj.fileType = 4;
        }

        s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/images'}});

        imageName =randomSt+timeMs+ext;

      }
      else if(fileType == 2)
      {
        oldpath = files.Sound.path;
         ext = path.extname(files.Sound.name);
        dir = '../client/storage/questions/sounds/';
        saveObj = {
                    sound_URL:'storage/questions/sounds/'+imageName+ext,
                    fileType :2
                  };
        s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/sounds'}});

        imageName =randomSt+timeMs+ext;
      }
      else
      {
        oldpath = files.Video.path;
         ext = path.extname(files.Video.name);
        dir = '../client/storage/questions/videos/';
        saveObj = {
                    video_URL:'storage/questions/videos/'+imageName+ext,
                    fileType :3
                  };

        s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/videos'}});

        imageName =randomSt+timeMs+ext;
      }
      newPath = dir+imageName+ext;

      ////consolelog("asssssssssssss",saveObj);
      // mv(oldpath, newPath, function (err)
      // {
      //   if(err)
      //   {
      //     reject(0);
      //   }
      //   else
      //   {
          for(let i=0;i<idArray.length;i++)
          {
            userQuestionModel.updateAll({id:idArray[i].id},saveObj,function(err,updated)
            {
              if(err)
              {
                //////////consolelog(err);
                reject(0);
              }
              else
              {

              }
            })
          }
          uploadFileInS3(oldpath,s3Bucket,imageName,fileType).then(function(value)
          {
            resolve(1);
          }).catch(function(err)
          {
            //console.log('Caught an error2!', err);
          });

      //   }
      // });
  })
}


  /* Upload file */

  function AddEditUploadFileData(fields,files)
  {
  return new Promise(function(resolve, reject)
  {
      let dir="";
      let saveObj ="";
      let oldpath="";
      let newpath="";
      let ext =""
      let randomSt = randomstring.generate(5);
      let date2 = new Date();
      let timeMs = date2.getTime();
      let imageName =randomSt+timeMs;
      let s3Bucket;

      if(fields.fileType == 1)
      {
        oldpath = files.image.path;
        ext = path.extname(files.image.name);
        dir = '../client/storage/questions/images/';
          saveObj = {
                      image_URL:'storage/questions/images/'+imageName+ext,
                      sound_URL:'',
                      video_URL:'',
                      fileType :1
                    };

        if(fields.zoom == 'on')
        {
          saveObj.fileType = 4;
        }


        s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/images'}});
        imageName =randomSt+timeMs+ext;
      }
      else if(fields.fileType == 2)
      {
        oldpath = files.Sound.path;
         ext = path.extname(files.Sound.name);
        dir = '../client/storage/questions/sounds/';
        saveObj = {
                    image_URL:'',
                    sound_URL:'storage/questions/sounds/'+imageName+ext,
                    video_URL:'',
                    fileType :2
                  };
        s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/sounds'}});
        imageName =randomSt+timeMs+ext;
      }
      else if(fields.fileType == 3)
      {
        oldpath = files.Video.path;
         ext = path.extname(files.Video.name);
        dir = '../client/storage/questions/videos/';
        saveObj = {
                    image_URL:'',
                    sound_URL:'',
                    video_URL:'storage/questions/videos/'+imageName+ext,
                    fileType :3
                  };
        s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/videos'}});
        imageName =randomSt+timeMs+ext;
      }
      else if(fields.fileType == 0)
      {
        saveObj = {
                    image_URL:'',
                    sound_URL:'',
                    video_URL:'',
                    fileType :0
                  };
      }


      if(fields.fileType != 0)
      {
        newPath = dir+imageName+ext;
        // mv(oldpath, newPath, function (err)
        // {
        //   if(err)
        //   {
        //     reject(0);
        //   }
        //   else
        //   {
            userQuestionModel.updateAll({questionGroupId:fields.editQuestionId},saveObj,function(err,updated)
            {
              if(err)
              {
                reject(0);
              }
              else
              {

                uploadFileInS3(oldpath,s3Bucket,imageName,fields.fileType).then(function(value)
                {
                  resolve(1);
                }).catch(function(err)
                {
                  //console.log('Caught an error2!', err);
                });
                resolve(1);
              }
            })
        //   }
        // });
      }
      else
      {
        userQuestionModel.updateAll({questionGroupId:fields.editQuestionId},saveObj,function(err,updated)
        {
          if(err)
          {
            reject(0);
          }
          else
          {
            resolve(1);
          }
        })
      }
  })
}



 /* upload in s3 */

 function uploadFileInS3(files,s3Bucket,imageName,fileType)
 {
   //console.log("Hit")
   return new Promise(function(resolve, reject)
   {
     ////console.log("hell")

         ////console.log("================= image name ================",imageName);
      if(fileType == 1 || fileType == 4){
          sharp(files).toBuffer()
          .then( data =>
           {
         let randomS = randomstring.generate();
         let params =  {}
         params.Key = imageName;
         params.Body = data;
         params.ContentType = 'binary';
         s3Bucket.putObject(params, function(err, data)
         {
           if (err)
           {
             reject(1);
           }
           else
           {
             ////console.log(data);
             ////console.log(data);
             //let url = path +params.Key;
             resolve(1);
           }
         })
       })
       .catch( err => {
         //console.log(err);
        });
     }else if(fileType==2){


         fs.readFile(files, function (err, data)
         {
           if (err) { throw err; }
           let randomS = randomstring.generate();
           let params =  {}
           params.Key = imageName;
           params.Body = data;
           params.ContentType = 'audio/mp4';

           s3Bucket.putObject(params, function(err, data)
           {
             if (err)
             {
               reject(1);
             }
             else
             {
               let url = path +params.Key;
               resolve(url);
             }
           })
         })

       }
       else if(fileType==3)
       {
         fs.readFile(files, function (err, data)
         {
           if (err) { throw err; }
           let randomS = randomstring.generate();
           let params =  {}
           params.Key = imageName;
           params.Body = data;
           params.ContentType = 'video/mp4';

           s3Bucket.putObject(params, function(err, data)
           {
             if (err)
             {
               reject(1);
             }
             else
             {
               let url = path +params.Key;
               resolve(url);
             }
           })
         })
       }
     })
 }

  /* Upload CSV File */

  function uploadCSVFile(fields,files)
  {
    return new Promise(function(resolve, reject)
    {
        let dir="";
        let ext = path.extname(files.xls.name);
        let saveObj ="";
        let oldpath="";
        let newpath="";

        let randomSt = randomstring.generate(5);
        let date2 = new Date();
        let timeMs = date2.getTime();
        let imageName =randomSt+timeMs;
        oldpath = files.xls.path;

        dir = '/home/ubuntu/boardGameTest/board_game/client/storage/questions/csv/';
        saveObj = '/home/ubuntu/boardGameTest/board_game/client/storage/questions/csv/'+imageName+ext

        newPath = dir+imageName+ext;
	//consolelog(newPath);
        mv(oldpath, newPath, function (err)
        {
          if(err)
          {
		  console.log(err);
            reject(0);
          }
          else
          {

            questionLoad(saveObj,fields).then(function(question)
            {

              resolve(1);
            })
            .catch(function(err)
            {
              reject(err);
            });
          }
        });
    })
  }

  /* upload questions */

  function questionLoad(saveObj,package)
  {
	//consolelog("ssssssssssssssss");
    return new Promise(function(resolve, reject)
    {
      let x=0;
      const csvFilePath=saveObj;
      csv().fromFile(csvFilePath).then((jsonObj)=>
      {
        if(jsonObj[0].CATEGORY != undefined &&  jsonObj[0].SUBCATEGORY != undefined &&  jsonObj[0].AGE != undefined &&  jsonObj[0].REGION != undefined
          &&  jsonObj[0].TIMEALLOWED != undefined &&  jsonObj[0].QUESTION != undefined  &&  jsonObj[0].ANSWER1 != undefined &&  jsonObj[0].ANSWER2 != undefined 
          &&  jsonObj[0].ANSWER3 != undefined &&  jsonObj[0].ANSWER4 != undefined &&  jsonObj[0].CORRECTANSWER != undefined &&  jsonObj[0].HINT != undefined
          &&  jsonObj[0].IMAGEURL != undefined &&  jsonObj[0].VIDEOURL != undefined &&  jsonObj[0].SOUNDURL != undefined &&  jsonObj[0].creditBy != undefined
          &&  jsonObj[0].status != undefined &&  jsonObj[0].questionState != undefined 
          )
        {
       
        if(jsonObj.length <= 500)
        {
          async.eachSeries(jsonObj, function(file, callback)
          {
            if(jsonObj.length == x)
            {
              cb(null,{status:1,message:"Succesfully inserted"});
            }
            else
            {
                async.waterfall([
                  function(callbackwater) {

                    getCategoryByName(file).then(function(category)
                    {
                      if(category.status == 1)
                      {
                        callbackwater(null, category.data);
                      }
                      else
                      {
                        errorLogsModel.create({page:"QuestionUpload",error:category.message,created:new Date(),modified:new Date()},function(err,data){
                          if(err)
                          {
                            x++;

                            if(x == jsonObj.length)
                            {
                              resolve(1);
                            }
                            else
                            {
                              callback();
                            }
                          }
                          else
                          {
                            x++;

                            if(x == jsonObj.length)
                            {
                              resolve(1);
                            }
                            else
                            {
                              callback();
                            }
                          }
                        })
                      }
                    })
                    .catch(function(err)
                    {
                      errorLogsModel.create({page:"QuestionUpload",error:category.message,created:new Date(),modified:new Date()},function(err,data){
                        if(err)
                        {
                          x++;

                          if(x == jsonObj.length)
                          {
                            resolve(1);
                          }
                          else
                          {
                            callback();
                          }
                        }
                        else
                        {
                          x++;

                          if(x == jsonObj.length)
                          {
                            resolve(1);
                          }
                          else
                          {
                            callback();
                          }
                        }
                        
                      })
                      
                    });
                  
                  },
                  function(category,callbackwater) {

                    let fields = {question:file.QUESTION,category:category.id,subCategory:file.SUBCATEGORY};

                    getSubCategoryInfo(fields).then(function(subCategory)
                    {
                      ////console.log("Sibcate",subCategory);
                      if(subCategory.status == 1)
                      {
                        //console.log(subCategory);
                        let subCate =  subCategory.data;
                        //console.log("subCate",subCate)
                        callbackwater(null,category,subCate);
                      }
                      else
                      {
                        errorLogsModel.create({page:"QuestionUpload",error:subCategory.message,created:new Date(),modified:new Date()},function(err,data){
                          if(err)
                          {
                            ////console.log(err);
                            x++;
  
                            if(x == jsonObj.length)
                            {
                              resolve(1);
                            }
                            else
                            {
                              callback();
                            }
                          }
                          else
                          {
                            x++;
  
                            if(x == jsonObj.length)
                            {
                              resolve(1);
                            }
                            else
                            {
                              callback();
                            }
                          }
                          
                        })
                      }
                      
                    })
                    .catch(function(err)
                    {
                      errorLogsModel.create({page:"QuestionUpload",error:category.msg,created:new Date(),modified:new Date()},function(err,data){
                        if(err)
                        {
                          x++;

                          if(x == jsonObj.length)
                          {
                            resolve(1);
                          }
                          else
                          {
                            callback();
                          }
                        }
                        else
                        {
                          x++;

                          if(x == jsonObj.length)
                          {
                            resolve(1);
                          }
                          else
                          {
                            callback();
                          }
                        }
                        
                      })
                    });
                  }, 
                  function(category,subCate,callbackwater)
                  {
                    let ageArray =  file.AGE.split(',');
                    ////console.log("ageArray ",ageArray );

                    let age = [];
                    let x=0;
                    async.eachSeries(ageArray, function(ageArr, callback)
                    {
                        userAgeModel.findOne({where:{age:ageArr.trim()}},function(err,ageData)
                        {
                          if(err)
                          {
                            errorLogsModel.create({page:"QuestionUpload",error:err,created:new Date(),modified:new Date()},function(err,data){
                              if(err)
                              {
                                callbackwater(err);
                              }
                              else
                              {
                                callbackwater(err);
                              }
                            })
                          }
                          else
                          {
                            if(ageData)
                            {

                              age.push(ageData.id);
                              x++;
                              ////consolelog("xxxxx",x);
                              ////consolelog("ageArray.length",ageArray.length);
                              if(ageArray.length ==  x)
                              {
                                age.toString();
                                callbackwater(null,category,subCate,age);
                              }
                              else
                              {
                                callback();
                              }
                            }
                            else
                            {
                              //console.log("ERROR")
                              errorLogsModel.create({page:"QuestionUpload",error:"Age not found for Question: "+file.QUESTION,created:new Date(),modified:new Date()},function(err,data){
                                if(err)
                                {
                                  x++;
                                  if(ageArray.length ==  x)
                                  {
                                    age.toString();
                                    callbackwater(null,category,subCate,age);
                                  }
                                  else
                                  {
                                    callback();
                                  }
                                }
                                else
                                {
                                  x++;
                                  if(ageArray.length ==  x)
                                  {
                                    age.toString();
                                    callbackwater(null,category,subCate,age);
                                  }
                                  else
                                  {
                                    callback();
                                  }
                                }
                              })
                              
                              //callbackwater(null,err);
                            }
                          }
                        })
                    })
                  },
                  function(category,subCate,age,callbackwater)
                  {

                    let countryArray =  file.REGION.split(',');
		                  //console.log("countryArray ",countryArray );
                    let country = [];
                    let x=0;
                    async.eachSeries(countryArray, function(countyInfo, callback)
                    {
                        countryModel.findOne({where:{name:countyInfo}},function(err,countryData)
                        {
                          if(err)
                          {
                            errorLogsModel.create({page:"QuestionUpload",error:err,created:new Date(),modified:new Date()},function(err,data){
                              if(err)
                              {
                                callbackwater(err);
                              }
                              else
                              {
                                callbackwater(err);
                              }
                            })
                          }
                          else
                          {
                            if(countryData)
                            {
                              country.push(countryData.id);
                              x++;
                              if(countryArray.length ==  x)
                              {
                                country.toString();
                                callbackwater(null,category,subCate,age,country);
                              }
                              else
                              {
                                callback();
                              }
                            }
                            else
                            {
                              errorLogsModel.create({page:"QuestionUpload",error:"Country Not Found for question : "+file.QUESTION,created:new Date(),modified:new Date()},function(err,data){
                                if(err)
                                {
                                  x++;
                                  if(countryArray.length ==  x)
                                  {
                                    country.toString();
                                    callbackwater(null,category,subCate,age,country);
                                  }
                                  else
                                  {
                                    callback();
                                  }


                                  if(x == jsonObj.length)
                                  {
                                    resolve(1);
                                  }
                                  else
                                  {
                                    callback();
                                  }
                                }
                                else
                                {
                                  x++;
                                  if(countryArray.length ==  x)
                                  {
                                    country.toString();
                                    callbackwater(null,category,subCate,age,country);
                                  }
                                  else
                                  {
                                    callback();
                                  }
                                }
                              })
                              
                              //callback(null,err);
                            }
                          }
                        })
                    })
                  }
                  ,
                  function(category,subCate,age,country,callbackwater)
                  {

                    let imageUrl ="",soundUrl="",videoUrl="",fileType=0;
                    if(file.IMAGEURL)
                    {
                      imageUrl="storage/questions/images/"+file.IMAGEURL;
                      if(fileType == 1)
                      {
                        fileType=4;
                      }
                      else
                      {
                        fileType=1;
                      }
                    }
                    else if(file.SOUNDURL)
                    {
                      soundUrl="storage/questions/sounds/"+file.SOUNDURL;
                      fileType=2;
                    }
                    else if(file.VIDEOURL)
                    {
                      videoUrl="storage/questions/videos/"+file.VIDEOURL;
                      fileType=3;
                    }
                    //console.log("dtatatatatatat",category);
                    let fields = {category:category.id,subCategory:subCate.id,package:package.package,
                      timeAllowed:file.TIMEALLOWED,age:age,region:country,question:file.QUESTION,option1:file.ANSWER1,option2:file.ANSWER2,
                      option3:file.ANSWER3,option4:file.ANSWER4,answer:file.CORRECTANSWER,status:parseInt(file.status),
                      fileType:fileType,image_URL:imageUrl,sound_URL:soundUrl,video_URL:videoUrl,creditBy:file.creditBy,questionState:file.questionState};

                    exportAddQuestion(fields,null).then(function(data)
                    {
                      callbackwater(null,data);
                    })
                    .catch(function(err)
                    {
                      callbackwater(err);
                    });
                  }
                  ,
              ], function (err, result)
              {
                if(err)
                {
                  reject(err);
                }
                else
                {
                  x++;

                  if(x == jsonObj.length)
                  {
                    resolve(1);
                  }
                  else
                  {
                    callback();
                  }
                }
              });
            }
          })
        }
        else
        {
          reject("Please Enter less then 200 rows");
        }
      }
      else
      {
        //console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        reject("Please compare the csv file column with your");
      }
      })
    })
  }





  /* Exporting Licence into csv file */

  function addExportLicence(country_id,distributor_id,type,res)
  {
    //consolelog('type ===================',type);
    return new Promise(function(resolve, reject)
    {
       const excel = require('node-excel-export');

        const styles = {
        headerDark: {
          fill: {
            fgColor: {
              rgb: 'FF000000'
            }
          },
          font: {
            color: {
              rgb: 'FFFFFFFF'
            },
            sz: 14,
            bold: true,
            underline: true
          }
        },
        cellPink: {
          fill: {
            fgColor: {
              rgb: 'FFFFFF'
            }
          }
        },
        cellGreen: {
          fill: {
            fgColor: {
              rgb: 'FF00FF00'
            }
          }
        }
      };

      //Array of objects representing heading rows (very top)
      const heading = [
        [{value: 'Licence', style: styles.headerDark}, {value: 'c1', style: styles.headerDark}],
        [ 'c2'] // <-- It can be only values
      ];

      //Here you specify the export structure
      const specification = {
        licence: {
          displayName: 'Licences',
          headerStyle: styles.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        },
        code: {
          displayName: 'Country',
          headerStyle: styles.headerDark,
          width: 220 // <- width in pixels
        }
        ,
        distributor: {
          displayName: 'Distributor',
          headerStyle: styles.headerDark,
          width: 220 // <- width in pixels
        }
        ,
        created: {
          displayName: 'Created',
          headerStyle: styles.headerDark,
          width: 220 // <- width in pixels
        }
      }

      // The data set should have the following shape (Array of Objects)
      // The order of the keys is irrelevant, it is also irrelevant if the
      // dataset contains more fields as the report is build based on the
      // specification provided above. But you should have all the fields
      // that are listed in the report specification

      let condition  = {};
      let updateCondition = {};

      //consolelog("country id ============",country_id);
      //consolelog("distributor id ============",distributor_id);


      if(country_id !=0 && distributor_id ==  0)
      {
        condition = {where:{country_id:country_id,count:type}};
        updateCondition = {country_id:country_id,count:type};
      }
      else if(country_id !=0 && distributor_id !=  0)
      {
        condition = {where:{country_id:country_id,distributor_id:distributor_id,count:type}};
        updateCondition = {country_id:country_id,distributor_id:distributor_id,count:type};
      }
      else
      {
        condition = {where:{count:0}};
        updateCondition = {count:0};
      }
      //consolelog("condition ============",condition);
      licenceModel.find(condition,function(err,data)
      {

        //consolelog("data >>>>>>>>>>>>>",data)
        const dataset = [];
        for(let i=0;i<data.length;i++)
        {
            var dd = data[i].created.getDate();
            var mm = data[i].created.getMonth()+1;
            var yyyy = data[i].created.getFullYear();
            if(dd<10)
            {
                dd='0'+dd;
            }

            if(mm<10)
            {
                mm='0'+mm;
            }
          date = dd+'/'+mm+'/'+yyyy;
          const test =
          {licence: data[i].licence, code: data[i].countryCode, distributor:data[i].distributorName,created:date};
          dataset.push(test);
        }

        licenceModel.updateAll(updateCondition,{count:1});


      const merges = [
        { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
        { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
        { start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
      ]

      // Create the excel report.
      // This function will return Buffer
      const report = excel.buildExport(
        [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
          {
            name: 'Report', // <- Specify sheet name (optional)
            heading: heading, // <- Raw heading array (optional)
            merges: merges, // <- Merge cell ranges
            specification: specification, // <- Report specification
            data: dataset // <-- Report data
          }
        ]
      );
      // You can then return this straight
      res.attachment('report.csv'); // This is sails.js specific (in general you need to set headers)
      return res.send(report);

        })
      //resolve(1);
    })
  }



  /* Get Subcategory Info */ 
  function getSubCategoryInfo(fields)
  {
    return new Promise(function(resolve, reject)
    {
        /* checking same subcategory in category */
        subCategoriesModel.findOne({where:{category_id:fields.category,
          subCategory:fields.subCategory}},function(err,data)
         {
           if(err)
           {
             reject(err);
           }
           else
           {
             if(data)
             {
                let obj = {status:1,data:data}               
                resolve(obj)               
             }
             else
             {
              let obj = {status:0,message:"Subcategory Not Found for Question :"+fields.question};
              resolve(obj)               
             }
           }
        })
    });
  }


  function addExportQuestion(res)
  {
   // //consolelog('type ===================',type);
    return new Promise(function(resolve, reject)
    {
      //consolelog("eeeee");
       const excel = require('node-excel-export');

        const styles1 = {
        headerDark: {
          fill: {
            fgColor: {
              rgb: 'FFFFFFFF'
            }
          },
          font: {
            color: {
              rgb: '0000000'
            },
            sz: 14,

          }
        },
        cellPink: {
          fill: {
            fgColor: {
              rgb: '000000'
            }
          }
        },
        cellGreen: {
          fill: {
            fgColor: {
              rgb: 'FFFFFFFF'
            }
          }
        }
      };
     // //consolelog("jjjjjjjjjjjjjj")
      //Array of objects representing heading rows (very top)
      const heading = [
        [{}]
      ];

      //Here you specify the export structure
      const specification = {
        category: {
          displayName: 'category',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        },
        sub_category: {
          displayName: 'sub_category',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        },
        question: {
          displayName: 'question',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        },option1: {
          displayName: 'answer1',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        },option2: {
          displayName: 'answer2',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        },option3: {
          displayName: 'answer3',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        },option4: {
          displayName: 'answer4',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        },correct_Answer: {
          displayName: 'correct_Answer',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        },image_URL: {
          displayName: 'image_URL',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        }
        ,video_URL: {
          displayName: 'video_URL',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        }
        ,sound_URL: {
          displayName: 'sound_URL',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        }
        ,age: {
          displayName: 'age',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        }
        ,region: {
          displayName: 'region',
          headerStyle: styles1.headerDark,
           // <- Cell style
          width: 220 //// <- width in chars (when the number is passed as string)
        }
      }

      // The data set should have the following shape (Array of Objects)
      // The order of the keys is irrelevant, it is also irrelevant if the
      // dataset contains more fields as the report is build based on the
      // specification provided above. But you should have all the fields
      // that are listed in the report specification

      let condition  = {};
      let updateCondition = {};

      ////consolelog("country id ============",country_id);
      ////consolelog("distributor id ============",distributor_id);

      userQuestionModel.find({include:['categories','sub_categories','age_categories','countries','question_packages'],where:{pack_ID:9}},function(err,data)
      {
        //consolelog(data);
        const dataset = [];
        for(let i=0;i<data.length;i++)
        {



          const test =
          {category:data[i].toJSON().categories.category,sub_category:data[i].toJSON().sub_categories.subCategory,question: data[i].question,option1: data[i].answer1,option2: data[i].answer2
            ,option3: data[i].answer3,option4: data[i].answer4,correct_Answer: data[i].correct_Answer,image_URL:data[i].image_URL,
            video_URL:data[i].video_URL,sound_URL:data[i].sound_URL,age: data[i].toJSON().age_categories.age
            ,region: data[i].toJSON().countries.name};
          dataset.push(test);
        }

      // const merges = [
      //   { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
      //   { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
      //   { start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
      // ]

      // Create the excel report.
      // This function will return Buffer
      const report = excel.buildExport(
        [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
          {
            //name: 'Report', // <- Specify sheet name (optional)
           // heading: heading, // <- Raw heading array (optional)
            // merges: merges, // <- Merge cell ranges
            specification: specification, // <- Report specification
            data: dataset // <-- Report data
          }
        ]
      );
      // You can then return this straight
      res.attachment('report.csv'); // This is sails.js specific (in general you need to set headers)
      return res.send(report);

        })
      //resolve(1);
    })
  }


  /** */


  function uploadCategoryFile(files,id,savePath,imageName,dir,oldpath)
  {
    return new Promise(function(resolve, reject)
    {

      //console.log('savePath===================>',savePath);
      //console.log('dir============================.',files);
        
        
       // let oldpath="";
        let s3Bucket,type;
       // oldpath = files.iconImage.path;
        s3Bucket = new AWS.S3({params:{Bucket:dir}});
        userCategoriesModel.updateAll({id:id},savePath,function(err,updated)
        {
          if(err)
          {
            console.log(err);
            reject(0);
          }
          else
          {

          }
        })

        // console.log(oldpath);
        // console.log(s3Bucket);
        console.log(imageName);
        
            


        uploadFileInS3(oldpath,s3Bucket,imageName,1).then(function(value)
        {
          console.log(value)
          resolve(1);
        }).catch(function(err)
        {
        
        });
         
    })
  }

  function getPackagesDataWithoutLimt()
  {
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

exports.data = methods;
