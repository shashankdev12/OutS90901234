
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
   // AWS.config.loadFromPath('./server/aws_config.json');
    //AWS.config.loadFromPath('E:/Daljeet/outsmarted/server/aws_config.json');
    var bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
var iconv = require('iconv-lite');
var csv_export=require('csv-export');

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
    regionAdminModel = app.models.region_admin
	  redeemCardModel = app.models.redeem_codes
    userNewCategoriesModel = app.models.user_categories
    questionsMultilangStatusTempModel = app.models.questions_multilang_status_temp
    questionsSettingModel = app.models.questions_setting
    regionCategoryModel = app.models.region_categories
    path = require('path');

const csv=require('csvtojson');

  /* ==================== Get adminDashBoard ========================== */


  methods.getDashboard = function(req,res,cb)
  {
    ////////console.log("sssssssssssssssssss");
      async.waterfall([
        function(callback) {
          // Checking licence
          getLicencesCount(1).then(function(count)
          {
            ////////console.log("-----------------",count);
            callback(null,count);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(count,callback) {
          // Checking licence
          userModel.count({emailVerified:1,licenceName:{ "neq":  null }},function(err,userCount)
          {
            if(err)
            {
              ////////console.log(err);
              callback(null,count,0);
            }
            else
            {
              ////////console.log(userCount);
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
              ////////console.log(err);
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
              ////////console.log(err);
              callback(null,count,0);
            }
            else
            {
              ////////console.log(userCount);
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
              ////////console.log(err);
              callback(null,count,0);
            }
            else
            {
              ////////console.log(userCount);
              callback(null,count,userCount,juniorCount,teenCount,AdultCount);
            }
          })
        },
        function(count,userCount,juniorCount,teenCount,AdultCount,callback) {
          // Checking licence
          licenceModel.count({},function(err,licenceCount)
          {
            if(err)
            {
              ////////console.log(err);
              callback(null,count,0);
            }
            else
            {
              ////////console.log(userCount);
              callback(null,count,userCount,juniorCount,teenCount,AdultCount,licenceCount);
            }
          })          
        }
        ,
        function(count,userCount,juniorCount,teenCount,AdultCount,licenceCount,callback) 
        {
          let user =  app.models.user;
          let ds1 = user.dataSource;
          ds1.connector.query("SELECT created, COUNT(id) as countV FROM `user` WHERE licenceName IS NOT NULL AND created >= CURDATE() - INTERVAL 30 DAY GROUP BY YEAR(created), MONTH(created),DAY(created)",function(err,userUniUser)
          {
            
            callback(null,count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser);
          })
          
        }
        ,
        function(count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser,callback) 
        {
          let games =  app.models.user_games;
          let ds1 = games.dataSource;
          ds1.connector.query("SELECT created, COUNT(id) FROM `user_games` WHERE created > NOW() - INTERVAL 30 DAY  GROUP BY YEAR(created), MONTH(created),DAY(created) ",function(err,userGame)
          {

            callback(null,count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser,userGame);
          })
        },
        function(count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser,userGame,callback) 
        {
          // Checking licence
          userChildsModel.count({},function(err,totalChilds)
          {
            if(err)
            {
              callback(null,totalChilds);
            }
            else
            {
              callback(null,count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser,userGame,totalChilds);
            }
          })
        }
        ,
        function(count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser,userGame,totalChilds,callback) 
        {
          let games =  app.models.user_games;
          let ds1 = games.dataSource;
          ds1.connector.query("SELECT category,category_id,COUNT(category_id) AS topTen  FROM user_add_ons INNER JOIN categories ON user_add_ons.category_id = categories.id  WHERE user_add_ons.created > NOW() - INTERVAL 7 DAY GROUP BY category_id,YEAR(user_add_ons.created), MONTH(user_add_ons.created),DAY(user_add_ons.created) ORDER BY  topTen;",function(err,addontopten)
          {

            callback(null,count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser,userGame,totalChilds,addontopten);
          })
        }
        ,
        function(count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser,userGame,totalChilds,addontopten,callback) 
        {
          let games =  app.models.user_games;
          let ds1 = games.dataSource;
          ds1.connector.query("SELECT category,category_id,COUNT(category_id) AS topTen  FROM user_add_ons INNER JOIN categories ON user_add_ons.category_id = categories.id   GROUP BY category_id ORDER BY  topTen;",function(err,addontopALL)
          {
            console.log(err)
            callback(null,count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser,userGame,totalChilds,addontopten,addontopALL);
          })
        }
    ], function (err,count,userCount,juniorCount,teenCount,AdultCount,licenceCount,userUniUser,userGame,totalChilds,addontopten,addontopALL)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        cb(null,{status:"success",message:"Successfully get data",licenceCount:count,userCount:userCount,jCount:juniorCount,
        tCount:teenCount,aCount:AdultCount,licenceCount:licenceCount,userLicenLast:userUniUser
        ,userGames:userGame,totalChilds:totalChilds,addontopten:addontopten,addontopALL:addontopALL})
      }
    });
  }


  methods.getAjaxUserCount = function(req,res,cb)
  {
    userChildsModel.count({age_id:1,created: {between: [req.body.startDate,req.body.endDate]}},function(err,juniorCount)
    {
      if(err)
      {
        cb(null,count,0);
      }
      else
      {
        userChildsModel.count({age_id:2,created: {between: [req.body.startDate,req.body.endDate]}},function(err,teenCount)
        {
          if(err)
          {
            cb(null,count,0);
          }
          else
          {
            
            userChildsModel.count({age_id:3,created: {between: [req.body.startDate,req.body.endDate]}},function(err,AdultCount)
            {
              if(err)
              {
                cb(null,count,0);
              }
              else
              {
                cb(null,{data:{junior:juniorCount,teen:teenCount,adult:AdultCount}});
              }
            })
          }
        })
      }
    })
  }



  methods.getAjaxUniqueUserCount = function(req,res,cb)
  {

    let user =  app.models.user;
    let ds1 = user.dataSource;
    ds1.connector.query("SELECT created, COUNT(id) as countV FROM `user` WHERE licenceName IS NOT NULL AND created > NOW() - INTERVAL "+req.body.days+" DAY GROUP BY YEAR(created), MONTH(created),DAY(created)",function(err,userUniUser)
    {
      console.log("userUniUser",userUniUser) 
      cb(null,{data:{userLicenLast:userUniUser}});
    })
    
  }


  methods.getAjaxGamePlayed = function(req,res,cb)
  {

    let games =  app.models.user_games;
    let ds1 = games.dataSource;
    ds1.connector.query("SELECT created, COUNT(id) as countG FROM `user_games` WHERE created > NOW() - INTERVAL "+req.body.days+" DAY  GROUP BY YEAR(created), MONTH(created),DAY(created) ",function(err,userGame)
    {
      console.log("userGameuserGame",userGame) 
      cb(null,{data:{userGames:userGame}});
    })
    
  }

  methods.getDashboardP = function(req,res,cb)
  {
    ////////console.log("sssssssssssssssssss");
      async.waterfall([
        function(callback) {
          // Checking licence
          getLicencesCount(1).then(function(count)
          {
            ////////console.log("-----------------",count);
            callback(null,count);
          })
          .catch(function(err)
          {
            callback(err);
          });
        },
        function(count,callback) {
          // Checking licence
          userModel.count({where: {
            and:[{
              or: [
                { created: { lt: req.body.startDate } },
                { created: { gt: req.body.endDate } },
              ]
            }]}},function(err,userCount)
          {
            if(err)
            {
              ////////console.log(err);
              callback(null,count,0);
            }
            else
            {
              ////////console.log(userCount);
              callback(null,count,userCount);
            }
          })
        }
        ,
        function(count,userCount,callback) {
          // Checking licence
          userChildsModel.count({age_id:1,and:[{
            or: [
              { created: { lt: req.body.startDate } },
              { created: { gt: req.body.endDate } },
            ]
          }]},function(err,juniorCount)
          {
            if(err)
            {
              ////////console.log(err);
              callback(null,count,0,0);
            }
            else
            {
              callback(null,count,userCount,juniorCount);
            }
          })
        },
        function(count,userCount,juniorCount,callback) {
          // Checking licence
          userChildsModel.count({age_id:2},function(err,teenCount)
          {
            if(err)
            {
              ////////console.log(err);
              callback(null,count,0);
            }
            else
            {
              ////////console.log(userCount);
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
              ////////console.log(err);
              callback(null,count,0);
            }
            else
            {
              ////////console.log(userCount);
              callback(null,count,userCount,juniorCount,teenCount,AdultCount);
            }
          })
        },
        function(count,userCount,juniorCount,teenCount,AdultCount,callback) {
          // Checking licence
          licenceModel.count({},function(err,licenceCount)
          {
            if(err)
            {
              ////////console.log(err);
              callback(null,count,0);
            }
            else
            {
              ////////console.log(userCount);
              callback(null,count,userCount,juniorCount,teenCount,AdultCount,licenceCount);
            }
          })

          
        }
    ], function (err,count,userCount,juniorCount,teenCount,AdultCount,licenceCount)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        ////////console.log("userCount=====================",userCount);
        cb(null,{status:"success",message:"Successfully get data",licenceCount:count,userCount:userCount,jCount:juniorCount,
        tCount:teenCount,aCount:AdultCount,licenceCount:licenceCount})
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
            //////consolelog("info>>>>>>>>>>>>>>>>>>>>>",info);
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
    ////////////consolelog(countryVal[1]);
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
    if (req.url == '/addCountry')
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
            if(fields.id == 0)
            {
              countryModel.create({name:fields.name,code:fields.code.toUpperCase(),language:fields.languages.toUpperCase(),status:1,created:new Date(),modified:new Date()},function(err,data)
              {
                if(err)
                {
                  cb(null,{status:"fail",message:"Error While creating country, please try again"})
                }
                else
                {
                  uploadCountryImage(files,data.id).then(function(upload)
                  {
                    cb(null,{status:"success",message:"Country is created successfully"});
                  }).catch(function(err) {
                    cb(null,{status:"Error",message:"Country is created successfully"});
                  });
                }
              })
            }
            else
            {
              countryModel.updateAll({id:fields.id},{name:fields.name,code:fields.code.toUpperCase(),language:fields.languages.toUpperCase(),modified:new Date()},function(err,data)
              {
                if(err)
                {
                  cb(null,{status:"fail",message:"Error While updating country, please try again"})
                }
                else
                {

                  userModel.updateAll({country_id:fields.id},{countryCode:fields.name},function(err,updateUserAge){
                    ////consolelog(err);
                  })

                  userChildsModel.updateAll({country_id:fields.id},{countryCode:fields.name},function(err,updateAge){

                  })


                  if((files.logo.name))
                  {
                      uploadCountryImage(files,fields.id).then(function(upload)
                      {
                        cb(null,{status:"success",message:"Country is updated successfully"});
                      }).catch(function(err) {
                        cb(null,{status:"Error",message:"Country is updated successfully"});
                      });
                  }
                  else
                  {
                    cb(null,{status:"success",message:"Country is updated successfully"});
                  }
                  
                }
              })
            }
         }
      });
   }
  }


  function readingFile(error,data)
{
    if(error){
        //////console.log(error);
    } else
    {
        //  //////console.log(data); // Printing the file.txt file's content
        
        
         // Creating new file - paste.txt with file.txt's content
        fs.writeFile('../common/models/questions_EN.js',data,'utf8',writeFile);
    } 
}


function readingFile2(error,data)
{
    if(error){
        //////console.log(error);
    } else
    {
      const obj = JSON.parse(data);
        //////console.log(obj.name); // Printing the file.txt file's content
        obj.name ="questions_EN"
        
         // Creating new file - paste.txt with file.txt's content
        fs.writeFile('../common/models/questions_EN.json',JSON.stringify(obj),'utf8',writeFile);
    } 
}
  
function writeFile(error)
{
    if(error){
        //////console.log(error)
    } else {
        //////console.log('Content has been pasted to paste.txt file');
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
          getUsersData(skipV,req.params).then(function(value)
          {
            //console.log(value);
            callback(null, value);
          })
          .catch(function(err)
          {
		console.log(err)
            callback(err);
          });
        },
        function(value, callback)
        {
          getUsersCount(skipV).then(function(count)
          {
            callback(null,count,value);
          })
          .catch(function(err)
          {
console.log(err)
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

   /* ==================== Get users Details ========================== */

   methods.getUserDetails = function(req,res,cb)
  {
    ////////console.log(req.params);
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
          ////consolelog(err);
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
          ////////console.log(err);
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
          ////////console.log(err);
          callback(err);
        });
      },
      function(value,devicesAttached,childs,allPack,count,teamInfo,categoriesData,callback) {
        // Checking user Details
        
        userNewCategoriesModel.find({include:"categories",where:{user_id:req.params.id}},function(err,usernewCate){
          if(err)
          {
            callback(err);
          }
          else
          {
            callback(null, value,devicesAttached,childs,allPack,count,teamInfo,categoriesData,usernewCate);
          }
        })
        
        // getUserCategoryData(req).then(function(categoriesData)
        // {
        //   callback(null, value,devicesAttached,childs,allPack,count,teamInfo,categoriesData);
        // })
        // .catch(function(err)
        // {
        //   ////////console.log(err);
        //   callback(err);
        // });
      }
    ], function (err,value,devicesAttached,childs,allPack,count,teamInfo,categoriesData,usernewCate)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from users table",data:null})
      }
      else
      {
        //////console.log("==================== Usernew=========================",usernewCate);
        cb(null,{status:"success",message:"Successfully get data",userDetails:value,devicesAttached:devicesAttached,
        childs:childs,package:allPack,gameCount:count.count,game_start:count.game_start,game_end:count.game_end,teamInfo:teamInfo,categories:categoriesData,newCategory:usernewCate})
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
    //////consolelog("sssssssssssssssssssssss")


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
      //////consolelog(2222222222222222);
      /* creating new age */
      userAgeModel.updateAll({id:req.body.id},{age:req.body.age,modified:new Date},function(err,data)
      {
        if(err)
        {
        }
        else
        {
          userModel.updateAll({age_id:req.body.id},{age:req.body.age},function(err,updateUserAge){
            ////consolelog(err);
          })


          userChildsModel.updateAll({age_id:req.body.id},{age:req.body.age},function(err,updateAge){

          })



          // cb(null,{status:"fail",message:"Error While updating age, please try again"})

          cb(null,{status:"success",message:"Age is updated successfully"});
        }
      })
    }
  }


methods.getRedeemCode = function(req,res,cb)
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
          redeemCardModel.find({order:'id desc',limit: 20, skip: skipV},function(err,value)
          {
          if(err)
          {
            callback(err);

          }
          else
          {
            callback(null,value);
          }
          })
        },
        function(value, callback)
        {
          redeemCardModel.count(function(err,count)
          {
          if(err)
          {
            callback(err);

          }
          else
          {
            callback(null,count,value);
          }
          })
        },
        function(count,value, callback)
        {
          let categoriesModel = app.models.categories;
          categoriesModel.find({},function(err,categoriesD){
            if(err)
            {
              callback(err);
            }
            else
            {
              callback(null,count,value,categoriesD);
            }
          })
        }
    ], function (err, count,value,categoriesD)
    {
      if(err)
      {
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        cb(null,{status:"success",message:"Successfully get data"
        ,redeemCodeData:value,redeemCodeCount:count,categories:categoriesD})
      }
    });
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
            //////////////consolelog(packageQuestionCount);
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
            //////console.log(age)
            callback(null,count,packageQuestionCount,infos,country,category,age);
          })
          .catch(function(err)
          {
            //////console.log(err);
            callback(err);
          });
          //callback(null,count,value,null);
        }

    ], function (err, count,value,info,country,category,age)
    {

      if(err)
      {
        //////console.log("sssssssssssssssssssssssssss",err);
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        //////console.log("bbbbbbbbbbb",value);
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
             //////console.log("sssssssssssssssssss",fields)
             setPackagesData(fields,files).then(function(value)
             {
               cb(null, {status:"success",message:"Successfully upload Image"});
             })
             .catch(function(err)
             {
               //////console.log(err);
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
              //////console.log(err);
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


 methods.updatePriortyTime = function(req,res,cb)
  {
    //////console.log(req.body);
    let x=0
    let regions =  req.body.region.split(",");
    
    async.eachSeries(regions,function(fields, callback)
    {
      //////console.log("fields",fields)
        x++
        countryModel.findOne({where:{id:fields}},function(err,countryData){
          //////console.log("questions_"+countryData.language);
        let userQuestionModel = app.models["questions_"+countryData.language];
        userQuestionModel.findOne({where:{questionMasterId:req.body.id}},function(err,data){
          if(err)
          {
            //////console.log("err1",err)
            cb(err,{status:1,message:"Error"});
          }
          else
          {
            //////console.log("data=============",data.questionMasterId); 
            //////console.log("data=============",req.body); 
            if(data)
            {
              userQuestionModel.updateAll({questionMasterId:req.body.id},{time_Allowed:req.body.time,priority:req.body.priority},function(err,update){
                if(err)
                {
                  //////console.log("err",err)
                  cb(err,{status:1,message:"Error"}); 
                }
                else
                {
                  //////console.log("xxxxx",x)
                  if(x == data.length)
                  {
                    cb(err,{status:1,message:"success"});
                  }
                  else
                  {
                    callback()
                  }
                }
              })
            }
          }
        })
      })
    })         
  }


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
          cond = "where questions.category_id="+req.params.category+"  and questions.sub_category_id = "+req.params.subCategory+" and questions.pack_ID = 0 and questions.status=0"
        }
        else if((req.params.category !=0) && (req.params.subCategory ==0) )
        {
          cond = "where questions.category_id="+req.params.category+"  and questions.pack_ID = 0 and questions.status=0"
        }
        else if((req.params.category ==0) && (req.params.subCategory ==0) )
        {
          cond = "where questions.pack_ID = 0 and questions.status=0 "
        }
       
       ds1.connector.query('SELECT questions.id,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionMasterId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id '+cond+' GROUP BY questionMasterId ORDER BY id DESC LIMIT '+skipV+',10', function (err, data)
       {
         if(err)
         {
           ////////////consolelog(err);
         }
         else
         {
           //////consolelog(data);
             for(let i=0;i<data.length;i++)
             {
               let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,question:data[i].question,answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionMasterId:data[i].questionMasterId}

               finalQuestion.push(question);
              }
             callbackWater(null,finalQuestion);

         }
       })
     },
     function(questionData, callbackWater)
     {
      //////consolelog("question data for free play ", questionData);
       if(questionData.length > 0)
       {
        //////consolelog("length is greater than 0 ");
         let x=0;id=0;
         async.eachSeries(questionData, function(question, callback)
         {

           //////consolelog("question group id ",question.questionMasterId);
           ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionMasterId ='+question.questionMasterId+'  GROUP BY age_id', function (err, ageData)
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
           ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id WHERE questionMasterId ='+questionAge.questionMasterId+'  GROUP BY region', function (err, countryData)
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
                 //////consolelog(4,questionAge);
                 callbackWater(null, questionAge);
               }
               else
               {
                 //////////////consolelog(question)
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
          cond = "where questions.category_id="+req.params.category+"  and questions.sub_category_id = "+req.params.subCategory+" and questions.pack_ID = 0 and questions.status=0"
        }
        else if((req.params.category !=0) && (req.params.subCategory ==0) )
        {
          cond = "where questions.category_id="+req.params.category+"  and questions.pack_ID = 0 and questions.status=0"
        }
        else if((req.params.category ==0) && (req.params.subCategory ==0) )
        {
          cond = "where questions.pack_ID = 0 and questions.status=0 "
        }
       ds1.connector.query('SELECT COUNT(a.cnt) as count FROM ( SELECT COUNT(id) AS cnt FROM questions '+cond+' GROUP BY questionMasterId) AS a', function (err, questionCount)
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
   //////consolelog("sending questions ", finalQuestion);
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
    
      let questions =  app.models.questions;
      let ds1 = questions.dataSource;
      let finalQuestion = [];	
      async.waterfall([	
      function(callbackWater) {	
        let cond="",type=0,pack="questions_"+req.session.regionCode+".pack_ID != 0",questionStatus=1,questionState="",regionCondition='';
        if(req.session.adminUserType == 1)
        {
            if(req.params.type == 1)
            {
              type = 1
              pack="questions_"+req.session.regionCode+".pack_ID != -1"
            }
            else if(req.params.type == 2)
            {
              type = 0
              pack="questions_"+req.session.regionCode+".pack_ID = 0"
            }
            else
            {
              if(req.params.package !=0)
              {
                pack="questions_"+req.session.regionCode+".pack_ID = "+req.params.package+""
              }
            }

            if(req.params.region == 0)
            {
              regionCondition ="and CONCAT(',', region, ',') LIKE '%,"+4+",%'"
            }
            else
            {
				      //////console.log("123	")
              regionCondition ="and CONCAT(',', region, ',') LIKE '%,"+req.params.region+",%'"
              //regionCondition ="and questions_"+req.session.regionCode+".region="+req.params.region+"";
            }
        }
        else
        {
          //////console.log('one============><><>',)
            if(req.params.type == 1)
            {
              type = 1
	            pack="questions_"+req.session.regionCode+".pack_ID != -1"	
            }
            else
            {
              //pack="questions.pack_ID = "+req.params.package+""
            }


            if(req.params.region == '0')
            {	  
              //regionCondition ="and region IN ("+req.session.region+")"
    
              regionCondition ="and CONCAT(',', region, ',') LIKE '%,"+req.session.region+",%'"
              //////console.log("regionCondition1",regionCondition)
            }
            else
            {
              regionCondition ="and CONCAT(',', region, ',') LIKE '%,"+req.params.region+",%'"
              //////console.log("regionCondition21",regionCondition)
              
            }

	  
	
			 // regionCondition ="and questions.region IN (1,2)"
         }

        //////console.log("======= 9999999999999999999999 ==============",pack);

        if(req.params.questionStatus == 0)
        {
          questionStatus = ""
        }
        else if(req.params.questionStatus == 1)
        {
          questionStatus = "and questions_"+req.session.regionCode+".questionActiveStatus = "+req.params.questionStatus+""
        }
        else if(req.params.questionStatus == 2)
        {
          questionStatus = "and questions_"+req.session.regionCode+".questionActiveStatus = 0"
        }


        
	req.params.package=1

        let searchRegion = req.session.regionCode;
        //////console.log(req.params)
        // if(req.params.region !=0 )
        // {
        //   searchRegion= 
        // }



        countryModel.findOne({where:{id:req.params.region}},function(err,countryData)
        {
          if(countryData)
          {
            searchRegion = countryData.language;
          }
          else
          {
            searchRegion = req.session.regionCode;
          }
          
          if(req.params.questionState == 0)
          {
            questionState = ""
          }
          else if(req.params.questionState == 1)
          {
            questionState = "and questions_"+searchRegion+".questionState = "+req.params.questionState+""
          }
          else if(req.params.questionState == 2)
          {
            questionState = "and questions_"+searchRegion+".questionState = 0"
          }


        if((req.params.category != 0) && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww11");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".status = "+type+"  "+questionStatus+" "+questionState+" ";
        }	
        else if((req.params.category != 0) && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww12");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+" and questions_"+searchRegion+".status =  "+type+" "+questionStatus+" "+questionState+" "	
        }
	else if((req.params.category != 0) && (req.params.package == 0) && (req.params.age != 0)  && (req.params.region == 0)  && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww12");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+" and questions_"+searchRegion+".status =  "+type+" "+questionStatus+"  and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+questionState+" "+regionCondition+" "	
        }
	else if((req.params.category != 0) && (req.params.package != 0)  && (req.params.region != 0)  && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww12");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+" and questions_"+searchRegion+".status =  "+type+" "+questionStatus+" "+questionState+" "+regionCondition+" "	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww13");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status = "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+questionStatus+" "+questionState+""	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww14");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+" "+questionStatus+" "+questionState+""	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww15");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww156");
          cond = "where questions_"+searchRegion+".status =  "+type+" "+questionStatus+" "+questionState+""			
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww17");
          cond = "where questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0) && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww18");
          cond = "where questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww19");
          cond = "where questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww20");
          cond = "where questions_"+searchRegion+".status =  "+type+"  and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww21");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+questionStatus+" "+questionState+"";		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww3331");
          cond = "where questions_"+searchRegion+".status =  "+type+"   and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+" "+regionCondition+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww4441");
          cond = "where questions_"+searchRegion+".status =  "+type+"  and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww200");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww199");
          cond = "where questions_"+searchRegion+".status =  "+type+"  "+regionCondition+" "+questionStatus+" "+questionState+""		
        }	
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww188");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+" and questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+"  "+regionCondition+" "+questionStatus+" "+questionState+""		
        }
	      else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
         
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+" and questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+" and questions_"+searchRegion+".fileType="+req.params.fileType+"  "+regionCondition+" "+questionStatus+" "+questionState+""		
        }

        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww177");
          cond = "where  questions_"+searchRegion+".status =  "+type+"  "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww166");
          cond = "where questions_"+searchRegion+".status =  "+type+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww155");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".status =  "+type+" and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww133");
          cond = "where questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww1212");
          cond = "where questions_"+searchRegion+".status =  "+type+"   and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {
          console.log("wwwwwwwwwww7");	
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww6");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'   and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww5");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww4");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'   and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww333");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'   and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("ww23wwwwwwwww");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwww2wwww");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"   and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'   and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+" and  questions_"+searchRegion+".status = "+type+"   "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww");
          cond = "where   questions_"+searchRegion+".status = "+type+" and questions_"+searchRegion+".fileType="+req.params.fileType+"   "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0) && (req.params.package != 0)  && (req.params.age == 0)  && (req.params.region == 0)  && (req.params.fileType != 0))
        {
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+" and   questions_"+searchRegion+".status = "+type+"   and questions_"+searchRegion+".fileType="+req.params.fileType+"   "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0) && (req.params.package != 0)  && (req.params.age != 0)  && (req.params.region == 0)   && (req.params.fileType != 0))
        {
          console.log("entery")
          cond = "where  questions_"+searchRegion+".category_id="+req.params.category+" and  questions_"+searchRegion+".status = "+type+"   and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"   and questions_"+searchRegion+".fileType="+req.params.fileType+"   "+questionStatus+" "+questionState+""		
        }
        else	
        {	
          //////console.log("helll is here");
          cond ="where questions_"+searchRegion+".status = "+type+"  "+questionStatus+" "+questionState+""	
        }	
        console.log("cond========",cond)
        //console.log("cond",req.params)

        if(req.params.supportUrl != 0  && req.params.answerOrder != 0)
        {
          cond = cond +"and  questions_"+searchRegion+".SupportVideoURL is not null and questions_"+searchRegion+".AnswerOrder is not null"
        }
        else if(req.params.supportUrl == 0  && req.params.answerOrder != 0)
        {
            cond = cond +" and questions_"+searchRegion+".AnswerOrder is not null and  questions_"+searchRegion+".AnswerOrder !=''"
        }
        else if(req.params.supportUrl != 0  && req.params.answerOrder == 0)
        {
            cond = cond +" and  questions_"+searchRegion+".SupportVideoURL is not null and  questions_"+searchRegion+".AnswerOrder !='' "
        }


        if(req.params.countrytype == '1')
        {
          cond = cond +" and  questions_"+searchRegion+".region = '"+req.params.region+"'";
        }

	if(req.params.priority == '1')
        {
          cond = cond +"and questions_"+searchRegion+".priority = '"+req.params.priority+"'";
        }
        else if(req.params.priority == '2')
        {
          cond = cond +"and questions_"+searchRegion+".priority = '"+req.params.priority+"'";
        }
        else if(req.params.priority == '0')
        {
          cond = cond 
        }

        console.log("=====================",cond)
                 
        ds1.connector.query('SELECT questions_'+searchRegion+'.time_Allowed,questions_'+searchRegion+'.countryCreated,questions_'+searchRegion+'.priority,questions_'+searchRegion+'.id,questions_'+searchRegion+'.time_Allowed,questions_'+searchRegion+'.questionActiveStatus,questions_'+searchRegion+'.questionState,questions_'+searchRegion+'.category_id,questions_'+searchRegion+'.fileType,questions_'+searchRegion+'.sub_category_id,questions_'+searchRegion+'.age_id,questions_'+searchRegion+'.time_Allowed,questions_'+searchRegion+'.region,questions_'+searchRegion+'.status,questions_'+searchRegion+'.question,questions_'+searchRegion+'.answer1,questions_'+searchRegion+'.answer2,questions_'+searchRegion+'.answer3,questions_'+searchRegion+'.answer4,questions_'+searchRegion+'.hint,questions_'+searchRegion+'.correct_Answer,questions_'+searchRegion+'.image_URL,questions_'+searchRegion+'.sound_URL,questions_'+searchRegion+'.video_URL,questions_'+searchRegion+'.fileType,questions_'+searchRegion+'.pack_ID,questions_'+searchRegion+'.questionMasterId,questions_'+searchRegion+'.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age,question_packages.packageName, COUNT(questions_'+searchRegion+'.id) AS multiple FROM questions_'+searchRegion+' INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id  LEFT JOIN question_packages ON pack_ID = question_packages.id '+cond+' GROUP BY questionMasterId ORDER BY questions_'+searchRegion+'.modified DESC LIMIT '+skipV+',40', function (err, data)	
        {	
          if(err)	
          {	
            console.log(err);	
          }	
          else	
          {
            
           console.log(data.length);
	        if(data.length>0)
	        {	
              for(let i=0;i<data.length;i++)	
              {	
                let question = { id:data[i].id,questionActiveStatus:data[i].questionActiveStatus,category:data[i].category,
                  subCategory:data[i].subCategory,packageName:data[i].packageName,
                  multiple:data[i].multiple,age:data[i].age_id,country:data[i].region,image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,
                  video_URL:data[i].video_URL,question:data[i].question,answer1:data[i].answer1,
                  answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,
                  created:data[i].created,questionMasterId:data[i].questionMasterId,questionState:data[i].questionState,
                  timeAllowed:data[i].time_Allowed,hint:data[i].hint,fileType:data[i].fileType,time_Allowed:data[i].time_Allowed,
                  priority:data[i].priority,countryCreated:data[i].countryCreated
                }	
                finalQuestion.push(question);	
               }	
               //console.log(finalQuestion);	
              callbackWater(null,finalQuestion);	
		}
		else
		{
		 callbackWater(null,[]);	

		}	
          }	
        })	
      })



      },	
      	
      function(finalQuestion, callbackWater)	
      {	let searchRegion = req.session.regionCode;
	      countryModel.findOne({where:{id:parseInt(req.params.region)}},function(err,countryData)
        {
	        
          if(countryData)
          {
		
            searchRegion = countryData.language;
          }
          else
          {
            searchRegion = req.session.regionCode;
          }
        let cond="",type=0,pack="questions_"+searchRegion +".pack_ID != 0",questionStatus=1,questionState="",regionCondition='';
        if(req.session.adminUserType == 1)
        {
          //////console.log('121212')
            
            if(req.params.type == 1)
            {
              type = 1
              pack="questions_"+searchRegion +".pack_ID != -1"
            }
            else if(req.params.type == 2)
            {
              type = 0
              pack="questions_"+searchRegion +".pack_ID = 0"
            }
            else
            {
              if(req.params.package !=0)
              {
                pack="questions_"+searchRegion +".pack_ID = "+req.params.package+""
              }
            }

            if(req.params.region == 0)
            {
              regionCondition ="and CONCAT(',', region, ',') LIKE '%,"+4+",%'"
            }
            else
            {
				      //////console.log("123	")
              regionCondition ="and CONCAT(',', region, ',') LIKE '%,"+req.params.region+",%'"
              //regionCondition ="and questions_"+req.session.regionCode+".region="+req.params.region+"";
            }
        }
        else
        {
          ////////console.log('one============><><>',)
            if(req.params.type == 1)
            {
              type = 1
	             pack="questions_"+searchRegion +".pack_ID != -1"	
            }
	    else
            {
	             //pack="questions_"+searchRegion +".pack_ID = "+req.params.package+""
	    }
			  
	           if(req.params.region == '0')
	  	{	  
	  		regionCondition ="and questions_"+req.session.regionCode+".region IN ("+req.session.region+")"
          	}
	  	else
	  	{
			regionCondition ="and questions_"+req.session.regionCode+".region="+req.params.region+"";

	  	}
        }

        //////console.log("======= 9999999999999999999999 ==============",req.session);

        if(req.params.questionStatus == 0)
        {
          questionStatus = ""
        }
        else if(req.params.questionStatus == 1)
        {
          questionStatus = "and questions_"+req.session.regionCode+".questionActiveStatus = "+req.params.questionStatus+""
        }
        else if(req.params.questionStatus == 2)
        {
          questionStatus = "and questions_"+req.session.regionCode+".questionActiveStatus = 0"
        }


        if(req.params.questionState == 0)
        {
          questionState = ""
        }
        else if(req.params.questionState == 1)
        {
          questionState = "and questions_"+searchRegion+".questionState = "+req.params.questionState+""
        }
        else if(req.params.questionState == 2)
        {
          questionState = "and questions_"+searchRegion+".questionState = 0"
        }

        
        //////console.log(req.params)
        // if(req.params.region !=0 )
        // {
        //   searchRegion= 
        // }
        if((req.params.category != 0) && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww11");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".status = "+type+"  "+questionStatus+" "+questionState+" ";
        }	
        else if((req.params.category != 0) && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww12");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+" and questions_"+searchRegion+".status =  "+type+" "+questionStatus+" "+questionState+" "	
        }
	      else if((req.params.category != 0) && (req.params.package != 0)  && (req.params.region != 0)   && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww12");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+" and questions_"+searchRegion+".status =  "+type+" "+questionStatus+" "+questionState+" "+regionCondition+" "	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww13");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status = "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+questionStatus+" "+questionState+""	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww14");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+" "+questionStatus+" "+questionState+""	
        }	
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww15");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww156");
          cond = "where questions_"+searchRegion+".status =  "+type+" "+questionStatus+" "+questionState+""			
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww17");
          cond = "where questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0) && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww18");
          cond = "where questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww19");
          cond = "where questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww20");
          cond = "where questions_"+searchRegion+".status =  "+type+"  and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww21");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+questionStatus+" "+questionState+"";		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
         
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+" and questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+" and questions_"+searchRegion+".fileType="+req.params.fileType+"  "+regionCondition+" "+questionStatus+" "+questionState+""		
        }

        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          console.log("wwwwwwwwwww3331");
          cond = "where questions_"+searchRegion+".status =  "+type+"   and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+" "+regionCondition+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww4441");
          cond = "where questions_"+searchRegion+".status =  "+type+"  and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww200");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww199");
          cond = "where questions_"+searchRegion+".status =  "+type+"  "+regionCondition+" "+questionStatus+" "+questionState+""		
        }	
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww188");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+" and questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+"  "+regionCondition+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww177");
          cond = "where  questions_"+searchRegion+".status =  "+type+"  "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww166");
          cond = "where questions_"+searchRegion+".status =  "+type+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww155");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".status =  "+type+" and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww133");
          cond = "where questions_"+searchRegion+".pack_ID = "+req.params.package+"   and questions_"+searchRegion+".status =  "+type+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww1212");
          cond = "where questions_"+searchRegion+".status =  "+type+"   and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {
          console.log("wwwwwwwwwww7");	
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww6");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'   and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww5");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww4");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'   and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwwwwwww333");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'   and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age != 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          console.log("ww23wwwwwwwww");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"  and questions_"+searchRegion+".pack_ID = "+req.params.package+"  and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"  and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package == 0) && (req.params.age != 0) && (req.params.region == 0) && (req.params.fileType != 0))	
        {	
          console.log("wwwwwww2wwww");
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+"   and questions_"+searchRegion+".status =  "+type+" and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%'   and questions_"+searchRegion+".fileType="+req.params.fileType+" "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType == 0))	
        {	
          //////console.log("wwwwwwwwwww");
          cond = "where  and questions_"+searchRegion+".category_id="+req.params.category+" and  questions_"+searchRegion+".status = "+type+"   "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category == 0)  && (req.params.package != 0) && (req.params.age == 0) && (req.params.region != 0) && (req.params.fileType != 0))	
        {	
          //////console.log("wwwwwwwwwww");
          cond = "where questions_"+searchRegion+".status = "+type+" and questions_"+searchRegion+".fileType="+req.params.fileType+"   "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0) && (req.params.package != 0)  && (req.params.age == 0)  && (req.params.region == 0)  && (req.params.fileType != 0))
        {
          cond = "where questions_"+searchRegion+".category_id="+req.params.category+" and   questions_"+searchRegion+".status = "+type+"   and questions_"+searchRegion+".fileType="+req.params.fileType+"   "+questionStatus+" "+questionState+""		
        }
        else if((req.params.category != 0) && (req.params.package != 0)  && (req.params.age != 0)  && (req.params.region == 0)   && (req.params.fileType != 0))
        {
          console.log("entery")
          cond = "where  and questions_"+searchRegion+".category_id="+req.params.category+" and  questions_"+searchRegion+".status = "+type+"   and  CONCAT(',', age_id, ',') LIKE '%,"+req.params.age+",%' "+regionCondition+"   and questions_"+searchRegion+".fileType="+req.params.fileType+"   "+questionStatus+" "+questionState+""		
        }
        else	
        {	
          //////console.log("helll is here");
          cond ="where "+pack+" and  questions_"+searchRegion+".status = "+type+"  "+questionStatus+" "+questionState+""	
        }	

        
        console.log("cond",req.params)

        if(req.params.supportUrl != 0  && req.params.answerOrder != 0)
        {
          cond = cond +"and  questions_"+searchRegion+".SupportVideoURL is not null and questions_"+searchRegion+".AnswerOrder is not null"
        }
        else if(req.params.supportUrl == 0  && req.params.answerOrder != 0)
        {
          cond = cond +"and questions_"+searchRegion+".AnswerOrder is not null"
        }
        else if(req.params.supportUrl != 0  && req.params.answerOrder == 0)
        {
          cond = cond +"and  questions_"+searchRegion+".SupportVideoURL is not null "
        }

        if(req.params.countrytype == '1')
        {
          cond = cond +" and  questions_"+searchRegion+".region = '"+req.params.region+"'";
        }

	if(req.params.priority == '1')
        {
          cond = cond +"and questions_"+searchRegion+".priority = '"+req.params.priority+"'";
        }
        else if(req.params.priority == '2')
        {
          cond = cond +"and questions_"+searchRegion+".priority = '"+req.params.priority+"'";
        }
        else if(req.params.priority == '0')
        {
          cond = cond 
        }
		
        
        console.log(cond);
        ds1.connector.query('SELECT COUNT(a.cnt) as count FROM ( SELECT COUNT(id) AS cnt FROM questions_'+searchRegion+' '+cond+' GROUP BY questionMasterId) AS a', function (err, questionCount)	
        {	
          if(err)	
          {	
			      console.log(err);
            //////console.log(err);
          }	
          else	
          {	
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
        if(req.session.adminUserType ==2)
        {
            getAllCountryLimit(req.session.region).then(function(country)
            {
            callback(null, value,count,category,package,country);
            })
            .catch(function(err)
            {
            //////console.log(err);
            callback(err);
            });
        }
        else
        {
          getAllCountry(0).then(function(country)
            {
            callback(null, value,count,category,package,country);
            })
            .catch(function(err)
            {
            //////console.log(err);
            callback(err);
            });
        }

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
        //////console.log(finalQuestion);
        cb(null,{questionsData:finalQuestion,count:questionCount[0].count,
          category:category,package:package,countries:country,age:age});	
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
        ////consolelog("cond=========================",cond)

        ds1.connector.query('SELECT questions.id,questions.time_Allowed,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionMasterId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id   '+cond+' GROUP BY questionMasterId ORDER BY questionMasterId DESC LIMIT '+skipV+',100', function (err, data)
        {
          if(err)
          {
            ////consolelog(err);
          }
          else
          {
            //////consolelog(data);
              for(let i=0;i<data.length;i++)
              {
                let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,question:data[i].question,answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionMasterId:data[i].questionMasterId,timeAllowed:data.time_Allowed,hint:data.hint}

                finalQuestion.push(question);
               }
               //////consolelog(2);
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

            ////consolelog(question.questionMasterId);
            ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionMasterId ='+question.questionMasterId+'  GROUP BY age_id', function (err, ageData)
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
            ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id WHERE questionMasterId ='+questionAge.questionMasterId+'  GROUP BY region', function (err, countryData)
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
                  //////consolelog(4,questionAge);
                  callbackWater(null, questionAge);
                }
                else
                {
                  //////////////consolelog(question)
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

        ds1.connector.query('SELECT COUNT(a.cnt) as count FROM ( SELECT COUNT(id) AS cnt FROM questions '+cond+' GROUP BY questionMasterId) AS a', function (err, questionCount)
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
    ////consolelog(finalQuestion);
    cb(null,{questionsData:finalQuestion,count:questionCount[0].count,category:category,package:package});
  });
  }


  /* Get Ajax */


       methods.getAjaxQuestions1 = function(req,res,cb)
  {
    //////console.log("hit here")
    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    let finalQuestion = [];
    //////console.log("question",req.body);
    countryModel.findOne({where:{id:req.body.region}},function(err,countryData)
    {
      //console
      async.waterfall([
      function(callbackWater) {
       	let cond="",regionC="",query ="",pack='',region="";
        //////console.log(req.session)
        if(parseInt(req.session.adminUserType) == 2)
        {
          regionC = " and region IN ("+req.session.region+")";
        }

        //////console.log("------------------------------",regionC)
        if(req.body.page > 0)	
        {	
          skipV = req.body.page*40;	
        }	
        else	
        {	
          skipV = 0;	
        }
        //////console.log(req.body);
	
        if(req.body.type == 0)
        {
        	if(req.body.package > 0)
        	{
          		pack = " and pack_Id ="+req.body.package+""
        	}
	      }


        if(req.body.region != 0)
        {
          region = " and region ="+req.body.region+"";
          
        }



        
        cond = "where (question LIKE '%"+req.body.quest+"%' OR answer1 LIKE '%"+req.body.quest+"%' OR answer2 LIKE '%"+req.body.quest+"%' OR answer3 LIKE '%"+req.body.quest+"%' OR answer4 LIKE '%"+req.body.quest+"%') and questions_"+countryData.language+".status="+req.body.type+" "+regionC+"  "+pack+"  ";
       
        //////console.log(cond);

        if(req.body.type == 0)
        {
          query = 'SELECT questions_'+countryData.language+'.priority,questions_'+countryData.language+'.status,questions_'+countryData.language+'.fileType,questions_'+countryData.language+'.time_Allowed,questions_'+countryData.language+'.questionState,questions_'+countryData.language+'.id,questions_'+countryData.language+'.questionActiveStatus,questions_'+countryData.language+'.category_id,questions_'+countryData.language+'.sub_category_id,questions_'+countryData.language+'.age_id,questions_'+countryData.language+'.time_Allowed,questions_'+countryData.language+'.region,questions_'+countryData.language+'.question,questions_'+countryData.language+'.answer1,questions_'+countryData.language+'.answer2,questions_'+countryData.language+'.answer3,questions_'+countryData.language+'.answer4,questions_'+countryData.language+'.hint,questions_'+countryData.language+'.correct_Answer,questions_'+countryData.language+'.image_URL,questions_'+countryData.language+'.sound_URL,questions_'+countryData.language+'.video_URL,questions_'+countryData.language+'.fileType,questions_'+countryData.language+'.pack_ID,questions_'+countryData.language+'.questionMasterId,questions_'+countryData.language+'.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age,question_packages.packageName, COUNT(questions_'+countryData.language+'.id) AS multiple FROM questions_'+countryData.language+' INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id  INNER JOIN question_packages ON pack_ID = question_packages.id '+cond+' GROUP BY questionMasterId ORDER BY questionMasterId DESC   LIMIT '+skipV+',40'
        }
        else
        {
          query = 'SELECT questions_'+countryData.language+'.priority,questions_'+countryData.language+'.status,questions_'+countryData.language+'.fileType,questions_'+countryData.language+'.time_Allowed,questions_'+countryData.language+'.questionState,questions_'+countryData.language+'.id,questions_'+countryData.language+'.questionActiveStatus,questions_'+countryData.language+'.category_id,questions_'+countryData.language+'.sub_category_id,questions_'+countryData.language+'.age_id,questions_'+countryData.language+'.time_Allowed,questions_'+countryData.language+'.region,questions_'+countryData.language+'.question,questions_'+countryData.language+'.answer1,questions_'+countryData.language+'.answer2,questions_'+countryData.language+'.answer3,questions_'+countryData.language+'.answer4,questions_'+countryData.language+'.hint,questions_'+countryData.language+'.correct_Answer,questions_'+countryData.language+'.image_URL,questions_'+countryData.language+'.sound_URL,questions_'+countryData.language+'.video_URL,questions_'+countryData.language+'.fileType,questions_'+countryData.language+'.pack_ID,questions_'+countryData.language+'.questionMasterId,questions_'+countryData.language+'.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions_'+countryData.language+'.id) AS multiple FROM questions_'+countryData.language+' INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id '+cond+' GROUP BY questionMasterId ORDER BY questionMasterId DESC   LIMIT '+skipV+',40'
        }
        
        ////////console.log()
        
        
        //////console.log(query);
        
        
        ds1.connector.query(query, function (err, data)
        {
          if(err)
          {
            //////console.log(err);
          }
          else
          {
              for(let i=0;i<data.length;i++)
              {
                let question = { totalQuestions:0,page:req.body.page,id:data[i].id,category:data[i].category,
                    subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,
                    age:data[i].age_id,country:data[i].region,image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL
                    ,questionActiveStatus:data[i].questionActiveStatus,question:data[i].question.toString()
                    ,answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4
                    ,correct_Answer:data[i].correct_Answer,created:data[i].created,questionMasterId:data[i].questionMasterId
                    ,questionState:data[i].questionState,timeAllowed:data[i].time_Allowed,hint:data[i].hint
                    ,fileType:data[i].fileType,countryCreated:data[i].countryCreated,priority:data[i].priority}

                finalQuestion.push(question);
               }
               ////////console.log(finalQuestion);
              callbackWater(null,finalQuestion);

          }
        })
      },
      // function(questionData, callbackWater)
      // {

      //   if(questionData.length > 0)
      //   {
      //     let x=0;id=0;
      //     async.eachSeries(questionData, function(question, callback)
      //     {

      //       //////consolelog(question.questionMasterId);
      //       ds1.connector.query('SELECT * FROM questions_'+countryData.language+' INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionMasterId ='+question.questionMasterId+'  GROUP BY age_id', function (err, ageData)
      //       {
      //         if(err)
      //         {
      //           callbackwater(err);
      //         }
      //         else
      //         {
      //           for(let j=0;j<ageData.length;j++)
      //           {
      //             question.age.push(ageData[j].age);
      //           }
      //           x++;

      //           if(questionData.length ==  x)
      //           {
      //             //////consolelog(3);
      //             callbackWater(null, question);
      //           }
      //           else
      //           {
      //             callback()
      //           }
      //         }
      //       })
      //     })
      //   }
      //   else
      //   {
      //     callbackWater(null, []);
      //   }
      // },
      // function(questionAgeData, callbackWater)
      // {
      //   if(finalQuestion.length > 0)
      //   {
      //     let x=0;id=0;
      //     async.eachSeries(finalQuestion, function(questionAge, callback)
      //     {
      //       ds1.connector.query('SELECT * FROM questions_'+countryData.language+' INNER JOIN countries ON region = countries.id WHERE questionMasterId ='+questionAge.questionMasterId+'  GROUP BY region', function (err, countryData)
      //       {
      //         if(err)
      //         {
      //           callbackwater(err);
      //         }
      //         else
      //         {
      //           for(let j=0;j<countryData.length;j++)
      //           {
      //             questionAge.country.push(countryData[j].name);
      //           }
      //           x++;

      //           if(finalQuestion.length ==  x)
      //           {
      //             //////consolelog(4,questionAge);
      //             callbackWater(null, questionAge);
      //           }
      //           else
      //           {
      //             //////////////consolelog(question)
      //             callback()
      //           }
      //         }
      //       })
      //     })
      //   }
      //   else
      //   {
      //     callbackWater(null, []);
      //   }
      // },
      function(questionAgeData, callbackWater)
      {
        let cond="",regionC="",query ="",pack="";

        if(req.session.adminUserType == 2)
        {
          regionC = " and region IN ("+req.session.region+")";
        }


        if(req.body.package > 0)
        {
          pack = " and pack_Id ="+req.body.package+""
        }
        
        cond = "where (question LIKE '%"+req.body.quest+"%' OR answer1 LIKE '%"+req.body.quest+"%' OR answer2 LIKE '%"+req.body.quest+"%' OR answer3 LIKE '%"+req.body.quest+"%' OR answer4 LIKE '%"+req.body.quest+"%') and questions_"+countryData.language+".status="+req.body.type+" "+regionC+" "+pack+" ";
        if(req.body.type == 0)
        {
          query = 'SELECT COUNT(DISTINCT(questionMasterId)) as countINfo from questions_'+countryData.language+' '+cond+' '
        }
        else
        {
          query = 'SELECT COUNT(DISTINCT(questionMasterId)) as countINfo from questions_'+countryData.language+' '+cond+' '
        }
        
        
        
        ////////console.log("query",query)
        
        
        ds1.connector.query(query, function (err, countInfo)
        {
          if(err)
          {
            //////console.log(err);
          }
          else
          {
            ////////console.log("<><>?",countInfo.countINfo);
            ////////console.log("<><>?",countInfo[0].countINfo);
            if(finalQuestion.length>0)
            {
              //////console.log('count problem ================>',countInfo[0].countINfo)
              finalQuestion[0].totalQuestions=countInfo[0].countINfo;
            }
            
              
              callbackWater(null,finalQuestion);

          }
        })
      }
    ], function (err,value)
    {
      userAgeModel.find({},function(err,ages)
      {
        countryModel.find({},function(err,regions)
        { 
          cb(null,{questionsData:finalQuestion,regions:regions,age:ages});
        })
      })
      
    });
  })
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
        ///////consolelog("cond",cond);

        ds1.connector.query('SELECT questions.id,questions.questionActiveStatus,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionMasterId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id   '+cond+' GROUP BY questionMasterId ORDER BY questionMasterId DESC', function (err, data)
        {
          if(err)
          {
            ////////console.log(err);
          }
          else
          {
              for(let i=0;i<data.length;i++)
              {
                let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,questionActiveStatus:data[i].questionActiveStatus.toString(),question:data[i].question.toString(),answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionMasterId:data[i].questionMasterId}

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

            //////consolelog(question.questionMasterId);
            ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionMasterId ='+question.questionMasterId+'  GROUP BY age_id', function (err, ageData)
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
                  //////consolelog(3);
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
            ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id WHERE questionMasterId ='+questionAge.questionMasterId+'  GROUP BY region', function (err, countryData)
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
                  //////consolelog(4,questionAge);
                  callbackWater(null, questionAge);
                }
                else
                {
                  //////////////consolelog(question)
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
    //////consolelog(value);
    
    cb(null,{questionsData:finalQuestion});
  });
  }


  methods.getAjaxFreeplayQuestions1 = function(req,res,cb)
  {
    //////consolelog("Hiiiiii");
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


        ds1.connector.query('SELECT questions.id,questions.category_id,questions.sub_category_id,questions.age_id,questions.time_Allowed,questions.region,questions.question,questions.answer1,questions.answer2,questions.answer3,questions.answer4,questions.hint,questions.correct_Answer,questions.image_URL,questions.sound_URL,questions.video_URL,questions.fileType,questions.pack_ID,questions.questionMasterId,questions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(questions.id) AS multiple FROM questions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON region = countries.id INNER JOIN age_categories ON age_id = age_categories.id '+cond+' GROUP BY questionMasterId ORDER BY questionMasterId DESC', function (err, data)
        {
          if(err)
          {
            ////consolelog(err);
          }
          else
          {
            ////consolelog(data);
              for(let i=0;i<data.length;i++)
              {
                let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,question:data[i].question.toString(),answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionMasterId:data[i].questionMasterId}

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

            ////consolelog(question.questionMasterId);
            ds1.connector.query('SELECT * FROM questions INNER JOIN age_categories ON age_id = age_categories.id WHERE questionMasterId ='+question.questionMasterId+'  GROUP BY age_id', function (err, ageData)
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
            ds1.connector.query('SELECT * FROM questions INNER JOIN countries ON region = countries.id WHERE questionMasterId ='+questionAge.questionMasterId+'  GROUP BY region', function (err, countryData)
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
                  //////consolelog(4,questionAge);
                  callbackWater(null, questionAge);
                }
                else
                {
                  //////////////consolelog(question)
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


  methods.buyPack = function(req,res,cb)
  {
    //////consolelog("Hiiiiii");
    //////consolelog(req.body);
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
    //////console.log("Hiiiiii00000000000000000000000000000000000");
    //////console.log(req.body);
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

    //////console.log("===================",cond);

    ds1.connector.query('SELECT * from user '+cond+' LIMIT 100', function (err, data)
    {
        if(err)
        {
          ////////console.log(err);
          cb(null,{info:null})
        }
        else
        {
          cb(null,{info:data})
        }
    })
  }


 methods.getRedeemCodeValue = function(req,res,cb)
  {
    let user =  app.models.user;
    let ds1 = user.dataSource;


    let redeem_codes =  app.models.redeem_codes;
    let ds = redeem_codes.dataSource;
    
    let cond='';
    
   cond = "where (redeem_code LIKE '%"+req.body.code+"%' ) ";
    

    ds1.connector.query('SELECT * from redeem_codes '+cond+' LIMIT 100', function (err, data)
    {
        if(err)
        {
          //////console.log(err);
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
              //////////////consolelog(err);
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
          // if(req.session.adminUserType ==2)
		      // {
			
			  
	        //   getAllCountryLimit(req.session.region).then(function(country)
		      //   {
          //     callback(null,category,package,age,country);
          //   })
          //   .catch(function(err)
          //   {
          //     //////////console.log(err);
          //     callback(err);
          //   });

          // }
          // else
          // {
            getAllCountry(0).then(function(country)
              {
              callback(null,category,package,age,country);
              })
              .catch(function(err)
              {
              //////////console.log(err);
              callback(err);
              });
          //}
        },
        function(category,package,age,country, callback)
        {
          getEditQuestion(req.params,req.session).then(function(question)
          {
            let checkQuestonModel = app.models.check_questions;
            if(req.params.checkQuestionId != 0)
            {
              checkQuestonModel.deleteAll({id:req.params.checkQuestionId},function(err,chQ){
                callback(null,category,package,age,country,question);
              })
            }
            else
            {
              callback(null,category,package,age,country,question);
            }          })
          .catch(function(err)
          {
            //////console.log(err);
            callback(err);
          });
        },
        function(category,package,age,country,question, callback)
        {
          if(req.params.id != 0)
          {
            getSubCategoryData(question.category_id).then(function(subCategory)
            {
              //////console.log("subca",subCategory)
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
        ////consolelog("question,",question)
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
        //  //console.log("fields=======>>>>>>",fields)
        //  //console.log("files =======>>>>>>",files)
         if(fields.id == 0)
         {
            addQuestion(req.session,fields,files).then(function(question)
            {
              cb(null,{status:"success",message:"Successfully Saved"});
            })
            .catch(function(err)
            {
              cb(null,{status:"fail",message:"Error"+err});
            });
        }
        else
        {
          if(fields.id)
          {
            ////console.log("Enter ====================================2",fields)
            // //console.log("Enter ====================================2",files)
            // userQuestionModel.deleteAll({questionMasterId:fields.id},function(err,data)
            // {
              editQuestion(req.session,fields,files).then(function(question)
              {
                cb(null,{status:"success",message:"Successfully Saved"});
              })
              .catch(function(err)
              {
                cb(null,{status:"fail",message:"Error"+err});
              });
           //})
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
            ////////////consolelog(err);
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
         ////consolelog(fields);
          uploadCSVFile(fields,files).then(function(question)
          {
            cb(null,{status:"success",message:"Successfully Saved"});
          })
          .catch(function(err)
          {
            ////////////consolelog(err);
            cb(null,{status:"fail",message:"Error :  "+err});
          });
      });
    }
  }


methods.setReddemCodeCSV = function(req,res,cb)
  {
    if (req.url == '/addUploadRedeemCode')
    {
       var form = new formidable.IncomingForm();
       form.parse(req, function (err, fields, files)
       {
         //////console.log(fields);
          uploadRedeemCSVFile(fields,files).then(function(question)
          {
            cb(null,{status:"success",message:"Successfully Saved"});
          })
          .catch(function(err)
          {
			  //////console.log("00000ppppp",err)
            ////////////consolelog(err);
            cb(null,{status:"fail",message:"Error :  "+err});
          });
      });
    }
  }


    methods.getNewQuestions = function(req,res,cb)
  {
    ////////console.log("params=====>>>>",req.params);
    let session = req.session.regionCode;
    let obj;
    // if(req.session.regionCode ==  'UK')
    // {
      let cond="";
      if(req.params.type==1)
      {
        //cond = "where licence LIKE '%"+req.body.licenceName+"%'";
        cond = "where "+[session]+"=1 and "+[session]+"Status=0";
     // obj ={[session]:1,[session+"Status"]:0,questionStatus:req.params.type,questionStatus:1}
      }
      else
      {
        cond = "where "+[session]+"=2 and "+[session]+"Status=1";
        //obj ={[session]:2,[session+"Status"]:1}
      }
    

    let skipV;
    if(req.query.filter)
    {
      skipV = req.query.filter.skip;
    }
    else
    {
      skipV = 0;
    }
  ////////console.log(cond)
  //console.log("nnnnnn",req.session)
  
    let questions_multilang_status_temp =  app.models.questions_multilang_status_temp;
    let ds1 = questions_multilang_status_temp.dataSource;
    //console.log('SELECT * FROM questions_multilang_status_temp left JOIN   questions_'+req.session.regionCode+' ON question_id = questions_'+req.session.regionCode+'.questionMasterId '+cond+'');
    if(req.session.adminUserType == 1)
    {
	//console.log("'SELECT * FROM questions_multilang_status_temp where UKStatus=0 )
      ds1.connector.query('SELECT * FROM questions_multilang_status_temp where UKStatus=0 limit 10' , function (err, data)
      {
        //console.log("allQuestions",data);
        if(data.length > 0)
        {
          let x=0;let questionarry = []
          async.eachSeries(data, function(field, cback)
          {
            x++
            if(x ==  data.length)
            {

              ds1.connector.query('SELECT * FROM questions_multilang_status_temp left JOIN  questions_'+field.createdBy+' ON question_id = questions_'+field.createdBy+'.questionMasterId where  questions_'+field.createdBy+'.questionMasterId = '+field.question_id+'' , function (err, data1)
              {
                if(err)
                {
                  console.log(err);
                  cb(null,{status:0,message:"err"})
                }
                else
                {
		  		
		//console.log("data1data1data1",data1)
                  questionarry.push(data1[0]);
                  console.log(questionarry);
                  userCategoriesModel.find({},function(err,category)
                  {
                    questionsMultilangStatusTempModel.count({UKStatus:0},function(err,count)
                    {
                      
                      cb(null,{status:1,message:"sucess",info:questionarry,category:category,questionCount:count})
                    })
                    
                  })
                  //cback()
                }
              })
            }
            else
            {
              ds1.connector.query('SELECT * FROM questions_multilang_status_temp left JOIN  questions_'+field.createdBy+' ON question_id = questions_'+field.createdBy+'.questionMasterId where  questions_'+field.createdBy+'.questionMasterId = '+field.question_id+'' , function (err, data1)
              {
                if(err)
                {
                  console.log(err);
                  cb(null,{status:0,message:"err"})
                }
                else
                {
                  questionarry.push(data1[0]);
                  cback()
                }
              })
            }
      
          })
        }
        else
        {
		cb(null,{status:1,message:"sucess",info:[],category:[],questionCount:0})
        }
      })
      
    }
    else
    {
      ds1.connector.query('SELECT * FROM questions_multilang_status_temp INNER JOIN  questions_'+req.session.regionCode+' ON question_id = questions_'+req.session.regionCode+'.questionMasterId   '+cond+'  ' , function (err, data)
      {
        if(err)
        {
          //////////console.log("datadatadata",err)
          cb(null,{status:0,message:"err"})
        }
        else
        {

          //////////////console.log(data);
          userCategoriesModel.find({},function(err,category)
          {
            questionsMultilangStatusTempModel.count(obj,function(err,count)
            {
              
              cb(null,{status:1,message:"sucess",info:data,category:category,questionCount:count})
            })
            
          })
          
        }
      })
    }
  }

/** update Temp Question  */

methods.updateIgnoreQuestion = function(req,res,cb)
{
  ////////console.log("===========33333333333333333333333============");
  let session = req.session.regionCode;
  ////////////console.log(obj)
  questionsMultilangStatusTempModel.findOne({where:{id:parseInt(req.params.id)}},function(err,data){
    if(err)
    {
      ////////console.log("=======================",err);
      cb(null,{status:0,message:"err"})
    }
    else
    {
      
      if(data)
      {
        // if(req.params.type == 2)
        // { 
          ////////console.log("================11111111111111111111111===============")       
          let obj ={[session]:1,[session+"Status"]:1}
          //////////console.log(obj)
          questionsMultilangStatusTempModel.updateAll({id:parseInt(req.params.id)},obj,function(err,update){
            if(err)
            {
              cb(null,{status:0})
            }
            else
            {
              ////////console.log("update",update)
              cb(null,{status:1})
            }
          })
        // }
        // else
        // {
        //   ////////console.log("===============================")
        //   questionsMultilangStatusTempModel.deleteAll({id:parseInt(req.params.id)},function(err,update){
        //     if(err)
        //     {
        //       ////////console.log(err)
        //       cb(null,{status:0})
        //     }
        //     else
        //     {
        //       ////////console.log("update",update)
        //       cb(null,{status:1})
        //     }
        //   })
        // } 
        
      }
      else
      {
        cb(null,{status:0})
      }
      
      
    }
  })
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
      //////////////consolelog(err);
      cb(null,{status:"fail",questionData:null});
    });
  }

  methods.getDetailFreeplayQuestion = function(req,res,cb)
  {
    ////consolelog("get details method")
    getSpecificFreeplayQuestion(req.params).then(function(value)
    {
      ////consolelog("got detials successfully")
      cb(null,{status:"success",questionData:value});
    })
    .catch(function(err)
    {
      //////////////consolelog(err);
      cb(null,{status:"fail",questionData:null});
    });
  }

  /* ===================== Delete Questions ============ */

  methods.deleteQuestions = function(req,res,cb)
  {
    //console.log(req.params)
    deleteQuest(req.params.id,req.params.type,req.params.region,req.session).then(function(value)
    {
      cb(null,{status:"sucess",message:"successfully Deleted"});
    })
    .catch(function(err)
    {
      cb(null,{status:"fail",message:"Error while deleting"});
    });
  }

  /* ===================== Get category ============ */


  methods.getNewCategories = function(req,res,cb)
  {
    let categories =  app.models.categories;
    let ds1 = categories.dataSource;
    ds1.connector.query('SELECT * FROM region_categories where country_id = '+req.params.id+'', function (err, value)	
    {
      console.log(err);
      getSpecificCategory(req.params).then(function(specificCategoryData)
      {
        getAllCountry(0).then(function(country)
        {
          let categories =  app.models.categories;
          let ds1 = categories.dataSource;
          ds1.connector.query('SELECT * FROM region_categories group by tag', function (err, gpC)	
          {
            
            cb(null,{status:"sucess",categoryData:value,specificData:specificCategoryData,countries:country,grp:gpC});
          })
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
  }

 /* ===================== Get category ============ */

  methods.getCategories = function(req,res,cb)
  {
    let categories =  app.models.categories;
    let ds1 = categories.dataSource;
    ds1.connector.query('SELECT * FROM categories ', function (err, value)	
    {
      getSpecificCategory(req.params).then(function(specificCategoryData)
      {
        getAllCountry(0).then(function(country)
        {
          let categories =  app.models.categories;
          let ds1 = categories.dataSource;
          ds1.connector.query('SELECT * FROM region_categories group by tag', function (err, gpC)	
          {
            
            cb(null,{status:"sucess",categoryData:value,specificData:specificCategoryData,countries:country,grp:gpC});
          })
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
  }


  /* ===================== Get category ============ */

  methods.getRCategories = function(req,res,cb)
  {
    let categories =  app.models.categories;
    let ds1 = categories.dataSource;
    ds1.connector.query('SELECT * FROM region_categories where country_id= '+req.params.id+'', function (err, value)	
    {
      getSpecificCategory(req.params).then(function(specificCategoryData)
      {
        getAllCountry(0).then(function(country)
        {
          let categories =  app.models.categories;
          let ds1 = categories.dataSource;
          ds1.connector.query('SELECT * FROM region_categories where country_id= '+req.params.id+' group by tag', function (err, gpC)	
          {
            let tagModel =  app.models.tags;
            tagModel.find({where:{region:req.params.id}},function(err,tags){

              cb(null,{status:"sucess",tags:tags,categoryData:value,specificData:specificCategoryData,countries:country,grp:gpC});
            })
            
          })
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
  }



  methods.getEditCategories = function(req,res,cb)
  {
    let categories =  app.models.categories;
    let ds1 = categories.dataSource;
    categories.findOne({include:"region_categories",where:{id:req.params.id}}, function (err, value)	
    {
      console.log(err);
      console.log(value);
        getAllCountry(0).then(function(country)
        {
          let categories =  app.models.categories;
          let ds1 = categories.dataSource;
          ds1.connector.query('SELECT * FROM categories group by tag', function (err, gpC)	
          {
            
            cb(null,{status:"sucess",categoryData:value,countries:country,grp:gpC});
          })
        })
        .catch(function(err)
        {
          callback(err);
        });
        
      
    })
  }





  /* ===================== Get category ============ */

  methods.getCategoriesOnly = function(req,res,cb)
  {
    let categories =  app.models.categories;
    let ds1 = categories.dataSource;
     console.log("req.params",req.params);
    ds1.connector.query('SELECT * FROM region_categories WHERE tag like "%'+req.params.name+'%"', function (err, data)	
    {
      console.log("datadata",data)
      ds1.connector.query('SELECT * FROM region_categories WHERE country_id = '+data[0].country_id+' and (tag NOT LIKE "%'+req.params.name+'%" or  tag is null) ', function (err, value)	
      {
        //.log("=================",value)  
        //.log("=================",data)  
        cb(null,{status:"sucess",categoryData:value,selectedCategories:data,tag_name:req.params.name});
      })
      
    })
    
  }

 /* ===================== Edit Category ===================== */

  methods.editCategoryDt = function(req,res,cb)
  {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files)
    {
      //////console.log('ssssssss',fields);

      if(fields.isPackage)
      {
        //////console.log("null")
      }
      else
      {
        //////console.log("null2")
      }

      console.log("-------------------------------------,",fields);

      if(fields.id == 0)
      {
        console.log("nnnnnnnnnnnnnnnnnnnnnnnnnn")
        addCategoryData(fields,files).then(function(specificCategoryData)
        {
          cb(null,{status:"sucess"});
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
        //////////////consolelog(err);
        cb(null,{status:"fail",message:"Fail to get data from country table",data:null})
      }
      else
      {
        ////////consolelog("asdjnasdkjanskjdnaksjdnakjsnd");
        cb(null,{status:"success",message:"Successfully get data",subCategoryDate:value,subCategoryCount:count,specificData:specificData,category:category})
      }
    });
  }

  /* ====================== Get Copy Questions ======================*/

  methods.copyQuestionData = function(req,res,cb)
  {
    ////console.log("req.session",req.session);
    if(req.session.adminUserType == 1)
    {
      let region =  req.params.region.split(",");
      let i=0;
      questionsSettingModel.findOne({},function(err,settingNumber){

      
      async.eachSeries(region, function(data, cback)
      {
        ////console.log("enter==============",data);
        countryModel.findOne({where:{id:data}},function(err,countryInfo)
        {
          ////console.log(err);
        let userQuestionModel = app.models["questions_"+countryInfo.language];
          i++;
          ////console.log("eeeeeeeeeeeeeee",req.params.id);
          userQuestionModel.findOne({where:{questionMasterId:req.params.id}},function(err,questionData)
          {
            if(err)
            {
              ////console.log("eeeeeeeeeeeeeee",err);
              callback(err);
            }
            else
            {
              ////console.log(questionData)
              let obj = {
                category_id:questionData.category_id,
                sub_category_id:questionData.sub_category_id,
                age_id:questionData.age_id,
                time_Allowed:questionData.time_Allowed,
                region:questionData.region,
                question:questionData.question,
                answer1:questionData.answer1,
                answer2:questionData.answer2,
                answer3:questionData.answer3,
                answer4:questionData.answer4,
                hint:questionData.hint,
                correct_Answer:questionData.correct_Answer,
                pack_ID:questionData.pack_ID,
                status:questionData.status,
                created:new Date(),
                modified:new Date(),
                image_URL:questionData.image_URL,
                image_URL:questionData.image_URL,
                image_URL:questionData.image_URL,
                fileType:questionData.fileType,
                questionMasterId:settingNumber.question_number
              }
              //console.log(obj);

              ////consolelog("obj to send ", obj);
              userQuestionModel.create(obj,function(err,newCopy)
              {
                if(err)
                {
                  //console.log(err);
                  ////console.log(err);
                }
                else
                {
                  if(region.length == i)
                  {
                    


                    questionsSettingModel.updateAll({id:settingNumber.id},{question_number:settingNumber.question_number+1})
                    cb(null,{status:"success",message:"Successfully Copied Question"})
                    //callback(null, objDetail,questionToUpdate,settingNumber.question_number);
                  }
                  else
                  {
                    cback()
                  }
                  
                }
              })

            }
          })
        })
      })
    })
    }
    else
    {
      questionsSettingModel.findOne({},function(err,settingNumber){
      let userQuestionModel = app.models["questions_"+req.session.regionCode];
      
      async.waterfall([
        function(callback) {
          ////consolelog("Getting Question");
          if(req.params.id)
          {
            userQuestionModel.findOne({where:{questionMasterId:req.params.id}},function(err,questionData)
            {
              if(err)
              {
                callback(err);
              }
              else
              {
                ////consolelog("Got the Question ", questionData);
                callback(null, questionData);
              }
            })
          }
        },
        function(questionData, callback)
        {
          //console.log("questionData",questionData)
          //console.log("questionData",req.session)
          // let i=0;
          // let objDetail=0;
          // let questionToUpdate = [];
          // async.eachSeries(questionData, function(data, cback)
          // {
          //   ////////console.log("working on each ", questionData);

            let obj = {
                      category_id:questionData.category_id,
                      sub_category_id:questionData.sub_category_id,
                      age_id:questionData.age_id,
                      time_Allowed:questionData.time_Allowed,
                      region:req.session.region,
                      question:questionData.question,
                      answer1:questionData.answer1,
                      answer2:questionData.answer2,
                      answer3:questionData.answer3,
                      answer4:questionData.answer4,
                      hint:questionData.hint,
                      correct_Answer:questionData.correct_Answer,
                      pack_ID:questionData.pack_ID,
                      status:questionData.status,
                      image_URL:questionData.image_URL,
                      image_URL:questionData.image_URL,
                      image_URL:questionData.image_URL,
                      fileType:questionData.fileType,
                      created:new Date(),
                      modified:new Date(),
                      questionMasterId:settingNumber.question_number
                    }

            //console.log("obj",obj)


                    userQuestionModel.create(obj,function(err,newCopy)
                    {
                      if(err)
                      {
                        //console.log(err);
                      }
                      else
                      {
                        questionsSettingModel.updateAll({id:settingNumber.id},{question_number:settingNumber.question_number+1},function(err,settingNumber)
                        {
                          cb(null,{status:"success",message:"Successfully Copied Question"})
                        })
                      }
                    })

          //           ////consolelog("obj to send ", obj);
          //     userQuestionModel.create(obj,function(err,newCopy)
          //     {
          //       i++;
          //       questionToUpdate.push(newCopy.id);
          //       if( i ==  1)
          //       {
          //         ////consolelog("created successfully ",newCopy);
          //         objDetail =
          //             {
          //               id:newCopy.id,
          //               image:questionData[0].image_URL,
          //               sound:questionData[0].sound_URL,
          //               video:questionData[0].video_URL,
          //               fileType:0
          //             }
          //       }
          //       if(i == questionData.length)
          //       {
          //         questionsSettingModel.updateAll({id:settingNumber.id},{question_number:settingNumber.question_number+1})
          //         callback(null, objDetail,questionToUpdate,settingNumber.question_number);
          //       }
          //       else
          //       {
          //         cback();
          //       }
          //     })
          // })
          // ////consolelog(questionData[0].image_URL);
          //  var fs = require('fs');
          //  fs.createReadStream('client/'+questionData[0].image_URL).pipe(fs.createWriteStream('client/storage/test.png'));
        },
        function(obj,questionToUpdate,id, callback)
        {
          //console.log("obj=================================== ");
          //  var fs = require('fs');
          let randomSt = randomstring.generate(5);
          let saveUrl = '';
          let updateObj ={};
          if(obj.fileType == 0)
          {
            updateObj ={questionMasterId:obj.id,image_URL:obj.image,sound_URL:null,video_URL:null,fileType:obj.fileType}
          }
          if(obj.fileType == 1 || obj.fileType == 4 )
          {
            updateObj ={questionMasterId:obj.id,image_URL:obj.image,sound_URL:null,video_URL:null,fileType:obj.fileType}
          }
          else if(obj.fileType == 2)
          {
            updateObj ={questionMasterId:obj.id,image_URL:null,sound_URL:obj.sound,video_URL:null,fileType:obj.fileType}
          }
          else if(obj.fileType == 3)
          {
            updateObj ={questionMasterId:obj.id,image_URL:null,sound_URL:null,video_URL:obj.video,fileType:obj.fileType}
          }

          ////console.log("===========================Enter in image",updateObj)
          let region =  req.params.region.split(",");
          let n=0
          async.eachSeries(region, function(data, cback)
          {
            n++
            ////console.log("enter==============",data);
            countryModel.findOne({where:{id:data}},function(err,countryInfo)
            {
              ////console.log("=================Englis =============",data)
              let userQuestionModel = app.models["questions_"+countryInfo.language];
              userQuestionModel.updateAll({id:id},updateObj,function(errupdate){
                if(err)
                {
                  ////console.log("=================Englis =============",err)
                }
                else
                {
                  if(region.length == n)
                  {
                    callback(null,1);
                  }
                  else
                  {
                    cback()
                  }
                }
              });
            })
          })



          // for(let i=0;i<questionToUpdate.length;i++)
          // {
          //   userQuestionModel.updateAll({id:questionToUpdate[i]},updateObj);
          // }
         
        }
      ], function (err,value)
      {
        ////consolelog("helll");
        if(err)
        {
          cb(null,{status:"fail",message:"Fail to get data from country table"})
        }
        else
        {
          ////consolelog("111111");
          cb(null,{status:"success",message:"Successfully Copied Question"})
        }
      });
    })
    
    }
  }

  /* ====================== Set/Add/Edit Sub Category ======================*/

  methods.setSubCategory = function(req,res,cb)
  {
    //////consolelog(" ======= req body ================",req.body);
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
    console.log("req.body.category_id",req.body.category_id)
    getSubCategoryData(req.body.category_id).then(function(value)
    {
      console.log(value);
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
    ds1.connector.query('SELECT * FROM questions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionMasterId ='+req.body.id+'  GROUP BY age_id', function (err, data)
    {
      if(err)
      {
        ////////////consolelog(err);
      }
      else
      {
        //////////////consolelog(data)
        cb(null,{age:data})
      }

    })
  }

    /* Ajax Qyestion call*/

   methods.getMultipleQuestion = function(req,res,cb)
   {
     ////////////consolelog(req.body.id);
     let questions =  app.models.questions;
     let ds1 = questions.dataSource;
     ds1.connector.query('SELECT questions.id,questions.age_id,questions.region,questions.questionMasterId,countries.name,age_categories.age FROM questions INNER JOIN   age_categories ON age_id = age_categories.id INNER JOIN countries ON region = countries.id WHERE questionMasterId ='+req.body.id+'', function (err, data)
     {
       if(err)
       {
         ////////////consolelog(err);
       }
       else
       {
         ////////consolelog("data",data);
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
          ////consolelog(err);
          cb(null,{status:"fail",message:"Error while getting data"});
        }
        else
        {
          if (req.url == '/addMessage')
          {
             var form = new formidable.IncomingForm();
             form.parse(req, function (err, fields, files)
             {
               //////////console.log("------------File",files);
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
                              ////////console.log(err);
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
        ////////console.log(err);
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
         ////////console.log(err);
       }
       else
       {
         appVersionModel.updateAll({device:"iOS"},{gameVersion:req.body.iosVersion,heading:req.body.heading.trim(),message:req.body.message.trim()},function(err,data)
         {
           if(err)
           {
             ////////console.log(err);
           }
           else
           {

             appVersionModel.updateAll({device:"windows"},{gameVersion:req.body.windowVersion,heading:req.body.heading.trim(),message:req.body.message.trim()},function(err,data)
             {
               if(err)
               {
                 ////////console.log(err);
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
       ////////console.log(1)

     userModel.findOne({where:{licence_id:req.params.id}},function(err,data)
     {
        if(err)
        {
          cb(null,{status:"fail"})
        }
        else
        {
          ////////console.log(2)
          if(data)
          {
            ////////console.log(3)
              userChildsModel.deleteAll({user_id:parseInt(data.id)},function(err,userChildDelete)
              {
                  if(err)
                  {
                    ////////console.log(6)
                    cb(null,{status:"fail"})
                  }
                  else
                  {
                    ////////console.log(4)
                    userModel.deleteAll({id:parseInt(data.id)},function(err,userinfoDelete){
                      if(err)
                      {
                        cb(null,{status:"fail"})
                      }
                      else
                      {
                        ////////console.log(999)
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
     //////////console.log(req.params.id)
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
         //////////console.log(req.params.id)
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
      ////////console.log(req.body)
      let licence =  app.models.licences;
      let ds1 = licence.dataSource;
      let finalQuestion = [];

      let cond="";
      cond = "where licence LIKE '%"+req.body.licenceName+"%' and status="+req.body.statusType+"";

          ////consolelog("cond",cond);

      ds1.connector.query('SELECT * from licences '+cond+' limit 100', function (err, info)
          {
            if(err)
            {
              ////////console.log(err);
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
            //////////////consolelog(err);
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
        ////consolelog("question,",question)
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
                  ////////console.log(6)
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
                  ////////console.log(6)
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
      let regions = req.body.region.split(","),x=0;

      ////console.log("ddddddddddddddddddddddddddddddddddddddd")
      async.eachSeries(regions, function(countryID, callback)
      {
        ////console.log(countryID)
        x++
        countryModel.findOne({where:{id:countryID}},function(err,data){
        let userQuestionModel = app.models["questions_"+data.language];
      userQuestionModel.findOne({where:{questionMasterId:parseInt(req.body.id)}},function(err,data)
      {
         if(err)
         {
           cb(null,{status:"fail"})
         }
         else
         {
           if(data)
           {
            
            userQuestionModel.updateAll({questionMasterId:data.questionMasterId},{questionActiveStatus:req.body.type},function(err,updateInfo)
            {
              if(err)
              {
                if(regions.length== x)
                {
                  cb(null,{status:"fail"})
                }
                else
                {
                  callback()
                }
              }
              else
              {
                ////////console.log("jjjjjjjjjjj"+updateInfo);
                if(regions.length== x)
                {
                  cb(null,{status:"success"})
                }else
                {
                  callback()
                }
              }
            })
           }
           else
           {
             if(regions.length== x)
             {
              cb(null,{status:"fail"})
             }else
             {
              callback()
             }
           }
 
         }
      })
    })
  })
    
 
    }

    /* =================== Multiple update ==============  */

    methods.updateActiveInactiveQuestionMultiple = function(req,res, cb)
    {
      let idArray =  req.body.id.split(",")
      let x=0;
      async.eachSeries(idArray, function(value, callback)
      {
        
        userQuestionModel.findOne({where:{questionMasterId:parseInt(value)}},function(err,data)
        {
          if(err)
          {
            cb(null,{status:"fail"})
          }
          else
          {
            if(data)
            {
              
              ////////console.log(data);
              userQuestionModel.updateAll({questionMasterId:data.questionMasterId},{questionActiveStatus:req.body.type},function(err,updateInfo)
              {
                if(err)
                {
                  if(idArray.length ==  x)
                  {
                    ////////console.log(2222);
                    //resolve(obj)
                  }
                  else
                  {
                    
                  }
                }
                else
                {

                  ////////console.log("idArray.length",idArray.length)
                  ////////console.log("idArray.lengthxxxxxxxxxxx",x)
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
                ////////console.log(2222);
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
      ////console.log(req.body);
      let idArray =  req.body.id.split(",")
      let regions =  req.body.region.split(",")

      let x=0,y=0;

      async.eachSeries(regions, function(region, callback1)
      { 
        ////console.log(region)
        countryModel.findOne({where:{id:region}},function(err,countryLang){

          ////console.log(countryLang)
        let userQuestionModel = app.models["questions_"+countryLang.language];
        y++
        if(regions.length == y)
        {
          cb(null,{status:"success"});
        }
        else
        {
          async.eachSeries(idArray, function(value, callback)
          {
            userQuestionModel.findOne({where:{questionMasterId:parseInt(value)}},function(err,data)
            {
              if(err)
              {
                cb(null,{status:"fail"})
              }
              else
              {
                if(data)
                {
                  userQuesuserQuestionModeltionModel.deleteAll({questionMasterId:data.questionMasterId},function(err,updateInfo)
                  {
                    if(err)
                    {
                      if(idArray.length ==  x)
                      {
                        callback1()
                        //resolve(obj)
                      }
                      else
                      {
                        callback()
                      }
                    }
                    else
                    {
                      ////////console.log("idArray.length",idArray.length)
                      ////////console.log("idArray.lengthxxxxxxxxxxx",x)
                      x++;
                      if(idArray.length ==  x)
                      {
                        callback1()
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
                    callback1()
                    //cb(null,{status:"success"});
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
      })
      })  
 
    }



    /**/

       /**/

    methods.addTagIndexD = function(req,res, cb)
    {
        let list = JSON.parse(req.body.listVal);
        let x=0;
        console.log("list>>>>>",req.body);

        let arr2 =[];
          async.eachSeries(list, function(fields, callback)
          {
            x++
            regionCategoryModel.findOne({where:{id:fields.name}},function(err,tagInfo)
            {
              if(err)
              {

              }
              else
              {
                arr2.push(tagInfo.category_id)
                if(tagInfo)
                {
                  let tags
                  if(tagInfo.tag != null && tagInfo.tag != '')
                  {
                    tags = tagInfo.tag+","+req.body.id 
                  }
                  else
                  {
                    tags = req.body.id 
                  }
                  regionCategoryModel.updateAll({id:fields.name},{tag:tags},function(err,update){
              
                    if(x == list.length)
                    {
                      ////.log("ttag><><>",tag)
                      let n=0;
                      let tagsModels = app.models.tags;
                      let arr  = [];
                      for(let i=0;i<list.length;i++)
                      {
                        arr.push(list[i].name);
                      }
                   
                      tagsModels.create({
                        category_id:arr2,tagIndex:1,tagName:req.body.id,region:req.body.region
                        ,order:req.body.order,status:1,created:new Date(),
                        modified:new Date()
                      },function(err,createTag)
                      {
                        console.log(err);
                        cb(null,{status:1})
                      })
                      
                    }
                    else
                    {
                      callback()
                    } 
                  })
                }
                else
                {
                  regionCategoryModel.updateAll({id:fields.name},{tag:req.body.id},function(err,update){
              
                    if(x == list.length)
                    {
                      let n=0;
                      let tagsModels = app.models.tags;
                      let arr  = [];
                      for(let i=0;i<list.length;i++)
                      {
                        arr.push(list[i].name);
                      }
                      console.log(arr);
                      tagsModels.create({
                        category_id:arr2,tagIndex:1,tagName:req.body.id,region:req.body.region
                        ,order:req.body.order,status:1,created:new Date(),
                        modified:new Date()
                      },function(err,createTag)
                      {
                        console.log(err);
                        cb(null,{status:1})
                      })
                    }
                    else
                    {
                      callback()
                    } 
                  })
                }
              }
            })
      })
    }

    methods.updateTagIndex = function(req,res, cb)
    {
        let list = JSON.parse(req.body.listVal);
        let x=0;
        console.log("list>>>>>",req.body);

        //.log(req.params)
        let categories =  app.models.categories;
        let ds1 = categories.dataSource;
        ////.log('SELECT * FROM categories WHERE tag != "'+req.params.name+'" ');
        async.waterfall([
          function(callback) {
            ds1.connector.query('SELECT GROUP_CONCAT(id) as id FROM region_categories WHERE tag like "%'+req.body.id+'%"', function (err, Catedata)	
            {
                console.log("Catedata",Catedata[0].id)

                let allCat =  Catedata[0].id.split(',');
                let i =0;
                let arr2 =[]
                async.eachSeries(allCat, function(allCateg, callbackn)
                { 
                    i++
                    if(allCat.length == i)
                    {
                      regionCategoryModel.findOne({where:{id:allCateg}},function(err,tagInfoN)
                      {
                        let tags = tagInfoN.tag.split(',');
                        const index = tags.indexOf(req.body.id);
                        if (index > -1) { // only splice array when item is found
                          tags.splice(index, 1); // 2nd parameter means remove one item only
                        }
                        console.log("tags",tags)

                        regionCategoryModel.updateAll({id:allCateg},{tag:tags.toString()},function(err,update){

                          callback(null, 1);
                          })
                      })
                      
                    } 
                    else
                    {
                      regionCategoryModel.findOne({where:{id:allCateg}},function(err,tagInfoN)
                      {
                        let tags = tagInfoN.tag.split(',');
                        const index = tags.indexOf(req.body.id);
                        if (index > -1) { // only splice array when item is found
                          tags.splice(index, 1); // 2nd parameter means remove one item only
                        }
                        console.log("tags",tags)

                        regionCategoryModel.updateAll({id:allCateg},{tag:tags.toString()},function(err,update){

                            callbackn()
                          })
                      })                        
                    }
                })


              
            })
      
          },function(gameInfo, callback)
          {
            let arr2=[];
            async.eachSeries(list, function(fields, callback)
            {
              x++
              regionCategoryModel.findOne({where:{id:fields.name}},function(err,tagInfo)
              {
                if(err)
                {
                }
                else
                {
                  arr2.push(tagInfo.category_id)
                  if(tagInfo)
                  {
                  let tags
                  if(tagInfo.tag != null && tagInfo.tag != '')
                  {
                    tags = tagInfo.tag+","+req.body.id 
                  }
                  else
                  {
                    tags = req.body.id 
                  }
                    //let newTag = tagInfo.tag+','+req.body.id;
                      regionCategoryModel.updateAll({id:fields.name},{tag:tags },function(err,update){
                  
                          if(x == list.length)
                          {
                            let tagsModels = app.models.tags;
                          let arr  = [];
                          for(let i=0;i<list.length;i++)
                          {
                            arr.push(list[i].name);
                          }
                          console.log(".........................,,,,,,,,,,,,,,",req.body);
                          tagsModels.deleteAll({tagName:req.body.id,region:req.body.region,},function(err,deleted)
                          {
                            tagsModels.create({
                              category_id:arr2,tagIndex:1,tagName:req.body.id,region:req.body.region
                              ,order:req.body.order,status:1,created:new Date(),
                              modified:new Date()
                            },function(err,createTag)
                            {
                              cb(null,{status:1})
                            })
                          })
                        }
                        else
                        {
                          callback()
                        } 
                      })
                  }
                  else
                  {
                    regionCategoryModel.updateAll({id:fields.name},{tag:req.body.id},function(err,update){
                
                      if(x == list.length)
                      {
                        ////.log("ttag><><>",tag)
                        let tagsModels = app.models.tags;
                        let arr  = [];
                        for(let i=0;i<list.length;i++)
                        {
                          arr.push(list[i].name);
                        }
                        console.log(".........................,,,,,,,,,,,,,,",req.body);
                        tagsModels.create({
                          category_id:arr2,tagIndex:1,tagName:req.body.id,region:4
                          ,order:4,status:1,created:new Date(),
                          modified:new Date()
                        },function(err,createTag)
                        {
                          cb(null,{status:1})
                        })
                      }
                      else
                      {
                        callback()
                      } 
                    })
                  }
                }
                
              })
              
                  
            })       
          }]
          , function (err, result,questionsAsked)
        {
          if(err)
          {
            console.log(err);
            cb(null,{status:"fail",message:"Error while getting error",error:err})
          }
          else
          {
            console.log(".........................,,,,,,,,,,,,,,",req.body);

            let tagsModels = app.models.tags;
            let arr  = [];
            for(let i=0;i<list.length;i++)
            {
              arr.push(list[i].name);
            }
            console.log(".........................,,,,,,,,,,,,,,",req.body);
            tagsModels.create({
              category_id:arr,tagIndex:1,tagName:req.body.id,region:4
              ,order:4,status:1,created:new Date(),
              modified:new Date()
            },function(err,createTag)
            {
              console.log(err);
              cb(null,{status:"success",data:result,askedQuestionslist:questionsAsked})
            })
            
            
          }
        });





        
    } 

   /* ======== Multiple Copy =========*/


    methods.copyMultipleQuestions = function(req,res, cb)
    {
      let idArray =  req.body.id.split(",")
      let x=0;
      ////////console.log(idArray);
      async.eachSeries(idArray, function(value, callbackAsync)
      {
        async.waterfall([
          function(callback) {
            ////consolelog("Getting Question");
            if(value)
            {
              userQuestionModel.find({where:{questionMasterId:value}},function(err,questionData)
              {
                if(err)
                {
                  callback(err);
                }
                else
                {
                  ////consolelog("Got the Question ", questionData);
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
  
                      ////consolelog("obj to send ", obj);
                userQuestionModel.create(obj,function(err,newCopy)
                {
                  i++;
                  questionToUpdate.push(newCopy.id);
                  if( i ==  1)
                  {
                    ////consolelog("created successfully ",newCopy);
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
              updateObj ={questionMasterId:obj.id,image_URL:obj.image,sound_URL:null,video_URL:null,fileType:obj.fileType}
  
  
            }
            if(obj.fileType == 1 || obj.fileType == 4 )
            {
              updateObj ={questionMasterId:obj.id,image_URL:obj.image,sound_URL:null,video_URL:null,fileType:obj.fileType}
            }
            else if(obj.fileType == 2)
            {
              updateObj ={questionMasterId:obj.id,image_URL:null,sound_URL:obj.sound,video_URL:null,fileType:obj.fileType}
            }
            else if(obj.fileType == 3)
            {
              updateObj ={questionMasterId:obj.id,image_URL:null,sound_URL:null,video_URL:obj.video,fileType:obj.fileType}
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
        userQuestionModel.findOne({where:{questionMasterId:parseInt(value)}},function(err,data)
        {
          if(err)
          {
            cb(null,{status:"fail"})
          }
          else
          {
            if(data)
            {
              userQuestionModel.updateAll({questionMasterId:data.questionMasterId},{pack_ID:req.body.packageId},function(err,updateInfo)
              {
                if(err)
                {
                  ////////console.log(err);
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
        userQuestionModel.findOne({where:{questionMasterId:parseInt(value)}},function(err,data)
        {
          if(err)
          {
            cb(null,{status:"fail"})
          }
          else
          {
            if(data)
            {
              userQuestionModel.updateAll({questionMasterId:data.questionMasterId},{status:1},function(err,updateInfo)
              {
                if(err)
                {
                  ////////console.log(err);
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
      ////console.log(req.body.region)
        let regions = req.body.region.split(","),x=0;
        
        ////console.log("updated11")
        async.eachSeries(regions, function(countryID, callback)
        {
            ////console.log(countryID)
            x++
            countryModel.findOne({where:{id:countryID}},function(err,data)
            {
              let userQuestionModel = app.models["questions_"+data.language];
            userQuestionModel.findOne({where:{questionMasterId:parseInt(req.body.id)}},function(err,data)
            {
              if(err)
              {
                ////console.log(err)
                cb(null,{status:"fail"})
              }
              else
              {
                if(data)
                {
                  userQuestionModel.updateAll({questionMasterId:data.questionMasterId},{questionState:parseInt(req.body.type)},function(err,updateInfo)
                  {
                    if(err)
                    {
                      ////console.log(err)
                      if(regions.length== x)
                  {
                      cb(null,{status:"fail",message:"error While updating"}); 
                    }else
                    {
                      callback()
                    }
                    }
                    else
                    {
                      ////console.log("updated")
                      if(regions.length== x)
                  {
                      cb(null,{status:"success",message:"updated"});  
                    }else
                    {
                      callback()
                    }
                    }
                  })
                }
                else
                {
                  if(regions.length== x)
                  {
                    cb(null,{status:"fail",message:"Question Id not found"});              
                  }else
                  {
                    callback()
                  }
                }
              }
            })
          })
        })
     }



  methods.getTempQuestions = function(req,res,cb)
  {
    ////////console.log("errrr")
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

       ds1.connector.query('SELECT tempquestions.id,tempquestions.category_id,tempquestions.sub_category_id,tempquestions.age_id,tempquestions.time_Allowed,tempquestions.region,tempquestions.question,tempquestions.answer1,tempquestions.answer2,tempquestions.answer3,tempquestions.answer4,tempquestions.hint,tempquestions.correct_Answer,tempquestions.image_URL,tempquestions.sound_URL,tempquestions.video_URL,tempquestions.fileType,tempquestions.pack_ID,tempquestions.questionMasterId,tempquestions.created,categories.category,sub_categories.subCategory,countries.name,age_categories.age, COUNT(tempquestions.id) AS multiple FROM tempquestions INNER JOIN categories ON category_id = categories.id INNER JOIN sub_categories ON sub_category_id = sub_categories.id  INNER JOIN countries ON tempquestions.region = countries.id INNER JOIN age_categories ON age_id = age_categories.id '+cond+' GROUP BY questionMasterId ORDER BY questionMasterId DESC LIMIT '+skipV+',10', function (err, data)
       {
         if(err)
         {
           console.log(err);
         }
         else
         {
           //////////console.log(data);
             for(let i=0;i<data.length;i++)
             {
               let question = { id:data[i].id,category:data[i].category,subCategory:data[i].subCategory,packageName:data[i].packageName,multiple:data[i].multiple,age:[],country:[],image_URL:data[i].image_URL,sound_URL:data[i].sound_URL,video_URL:data[i].video_URL,question:data[i].question,answer1:data[i].answer1,answer2:data[i].answer2,answer3:data[i].answer3,answer4:data[i].answer4,correct_Answer:data[i].correct_Answer,created:data[i].created,questionMasterId:data[i].questionMasterId}

               finalQuestion.push(question);
              }
             callbackWater(null,finalQuestion);

         }
       })
     },
     function(questionData, callbackWater)
     {
      //////consolelog("question data for free play ", questionData);
       if(questionData.length > 0)
       {
        //////consolelog("length is greater than 0 ");
         let x=0;id=0;
         async.eachSeries(questionData, function(question, callback)
         {

           console.log('SELECT * FROM tempquestions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionMasterId ='+question.questionMasterId+'  GROUP BY age_id');
           ds1.connector.query('SELECT * FROM tempquestions INNER JOIN   age_categories ON age_id = age_categories.id WHERE questionMasterId ='+question.questionMasterId+'  GROUP BY age_id', function (err, ageData)
           {
             if(err)
             {
               console.log(err);
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
           ds1.connector.query('SELECT * FROM tempquestions INNER JOIN countries ON region = countries.id WHERE questionMasterId ='+questionAge.questionMasterId+'  GROUP BY region', function (err, countryData)
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
                 //////consolelog(4,questionAge);
                 callbackWater(null, questionAge);
               }
               else
               {
                 //////////////consolelog(question)
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
        
       ds1.connector.query('SELECT COUNT(a.cnt) as count FROM ( SELECT COUNT(id) AS cnt FROM tempquestions '+cond+' GROUP BY questionMasterId) AS a', function (err, questionCount)
       {
         if(err)
         {
          ////////console.log(err);
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
   //////consolelog("sending questions ", finalQuestion);
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
       ////////console.log(data);
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
    ////////console.log(req.params);
    regionAdminModel.find({},function(err,data){
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
              ////////console.log(err);
              //cb(null,{status:1,dataInfo:data,countryInfo:countryInfo});
            }
            else
            {
              if(req.params.id == 0)
              {
				  //////console.log(data)
                cb(null,{status:1,dataInfo:data,countryInfo:countrydata,userInf:null});
              }
              else
              {
                regionAdminModel.findOne({where:{id:req.params.id}}
                  ,function(err,admiInfo)
                {
                  if(err)
                  {
                    cb(null,{status:0})
                  }
                  else
                  {
                    //////console.log(admiInfo);
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
	countryModel =  app.models.countries;
	delete regionAdminModel.validations.email
  ////////console.log("kkkk-------------------------------------",req.body);
  if(req.body.id == 0)
  {
    // regionAdminModel.findOne({where:{country_id:req.body.country,userType:2}},function(err,data)
    // {
    
    //   if(err)
    //   {
    //     cb(null,{status:0,message:"Error"})
    //   }
    //   else
    //   {
    //     if(data)
    //     {
    //       ////////console.log("ooooooooooooooooooooo")
    //       cb(null,{status:0,message:'already Exist'})
    //     }
    //     else
    //     {
          ////////console.log("-------------------------------------",req.body);
            // userModel.create({username:req.body.username,password:req.body.password,passwordDebug:req.body.password,
            //                   country_id:req.body.country,
            //                 adminCountries:req.body.region,countryCode:req.body.countryName,created:new Date(),
            //                 userType:2,modified: new Date()},function(err,addInfo)
            // {
            //   if(err)
            //   {
            //     ////////console.log(err)
            //     cb(null,{status:0,message:"Error"})
            //   }
            //   else
            //   {
					////////console.log(req.body.region)
				let countries = req.body.region.split(',');
				let CountryIn = {inq:countries};
				countryModel.find({where:{id:CountryIn}},function(err,data1){
					let countryA = []
					for(let i=0;i<data1.length;i++)
					{
						countryA.push(data1[i].name);
					}
				
          console.log(data1)
				
				
                regionAdminModel.create({username:req.body.username,password:req.body.password
                  ,passwordEncript:req.body.password,
                countryCode:req.body.region,countryName:countryA,languageCode:data1[0].code,created:new Date(),modified: new Date()
                },function(err,addInfo)
                { 
                 if(err)
                  {
                   console.log(err);
                 }
                  else
                 {
					  ////////console.log("1111");
                   cb(null,{status:1,message:"Successfully added"})
                 }
                })
				})


                
            //   }
            // })
        
         // }
        
    //     }
    //  })
    }
    else
    {
      regionAdminModel.findById(parseInt(req.body.id), function (err, userM)
      {
	if(err)
	{
		cb(null,{status:0})
	}
	else
	{
      
        let countries = req.body.region.split(',');
				let CountryIn = {inq:countries};
				countryModel.find({where:{id:CountryIn}},function(err,data1){
					let countryA = [],code=[]
					for(let i=0;i<data1.length;i++)
					{
						countryA.push(data1[i].name);
            code.push(data1[i].code);
					}
				
				
				
                userM.updateAttributes({username:req.body.username,password:req.body.password,passwordEncript:req.body.password,
                countryCode:req.body.region,countryName:countryA,languageCode:code,created:new Date(),modified: new Date()
                },function(err,addInfo)
                { 
                 if(err)
                  {
                   ////////console.log(err);
                 }
                  else
                 {
					  ////////console.log("1111");
                   cb(null,{status:1,message:"Successfully added"})
                 }
                })
	})
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
      ////////console.log('ssssssssssssssssssssssssssssssssssssssss',err);
      cb(null,{status:0,message:"Error"})
    }
    else
    {
      ////////console.log("sssssssssssss",data);
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
  //////console.log(req.params);
  userPackagesModel.findOne({where:{id:parseInt(req.params.id)}},function(err,data)
  {
    if(err)
    {
      cb(null,{status:0,message:"Error"})
    }
    else
    {
      ////////console.log("sssssssssssss",data);
      if(data)
      {
        userPackagesModel.updateAll({id:parseInt(data.id)},{status:req.params.type},function(err,infoData)
        {
          if(err)
          {
            //////console.log(err);
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
  //////console.log(req.params);
  userCategoriesModel.findOne({where:{id:parseInt(req.params.id)}},function(err,data)
  {
    if(err)
    {
      cb(null,{status:0,message:"Error"})
    }
    else
    {
      ////////console.log("sssssssssssss",data);
      if(data)
      {
        userCategoriesModel.updateAll({id:parseInt(data.id)},{status:req.params.type},function(err,infoData)
        {
          if(err)
          {
            //////console.log(err);
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
      ////////////consolelog(req.params);
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
      //////consolelog("req.body",req.body);
      distributorsModel.findOne({where:{country_id:req.body.country,distributor:req.body.distributor},neq:{id:req.params.id}},function(err,data)
      {
          if(err)
          {
            reject(0);
          }
          else
          {

            //////consolelog("datat ================",data);
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
    //////consolelog("data",req.body);
    return new Promise(function(resolve, reject)
    {
      distributorsModel.create({country_id:req.body.country,distributor:req.body.distributor,status:0,created:new Date(),modified:new Date()},function(err,created){
        if(err)
        {
          ////////////consolelog(err);
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
      //////consolelog("param.distributor_id",param.distributor_id);
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
  
  function getAllCountryLimit(country)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all countries from table */
	  ////////console.log("session",req.session)
	  let countryinfo =country.split(',');
        let countryArr = {inq:countryinfo};
      countryModel.find({where:{id:countryArr}},function(err,countriesData)
      {

          if(err)
          {
            reject(0);
          }
          else
          {
			  //////console.log(countriesData)
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

  function getUsersData(skipV,param)
  {
    return new Promise(function(resolve, reject)
    {
      /* Getting all users from table */
      let user =  app.models.user;
      let ds1 = user.dataSource;
      orderType ="desc";
      if(param.odr == 1)
      {
        orderType ='asc'
      }
      
    if(param.type == 0)
    {
        ds1.connector.query('SELECT email,licence,user.licenceName,user.id ,user_games.user_id,COUNT(user_games.id) AS tt,user.firstName,user.lastName,user.created,user.countryCode FROM user LEFT JOIN user_games ON user.id = user_games.user_id  LEFT JOIN licences ON user.licence_id = licences.id WHERE user.id !=1 && user.firstName is not null GROUP BY id ORDER BY tt '+orderType+' LIMIT '+skipV+',10',function(err,data){
            if(err)
            {
		console.log(err);
              reject(0);
            }
            else
            {
              resolve(data);
            }
        })
      }
      else
      {
        ds1.connector.query('SELECT email,licence,user.licenceName,user.id ,user_games.user_id,Max(user_games.created) AS tt,user.firstName,user.lastName,user.created,user.countryCode FROM user LEFT JOIN user_games ON user.id = user_games.user_id  LEFT JOIN licences ON user.licence_id = licences.id WHERE user.id !=1 && user.firstName is not null GROUP BY id ORDER BY tt '+orderType+' LIMIT '+skipV+',10',function(err,data){
          if(err)
          {
		console.log(err);
            reject(0);
          }
          else
          {
            resolve(data);
          }
      })
      }
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
	  console.log(usersCount)
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
                      ds1.connector.query('SELECT COUNT(DISTINCT questionMasterId) as pkID FROM questions  WHERE pack_ID = '+packages[i].id+' ', function (err, questionCount)
                            {
                              if(!err)
                            {
                          //////consolelog("entries ",questionCount[0].pkID);
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
                    console.log(userInfo.purchaseCategory);
                    console.log(categories);
                    let array = [];
                    let userCategory =[]
                    if(userInfo.purchaseCategory != '' && userInfo.purchaseCategory != null)
                    {  
                      userCategory = userInfo.purchaseCategory.split(",");
                    }

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
                      if(userCategory.length > 0)
                      {
                        for(let j=0;j<userCategory.length;j++)
                        {
                          if(categories[i].id == userCategory[j])
                          {
                            obj.purchased = 1;
                          }
                        }

                        array.push(obj);
                        //////console.log(i)
                        //////console.log(userCategory.length)
                        if(array.length== userCategory.length) {
                          console.log("ssss",array)
                          resolve(array)
                        }
                      }
                      else
                      {
                        array.push(obj);
                        if(array.length == categories.length)
                        {
                          
                          resolve(array)
                        }
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
            userGameModel.count({user_id:req.params.id,game_start:1},function(err,game_startCount){
              if(err)
              {
                reject(0)
              }
              else
              {
                userGameModel.count({user_id:req.params.id,game_end:1},function(err,game_endCount){
                  if(err)
                  {
                    reject(0)
                  }
                  else
                  {
                    let obj ={count:count,game_start:game_startCount,game_end:game_endCount}
                    resolve(obj)
                  }
                })
              }
            
           
            })
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
       ds1.connector.query('SELECT COUNT(DISTINCT questionMasterId) as pkID FROM questions  WHERE pack_ID = '+value[i].id+' ', function (err, questionCount)
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
               //////consolelog("hhhhhhh");
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
      ////////////consolelog(params);
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
      //////////////consolelog(cond);
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
              //////////////consolelog(err);
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
      let corePackage=0;
      if(fields.corepack == 'on')
      {
        corePackage=1
      }

      //////console.log("---------------------------",corePackage);
        /* Setting package from table */
        userPackagesModel.create({packageName:fields.package,packageDescription:fields.packageDescription,
          costIndex:cost[0],cost:cost[1],countries:fields.region,categories:fields.category,age:fields.age,status:0,corePack:corePackage,
          created:new Date(),modified:new Date()},function(err,data)
        {
          if(err)
          {
            //////////////consolelog(err);
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
      //////console.log("kks",fields);
      let cost =  fields.cost.split(',');
      let corePackage=0
      if(fields.corepack == 'on')
      {
        corePackage=1
      }
        /* Setting package from table */
        userPackagesModel.updateAll({id:fields.id},{packageName:fields.package,
          packageDescription:fields.packageDescription,costIndex:cost[0],cost:cost[1],countries:fields.region,
          categories:fields.category,age:fields.age,corePack:corePackage,modified:new Date()},function(err,data)
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
      //////////console.log(param);
        /* Setting package from table */
        userQuestionModel.findOne({include:['categories', 'sub_categories',"question_packages","age_categories","countries"],where:{id:param.id}},function(err,data)
        {
          if(err)
          {
            reject(0);
          }
          else
          {
            //////////console.log(data);
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
        ////consolelog("getting details")
        userQuestionModel.findOne({include:['categories', 'sub_categories',"age_categories","countries"],where:{id:param.id}},function(err,data)
        {
          if(err)
          {
            reject(0);
          }
          else
          {
            ////consolelog("got details successfully ", data)
            resolve(data)
          }
        })
    });
  }

  /* ========== Edit Question ===============  */

   function getEditQuestion(param,session)
  {
    return new Promise(function(resolve, reject)
    {
      let questions =  app.models.questions;
      let ds1 = questions.dataSource;
      let regionD = param.region
	if(param.region ==  0)
        {
	  regionD =4
        }


      countryModel.findOne({where:{id:regionD }},function(err,regionInfo){

      console.log(regionInfo);
      ds1.connector.query('SELECT * FROM questions_'+regionInfo.language+'  WHERE questionMasterId ='+param.id+'', function (err, data)
      {
        if(err)
        {
          //////console.log(err);
          reject(0);
        }
        else
        {
          
          data = data[0]
          
          let obj = {}
              obj = { category_id:data.category_id,sub_category_id:data.sub_category_id,age_id: data.age_id,
                      time_Allowed:data.time_Allowed,region:data.region,question: data.question,
                      answer1:data.answer1,answer2:data.answer2,answer3:data.answer3,answer4: data.answer4
                      ,hint:data.hint,correct_Answer:data.correct_Answer,image_URL:data.image_URL,
                      video_URL:data.video_URL,sound_URL:data.sound_URL,fileType:data.fileType,
                      language:data.language, pack_ID:data.pack_ID,questionMasterId: data.questionMasterId,id:data.id
                      ,creditBy:data.creditBy,status:data.status,questionActiveStatus:data.questionActiveStatus,
                      AnswerOrder:data.AnswerOrder,SupportVideoURL:data.SupportVideoURL,hint:data.hint,priority:data.priority}

          let regionSpl= data.region.split(',');
          // console.log("regionSpl",regionSpl)
          // console.log("data",data)
          if(session.regionCode != "UK")
          {
            resolve(obj)
          }
          else
          {
            let xyz =[],x=0;
            
            
            async.eachSeries(regionSpl, function(dataIdArray1, callback)
            {
              ////console.log("dataIdArray1",dataIdArray1)
              countryModel.findOne({where:{id:dataIdArray1}},function(err,countryCode){
                ////console.log("countryCode",countryCode)
              let userQuestionModel =  app.models["questions_"+countryCode.language];              
              userQuestionModel.findOne({where:{questionMasterId:param.id}},function(err,data)
              {
                if(err)
                {

                  callbackwater(err);
                }
                else
                {
                  ////console.log("data====",data)
                  if(x==0)
                  {
                    obj = { category_id:data.category_id,sub_category_id:data.sub_category_id,age_id: data.age_id,
                            time_Allowed:data.time_Allowed,region:data.region, pack_ID:data.pack_ID,
                            questionMasterId: data.questionMasterId,id:data.id,creditBy:data.creditBy
                            ,status:data.status,questionActiveStatus:data.questionActiveStatus,
                            questionArr:[],AnswerOrder:data.AnswerOrder,SupportVideoURL:data.SupportVideoURL,priority:data.priority}  
                          }

                  let obj1= {
                        question: data.question,answer1:data.answer1,answer2:data.answer2,answer3:data.answer3
                        ,answer4: data.answer4,hint:data.hint,correct_Answer:data.correct_Answer,image_URL:data.image_URL
                        ,video_URL:data.video_URL,sound_URL:data.sound_URL,fileType:data.fileType,language:countryCode.language,
                        country_id:countryCode.id,countryImage:countryCode.image,AnswerOrder:data.AnswerOrder,SupportVideoURL:data.SupportVideoURL,priority:data.priority
                  }
                  
                  xyz.push(obj1);
                  x++;
                  
                  callback()
                  if(regionSpl.length ==  x)
                  {
                    obj.questionArr=xyz;
                    resolve(obj)
                  }
                }
              })
            })
          }) 
          }
        }
      })
    });
  })
  }

  // function getEditQuestion1(param,session)
  // {
  //   return new Promise(function(resolve, reject)
  //   {
  //     let questions =  app.models.questions_new_structure;
  //     let ds1 = questions.dataSource;

  //     let query ="";

  //     questionsMultilangStatusTempModel.findOne({where:{question_id:param.id}},function(err,countryType){

  //     ////////console.log("param",countryType[session.regionCode])
  //     if(param.type == 1)
  //     {
  //       if(parseInt(param.regionType) == 0)
  //       {
  //         query = 'SELECT priority,category_id,sub_category_id,age_id,time_Allowed,region,question_'+session.regionCode+' as question,answer1_'+session.regionCode+' as answer1 ,answer2_'+countryType.createdBy+' as answer2,answer3_'+countryType.createdBy+' as answer3,answer4_'+countryType.createdBy+' as answer4,hint_'+countryType.createdBy+' as hint ,correct_Answer_'+countryType.createdBy+' as correct_Answer ,image_URL_'+countryType.createdBy+' as image_URL,video_URL_'+countryType.createdBy+' as video_URL,sound_URL_'+countryType.createdBy+' as sound_URL,fileType,language,pack_ID,questionMasterId,id,creditBy_'+countryType.createdBy+' as creditBy,status,questionActiveStatus  FROM questions_new_structure  WHERE id ='+param.id+'';
  //         ds1.connector.query(query, function (err, data)
  //         {
  //           if(err)
  //           {
  //             //////////console.log(err);
  //             reject(0);
  //           }
  //           else
  //           {
  //             //////console.log("datadatadatadatadata",data);
  //             let x=0;
  //             let obj = {}
  //             obj = 
  //                 { category_id:data[0].category_id, sub_category_id:data[0].sub_category_id, 
  //                   age_id: [data[0].age_id], time_Allowed:data[0].time_Allowed ,region:[data[0].region]
  //                   ,question: data[0].question, answer1:data[0].answer1 
  //                   ,answer2:data[0].answer2
  //                   ,answer3:data[0].answer3, answer4: data[0].answer4
  //                   , hint:data[0].hint,
  //                   correct_Answer:data[0].correct_Answer 
  //                   ,image_URL:data[0].image_URL,
  //                   video_URL:data[0].video_URL,sound_URL:data[0].sound_URL
  //                    ,fileType:data[0].fileType,
  //                   language:data[0].language, pack_ID:data[0].pack_ID ,questionMasterId: data[0].questionMasterId
  //                   ,id:data[0].id, creditBy:data[0].creditBy, status:data[0].status,
  //                   questionActiveStatus:data[0].questionActiveStatus,
  //                   priority:data[0].priority}
            
  //                 resolve(obj)
  //             }
  //           })
  //       }
  //       else
  //       {
  //         //////console.log("helllll");
  //         countryModel.findOne({where:{id:param.regionType}},function(err,region){
  //           if(err)
  //           {
  //             //////console.log(err);
  //           }
  //           else
  //           {
              
  //             query = 'SELECT priority,category_id,sub_category_id,age_id,time_Allowed,region,question_'+region.language+' as question,answer1_'+region.language+' as answer1 ,answer2_'+region.language+' as answer2,answer3_'+region.language+' as answer3,answer4_'+region.language+' as answer4,hint_'+region.language+' as hint ,correct_Answer_'+region.language+' as correct_Answer ,image_URL_'+region.language+' as image_URL,video_URL_'+region.language+' as video_URL,sound_URL_'+region.language+' as sound_URL,fileType,language,pack_ID,questionMasterId,id,creditBy_'+region.language+' as creditBy,status,questionActiveStatus  FROM questions_new_structure  WHERE id ='+param.id+'';
  //             ds1.connector.query(query, function (err, data)
  //             {
  //               if(err)
  //               {
  //                 //////////console.log(err);
  //                 reject(0);
  //               }
  //               else
  //               {
  //                 //////console.log("datadatadatadatadata",data);
  //                 let x=0;
  //                 let obj = {}
  //                 obj = 
  //                     { category_id:data[0].category_id, sub_category_id:data[0].sub_category_id, 
  //                       age_id: [data[0].age_id], time_Allowed:data[0].time_Allowed ,region:[data[0].region]
  //                       ,question: data[0].question, answer1:data[0].answer1 
  //                       ,answer2:data[0].answer2
  //                       ,answer3:data[0].answer3, answer4: data[0].answer4
  //                       , hint:data[0].hint,
  //                       correct_Answer:data[0].correct_Answer 
  //                       ,image_URL:data[0].image_URL,
  //                       video_URL:data[0].video_URL,sound_URL:data[0].sound_URL
  //                        ,fileType:data[0].fileType,
  //                       language:data[0].language, pack_ID:data[0].pack_ID ,questionMasterId: data[0].questionMasterId
  //                       ,id:data[0].id, creditBy:data[0].creditBy, status:data[0].status,
  //                       questionActiveStatus:data[0].questionActiveStatus,
  //                       priority:data[0].priority}
                
  //                     resolve(obj)
  //                 }
  //               })
  //           }
  //         })
          
  //       }
  //     }
  //     else
  //     {
  //       if(countryType[session.regionCode] == 2)
  //       {
  //         query ='SELECT priority,category_id,sub_category_id,age_id,creditBy_'+session.regionCode+' as creditBySecond,time_Allowed,region,question_'+session.regionCode+' as questionSecond,answer1_'+session.regionCode+' as answer1Second ,answer2_'+session.regionCode+' as answer2Second,answer3_'+session.regionCode+' as answer3Second,answer4_'+session.regionCode+' as answer4Second,hint_'+session.regionCode+' as hintSecond ,correct_Answer_'+session.regionCode+' as correct_AnswerSecond ,image_URL_'+session.regionCode+' as image_URLSecond,video_URL_'+session.regionCode+' as video_URLSecond,sound_URL_'+session.regionCode+' as sound_URLSecond,question_EN as question,answer1_EN as answer1 ,answer2_EN as answer2,answer3_EN as answer3,answer4_EN as answer4,hint_EN as hint ,correct_Answer_EN as correct_Answer ,image_URL_EN as image_URL,video_URL_EN as video_URL,sound_URL_EN as sound_URL,fileType,language,pack_ID,questionMasterId,id,creditBy_EN as creditBy,status,questionActiveStatus  FROM questions_new_structure  WHERE id ='+param.id+'';
  //       }
  //       else
  //       {
  //         query ='SELECT priority,category_id,sub_category_id,age_id,time_Allowed,region,question_EN as question,answer1_EN as answer1 ,answer2_EN as answer2,answer3_EN as answer3,answer4_EN as answer4,hint_EN as hint ,correct_Answer_EN as correct_Answer ,image_URL_EN as image_URL,video_URL_EN as video_URL,sound_URL_EN as sound_URL,fileType,language,pack_ID,questionMasterId,id,creditBy_EN as creditBy,status,questionActiveStatus  FROM questions_new_structure  WHERE id ='+param.id+'';
  //       }
  //       //////console.log(query);
  //       ds1.connector.query(query, function (err, data)
  //       {
  //         if(err)
  //         {
  //           ////////console.log(err);
  //           reject(0);
  //         }
  //         else
  //         {
            
  //           if(countryType[session.regionCode] == 2)
  //           {
  //             let obj = {}
  //             obj = 
  //               { category_id:data[0].category_id,
  //                 sub_category_id:data[0].sub_category_id, 
  //                 age_id: [data[0].age_id],
  //                 time_Allowed:data[0].time_Allowed ,
  //                 region:[data[0].region]

  //                 ,question: data[0].question,
  //                 answer1:data[0].answer1 
  //                 ,answer2:data[0].answer2
  //                 ,answer3:data[0].answer3,
  //                 answer4: data[0].answer4,
  //                 hint:data[0].hint,
  //                 correct_Answer:data[0].correct_Answer,
  //                 image_URL:data[0].image_URL,
  //                 video_URL:data[0].video_URL,
  //                 sound_URL:data[0].sound_URL,



  //                 questionSecond: data[0].questionSecond,
  //                 answer1Second:data[0].answer1Second 
  //                 ,answer2Second:data[0].answer2Second
  //                 ,answer3Second:data[0].answer3Second,
  //                 answer4Second: data[0].answer4Second,
  //                 hintSecond:data[0].hintSecond,
  //                 correct_AnswerSecond:data[0].correct_AnswerSecond,
  //                 image_URLSecond:data[0].image_URLSecond,
  //                 video_URLSecond:data[0].video_URLSecond,
  //                 sound_URLSecond:data[0].sound_URLSecond,
  //                 creditBySecond:data[0].creditBySecond,

  //                 fileType:data[0].fileType,
  //                 language:data[0].language, 
  //                 pack_ID:data[0].pack_ID ,
  //                 questionMasterId: data[0].questionMasterId,
  //                 id:data[0].id,
  //                 creditBy:data[0].creditBy,
  //                 status:data[0].status,
  //                 questionActiveStatus:data[0].questionActiveStatus,
  //                 priority:data[0].priority,
  //                 historyType:1
  //               }
          
  //               resolve(obj)
  //           }
  //           else
  //           {
  //             let obj = {}
  //             obj = 
  //               { category_id:data[0].category_id,
  //                 sub_category_id:data[0].sub_category_id, 
  //                 age_id: [data[0].age_id],
  //                 time_Allowed:data[0].time_Allowed ,
  //                 region:[data[0].region]

  //                 ,question: data[0].question,
  //                 answer1:data[0].answer1 
  //                 ,answer2:data[0].answer2
  //                 ,answer3:data[0].answer3,
  //                 answer4: data[0].answer4,
  //                 hint:data[0].hint,
  //                 correct_Answer:data[0].correct_Answer,
  //                 image_URL:data[0].image_URL,
  //                 video_URL:data[0].video_URL,
  //                 sound_URL:data[0].sound_URL,

  //                 fileType:data[0].fileType,
  //                 language:data[0].language, 
  //                 pack_ID:data[0].pack_ID ,
  //                 questionMasterId: data[0].questionMasterId,
  //                 id:data[0].id,
  //                 creditBy:data[0].creditBy,
  //                 status:data[0].status,
  //                 questionActiveStatus:data[0].questionActiveStatus,
  //                 priority:data[0].priority,
  //                 historyType:0
  //               }
          
  //               resolve(obj)
  //           }
            
  //           }
  //         })
  //     }


  //     //////console.log("query/////////////////",query)

     
  //     });
  //   })
  // }



  /* get Specific Category */

  function getSpecificCategory(param)
  {
    return new Promise(function(resolve, reject)
    {
        /* Getting Specific Category */
        regionCategoryModel.findOne({where:{id:param.id}},function(err,data)
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
    //////////console.log(fields);
    let countriesModel =  app.models.countries
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
              let countriesIn =  fields.countriesIn.split(',');
              let  i = 0;
              let masterId=0;
                      
              countriesModel.findOne({where:{id:countriesIn[0]}},function(err,data1)
              {
                userCategoriesModel.create({category:fields["category_"+data1.code],
                description:fields["description_"+data1.code],
                amountIndex:userCost[0],amount:userCost[1],categoryRegion:fields.countriesIn
                ,status:1,type:2,isPackage:isPack,created:new Date(),modified:new Date(),
                regionId:fields.regionType},
                function(err,data)
                {
                  ////console.log(err)
                  async.eachSeries(countriesIn, function(region, callback)
                      {
                        i++
                        countriesModel.findOne({where:{id:region}},function(err,dataR)
                        {
                          regionCategoryModel.create({category:fields["category_"+dataR.code],category_id:data.id,
                          description:fields["description_"+dataR.code],
                          country_id:region,country_code:dataR.code
                          ,status:1,created:new Date(),modified:new Date()},
                            function(err,data1)
                          {
                            if(err)
                            {
                              //console.log(err);
                              reject(err)
                            }
                            else
                            {
                              if(i == 1)
                              {
                                masterId = data.id
                              }
                              if(countriesIn.length  == i)
                              {
                                if(masterId != 0)
                                {
                                  userCategoriesModel.updateAll({id:data.id},{categoryMasterId:masterId},function(err,uuu){
                                    //console.log(err)
                                    callbackwater(null,data.id);
                                  })
                                }
                                else
                                {
                                  //console.log("jjjj2");
                                  callbackwater(null,data.id);
                                }
                                
                              }
                              else
                              {
                                if(masterId != 0)
                                {
                                  //console.log("jjj333j");
                                  userCategoriesModel.updateAll({id:data.id},{categoryMasterId:masterId},function(err,data){
                                    callback()
                                  })
                                }
                                else{
                                  //console.log("jjjj44444");
                                  callback()
                                }                   
                              }
                            }
                          })
                        })
                  })
                })
              })
            },
            function(id,callbackwater)
            {
              console.group("==========1")
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
                  //console.log("err",err)
                  callbackwater(err);
                });
              }
              else{
                //console.log(11111)
                callbackwater(null,id);
              }
            },
            function(id,callbackwater)
            {
              //console.group("==========",files)
              if(files.buttonImage.name)
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
                      callbackwater(null,id);
                    }).catch(function(err)
                    {
                      callbackwater(err);
                    });
              }
              else
              {
                //console.log(222222)
                callbackwater(null,id);
              }

          },
          function(id,callbackwater)
            {
              //console.group("==========",files)
              if(files.image1.name)
              {
                  let randomSt = randomstring.generate(5);
                  let date2 = new Date();
                  let timeMs = date2.getTime();
                  let imageName =randomSt+timeMs;
                  let ext = path.extname(files.image1.name);
                  let oldpath="";
                  let saveurl = {image1:'storage/categories/'+imageName+ext};
                  bucketUrl = "outsmarted/storage/categories";
                  imageName =imageName+ext
                  oldpath = files.image1.path;

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
                //console.log(222222)
                callbackwater(null,id);
              }



          },
          function(id,callbackwater)
            {
              //console.group("==========",files)
              if(files.image2.name)
              {
                  let randomSt = randomstring.generate(5);
                  let date2 = new Date();
                  let timeMs = date2.getTime();
                  let imageName =randomSt+timeMs;
                  let ext = path.extname(files.image1.name);
                  let oldpath="";
                  let saveurl = {image2:'storage/categories/'+imageName+ext};
                  bucketUrl = "outsmarted/storage/categories";
                  imageName =imageName+ext
                  oldpath = files.image2.path;

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
                //console.log(222222)
                callbackwater(null,id);
              }

          },
          function(id,callbackwater)
            {
              //console.group("==========",files)
              if(files.image3.name)
              {
                  let randomSt = randomstring.generate(5);
                  let date2 = new Date();
                  let timeMs = date2.getTime();
                  let imageName =randomSt+timeMs;
                  let ext = path.extname(files.image1.name);
                  let oldpath="";
                  let saveurl = {image3:'storage/categories/'+imageName+ext};
                  bucketUrl = "outsmarted/storage/categories";
                  imageName =imageName+ext
                  oldpath = files.image3.path;

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
                //console.log(222222)
                callbackwater(null,id);
              }

          },
          function(id,callbackwater)
            {
              //console.group("==========",files)
              if(files.image4.name)
              {
                  let randomSt = randomstring.generate(5);
                  let date2 = new Date();
                  let timeMs = date2.getTime();
                  let imageName =randomSt+timeMs;
                  let ext = path.extname(files.image1.name);
                  let oldpath="";
                  let saveurl = {image4:'storage/categories/'+imageName+ext};
                  bucketUrl = "outsmarted/storage/categories";
                  imageName =imageName+ext
                  oldpath = files.image4.path;

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
                //console.log(222222)
                callbackwater(null,id);
              }

          },
          function(id,callbackwater)
            {
              //console.group("==========",files)
              if(files.image5.name)
              {
                  let randomSt = randomstring.generate(5);
                  let date2 = new Date();
                  let timeMs = date2.getTime();
                  let imageName =randomSt+timeMs;
                  let ext = path.extname(files.image1.name);
                  let oldpath="";
                  let saveurl = {image5:'storage/categories/'+imageName+ext};
                  bucketUrl = "outsmarted/storage/categories";
                  imageName =imageName+ext
                  oldpath = files.image5.path;

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
                //console.log(222222)
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

  /* edit Category */

  
  function editCategoryData(fields,files)
  {
    ////////console.log(files);
    let countriesModel =  app.models.countries;
    let regionCategoryModel =  app.models.region_categories;
    
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
              regionCategoryModel.deleteAll({category_id:parseInt(fields.id)},function(err,data)
              {
                let userCost = fields.cost.split(',');
                let countriesIn =  fields.countriesIn.split(',');
                let  i = 0;
                let masterId=0;
                //console.log("sssssssssssssssssssssssssssss",countriesIn);
              
                
              
              async.eachSeries(countriesIn, function(region, callback)
              {
                i++
                countriesModel.findOne({where:{id:region}},function(err,data1)
                {
                  
                    
                      if(countriesIn.length  == i)
                      {
                          if(i == 1)
                          {
                            userCategoriesModel.updateAll({id:fields.id},{
                              category:fields["category_"+data1.code],
                              description:fields["description_"+data1.code],
                              amountIndex:userCost[0],amount:userCost[1],categoryRegion:fields.countriesIn
                              ,status:1,type:2,isPackage:isPack,created:new Date(),modified:new Date(),
                              regionId:fields.regionType,iconImage:fields.iconImageal,
                              buttonImage:fields.buttonImageal,image1:fields.image1al,image2:fields.image2al
                              ,image3:fields.image3al,image4:fields.image4al,image5:fields.image5al},
                              function(err,data)
                            {
                              regionCategoryModel.create({
                                category_id:fields.id,category:fields["category_"+data1.code],
                                description:fields["description_"+data1.code],
                                tag:fields["tag_"+data1.code],
                                tag_index:fields["tag_index_"+data1.code]
                                ,country_id:region,country_code:data1.code
                                ,status:1,created:new Date(),modified:new Date()},
                                function(err,data)
                              {
                                callbackwater(null,fields.id);
                              })
                            })
                          }
                          else
                          {
                            regionCategoryModel.create({
                              category_id:fields.id,category:fields["category_"+data1.code],
                              description:fields["description_"+data1.code],
                              tag:fields["tag_"+data1.code],
                              tag_index:fields["tag_index_"+data1.code]
                              ,country_id:region,country_code:data1.code
                              ,status:1,created:new Date(),modified:new Date()},
                              function(err,data1)
                            {
                              callbackwater(null,fields.id);
                            })
                          }
                      }
                      else
                      {
                        if(i == 1)
                        {
                          userCategoriesModel.updateAll({id:fields.id},{
                            category:fields["category_"+data1.code],
                            description:fields["description_"+data1.code],
                            amountIndex:userCost[0],amount:userCost[1],categoryRegion:fields.countriesIn
                            ,status:1,type:2,isPackage:isPack,created:new Date(),modified:new Date(),
                            regionId:fields.regionType,iconImage:fields.iconImageal,
                            buttonImage:fields.buttonImageal},
                            function(err,data)
                          {
                            regionCategoryModel.create({
                              category_id:fields.id,category:fields["category_"+data1.code],
                              description:fields["description_"+data1.code],
                              tag:fields["tag_"+data1.code],
                              tag_index:fields["tag_index_"+data1.code]
                              ,country_id:region,country_code:data1.code
                              ,status:1,created:new Date(),modified:new Date()},
                              function(err,data)
                            {
                              //console.log(err)
                              callback()
                            })
                          })
                        }
                        else
                        {
                          regionCategoryModel.create({
                            category_id:fields.id,category:fields["category_"+data1.code],
                            description:fields["description_"+data1.code],
                            tag:fields["tag_"+data1.code],
                            tag_index:fields["tag_index_"+data1.code]
                            ,country_id:region,country_code:data1.code
                            ,status:1,created:new Date(),modified:new Date()},
                            function(err,data)
                          {
                            callback()
                          })
                        }
                        
                          
                        
                      }
                    
                  
                })
              })
              })
            },
            function(id,callbackwater)
            {
              if(files.iconImage.name != '')
              {
                //console.log("Enter==============>>>>>>")
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
                //console.log("njnjjnj",id)
                uploadCategoryFile(files,id,saveurl,imageName,bucketUrl,oldpath).then(function(upload)
                  {
                    //console.log(upload);
                    callbackwater(null,id);
                  }).catch(function(err)
                  {
                    //console.log(err);
                    callbackwater(err);
                  });
              }
              else
              {
                //console.log("121112")
                callbackwater(null,id);
              }
            },
            function(id,callbackwater)
            {
		////console.log("files.buttonImage.name",files)
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
                    callbackwater(null,id);
                  }).catch(function(err)
                  {
                    callbackwater(err);
                  });
              }
              else
              {
                //console.log("333333333")
                callbackwater(null,id);
              }
            }
            ,
            function(id,callbackwater)
            {
		////console.log("files.buttonImage.name",files)
              if(files.image1.name != '')
              {
                let randomSt = randomstring.generate(5);
                let date2 = new Date();
                let timeMs = date2.getTime();
                let imageName =randomSt+timeMs;
                let ext = path.extname(files.image1.name);
                let oldpath="";
                let saveurl = {image1:'storage/categories/'+imageName+ext};
                bucketUrl = "outsmarted/storage/categories";
                imageName =imageName+ext
                oldpath = files.image1.path;

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
                //console.log("333333333")
                callbackwater(null,id);
              }
            }
            ,
            function(id,callbackwater)
            {
		////console.log("files.buttonImage.name",files)
              if(files.image2.name != '')
              {
                let randomSt = randomstring.generate(5);
                let date2 = new Date();
                let timeMs = date2.getTime();
                let imageName =randomSt+timeMs;
                let ext = path.extname(files.image2.name);
                let oldpath="";
                let saveurl = {image2:'storage/categories/'+imageName+ext};
                bucketUrl = "outsmarted/storage/categories";
                imageName =imageName+ext
                oldpath = files.image2.path;

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
                //console.log("333333333")
                callbackwater(null,id);
              }
            }
            ,
            function(id,callbackwater)
            {
		////console.log("files.buttonImage.name",files)
              if(files.image3.name != '')
              {
                let randomSt = randomstring.generate(5);
                let date2 = new Date();
                let timeMs = date2.getTime();
                let imageName =randomSt+timeMs;
                let ext = path.extname(files.image3.name);
                let oldpath="";
                let saveurl = {image3:'storage/categories/'+imageName+ext};
                bucketUrl = "outsmarted/storage/categories";
                imageName =imageName+ext
                oldpath = files.image3.path;

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
                //console.log("333333333")
                callbackwater(null,id);
              }
            }
            ,
            function(id,callbackwater)
            {
		////console.log("files.buttonImage.name",files)
              if(files.image4.name != '')
              {
                let randomSt = randomstring.generate(5);
                let date2 = new Date();
                let timeMs = date2.getTime();
                let imageName =randomSt+timeMs;
                let ext = path.extname(files.image4.name);
                let oldpath="";
                let saveurl = {image4:'storage/categories/'+imageName+ext};
                bucketUrl = "outsmarted/storage/categories";
                imageName =imageName+ext
                oldpath = files.image4.path;

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
                //console.log("333333333")
                callbackwater(null,id);
              }
            }
            ,
            function(id,callbackwater)
            {
		////console.log("files.buttonImage.name",files)
              if(files.image5.name != '')
              {
                let randomSt = randomstring.generate(5);
                let date2 = new Date();
                let timeMs = date2.getTime();
                let imageName =randomSt+timeMs;
                let ext = path.extname(files.image5.name);
                let oldpath="";
                let saveurl = {image5:'storage/categories/'+imageName+ext};
                bucketUrl = "outsmarted/storage/categories";
                imageName =imageName+ext
                oldpath = files.image5.path;

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
                //console.log("333333333")
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
              //////////////consolelog(data);
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


  function deleteQuest(id,type,region,session)
 {
   ////consolelog("sessionsessionsession",session);
  return new Promise(function(resolve, reject)
  {
    if(type == 1)
    {
      countryModel.findOne({where:{id:region}},function(err,data){
        let userQuestionModel = app.models["questions_"+data.language];
        
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
        })
      
    }
    else
    {
      if(session.adminUserType == 2)
      {

        //////console.log("req.param",req.params)
        countryModel.findOne({where:{id:region}},function(err,data){
          let userQuestionModel = app.models["questions_"+data.language];
        userQuestionModel.findOne({where:{questionMasterId:parseInt(id)}},function(err,userInfoRegion)
        {
          //console.log(userInfoRegion);
          ////console.log("userInfoRegion",userInfoRegion)
          regionsd =  userInfoRegion.region.split(",");
         ////console.log(111111,regionsd)

          const index = regionsd.indexOf(session.region.toString());
            if (index > -1) {
              ////console.log(222222,regionsd)
              regionsd.splice(index, 1); // 2nd parameter means remove one item only
            }

            userQuestionModel.deleteAll({questionMasterId:parseInt(id)},function(err,data)
            {
              //let regions = regionsd.split(","),
	      if(regionsd.lengt > 1)
              {	
              let x=0;
		
              ////console.log("ddddddddddddddddddddddddddddddddddddddd",regionsd)
              async.eachSeries(regionsd, function(countryID, callback)
              {
                ////console.log("countryID================>>>",countryID)

                x++
                countryModel.findOne({where:{id:parseInt(countryID)}},function(err,data){
                  let userQuestionModel = app.models["questions_"+data.language];
                  ////console.log("countryID===============>>>>",data)
                  userQuestionModel.updateAll({questionMasterId:parseInt(id)},{region:regionsd.toString()},function(err,data)
                  {
                    if(err)
                    {
                      ////console.log(err);
                    }
                    if(x == regionsd.length)
                    {
                      resolve(1);
                    }
                    else
                    {
                      callback()
                    }
                  })
                })
              })
		}
		else
		{
		      resolve(1);

		}
            })  
          })

       })
      }
      else{



      ////console.log("9999"region)
      let regions = region.split(","),x=0;
      //////console.log("ddddddddddddddddddddddddddddddddddddddd")
      async.eachSeries(regions, function(countryID, callback)
      {
        //////console.log(countryID)
        x++
        countryModel.findOne({where:{id:countryID}},function(err,data){
          let userQuestionModel = app.models["questions_"+data.language];
          userQuestionModel.deleteAll({questionMasterId:parseInt(id)},function(err,data)
          {
            if(err)
            {
              if(regions.length == x)
              {
                //////console.log(err);
                reject(err);
              }
              else
              {
                callback()
              }
              
            }
            else
            {
              //////console.log("delete");
              if(regions.length == x)
              {
                resolve(1);
              }
              else
              {
                callback()
              }
            }
          })
        })
      })
    }
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

   
  function addQuestion(session,fields,files)
  {
    ////console.log("//console.log(fileds);",fields);
    let ageArray =  fields.age.split(',');
    let regionCodeArray =  fields.regionCode.split(',');
    let dataIdArray = [];

    return new Promise(function(resolve, reject)
    {
      let regionCodeArray =  fields.regionCode.split(',');
      //console.log(fields);
      async.waterfall([
        
        function(callbackwater)
        {
            questionsSettingModel.findOne({},function(err,setting){
            if(err)
            {

            }
            else
            {
            let userIdArray = [];
            let x=0;id=0;
            //.log("regionCodeArray",regionCodeArray)
            async.eachSeries(regionCodeArray, function(dataIdArray1, callback)
            {
              
              let userQuestionModel =  app.models["questions_"+dataIdArray1];
              let pack_id=0;
              if(fields.finalRound != 1)
              {
                pack_id =fields.package;
              }
               let countryId =session.region
              if(session.region == 1)
              {
                countryId = 4
              }
              else
              {
                countryN = session.region.split(',')
                countryId = countryN[0];
              }

              userQuestionModel.create({category_id:fields.category,sub_category_id:fields.subCategory,
                pack_ID:pack_id,time_Allowed:fields.timeAllowed,age_id:fields.age,
                region:fields.region,
                question:fields.question.trim(),answer1:fields.option1,
                answer2:fields.option2,answer3:fields.option3,answer4:fields.option4,
                correct_Answer:fields.answer,image_URL:"",video_URL:"",sound_URL:"",status:fields.finalRound,created:new Date(),
                modified:new Date(),priority:fields.priority,countryCreated:countryId
                ,creditBy:fields.creditBy,questionActiveStatus:1,questionState:1,
                hint:fields.hint,AnswerOrder:fields.order},function(err,data)
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
                    id = data.id
                  }
                  
                  userQuestionModel.updateAll({id:data.id},{questionMasterId:setting.question_number},function(err,updated)
                  {
                  callback()
                  if(regionCodeArray.length ==  x)
                  {
                    ////////.log("helllll")
                    callbackwater(null, userIdArray,id,setting);
                  }
                 })
                  
                }
              })
            })
          }
        })
          
        },function(userIdArray,id,setting,callbackwater)
        {
          questionsSettingModel.updateAll({id:setting.id},{question_number:setting.question_number+1},function(err,updateNumber){
          })

          if(session.regionCode == 'UK')
          {
            if(regionCodeArray.length == 1)
            {
              // if(regionCodeArray[0] !=  'UK')
              // {
                let obj = {question_id:setting.question_number,UK:1,UKStatus:0,
                          created:new Date,createdBy:session.regionCode,modified:new Date()}
                obj[regionCodeArray[0]] = 1;
                obj[regionCodeArray[0]+"Status"] = 0;
                //delete obj.UK
                //delete obj.UKStatus
                questionsMultilangStatusTempModel.create(obj,function(err,data)
                {
                  if(err)
                  {
                    //.log(err);
                  }
                  else
                  {
                    ////////////.log("====================add");
                  }
                })
              //}
              
            }
            else
            {
              let obj = {question_id:setting.question_number,UK:1,UKStatus:1,created:new Date,createdBy:session.regionCode,modified:new Date()}
              for(let k=0;k<regionCodeArray.length;k++)
              {
                obj[regionCodeArray[k]] = 1;
                
                if(regionCodeArray[k] == 'UK')
                {
                  obj[regionCodeArray[k]+"Status"] = 1;
                }
              }

              questionsMultilangStatusTempModel.create(obj,function(err,data)
              {
                if(err)
                {
                  ////////////.log(err);
                }
                else
                {
                  ////////////.log("====================add");
                }
              })
              
              
            }
          }
          else
          {
              let obj = {question_id:setting.question_number,UK:1,UKStatus:1,created:new Date,
                          createdBy:session.regionCode
                        ,modified:new Date()}
              obj[session.regionCode] = 1;
              obj[session.regionCode+"Status"] = 1;
             
              delete obj.UKStatus
              questionsMultilangStatusTempModel.create(obj,function(err,data)
              {
                if(err)
                {
                  ////////////.log(err);
                }
                else
                {
                  ////////////.log("====================add");
                }
              })


          }


          callbackwater(null, setting.question_number);
        },
        function(id,callbackwater)
        {
          
          if(fields.fileType  != 0)
          {
            uploadFile(files,id,fields.fileType,fields.zoom,regionCodeArray,fields.supportVideo).then(function(upload)
            {
              callbackwater(null,upload);
            }).catch(function(err)
            {
              ////.log(err)
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

function changeEncoding(path) {
    var buffer = fs.readFileSync(path);
    var output = iconv.encode(iconv.decode(buffer, "ISO-8859-1"), "utf-8");
    fs.writeFileSync(path, output);
}

  /* Export Question */

  function exportAddQuestion(fields,files)
  {
    ////////console.log("Hekkkkkkk",fields);
    return new Promise(function(resolve, reject)
    {
      let dataIdArray = [];
      async.waterfall([
        function(callbackwater) {
          ////////////console.log("hhhhhhhhhhhhhhhhhh",fields.age);
          
          if(fields.age.length > 0 && fields.region.length >0)
          {
            let x=0;
            // async.eachSeries(fields.age, function(file, callback)
            // {
              
              //let j =0;
              async.eachSeries(fields.region, function(file1, callback1)
              {
                x++;
                let idObj = {regionArray:file1};
                dataIdArray.push(idObj);
                
                callback1();
                if(fields.region.length == x)
                {
                  callbackwater(null, dataIdArray);
                }
              })
           // })
          }
          else
          {
            resolve("successfully saved");
            ////////////console.log("Helll is here");
          }
        },
        function(dataIdArray,callbackwater)
        {
          //////////console.log(1234);
          if(dataIdArray.length > 0)
          {
            let userIdArray = [];
            let x=0,id=0;
            
              questionsSettingModel.findOne({},function(err,questionNumber)
              {
             
              // tempQuestionModel.findOne({where:{question:fields.question.trim(),answer1:fields.option1,answer2:fields.option2,
              //   answer3:fields.option3,answer4:fields.option4,correct_Answer:fields.answer}},function(err,qdata){
              //     if(err)
              //     {
			        //         //console.log("------------------------",err);
              //     }
              //     else
              //     {
                      let age=fields.age.toString(),masterid;
//                      //console.log("fieldsfieldsfields",fields)
                      if(fields.questionMasterId.trim() != '')
                      {
                        ////////console.log("====================",fields.questionMasterId)
                        masterid = fields.questionMasterId
                      }
                      else
                      {
                        ////////console.log("===2=2=1=1=1=1=2=3=12312=========",questionNumber)
                        masterid = questionNumber.question_number;
                      }
                          ////console.log("fields.age.toString()",typeof fields.age.toString())
                          let age2c = fields.age.toString()
                        console.log(fields)
                        tempQuestionModel.create({category_id:fields.category,sub_category_id:fields.subCategory,
                        pack_ID:fields.package,time_Allowed:fields.timeAllowed,age_id:age2c ,
                        region:fields.region,question:fields.question.trim(),answer1:fields.option1,answer2:fields.option2,
                        answer3:fields.option3,answer4:fields.option4,correct_Answer:fields.answer,image_URL:fields.image_URL,
                        video_URL:fields.video_URL,sound_URL:fields.sound_URL,fileType:fields.fileType,creditBy:fields.creditBy,
                        created:new Date(),status:fields.status,questionActiveStatus:fields.questionState,hint:fields.hint,
                        questionActiveStatus:fields.questionState,questionMasterId:masterid,modified:new Date()
			                  },function(err,data)
                      {
                        if(err)
                        {
                          console.log(err);
                          callbackwater(err);
                        }
                        else
                        {
                          questionsSettingModel.updateAll({id:questionNumber.id},{question_number:questionNumber.question_number+1},function(err,up){

                         
                          let userIdObj =  {id:data.id}
                          userIdArray.push(userIdObj);
                          // x++;
                          // if(x == 1)
                          // {
                            // if(qdata)
                            // {
                            //   id = qdata.questionMasterId
                            // }
                            // else
                            // {
                              id = data.id
                            //}
                            
                          //}
                          //callback()
                          // if(dataIdArray.length ==  x)
                          // {
                            callbackwater(null, userIdArray,id);
                          //}
                        })
                        }
                      })
                //   }
                // })
              })
            //})
          }
          else
          {
            callbackwater(err);
          }
        },function(userIdArray,id,callbackwater)
        {
          // for(let i=0;i<dataIdArray.length;i++)
          // {
          //   tempQuestionModel.updateAll({id:userIdArray[i].id},{questionMasterId:id},function(err,updated)
          //   {
          //     if(err)
          //     {
          //       //////////////consolelog(err);
          //     }
          //     else
          //     {

          //     }
          //   })
          // }
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

function editQuestion(session,fields,files)
  {
    console.log("fields=====================",fields)
    return new Promise(function(resolve, reject)
    {
      
      async.waterfall([
        function(callbackwater)
        {
          if(parseInt(session.adminUserType) != 2)
          {
            alrergids = fields.alrd_region_code.split(',');
              updtquestions=[];
              //////console.log("fields",fields)
              let x =0;
              async.eachSeries(alrergids, function(dataIdArray1, callback)
              {
                  let userQuestionModel =  app.models["questions_"+dataIdArray1];
                  let updateRegionsModel =  fields.alrd_region_code.split(',');
                  let updateRegion = updateRegionsModel.filter(a => a === dataIdArray1);
                  
                  

                    userQuestionModel.deleteAll({questionMasterId:fields.id},function(err,delet){
                      

                              x++;
                              callback()
                              if(alrergids.length ==  x)
                              {
                                callbackwater(null);
                              }
                              // else
                              // {
                              //   callback() 
                              // }
                            
                    })
                      
                      //}
                   })
          }
          else
          {
            callbackwater(null);
          }

        },
        function(callbackwater)
        {
          if(parseInt(session.adminUserType) == 2)
          {
            let userQuestionModel =  app.models["questions_"+session.regionCode];
            if( fields.orderCheck != 'on')
            {
              fields.AnswerOrder = ""
            }

            let image = fields['imageUrl_'+session.regionCode];
                  let sound = fields['soundUrl_'+session.regionCode];
                  let video = fields['videoUrl_'+session.regionCode];
                  let Supportvideo = fields['SupportVideoURL_'+session.regionCode];

                  if(files['image_'+session.regionCode].name)
                    image = '';
                  if(files['Video_'+session.regionCode].name)
                    video = '';
                  if(files['Sound_'+session.regionCode].name)
                    sound = '';

                  //console.log
                  

                  if(fields["fileType_"+session.regionCode]  == '0')
                  {
                    image = '';
                    video = '';
                    sound = '';
                    Supportvideo=''
                  }
                  else if(fields["fileType_"+session.regionCode]  == 1 || fields["fileType_"+session.regionCode]  == 4)
                  {
                    Supportvideo='';
                    video = '';
                    sound = '';
                  }
                  else if(fields["fileType_"+session.regionCode]  == 2)
                  {
                    image = '';
                    video = '';
                    Supportvideo=''
                  }
                  else if(fields["fileType_"+session.regionCode]  == 3)
                  {
                    image = '';
                    sound = '';
                  }

                  

                  let pack_id=0;
                  if(fields.finalRound != 1)
                  {
                    pack_id =fields.package;
                  }

                  if(session.adminUserType == 2)
                  {
                      pack_id =session.packValG;
                  }	



            let obj ={category_id:fields.category,sub_category_id:fields.subCategory,
              pack_ID:fields.package,time_Allowed:fields.timeAllowed,age_id:fields.age,
              region:fields.region,question:fields.question.trim(),answer1:fields.option1,
              answer2:fields.option2,answer3:fields.option3,answer4:fields.option4,
              correct_Answer:fields.answer,image_URL:image,video_URL:video,
              sound_URL:sound,status:fields.finalRound,created:new Date(),
              modified:new Date(),creditBy:fields.creditBy,questionActiveStatus:1,questionState:1
              ,hint:fields["hint_"+session.regionCode], priority:fields.priority,
              AnswerOrder:fields.AnswerOrder,sound_URL:sound,fileType:fields["fileType_"+session.regionCode]}

              userQuestionModel.updateAll({questionMasterId:fields.id},obj,function(err,data)
              {
                if(err)
                {
                  console.log(err);
                  callbackwater(err);
                }
                else
                {
                  //console.log("nnnn");
                  callbackwater(null,[],data.id);
                }
              })
          }
          else
          {
           
              let userIdArray = [];
              let x=0;
              rgids = fields.region_code.split(',');
              alrergids = fields.alrd_region_code.split(',');
              updtquestions=[];
              //////console.log("fields",fields)
              async.eachSeries(rgids, function(dataIdArray1, callback)
              {
                //console.log(dataIdArray1)
                  let image = fields['imageUrl_'+dataIdArray1];
                  let sound = fields['soundUrl_'+dataIdArray1];
                  let video = fields['videoUrl_'+dataIdArray1];
                  let Supportvideo = fields['SupportVideoURL_'+dataIdArray1];

                  if(files['image_'+dataIdArray1].name)
                    image = '';
                  if(files['Video_'+dataIdArray1].name)
                    video = '';
                  if(files['Sound_'+dataIdArray1].name)
                    sound = '';

                  //console.log
                  

                  if(fields["fileType_"+dataIdArray1]  == '0')
                  {
                    image = '';
                    video = '';
                    sound = '';
                    Supportvideo=''
                  }
                  else if(fields["fileType_"+dataIdArray1]  == 1 || fields["fileType_"+dataIdArray1]  == 4)
                  {
                    Supportvideo='';
                    video = '';
                    sound = '';
                  }
                  else if(fields["fileType_"+dataIdArray1]  == 2)
                  {
                    image = '';
                    video = '';
                    Supportvideo=''
                  }
                  else if(fields["fileType_"+dataIdArray1]  == 3)
                  {
                    image = '';
                    sound = '';
                  }

                  

                  let pack_id=0;
                  if(fields.finalRound != 1)
                  {
                    pack_id =fields.package;
                  }

                  if(session.adminUserType == 2)
                  {
                      pack_id =session.packValG;
                  }	


                  if(fields["zoom_"+dataIdArray1] == 'on')
                  {
                    fields["fileType_"+dataIdArray1] = 4;
                  }
              
                  
                  let userQuestionModel =  app.models["questions_"+dataIdArray1];
                  let updateRegionsModel =  fields.alrd_region_code.split(',');
                  let updateRegion = updateRegionsModel.filter(a => a === dataIdArray1);
                  
                 
                    //userQuestionModel.deleteAll({questionMasterId:fields.id},function(err,delet){
                      if(fields["orderCheck_"+dataIdArray1] !=  'on')
                      {
                        fields["AnswerOrder_"+dataIdArray1] = ""
                      }
                      //////console.log("new Country add")
                      // let newRegionsModel =  fields.new_region_code.split(',');
                      // let newRegion = newRegionsModel.filter(a => a === parseInt(dataIdArray1));

                      console.log("image",image)



                      userQuestionModel.create({category_id:fields.category,
                      sub_category_id:fields.subCategory,pack_ID:pack_id,time_Allowed:fields.timeAllowed,age_id:fields.age              ,hint:fields.hint, priority:fields.priority,
                      region:fields.region,question:fields["question_"+dataIdArray1].trim(),answer1:fields["option1_"+dataIdArray1],
                      answer2:fields["option2_"+dataIdArray1],answer3:fields["option3_"+dataIdArray1],answer4:fields["option4_"+dataIdArray1],
                      correct_Answer:fields["answer_"+dataIdArray1],hint:fields["hint_"+dataIdArray1],created:new Date(),modified:new Date(),creditBy: fields.creditBy
                      ,status:fields.finalRound,questionActiveStatus:fields.questionActiveStatus,AnswerOrder:fields["AnswerOrder_"+dataIdArray1],
                      created:new Date(),questionMasterId:fields.id,modified:new Date(),fileType:fields["fileType_"+dataIdArray1],image_URL:image,video_URL:video,sound_URL:sound}
                        ,function(err,data)
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
                              if(rgids.length ==  x)
                              {
                                callbackwater(null, userIdArray,id);
                              }
                            }
                          })
                        //})
                      //}
                   })
                }
              },function(userIdArray,id,callbackwater)
              {
                console.log("session.adminUserType",session.adminUserType)
                console.log("session.adminUserType",fields.regionType)
                if(parseInt(session.adminUserType) == 1 || parseInt(fields.regionType) == 3)
                {
                  questionsMultilangStatusTempModel.findOne({where:{question_id:fields.id}},function(err,tempData){
                    if(err)
                    {

                    }
                    else
                    {
                      if(tempData != null)
                      {
                        let regionArray = fields.region_code.split(',');
                        let xyz={}
                        //console.log("tempData",tempData)
                        for(let k=0;k<regionArray.length;k++)
                        {
                          if(tempData !=  null)
                          {
                            if(regionArray[k] == session.regionCode)
                            {
                              if(regionArray[k]+"Status" == 1)
                              {
                                xyz[regionArray[k]] = 2;
                                xyz[regionArray[k]+"Status"]=2
                              }
                              else
                              {
                                xyz[regionArray[k]] = 1;
                                xyz[regionArray[k]+"Status"]=1
                              }
                            }
                            else if(tempData[regionArray[k]] == 1 && tempData[regionArray[k]+"Status"] == 1)
                            {
                              xyz[regionArray[k]] = 2;
                            }
                            else
                            {
                              xyz[regionArray[k]] = 1;
                              ////////console.log("why")
                            }
                          }
                        }  

                        console.log("======",xyz)
                        questionsMultilangStatusTempModel.updateAll({question_id:fields.id},xyz,function(err,data)
                        {
                          if(err)
                          {
                            ////////console.log(err);
                          }
                          else
                          {
                            callbackwater(null, fields.id);
                          }
                        })
                      }
                      else
                      {
                        let xyz={question_id:fields.id,created:new Date(),modified:new Date()}
                        let regionArray = fields.region_code.split(',');
                      
                        for(let k=0;k<regionArray.length;k++)
                        {
                          if(tempData !=  null)
                          {
                            if(regionArray[k] == session.regionCode)
                            {
                              if(regionArray[k]+"Status" == 1)
                              {
                                xyz[regionArray[k]] = 2;
                                xyz[regionArray[k]+"Status"]=2
                              }
                              else
                              {
                                xyz[regionArray[k]] = 1;
                                xyz[regionArray[k]+"Status"]=1
                              }
                            }
                            else if(tempData[regionArray[k]] == 1 && tempData[regionArray[k]+"Status"] == 1)
                            {
                              xyz[regionArray[k]] = 2;
                            }
                            else
                            {
                              xyz[regionArray[k]] = 1;
                              ////////console.log("why")
                            }
                          }
                        } 


                        questionsMultilangStatusTempModel.create(xyz,function(err,data)
                        {
                          if(err)
                          {
                            //console.log(err);
                          }
                          else
                          {
                            callbackwater(null, fields.id);
                          }
                        })
                      }
                    }
                  })
                      
                }
                else
                {
                  console.log("new eneter");
                  questionsMultilangStatusTempModel.findOne({where:{question_id:fields.id}},function(err,tempData){
                    if(err)
                    {

                    }
                    else
                    {
                      console.log("well played,",tempData)
                      let regionArray = fields.region_code.split(',');
                      let xyz={}
                      for(let k=0;k<regionArray.length;k++)
                      {
                        if(regionArray[k] == session.regionCode)
                        {
                          if(regionArray[k]+"Status" == 1)
                          {
                            xyz[regionArray[k]] = 2;
                            xyz[regionArray[k]+"Status"]=2
                          }
                          else
                          {
                            xyz[regionArray[k]] = 1;
                            xyz[regionArray[k]+"Status"]=1
                          }
                        }
                      } 
                      cosole.log("fileds to cupdate",xyz); 
                        
                      questionsMultilangStatusTempModel.updateAll({question_id:fields.id},xyz,function(err,data)
                      {
                        if(err)
                        {
                        ////////console.log(err);
                     
                        }
                        else
                        {
                          callbackwater(null, fields.id);
                        }
                      })
                    }
                          
              })
            }
          },
        function(userIdArray,callbackwater)
        {
          if(parseInt(session.adminUserType) == 2)
          {
            if(fields["fileType_"+session.regionCode]  != 0)
            {
              console.log("ennnnnnnnter0000222222")
              if(files['image_'+session.regionCode].name != '' ||  files['Sound_'+session.regionCode].name != '' || files['Video_'+session.regionCode].name != '' || files['SupportVideoURL_'+session.regionCode].name != '')
              {
                console.log("ennnnnnnnter0000000000000000")
                editUploadFile(files,userIdArray,fields["fileType_"+session.regionCode],fields.zoom,fields.id,session.regionCode).then(function(upload)
                {
                  callbackwater(null,upload);
                }).catch(function(err)
                {
                  callbackwater(err);
                });
              }
              else
              {
                console.log("ennnnnnnnter00000055555555555555555555")
                resolve("successfully saved");
              }
            }
            else
            {
              resolve("successfully saved");
            }
          }
          else
          {
            
            rgids = fields.region_code.split(',');
            let x=0 
            async.eachSeries(rgids, function(dataIdArray1, callback)
            {
              //console.log("============================================enter3",dataIdArray1)
              x++
              if(fields['fileType_'+dataIdArray1]  != 0)
              {
                if(files['image_'+dataIdArray1].name != '' ||  files['Sound_'+dataIdArray1].name != '' || files['Video_'+dataIdArray1].name != '' || files['SupportVideoURL_'+dataIdArray1].name != '')
                {
                   //////console.log("Enter in image section=================================",files)
                  // callback()
                  
                  
                  editUploadFile(files,userIdArray,fields['fileType_'+dataIdArray1],fields.zoom,fields.id,dataIdArray1).then(function(upload)
                  {
                    if(x== rgids.length)
                    {
                      callbackwater(null,upload);
                    }
                    else
                    {
                      callback()
                    }
                  }).catch(function(err)
                  {
                    callbackwater(err);
                  });
                }
                else
                {
                  //console.log("============================================enter2",dataIdArray1)
                  if(fields['imageUrl_'+dataIdArray1] == '' && fields['soundUrl_'+dataIdArray1] == '' && fields['videoUrl_'+dataIdArray1] == '' && fields['SupportVideoURL_'+dataIdArray1] == '' )
                  {
                    if(files['image'].name != '' ||  files['Sound'].name != '' || files['Video'].name != '' || files['SupportVideoURL'].name != '')
                    {
                      editUploadFileUn(files,userIdArray,fields['fileType'],fields.zoom,fields.id,dataIdArray1).then(function(upload)
                      {
                        if(x== rgids.length)
                        {
                          callbackwater(null,upload);
                        }
                        else
                        {
                          if(x== rgids.length)
                          {
                            callbackwater(null,upload);
                          }
                          else
                          {
                            callback()
                          }
                        }
                      }).catch(function(err)
                      {
                        callbackwater(err);
                      });
                    }
                    else
                    {
                      if(x== rgids.length)
                      {
                        callbackwater(null,1);
                      }
                      else
                      {
                        callback()
                      }
                    }
                  }
                  else
                  {
                    if(x == rgids.length)
                    {
                      callbackwater(null,1);
                    }
                    else
                    {
                      callback()
                    }
                  }

                  
                }
              }
              else
              {
                //console.log("============================================enter",dataIdArray1)
                if(fields['fileType'] !=  0)
                {
                  if(fields['imageUrl_'+dataIdArray1] == '' && fields['soundUrl_'+dataIdArray1] == '' && fields['videoUrl_'+dataIdArray1] == '' && fields['SupportVideoURL_'+dataIdArray1] == '' )
                  {
                    if(files['image'].name != '' ||  files['Sound'].name != '' || files['Video'].name != '' || files['SupportVideoURL'].name != '')
                    {
                      // ////console.log("enter to the drag",dataIdArray1)
                      // ////console.log("Enter in image section=================================",files)
                      // callback()
                      editUploadFileUn(files,userIdArray,fields['fileType'],fields.zoom,fields.id,dataIdArray1).then(function(upload)
                      {
                        if(x== rgids.length)
                        {
                          callbackwater(null,upload);
                        }
                        else
                        {
                          if(x== rgids.length)
                          {
                            callbackwater(null,upload);
                          }
                          else
                          {
                            callback()
                          }
                        }
                      }).catch(function(err)
                      {
                        callbackwater(err);
                      });
                    }
                    else
                    {
                      if(x== rgids.length)
                      {
                        callbackwater(null,1);
                      }
                      else
                      {
                        callback()
                      }
                    }
                  }
                  else
                  {
                    if(x== rgids.length)
                    {
                      callbackwater(null,1);
                    }
                    else
                    {
                      callback()
                    }
                  }
                }
                else
                {
                  if(x== rgids.length)
                    {
                      callbackwater(null,1);
                    }
                    else
                    {
                      callback()
                    }
                }
                // callback()
                // resolve("successfully saved");
              }
            })
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
    //////console.log("file ==================",files);
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
                    //////////console.log("================= image name ================",imageName);
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
                    ////////console.log(err);
                  });

            //   }
            // })
          }
        });
    })
  }


  function uploadCountryImage(files,id)
  {
    //////////console.log("file ==================",files);
    return new Promise(function(resolve, reject)
    {
        let dir = '../client/storage/country/';
        let oldpath="";
        let newpath="";
        let savePath ="";
        let randomSt = randomstring.generate(5);
        let date2 = new Date();
        let timeMs = date2.getTime();
        let imageName =randomSt+timeMs;
        oldpath = files.logo.path;
        let s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/country'}});

        //newPath = '../client/storage/packages/'+imageName+".jpg";
        savePath = 'storage/country/'+imageName+".jpg";

        // mv(oldpath, newPath, function (err)
        // {
        //   if(err)
        //   {
        //     reject(0);
        //   }
        //   else
        //   {
          //////console.log(savePath)
            countryModel.updateAll({id:id},{image:savePath},function(err,updated)
            {
              if(err)
              {
                //////console.log(err);
                reject(0);
              }
              else
              {
                //////console.log(updated)
                sharp(oldpath)
                .toBuffer()
                .then( data =>
                 {
                    //////////////console.log("================= image name ================",imageName);
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
                    ////////////console.log(err);
                  });

            //   }
            // })
          }
        });
    })
  }






  
  /* Upload file */

  function uploadFile(files,id,fileType,zoom,region,supportVideo)
  {
    ////console.log("nnnnnnn")
    return new Promise(function(resolve, reject)
    {
        let dir="";
        let saveObj ="";
        let oldpath="";
        let ext =""
        let randomSt = randomstring.generate(5);
        let randomSt2 = randomstring.generate(5);
        let date2 = new Date();
        let timeMs = date2.getTime();
        let imageName =randomSt+timeMs;
        let supportImageName =randomSt2+timeMs;
        let s3Bucket,supportS3Bucket,type;
        let supportOldpath="";
        let supportExt =""
        let supportObj = {exist:0}

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
        else if(fileType == 3)
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
          if(supportVideo ==  'on')
          {
            supportOldpath = files.supportVideoFile.path;
            supportExt = path.extname(files.supportVideoFile.name);
            saveObj = {
                        video_URL:'storage/questions/videos/'+imageName,
                        SupportVideoURL:'storage/questions/supportVideos/'+supportImageName+supportExt,
                        fileType :3
                      };
                      bucketUrl = "outsmarted/storage/questions/supportVideos";
            supportS3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/supportVideos'}});
            supportImageName =randomSt2+timeMs+ext;
            
            supportObj =  {exist:1,oldPath:supportOldpath,s3Bucket:supportS3Bucket,imageName:supportImageName}
          }          

        }


        //console.log("saveObjsaveObj",saveObj,id)
        
          
        
        
        let x=0
        async.eachSeries(region, function(fields, callback)
        {
          let userQuestionModel =  app.models["questions_"+fields];
          x++
          userQuestionModel.updateAll({questionMasterId:id},saveObj,function(err,updated)
          {
            if(err)
            {
              
              reject(0);
            }
            else
            {
              if(region.length == x)
              {
                resolve()
              }
              else
              {
                callback()
              }

            }
          })
        })

        

        uploadFileInS3(oldpath,s3Bucket,imageName,fileType,supportObj).then(function(value)
        {
          resolve(1);
        }).catch(function(err)
        {
          //console.log('Caught an error2!', err);
        });
    })
  }

  /* Upload file */

  function editUploadFile(files,idArray,fileType,zoom,id,region)
  {
    //console.log("enter in new screennnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn")
  return new Promise(function(resolve, reject)
  {
    
      let dir="";
      let saveObj ="";
      let oldpath="";
      let newpath="";
      let ext =""
      let randomSt = randomstring.generate(5);
      let randomSt2 = randomstring.generate(5);
      let date2 = new Date();
      let timeMs = date2.getTime();
      let imageName =randomSt+timeMs;
      let supportImageName =randomSt2+timeMs;
      let s3Bucket;
      let userQuestionModel =  app.models["questions_"+region];
      let supportOldpath="";
      let supportExt =""
      let supportObj = {exist:0}
      console.log("enter in new screennnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn3")
      console.log("fileType",files)
      if(fileType == 1 || fileType == 4)
      {
        oldpath = files['image_'+region].path;
         ext = path.extname(files['image_'+region].name);
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
         ext = path.extname(files['Sound_'+region].name);
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
        oldpath = files['Video_'+region].path;
        ext = path.extname(files['Video_'+region].name);
        dir = '../client/storage/questions/videos/';
        saveObj = {
                    video_URL:'storage/questions/videos/'+imageName+ext,
                    fileType :3
                  };
        s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/videos'}});
        imageName =randomSt+timeMs+ext;
        
        if(files['SupportVideoURL_'+region].name)
        {
          supportOldpath = files['SupportVideoURL_'+region].path;
          supportExt = path.extname(files['SupportVideoURL_'+region].name);
          saveObj = {
                      video_URL:'storage/questions/videos/'+imageName,
                      SupportVideoURL:'storage/questions/supportVideos/'+supportImageName+supportExt,
                      fileType :3
                    };
          supportS3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/supportVideos'}});
          supportImageName =randomSt2+timeMs+ext;
          supportObj =  {exist:1,oldPath:supportOldpath,s3Bucket:supportS3Bucket,imageName:supportImageName}
        }
      }
      newPath = dir+imageName+ext;
      //console.log("rooo",newPath)
      //////consolelog("asssssssssssss",saveObj);
      // mv(oldpath, newPath, function (err)
      // {
      //   if(err)
      //   {
      //     reject(0);
      //   }
      //   else
      //   {
          
            userQuestionModel.updateAll({questionMasterId:id},saveObj,function(err,updated)
            {
              if(err)
              {
                consolelog(err);
                reject(0);
              }
              else
              {

              }
            })
          
          uploadFileInS3(oldpath,s3Bucket,imageName,fileType,supportObj).then(function(value)
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


function editUploadFileUn(files,idArray,fileType,zoom,id,region)
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
      let userQuestionModel =  app.models["questions_"+region];
      ////console.log("enter in new screennnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn3")
      ////console.log("fileType",fileType)
      if(fileType == 1 || fileType == 4)
      {
        oldpath = files['image'].path;
         ext = path.extname(files['image'].name);
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
         ext = path.extname(files['Sound'].name);
        dir = '../client/storage/questions/sounds/';
        saveObj = {
                    sound_URL:'storage/questions/sounds/'+imageName+ext,
                    fileType :2
                  };
        s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/sounds'}});

        imageName =randomSt+timeMs+ext;
      }
      else if(fileType == 3)
      {
        oldpath = files.Video.path;
         ext = path.extname(files['Video'].name);
        dir = '../client/storage/questions/videos/';
        saveObj = {
                    video_URL:'storage/questions/videos/'+imageName+ext,
                    fileType :3
                  };

        s3Bucket = new AWS.S3({params:{Bucket:'outsmarted/storage/questions/videos'}});

        imageName =randomSt+timeMs+ext;
      }
      newPath = dir+imageName+ext;
      //console.log(newPath)
      ////console.log("rooo",randomSt+timeMs+ext)
      //////consolelog("asssssssssssss",saveObj);
      // mv(oldpath, newPath, function (err)
      // {
      //   if(err)
      //   {
      //     reject(0);
      //   }
      //   else
      //   {
          
            userQuestionModel.updateAll({questionMasterId:id},saveObj,function(err,updated)
            {
              if(err)
              {
                consolelog(err);
                reject(0);
              }
              else
              {
                //console.log("updated")
              }
            })
          
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
    ////console.log("============Add file=====================")
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
          

          let userQuestionModel = app.models["questions_"+fields.regionName];
            userQuestionModel.updateAll({questionMasterId:fields.editQuestionId},saveObj,function(err,updated)
            {
              if(err)
              {
                ////console.log(err);
                reject(0);
              }
              else
              {

                uploadFileInS3(oldpath,s3Bucket,imageName,fields.fileType).then(function(value)
                {
                  resolve(1);
                }).catch(function(err)
                {
                  ////////console.log('Caught an error2!', err);
                });
                resolve(1);
              }
            })
        //   }
        // });
      }
      else
      {
        userQuestionModel.updateAll({questionMasterId:fields.editQuestionId},saveObj,function(err,updated)
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

 function uploadFileInS3(files,s3Bucket,imageName,fileType,supportVideo)
 {
   //console.log("=============")
   //console.log(s3Bucket)
   //console.log(supportVideo.s3Bucket)
   //console.log("=============")
   return new Promise(function(resolve, reject)
   {
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
             resolve(1);
           }
         })
       })
       .catch( err => {
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
         //console.log("filesfilesfiles",files)
         fs.readFile(files, function (err, data)
         {
           if (err) { throw err; }
           let randomS = randomstring.generate();
           let params =  {}
           params.Key = imageName;
           params.Body = data;
           params.ContentType = 'video/mp4';
           //console.log("param2",params)
           s3Bucket.putObject(params, function(err, data)
           {
             if (err)
             {
              if(supportVideo.exist ==  1)
              {
               reject(1);
              }
              else
              {
               resolve(url);
              }

             }
             else
             {
               let url = path +params.Key;
               if(supportVideo.exist ==  1)
               {

               }
               else
               {
                resolve(url);
               }
             }
           })
         })


         if(supportVideo.exist ==  1)
         {

          


           //console.log("endter iiiiiii in support File arera",supportVideo)
          fs.readFile(supportVideo.oldPath, function (err, data)
          {
            ////console.log("daatatatatatat",data)
            if (err) { throw err; }
            let params =  {}
            params.Key = supportVideo.imageName;
            params.Body = data;
            params.ContentType = 'video/mp4';
            //console.log("param1",params)
            supportVideo.s3Bucket.putObject(params, function(err, data)
            {
              if (err)
              {

                //console.log(err)
                reject(1);
              }
              else
              {
                ////console.log("datadatadatadata",data)
                let url = path +params.Key;
                ////console.log(path)
                resolve(url);
              }
            })
          })
         }
       }
     })
 }


 function uploadFileInCategory(files,s3Bucket,imageName,fileType)
 {
   console.log("=============")
   //console.log(s3Bucket)
   console.log(fileType)
   console.log("=============")
   return new Promise(function(resolve, reject)
   {
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
            console.log("0000")
             reject(1);
           }
           else
           {
            console.log("9999")
             resolve(1);
           }
         })
       })
       .catch( err => {
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
         //console.log("filesfilesfiles",files)
         fs.readFile(files, function (err, data)
         {
           if (err) { throw err; }
           let randomS = randomstring.generate();
           let params =  {}
           params.Key = imageName;
           params.Body = data;
           params.ContentType = 'video/mp4';
           //console.log("param2",params)
           s3Bucket.putObject(params, function(err, data)
           {
             if (err)
             {
              if(supportVideo.exist ==  1)
              {
               reject(1);
              }
              else
              {
               resolve(url);
              }

             }
             else
             {
               let url = path +params.Key;
               if(supportVideo.exist ==  1)
               {

               }
               else
               {
                resolve(url);
               }
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


       // dir = 'E:\shashank\stuart\stauartWorking\working\working\client\storage\questions\csv';
       // saveObj = 'E:\shashank\stuart\stauartWorking\working\working\client\storage\questions\csv'+imageName+ext
         dir = '/home/ubuntu/outsmartedNewUpdate/client/storage/questions/csv/';
         saveObj = '/home/ubuntu/outsmartedNewUpdate/client/storage/questions/csv/'+imageName+ext

        newPath = dir+imageName+ext;
	      ////consolelog(newPath);
       changeEncoding(oldpath) 
        mv(oldpath, newPath, function (err)
        {
          if(err)
          {
		        //////console.log(err);
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
	////consolelog("ssssssssssssssss");
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
          &&  jsonObj[0].status != undefined &&  jsonObj[0].questionState != undefined &&  jsonObj[0].questionMasterId != undefined
          )
        {
          //console.log(jsonObj)

          for(let i=0;i<jsonObj.length;i++)
          {
            console.log(jsonObj[i].QUESTION)
          }



       
        if(jsonObj.length <= 15000)
        {



          async.eachSeries(jsonObj, function(file, callback)
          {
            //let strin = iconv.decode(Buffer.from(file.QUESTION), 'win1251')
            //console.log(file.QUESTION)
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
                      //////////console.log("Sibcate",subCategory);
                      if(subCategory.status == 1)
                      {
                        ////////console.log(subCategory);
                        let subCate =  subCategory.data;
                        ////////console.log("subCate",subCate)
                        callbackwater(null,category,subCate);
                      }
                      else
                      {
                        errorLogsModel.create({page:"QuestionUpload",error:subCategory.message,created:new Date(),modified:new Date()},function(err,data){
                          if(err)
                          {
                            //////////console.log(err);
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
                    //////////console.log("ageArray ",ageArray );

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
                              //////consolelog("xxxxx",x);
                              //////consolelog("ageArray.length",ageArray.length);
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
                              ////////console.log("ERROR")
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
		                  ////////console.log("countryArray ",countryArray );
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
                    ////////console.log("dtatatatatatat",category);
                    let fields = {category:category.id,subCategory:subCate.id,package:package.package,
                      timeAllowed:file.TIMEALLOWED,age:age,region:file.REGION,question:file.QUESTION,option1:file.ANSWER1,option2:file.ANSWER2,
                      option3:file.ANSWER3,option4:file.ANSWER4,answer:file.CORRECTANSWER,status:parseInt(file.status),
                      fileType:fileType,image_URL:imageUrl,sound_URL:soundUrl,video_URL:videoUrl,
                      creditBy:file.creditBy,questionState:file.questionState,questionMasterId:file.questionMasterId,hint:file.HINT};

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
          reject("Please Enter less then 500 rows");
        }
      }
      else
      {
        ////////console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        reject("Please compare the csv file column with your");
      }
      })
    })
  }


function questionLoadHint(saveObj,package)
  {
	////consolelog("ssssssssssssssss");
    return new Promise(function(resolve, reject)
    {
      let x=0;

      const csvFilePath=saveObj;
      let questionModel = app.models.questions_FR
      console.log(saveObj)
      csv().fromFile(csvFilePath).then((jsonObj)=>
      {
        if(jsonObj.length <= 15000)
        {
          async.eachSeries(jsonObj, function(file, callback)
          {
           if(file.hint != '')
           {
            questionModel.updateAll({id:file.questionMasterId},{hint:file.HINT},function(err,data)
            {
              if(err)
              {
                callback()
              }
              else
              {
                callback()    
              }
            })
           }
           else
           {
            callback()
           }
            
          })
        }
        else
        {
          reject("Please Enter less then 500 rows");
        }
      
      })
    })
  }

function uploadRedeemCSVFile(fields,files)
  {
	  //////console.log("question>>>>>>>");
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

        dir =  '/home/ubuntu/outsmartedNewUpdate/client/storage/redeemCode/';
        saveObj = '/home/ubuntu/outsmartedNewUpdate/client/storage/redeemCode/'+imageName+ext

        newPath = dir+imageName+ext;
	////consolelog(newPath);
        mv(oldpath, newPath, function (err)
        {
          if(err)
          {
		  //////console.log("-------------",err);
            reject(0);
          }
          else
          {

            redeemCodeLoad(saveObj,fields).then(function(question)
            {

              resolve(1);
            })
            .catch(function(err)
            {
				//////console.log("question>>>>>>>");
              reject(err);
            });
          }
        });
    })
  }

  /* upload questions */

  function redeemCodeLoad(saveObj,package)
  {
	//////console.log("ssssssssssssssss",saveObj);
    return new Promise(function(resolve, reject)
    {
      let x=0;
      const csvFilePath=saveObj;
      csv().fromFile(csvFilePath).then((jsonObj)=>
      {
		  ////////console.log("jsonObj",jsonObj)
        if(jsonObj[0].CODE != undefined && jsonObj[0].CATEGORY != undefined )
        {
			////////console.log("jsonObj",jsonObj)
			
        if(jsonObj.length <= 5000)
        {
			let finalData = []
          async.eachSeries(jsonObj, function(file, callback)
          {
			  //////console.log(jsonObj.length)
			  //////console.log(x)
			  x++;
            if(jsonObj.length == x)
            {
				//////console.log(file)
				let obj = {redeem_code:file.CODE,categories:file.CATEGORY,packages:file.PACK,status:0,created:new Date(),modified:new Date()}
				finalData.push(obj)
				
				redeemCardModel.create(finalData,function(err,data){
					if(err)
					{
						//////console.log("err",err)
					}
					else
					{
						resolve(1);
					}
				})
				
			}
			else
			{
				//x++;
				if(file.CATEGORY == null)
				{
					file.CATEGORY = ''
				}
				
				if(file.PACK == null)
				{
					file.PACK = ''
				}
				
				
				
				let obj = {redeem_code:file.CODE,categories:file.CATEGORY,packages:file.PACK,status:0,created:new Date(),modified:new Date()}
				finalData.push(obj)
				////////console.log(x)
				callback()
			}
			
		  })
		}
        else
        {
            reject("Can insert 5000 rows only"); 
        }
		}
	  })
	})
  }
  






  /* Exporting Licence into csv file */

  function addExportLicence(country_id,distributor_id,type,res)
  {
    ////consolelog('type ===================',type);
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

      ////consolelog("country id ============",country_id);
      ////consolelog("distributor id ============",distributor_id);


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
      ////consolelog("condition ============",condition);
      licenceModel.find(condition,function(err,data)
      {

        ////consolelog("data >>>>>>>>>>>>>",data)
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
	//console.log("fields",fields);
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
	    //console.log("data",data);
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
   // ////consolelog('type ===================',type);
    return new Promise(function(resolve, reject)
    {
      ////consolelog("eeeee");
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
     // ////consolelog("jjjjjjjjjjjjjj")
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

      //////consolelog("country id ============",country_id);
      //////consolelog("distributor id ============",distributor_id);

      userQuestionModel.find({include:['categories','sub_categories','age_categories','countries','question_packages'],where:{pack_ID:9}},function(err,data)
      {
        ////consolelog(data);
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

        uploadFileInCategory(oldpath,s3Bucket,imageName,1).then(function(value)
        {
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

/* ====================== view Export Question ======================*/
methods.viewExportQuestion = function(req,res,cb)
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

  /* ====================== view Export Question ======================*/
methods.viewFinalRound = function(req,res,cb)
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


methods.getDataAndExport = function(req,res, cb)
{
  let questions =  app.models.questions;
  let dsQuestion = questions.dataSource;
  
  let searchRegion = req.session.regionCode;
  //let searchRegion = "en";
  let condition = "";
  console.log(req.body);
   
  
  let categories =  app.models.categories;
  let countries =  app.models.countries;
  let question_packages = app.models.question_packages
  let age_categories = app.models.age_categories
  let dsCountry = countries.dataSource;
  let dsCategory = categories.dataSource;
  let dsQuestionPackages = question_packages.dataSource;//let sql = `CALL filterTodo(?)`;
  let dsAges = age_categories.dataSource;
  let countriesProcedure = `CALL GetAllCountry()`;
  let categoriesProcedure = `CALL GetAllCategories()`;
  let packagesProcedure = `CALL GetAllPackages()`;
  let ageProcedure = `CALL GetAllAge()`;

    


  //{ category: '2', packages: '2', region: '3' }
  if(req.body.region != "")
  {
    if( req.body.packages != ""  &&   req.body.category != "")
    {
      condition = 'where pack_ID ='+req.body.packages+' and category_id='+req.body.category+''
    }
    else if( req.body.packages == ""  &&   req.body.category == "")
    {
      condition = 'where  category_id='+req.body.category+''
    }
    else
    {
      condition = 'where pack_ID ='+req.body.packages+''
    }

    dsQuestion.connector.query('SELECT * FROM questions_'+searchRegion+' '+condition+'', function (err, data)
    { 
      if(err)
      {
        cb(null,{status:"Error",type:0})
      }
      else
      {
        if(data.length > 0)
        {
          dsCountry.connector.query(countriesProcedure, (error, countriesData, field1s) => {
          if (error) {
            console.log(error)
          }
          else
          {
            dsCategory.connector.query(categoriesProcedure, (error, categoriesData, field2s) => {
            if (error) 
            {
              console.log(error)
              //return console.error(error.message);
            }
              else
              {
                dsAges.connector.query(ageProcedure, (error, ageData, field3s) => {
                  if (error) 
                  {
                    console.log(error)
                    //return console.error(error.message);
                  }
                  else
                  {
                    let i=0;var documents = [];
                    async.eachSeries(data, function(fields, callback)
                    {
                      i++
                      let region =  countriesData[0].filter(a=>a.id == req.body.region)
                      let obj;
                      let category =  categoriesData[0].filter(a=>a.id == fields.category_id)
                      let ageArr = fields.age_id.split(',');
                      let age;
                      if(ageArr.length > 1)
                      {
                        for(let i=0;i<ageArr.length;i++)
                        {
                          let ageVal= ageData[0].filter(a=>a.id == ageArr[i])
                          age =  age+','+ageVal[0].age
                        }
                      }
                      else
                      {
                        age  = ageData[0].filter(a=>a.id == fields.age_id )
                        age =  age[0].age
                      }

//                      console.log("======================",age);
                      

                      
                        if(i === data.length)
                        {
                          fields.question = fields.question.replace(/,/g, "");
                          fields.answer1 = fields.answer1.replace(/,/g, "");
                          fields.answer2 = fields.answer2.replace(/,/g, "");
                          fields.answer3 = fields.answer3.replace(/,/g, "");
                          fields.answer4 = fields.answer4.replace(/,/g, "");
                          obj = {
                            CATEGORY: category[0].category,
                            SUBCATEGORY: 'NONE',
                            AGE:age,
                            REGION: region[0].name,
                            TIMEALLOWED: fields.time_Allowed,
                            QUESTION:fields.question,
                            ANSWER1:fields.answer1,
                            ANSWER2:fields.answer2,
                            ANSWER3:fields.answer3,
                            ANSWER4:fields.answer4,
                            CORRECTANSWER:fields.correct_Answer,
                            IMAGEURL:fields.image_URL,
                            VIDEOURL:fields.video_URL,
                            SOUNDURL:fields.sound_URL,
                            FILETYPE:fields.fileType,
                            creditBy:fields.creditBy,
                            status:fields.status,
                            questionState:fields.questionState,
                            questionMasterId:fields.questionMasterId,
                            questionActiveStatus:fields.questionActiveStatus,
                            Priority:fields.priority,
                            SupportVideoUrl:fields.SupportVideoURL,
                            AnswerOrder:fields.AnswerOrder,
                            countryCreated:fields.countryCreated,
                            HINT:fields.hint,
                          }
                          
                          documents.push(obj);
                          //console.log("documents",documents)
                          csv_export.export(documents,function(buffer){
                            fs.writeFileSync('/home/ubuntu/outsmartedNewUpdate/client/storage/zip/data.zip',buffer);
                            //fs.writeFileSync('./data.zip',buffer);
                            
                            cb(null,{status:"success",type:1,message:"Succefully Created"})
                          });
                          //cb(null,{status:"success"})
                        }
                        else
                        {
                          fields.question = fields.question.replace(/,/g, "");
                          fields.answer1 = fields.answer1.replace(/,/g, "");
                          fields.answer2 = fields.answer2.replace(/,/g, "");
                          fields.answer3 = fields.answer3.replace(/,/g, "");
                          fields.answer4 = fields.answer4.replace(/,/g, "");
                          obj = {
                            CATEGORY: category[0].category,
                            SUBCATEGORY: 'NONE',
                            AGE:age,
                            REGION: region[0].name,
                            TIMEALLOWED: fields.time_Allowed,
                            QUESTION:fields.question,
                            ANSWER1:fields.answer1,
                            ANSWER2:fields.answer2,
                            ANSWER3:fields.answer3,
                            ANSWER4:fields.answer4,
                            CORRECTANSWER:fields.correct_Answer,
                            IMAGEURL:fields.image_URL,
                            VIDEOURL:fields.video_URL,
                            SOUNDURL:fields.sound_URL,
                            FILETYPE:fields.fileType,
                            creditBy:fields.creditBy,
                            status:fields.status,
                            questionState:fields.questionState,
                            questionMasterId:fields.questionMasterId,
                            questionActiveStatus:fields.questionActiveStatus,
                            Priority:fields.priority,
                            SupportVideoUrl:fields.SupportVideoURL,
                            AnswerOrder:fields.AnswerOrder,
                            countryCreated:fields.countryCreated,
                            HINT:fields.hint,
                          }
                          documents.push(obj);
                            callback()
                          
                        }
                    })
                  }
                })
            }
          })
        }
      })
      }else
      {
        cb(null,{status:"success",type:0,message:"No Data Found"})
      }
      }
      
    })
  }
  else
  {
    cbnull,{status:"fail"}
  }
  
}

methods.deleteFromCheckedQuestions = function(req,res, cb)
{
  let checkQuestionsModel = app.models.check_questions
  console.log(req.params.id)
  if(req.params.id != "" && req.params.id != 0 &&  req.params.id != null)
  {

    checkQuestionsModel.deleteAll({id :req.params.id},function(err,data){
      if(err)
      {
        console.log(err);
      }
      else
      {
        cb(null,{status:"success"});
      }
    })
  }
}


methods.getWrongQuestions = function(req,res,cb)
  {
    let regionAdmin = app.models.region_admin
    let ageCategories = app.models.age_categories
    let session = req.session.regionCode;
    let skipV;
      if(req.query.filter)
      {
        skipV = req.query.filter.skip;
      }
      else
      {
        skipV = 0;
      }
        let checkQuestionsModel = app.models.check_questions
        let check_questions =  app.models.check_questions;
        let ds1 = check_questions.dataSource;
      
        console.log("req.session.loginName",req.session.loginName)
      
        regionAdmin.findOne({where:{username:req.session.loginName}},function(err,rregionAdminData){
        if(err)
        {

        }
        else
        {
          console.log('SELECT check_questions.id AS qq,check_questions.questionMasterId AS MI,question,countries.id as region,questions_'+req.session.regionCode+'.category_id FROM check_questions INNER JOIN   questions_'+req.session.regionCode+' ON check_questions.questionMasterId = questions_'+req.session.regionCode+'.questionMasterId  INNER JOIN countries ON check_questions.`region` = countries.`language` where check_questions.region IN ('+rregionAdminData.languageCode+') LIMIT '+skipV+',10')
          ds1.connector.query('SELECT check_questions.id AS qq,check_questions.questionMasterId AS MI,age_id,question,answer1,answer2,answer3,answer4,correct_Answer,fileType,image_URL,sound_URL,video_URL,countries.id as region,questions_'+req.session.regionCode+'.category_id FROM check_questions INNER JOIN   questions_'+req.session.regionCode+' ON check_questions.questionMasterId = questions_'+req.session.regionCode+'.questionMasterId  INNER JOIN countries ON check_questions.`region` = countries.`language` where check_questions.region IN ('+rregionAdminData.languageCode+') LIMIT '+skipV+',10' , function (err, data)
          {
            if(err)
            {
              cb(null,{status:0,message:"err"})
            }
            else
            {


              userCategoriesModel.find({},function(err,category)
              {
                ds1.connector.query('SELECT count(id) as count from check_questions where check_questions.region IN ('+rregionAdminData.languageCode+')' , function (err, count)
                {
                  ageCategories.find({},function(err,ageInfo)
                  {
                    console.log("======",count[0].count);
                    cb(null,{status:1,message:"sucess",info:data,category:category,questionCount:count[0].count,ageInfo:ageInfo})
                  })
                  
                })              
              })
            }
          })
        }
      })
    }
exports.data = methods;
