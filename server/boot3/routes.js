let dsConfig = require('../datasources.json');
let path = require('path');
let another = require('../controllers/admin.js');
let app = require('../../server/server');
let session = require('express-session');
let loopback = require('loopback');
let flash = require('express-flash-messages');
let adminController = require('../controllers/admin.js');
let multer = require('multer');
var sessionstorage = require('sessionstorage');
var sizeOf = require('image-size');
var multerS3 = require('multer-s3')

var ds = app.dataSources.db;





//let upload = multer({ dest: 'client/storage/packages/' })

var upload = multer({
    // destination: (req, file, cb) =>
    // {
      ////console.log(2234)
      // if(file.fieldname == "mulipleImages")
      // {
        storage: multerS3({
          s3: new AWS.S3( { params: {Bucket:'outsmarted/storage/questions/images'}}),
          bucket: 'outsmarted/storage/questions/images',
          contentType: multerS3.AUTO_CONTENT_TYPE,
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
            cb(null, file.originalname)
          }
        })


    //   if(file.fieldname == "mulipleSound")
    //   {
    //     storage: multerS3({
    //       s3: new AWS.S3( { params: {Bucket:'outsmarted/storage/test'}}),
    //       bucket: 'outsmarted/storage/test',
    //       metadata: function (req, file, cb) {
    //         cb(null, {fieldName: file.fieldname});
    //       },
    //       key: function (req, file, cb) {
    //         cb(null, file.originalname)
    //       }
    //     })
    //   }
    //
    //   if(file.fieldname == "muliplevideos")
    //   {
    //     storage: multerS3({
    //       s3: new AWS.S3( { params: {Bucket:'outsmarted/storage/test'}}),
    //       bucket: 'outsmarted/storage/test',
    //       metadata: function (req, file, cb) {
    //         cb(null, {fieldName: file.fieldname});
    //       },
    //       key: function (req, file, cb) {
    //         cb(null, file.originalname)
    //       }
    //     })
    //   }
    // }
})
var upload1 = multer({
        storage: multerS3({
          s3: new AWS.S3( { params: {Bucket:'outsmarted/storage/questions/sounds'}}),
          bucket: 'outsmarted/storage/questions/sounds',
          contentType: multerS3.AUTO_CONTENT_TYPE,
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
            cb(null, file.originalname)
          }
        })
})
var upload3 = multer({

        storage: multerS3({
          s3: new AWS.S3( { params: {Bucket:'outsmarted/storage/questions/videos'}}),
          bucket: 'outsmarted/storage/questions/videos',
          contentType: multerS3.AUTO_CONTENT_TYPE,
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
            cb(null, file.originalname)
          }
        })
})


app.use(session({ secret: "shashank" }));
app.use(flash());

module.exports = function (app) {

  /* ==================== Admin Login View ================================= */

  app.get('/admin', function (req, res) {
    //console.log(1);
    try {

      res.render('./admin');
    }
    catch (e) {
      res.redirect('/admin');
    }
  });
  
  
  /* ==================== Admin Login View ================================= */

  app.get('/admin_region', function (req, res) {
    //console.log(1);
    try {

      res.render('./admin_region');
    }
    catch (e) {
      res.redirect('/admin_region');
    }
  });



app.post('/addUserPack', function(req, res, next)
  {
       let userModel = app.models.user;
       let questionPackagesModel = app.models.question_packages;
       let aData = req.body;
       //console.log("aData==========",aData);
       //let aData = {licenceName:"UK5daaba33581122a",packCode:"HHHHH"};


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
                   res.redirect("https://www.outsmarted.app/thankyou");
                 }
                 else
                 {
  		               //console.log()
                   if(userInfo)
                   {
                     let userExistPack = userInfo.packages.split(',');
                     let userPack;
                     //console.log(userExistPack);
                     if(userExistPack.includes(packInfo.id.toString()))
                     {
                         userPack = userInfo.packages;
                     }
                     else
                     {
                       userPack = userInfo.packages+',' + packInfo.id;
                     }
                     ////console.log(userPack);
                     userModel.updateAll({id:userInfo.id},{packages:userPack},function(err,userInfo)
                     {
                       res.redirect("https://www.outsmarted.app/thankyou");
                       //cb(null,{status:1})
                     })
                   }
                 }
               })
             }
             else
             {
               res.redirect("https://www.outsmarted.app/thankyou");
             }
           }
         })
  })



app.post('/addUserPackCategory', function(req, res, next)
  {
       let userModel = app.models.user;
       let questionPackagesModel = app.models.question_packages;
       let categoriesModel = app.models.categories;
       let aData = req.body;
       //console.log("aData==========",aData);
       //let aData = {licenceName:"UK5daaba33581122a",packCode:"HHHHH",categoryCode:null};

     
  })

  /* ====================Checking Login=======================================*/

app.post('/adminLogin', function (req, res) {
    try {
      let user_name = req.body.username;
      let password = req.body.password;
      let users = app.models.user;
	
      users.login({
        username: user_name,
        password: password
      }, function (err, token) {
          if (err) {
            req.flash('notify', 'wrong username or password');
            res.redirect('/admin');
          }
          else {
            users.findOne({ where: { id: token.userId },fields:{id:true,username:true,email:true,userType:true,country_id:true,countryCode:true,packages:true} }, function (err, userDat) {
              if (err) {
                res.redirect('/admin');
              }
              else
              {
                if(userDat.userType == 2)
                {
                  req.session.token = token.id;
                  req.session.userId = token.userId;
                  req.session.adminUserType= 2
                  req.session.region = userDat.country_id;
                  req.session.regionName = userDat.countryCode;
                  req.session.packValG=userDat.packages;
                  //req.session.usertype = 2; // restriction to admin
                  res.redirect('./reviewQuestions/1/0');
                }
                else
                {
                  req.session.token = token.id;
                  req.session.userId = token.userId;
                  req.session.adminUserType= 1;
                  req.session.region = 1;
                  req.session.regionName = "EN";
                  req.session.regionCode = "EN";
                  //req.session.packValG=userDat.packages;
                  //res.redirect('./reviewQuestions/1/0');
                  res.redirect('./adminDashboard');
                  
                }
                
              }
            });
          }
        });
    }
    catch (e)
    {
      res.redirect('/admin');
    }
  });
  
  
  
  app.post('/regionAdminlogin', function (req, res) {
    try {
      let user_name = req.body.username;
      let password = req.body.password;
      let regionadmin = app.models.region_admin;
      let countriesModel = app.models.countries;
      regionadmin.login({
        username: user_name,
        password: password
      }, function (err, token) {
          if (err) {
            ////console.log("errrr=============================",err);
            req.flash('notify', 'wrong username or password');
            res.redirect('/admin_region');
          }
          else {
            regionadmin.findOne({ where: { id: token.userId }}, function (err, userDat) {
              if (err) {
                res.redirect('/admin_region');
              }
              else
              {
                countriesModel.findOne({where :{id:userDat.countryCode}},function(err,countryData){
                  if(err)
                  {

                  }
                  else
                  {
                    ////console.log(countryData)
                    req.session.token = token.id;
                    req.session.adminUserType= 2
                    req.session.region = userDat.countryCode;
                    req.session.regionName = userDat.countryName;
                    req.session.regionCode = countryData.language;
                    req.session.packValG=userDat.packages;
                    //req.session.usertype = 2; // restriction to admin
                    res.redirect('./reviewQuestions/1/0');
                }
              })
              }
            });
          }
        });
    }
    catch (e)
    {
      res.redirect('/admin_region');
    }
  });
  /* ====================== Logout ========================================== */

  app.get('/adminlogout', function (req, res)
  {
    /* check admin session */
    if (req.session.token)
    {
      let users = app.models.user;
      users.logout(req.session.token, function (err) {
        if (err)
        {
          /* redirecting to admin view page */
          res.redirect('/admin');
        }
        else
        {
          /* Destroying the session */
          req.session.destroy();
          res.redirect('/admin');
        }
      });
    }
    else
    {
      /* redirecting to admin view page */
      res.redirect('/admin');
    }
  });

  /* ======================  Dashboard ==================================== */

  app.get('/adminDashboard', function (req, res) {
    try
    {
      if (req.session.token)
      {
        console.log("req.session<<<<<<<<<>>>>>>>>>>>>>>>>>",req.session)
          adminController.data.getDashboard(req, res, function (err, data)
          {
            res.render('./adminDashboard', {totalLicences:data.licenceCount,userCount:data.userCount,juniorCount:data.jCount,
                                    teenCount:data.tCount,adultCount:data.aCount,userStatus:req.session.adminUserType});
          });
      }
      else
      {
        res.redirect('./admin');
      }
    }
    catch (e)
    {
      res.redirect('./admin');
    }
  });


  app.post('/adminDashboard', function (req, res) {
    try
    {
      if (req.session.token)
      {
        console.log(req.body)
        ////console.log('req.session.adminUserType= 2',req.session.adminUserType)
        
          adminController.data.getDashboardP(req, res, function (err, data)
          {
            res.render('./adminDashboard', {totalLicences:data.licenceCount,userCount:data.userCount,juniorCount:data.jCount,
                                    teenCount:data.tCount,adultCount:data.aCount,userStatus:req.session.adminUserType});
          });
        
      }
      else
      {
        res.redirect('./admin');
      }
    }
    catch (e)
    {
      res.redirect('./admin');
    }
  });

  /* ====================== Change Password View ================== */

  app.get('/changePassword', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1) {
      
        res.render('./changePassword',{userStatus:req.session.adminUserType});
      
    }
    else {
      res.redirect('/admin');
    }
  });

  /* ====================== Change Password ================== */

  app.post('/request-password-reset', function (req, res, next)
  {
    ////console.log("request-data",req.session);
    let users = app.models.user;
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        users.findById(req.session.userId, function (err, user)
        {
          if (err)
          {
            res.redirect('./changePassword');
          }
          else
          {
            user.updateAttribute('password', req.body.newPassword, function (err, user)
            {
              if (err)
              {
                req.flash('warning', 'Sorry Try again...');
                res.render('./changePassword',{userStatus:req.session.adminUserType});
              }
              else
              {
                req.flash('success', 'Password changed');
                res.render('./changePassword',{userStatus:req.session.adminUserType});
              }
            });
          }
        });
      
    }
    else
    {
      res.render('./admin');
    }


  });

  /* ====================== Get Distributors ===================== */

  app.get('/distributors/:id', function (req, res, cb)
  {
    if (req.session.token && req.session.adminUserType == 1)
    {
      adminController.data.getDistributor(req, res, function (err, data)
      {
        //console.log("data <><><>>>>>>>>>>>>>",data);
        res.render('./distributors', {distributors: data.distributorData,paginator:data.distributorCount,countries:data.countryData,info:data.distributorInfo,userStatus:req.session.adminUserType});
      });
    }
    else
    {
      res.render('./admin');
    }
  });

  /* =================== add distributors ===================== */

  app.post("/addDistributor",function(req,res,cb)
  {
    if (req.session.token && req.session.adminUserType == 1)
    {
        adminController.data.setDistributors(req,res,function(err,data)
        {
          res.redirect('/distributors/0');
        })
    }
    else
    {
      res.render('./admin');
    }
  })


  /* ====================== Get Licences ===================== */

  app.get('/licences/:id', function (req, res, cb)
  {
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        adminController.data.getLicences(req, res, function (err, data)
        {
          res.render('./licences', {licenceData: data.licenceData,paginator:data.licenceCount,userStatus:req.session.adminUserType});
        });
    }
    else
    {
      res.render('./admin');
    }

  });

  /* ====================== Get Bulk Licences ===================== */

  app.get('/bulkLicences/:id/:distributor_id/:page', function (req, res, cb)
  {
    if (req.session.token && req.session.adminUserType == 1)
    {

      
        adminController.data.getLicences(req, res, function (err, data)
            {
              res.render('./bulkLicences', {licenceData: data.licenceData,paginator:data.licenceCount
                ,countryData:data.countryData,licence_id:req.params.id,country_id:req.params.id,page:req.params.page,
                distributor:data.distributor,distributor_id:req.params.distributor_id,userStatus:req.session.adminUserType});
            });
      
      
    }
    else
    {
      res.render('./admin');
    }
  });


app.get('/exportQuestions', function (req, res, cb) {
  //console.log("-------------------------------------------------------")
  if (req.session.token && req.session.adminUserType == 1)
  {
    
      adminController.data.exportQuestionData(req, res, function (err, data)
      {
        if (err)
        {
          cb(null, {status: 0,message: err.message,cityInfo:null});
        }
        else
        {
          res.write(JSON.stringify(data.subCategory));
          res.end();
        }
      });
    
    
  }
  else
  {
    res.redirect('/admin');
  }
});

/* ====================== Set/Add Licences ===================== */

  app.post('/addLicence', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        adminController.data.setLicences(req, res, function (err, data)
        {

          res.redirect('./licences/0');
        });
      
      
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ====================== Set/Add Bulk Licences ===================== */

  app.post('/addBulkLicence', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        adminController.data.setBulkLicences(req, res, function (err, data)
        {
          res.redirect('./bulkLicences/0/0/0');
        });
      
      
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ====================== Set/Add Bulk Licences ===================== */

  app.get('/exportedLicences/:id/:distributor_id/:page', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        adminController.data.getExportedLicences(req, res, function (err, data)
        {
          //console.log(data);
          res.render('./exportedLicences', {licenceData: data.licenceData,paginator:data.licenceCount
            ,countryData:data.countryData,country_id:req.params.id,page:req.params.page,distributor:data.distributor,
            distributor_id:req.params.distributor_id,userStatus:req.session.adminUserType});
        });
      
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ====================== Update Licence Status ================ */

  app.post('/updateLcsStatus', function (req, res, cb)
  {
    if (req.session.token && req.session.adminUserType == 1)
    {

      
        adminController.data.updateLicenceStatus(req, res, function (err, data)
        {
          if(err)
          {
            res.write(JSON.stringify(data));
            res.end();
          }
          else
          {
            if(data == 1)
            {
              res.write(JSON.stringify(data));
              res.end();
            }
            else
            {
              res.write(JSON.stringify(data));
              res.end();
            }

          }
        });
      
        
      }
      else
      {
        res.redirect('/admin');
      }
});

/* ======================= View Country ======================== */

  app.get('/country/:id', function (req, res, cb) 
  {
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        adminController.data.getCountries(req, res, function (err, data)
        {
          res.render('./country', {countryData: data.countryData,paginator:data.countryCount,
            countryInfo:data.countryInfo,userStatus:req.session.adminUserType});
        });
      
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ====================== Set/Add Country ===================== */

  app.post('/addCountry', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        adminController.data.setCountry(req, res, function (err, data)
        {
          if(data.status == "fail")
          {
            req.flash('notify', data.message);
            res.redirect('./country/0');
          }
          else
          {
            req.flash('notify', data.message);
            res.redirect('./country/0');
          }
        });
      

      
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ====================== User List =========================== */

  app.get('/users/:id/:odr/:type', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        adminController.data.getUsers(req, res, function (err, data)
        {
          ////console.log(data.userData);
          res.render('./users', {userData: data.userData,paginator:data.userCount,page:req.params.id,userStatus:req.session.adminUserType,orderby:req.params.odr,type:req.params.type});
        });
      
      
    }
    else
    {
      res.redirect('/admin');
    }

  });

/* ====================== User List =========================== */

   app.get('/userDetails/:id', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
        adminController.data.getUserDetails(req, res, function (err, data)
        {
          //console.log("data",data.devicesAttached)
          res.render('./userDetails',{userData:data.userDetails ,devicesAttached:data.devicesAttached,
            childs:data.childs,packagesData:data.package,categoryData:data.categories,gameCount:data.gameCount,
            teamInfo:data.teamInfo,userStatus:req.session.adminUserType,newCategory:data.newCategory});
        });      
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ====================  User Age ============================ */

  app.get('/userAge/:id', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        adminController.data.getUserAge(req, res, function (err, data)
        {
        res.render('./userAge',{ageData: data.ageData,paginator:data.ageCount,ageInfo:data.ageInfo,userStatus:req.session.adminUserType});
        })
      
      
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ====================== Set/Add Age ===================== */

  app.post('/addAge', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      
        adminController.data.setAge(req, res, function (err, data)
        {
          if(data.status == "fail")
          {
            req.flash('notify', data.message);
            res.redirect('./userAge/0');
          }
          else
          {
            req.flash('notify', data.message);
            res.redirect('./userAge/0');
          }
        });
      
      
    }
    else
    {
      res.redirect('/admin');
    }
  });

  /* ====================== View Questions Form ===================== */

  app.get('/questions/:id', function (req, res, cb)
  {
    if (req.session.token)
    {
        let packages = 0;
        if(req.session.adminUserType != 1)
        {
          packages = req.session.packValG
        }

        adminController.data.questions(req, res, function (err, data)
        {
          res.render('./questions',{category:data.category,packages:data.package,ageData:data.age
          ,country:data.country,question:data.question,subCategory:data.subCategory
          ,userStatus:req.session.adminUserType,package_id:packages,countryCode2:req.session.regionCode,
          
          regionsession:req.session.region});
        })
    }
    else
    {
      res.redirect('/admin');
    }
  });




  /* ====================== Edit Questions  ========================= */
  app.get('/editQuestions/:id/:type/:regionType/:region', function (req, res, cb)
  {




    if (req.session.token)
    {
      let packages = 0;
      if(req.session.adminUserType != 1)
      {
        packages = req.session.packValG
      }

        adminController.data.editQuestions(req, res, function (err, data)
        {
            if(req.session.adminUserType == 2)
            {
              req.session.packValG = data.question.pack_ID; 	
            }
            
            console.log("data.subCategory",data.question)
            res.render('./editQuestions',{category:data.category,packages:data.package,ageData:data.age
            ,country:data.country,question:data.question,subCategory:data.subCategory,userStatus:req.session.adminUserType,
            userStatus:req.session.adminUserType,package_id:packages,regionsession:req.session.region
            ,type:req.params.type,regionType:req.params.regionType,question_id:req.params.id});
        })
     
    }
    else
    {
      res.redirect('/admin');
    }
  });

 /* ======================= Add Question =======================*/

  app.post('/addQuestions', function (req, res, cb)
  {
    if (req.session.token)
    {
        ////console.log("Add ques req =",req.body);
       
        
        adminController.data.setQuestions(req, res, function (err, data)
        {
          if(data.status == "fail")
          {
            req.flash('notify', data.message);
            res.redirect('./viewQuestions/0/0/0/0/0/0/0/0/0/0');
          }
          else
          {
            req.flash('notify', data.message);
            res.redirect('./viewQuestions/0/0/0/0/0/0/0/0/0/0');
          }
        })
      
    }
    else
    {
      res.redirect('/admin');
    }
  });

  /* ====================== View Questions Form ===================== */

  app.get('/uploadQuestions', function (req, res, cb)
  {
    if (req.session.token && req.session.adminUserType == 1)
    {
      adminController.data.uploadQuestion(req, res, function (err, data)
      {
        //console.log(data.packages);
        res.render('./uploadQuestions',{packages:data.packages,userStatus:req.session.adminUserType});
      })
    }
    else
    {
      res.redirect('/admin');
    }
  });

  /* ======================= Add/edit Question Image =======================*/

   app.post('/addEditFile', function (req, res, cb)
   {
     if (req.session.token)
     {
       adminController.data.addEditQuestionsFile(req, res, function (err, data)
       {
         if(data.status == "fail")
         {
           req.flash('notify', data.message);
           res.redirect('./viewQuestions/0/0/0/0/0/0/0/0/0/0');
         }
         else
         {
           req.flash('notify', data.message);
           res.redirect('./viewQuestions/0/0/0/0/0/0/0/0/0/0');
         }
       })
     }
     else
     {
       res.redirect('/admin');
     }
   });

  /* ======================= Add Question CSV File =======================*/

   app.post('/addUploadQuestion', function (req, res, cb)
   {
     if (req.session.token && req.session.adminUserType == 1)
     {
       adminController.data.setQuestionCSV(req, res, function (err, data)
       {
         if(data.status == "fail")
         {
           req.flash('notify', data.message);
           res.redirect('./uploadQuestions');
         }
         else
         {
           req.flash('notify', data.message);
           res.redirect('./uploadQuestions');
         }
       })
     }
     else
     {
       res.redirect('/admin');
     }
   });


/* ====================  Question List ============================ */

  app.get('/viewQuestions1/:category/:subCategory/:package/:likeQuestion/:id', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      adminController.data.getQuestions(req, res, function (err, data)
      {
        res.render('./viewQuestions',{questionsData: data.questionsData,paginator:data.questionsCount,category:data.category,
							packages:data.package,category_page_id:req.params.category,sub_page_category_id:req.params.subCategory,
							package_id:req.params.package,userStatus:req.session.adminUserType});
      });
    }
    else
    {
      res.redirect('/admin');
    }
  });


  app.get('/viewQuestions/:category/:subCategory/:package/:age/:region/:fileType/:type/:questionStatus/:questionState/:id', function (req, res, cb) {
    // if (req.session.token)
    // {
      if(req.session.adminUserType != 1)
      {
        //req.params.region = req.session.region
        req.params.package = req.session.packValG
      }
      console.log(req.session);
      adminController.data.getQuestions1(req, res, function (err, data)
      {
        console.log(data.questionsData);
        res.render('./viewQuestions',{questionsData: data.questionsData
          ,paginator:data.count,category:data.category,
          packages:data.package,category_page_id:req.params.category,
          sub_page_category_id:req.params.subCategory,
          package_id:req.params.package,region_id:req.params.region,fileType_id:req.params.fileType,
          age_id:req.params.age,page:req.params.id,countryInfo:data.countries,ageInfo:data.age,type:req.params.type,
          questionStatus:req.params.questionStatus,questionState:req.params.questionState,
          userStatus:req.session.adminUserType,page:req.params.id,sessionRegion:req.session.regionCode});
      });
    // }
    // else
    // {
    //   res.redirect('/admin');
    // }
  });


  app.get('/viewFinalQuestions/:category/:subCategory/:package/:id', function (req, res, cb) {
    if (req.session.token)
    {
      adminController.data.getFinalQuestions(req, res, function (err, data)
      {
        res.render('./viewFinalQuestions',{questionsData: data.questionsData,paginator:data.count,category:data.category,
          packages:data.package,category_page_id:req.params.category,sub_page_category_id:req.params.subCategory,
          package_id:req.params.package,page:req.params.id,userStatus:req.session.adminUserType});
      });
    }
    else
    {
      res.redirect('/admin');
    }
  });

  app.get('/viewFreeplayQuestions/:category/:subCategory/:package/:id', function (req, res, cb) {
    if (req.session.token)
    {
      adminController.data.getFreePlayQuestions(req, res, function (err, data)
      {
        //console.log(data);
        res.render('./viewFreeplayQuestions',{questionsData: data.questionsData,paginator:data.count,
          category:data.category,packages:data.package,category_page_id:req.params.category,sub_page_category_id:req.params.subCategory,package_id:req.params.package
          ,page:req.params.id,userStatus:req.session.adminUserType,userStatus:req.session.adminUserType});
      });
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ===================  Detail Questions =========================== */

  app.get('/viewDetailQuestions/:id', function (req, res, cb) {
    //console.log(11111);
    if (req.session.token && req.session.adminUserType == 1)
    {
      adminController.data.getDetailQuestion(req, res, function (err, data)
      {
        res.render('./viewDetailQuestions',{questionsData: data.questionData,userStatus:req.session.adminUserType});
      });
    }
    else
    {
      res.redirect('/admin');
    }
  });

  app.get('/viewDetailFreeplayQuestions/:id', function (req, res, cb) {
    //console.log(11111);
    if (req.session.token)
    {
      adminController.data.getDetailFreeplayQuestion(req, res, function (err, data)
      {
        res.render('./viewDetailQuestions',{questionsData: data.questionData,userStatus:req.session.adminUserType});
      });
    }
    else
    {
      res.redirect('/admin');
    }
  });

  /* ===================  Delete Questions =========================== */

 app.get('/deleteQuestion/:id/:type/:region', function (req, res, cb) {
   if (req.session.token)
   {
     //console.log(req.params,region)
     adminController.data.deleteQuestions(req, res, function (err, data)
     {
       res.redirect('/viewQuestions/0/0/0/0/0/0/0/0/0/0');
     });
   }
   else
   {
     res.redirect('/admin');
   }
 });




/* ==============  Ajax Call to get subCategory ==================== */

  app.post('/category/getSubTopics/', function (req, res, cb) {
    // if (req.session.token && req.session.adminUserType == 1)
    // {
      adminController.data.getSubCategory(req, res, function (err, data)
      {
        if (err)
        {
          cb(null, {status: 0,message: err.message,cityInfo:null});
        }
        else
        {
          res.write(JSON.stringify(data.subCategory));
          res.end();
        }
      });
    // }
    // else
    // {
    //   res.redirect('/admin');
    // }
  });

 /* ================== Get Multiple Age ================ */

  app.post('/getMultipleAge', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      adminController.data.getMultipleAge(req, res, function (err, data)
      {
        if (err)
        {
          cb(null, {status: 0});
        }
        else
        {
          res.write(JSON.stringify(data.age));
          res.end();
        }
      });
    }
    else
    {
      res.redirect('/admin');
    }
  });


  /* ================== Get Multiple Question ================ */

   app.post('/getMultipleQuestion', function (req, res, cb) {
     if (req.session.token)
     {
       adminController.data.getMultipleQuestion(req, res, function (err, data)
       {
         if (err)
         {
           cb(null, {status: 0});
         }
         else
         {
           res.write(JSON.stringify(data));
           res.end();
         }
       });
     }
     else
     {
       res.redirect('/admin');
     }
   });


  /* ==============  Ajax Call to get subCategory ==================== */

  app.get('/exportlicence/:id/:distributor_id/:type', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      adminController.data.exportLicenceData(req, res, function (err, data)
      {
        if (err)
        {
          cb(null, {status: 0,message: err.message,cityInfo:null});
        }
        else
        {
          res.write(JSON.stringify(data.subCategory));
          res.end();
        }
      });
    }
    else
    {
      res.redirect('/admin');
    }
  });


  /* ==========  Ajax Call to get Distributor from countryId =========== */

    app.post('/country/distributor', function (req, res, cb)
    {
      if (req.session.token && req.session.adminUserType == 1)
      {
        adminController.data.getCountryDistributor(req, res, function (err, data)
        {
          if (err)
          {
            cb(null, {});
          }
          else
          {
            //console.log(data.info);
            res.write(JSON.stringify(data.info));
            res.end();
          }
        });
      }
      else
      {
        res.redirect('/admin');
      }
    });


    app.post('/getQuestionSearch', function (req, res, cb)
    {

      if (req.session.token)
      {
        //console.log("request for question search");
        adminController.data.getAjaxQuestions1(req, res, function (err, data)
        {
          if (err)
          {
            cb(null, {status: 0});
          }
          else
          {
            ////console.log(data);
            res.write(JSON.stringify(data));
            res.end();
          }
        });
      }
      else
      {
        res.redirect('/admin');
      }
    });


    app.post('/getQuestionSearchFinal', function (req, res, cb)
    {

      if (req.session.token && req.session.adminUserType == 1)
      {
        ////console.log("request for question search");
        adminController.data.getAjaxQuestionsFinal(req, res, function (err, data)
        {
          if (err)
          {
            cb(null, {status: 0});
          }
          else
          {
            //console.log("============================",data);
            res.write(JSON.stringify(data));
            res.end();
          }
        });
      }
      else
      {
        res.redirect('/admin');
      }
    });

    app.post('/getFreeplayQuestionSearch', function (req, res, cb)
    {

      if (req.session.token && req.session.adminUserType == 1)
      {
        //console.log("request for question search");
        adminController.data.getAjaxFreeplayQuestions1(req, res, function (err, data)
        {
          if (err)
          {
            cb(null, {status: 0});
          }
          else
          {
            ////console.log(data);
            res.write(JSON.stringify(data));
            res.end();
          }
        });
      }
      else
      {
        res.redirect('/admin');
      }
    });


    app.post('/getUserListSearch', function (req, res, cb)
    {

      if (req.session.token && req.session.adminUserType == 1)
      {
        adminController.data.getUserLicence(req, res, function (err, data)
        {
          if (err)
          {
            cb(null, {status: 0});
          }
          else
          {
            //console.log("ssssssssssssssssssss",data);
            res.write(JSON.stringify(data.info));
            res.end();
          }
        });
      }
      else
      {
        res.redirect('/admin');
      }
    })

    /* ============= */

    app.get('/getMessage/:id', function (req, res, cb)
    {

      if (req.session.token && req.session.adminUserType == 1)
      {
        adminController.data.getMessageData(req, res, function (err, data)
        {
          //console.log(data);
          res.render('./getMessage',{messageData: data.data,edit:data.edit,userStatus:req.session.adminUserType});
        })
      }
      else
      {
        res.redirect('/admin');
      }
    });


    app.post('/addMessage', function (req, res, cb)
    {
      if (req.session.token && req.session.adminUserType == 1)
      {
        adminController.data.setMessageData(req, res, function (err, data)
        {
          res.redirect('./getMessage/0');
        })
      }
      else
      {
        res.redirect('/admin');
      }
    });

    /* Buy pack*/

    app.post('/buyPack', function (req, res, cb)
    {
      //console.log("Helllllloooo");
      if (req.session.token && req.session.adminUserType == 1)
      {
        adminController.data.buyPack(req, res, function (err, data)
        {
          if (err)
          {
            cb(null, {status: 0});
          }
          else
          {
            ////console.log(data);
            res.write(JSON.stringify(data.status));
            res.end();
          }
        });
      }
      else
      {
        res.redirect('/admin');
      }
    })



    app.post('/buyCategory', function (req, res, cb)
    {
      //console.log("Helllllloooo");
      if (req.session.token && req.session.adminUserType == 1)
      {
        adminController.data.buyCategory(req, res, function (err, data)
        {
          if (err)
          {
            cb(null, {status: 0});
          }
          else
          {
            ////console.log(data);
            res.write(JSON.stringify(data.status));
            res.end();
          }
        });
      }
      else
      {
        res.redirect('/admin');
      }
    })

/* ====================  View packages ============================ */

  app.get('/packages/:id', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
      adminController.data.getPackages(req, res, function (err, data)
      {
        
          res.render('./packages',{packagesData: data.packagesData,paginator:data.packagesCount,packagesInfo:data.packagesInfo,
          countryInfo:data.countryInfo,categoryInfo:data.categories,userStatus:req.session.adminUserType,ageData:data.ageInfo});
      });
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ====================== Set/Add package ===================== */

  app.post('/addPackage', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {

      ////console.log(req.body);
      adminController.data.setPackage(req, res, function (err, data)
      {
        if(data.status == "fail")
        {
          req.flash('notify', data.message);
          res.redirect('./packages/0');
        }
        else
        {
          req.flash('notify', data.message);
          res.redirect('./packages/0');
        }
      });
    }
    else
    {
      res.redirect('/admin');
    }
  });

/* ====================  View Categories ============================ */

  app.get('/viewCategories/:id', function (req, res, cb)
  {
    if (req.session.token && req.session.adminUserType == 1)
    {
     adminController.data.getCategories(req, res, function (err, data)
     {
       console.log('datad==================================.',data);
       res.render('./viewCategories',{categoryData: data.categoryData,speficData:data.specificData,countries:data.countries,userStatus:req.session.adminUserType});
     });
   }
   else
   {
     res.redirect('/admin');
   }
 });

/* ===================== Edit Category =============================== */

 app.post('/editCategory', function (req, res, cb) {
   if (req.session.token && req.session.adminUserType == 1)
   {
     ////console.log(req.body);


     
     adminController.data.editCategoryDt(req, res, function (err, data)
     {
       if(data.status == "fail")
       {
         req.flash('notify', data.message);
         res.redirect('./viewCategories/0');
       }
       else
       {
         req.flash('notify', data.message);
         res.redirect('./viewCategories/0');
       }
     });
   }
   else
   {
     res.redirect('/admin');
   }
 });

 /* ====================  View Sub Category ============================ */

 app.get('/viewSubCategory/:id/:category/:page', function (req, res, cb)
 {
   if (req.session.token && req.session.adminUserType == 1)
   {
     adminController.data.getSubCategoryDt(req, res, function (err, data)
     {
       res.render('./viewSubCategory',{subCategoryData:data.subCategoryDate, paginator:data.subCategoryCount,speficData:data.specificData,category:data.category,filterCategory:req.params.category,page:req.params.page,userStatus:req.session.adminUserType});
     });
   }
   else
   {
     res.redirect('/admin');
   }
 });

 /* ===================== Copy Question =======================*/

 app.get('/copyQuestion/:id/:region', function (req, res, cb)
 {
   if (req.session.token )
   {
      adminController.data.copyQuestionData(req, res, function (err, data)
     {
        req.flash('notify', "Question is successfully copied");
        res.redirect('/viewQuestions/0/0/0/0/0/0/0/0/0/0');
     });
   }
   else
   {
     res.redirect('/admin');
   }
 });

 /* ====================  Add Sub Category ============================ */

 app.post('/addSubCategory', function (req, res, cb) {
   if (req.session.token && req.session.adminUserType == 1)
   {
     adminController.data.setSubCategory(req, res, function (err, data)
     {
       if(data.status == "fail")
       {
         req.flash('notify', data.message);
         res.redirect('./viewSubCategory/0/0/0');
       }
       else
       {
         req.flash('notify', data.message);
         res.redirect('./viewSubCategory/0/0/0');
       }
     });
   }
   else
   {
     res.redirect('/admin');
   }
 });



 app.post('/updateQuestionPriorityTime', function (req, res, cb)
 {
   // if (req.session.token && req.session.adminUserType == 1)
   // {
     ////console.log(req.body);
     adminController.data.updatePriortyTime(req, res, function (err, data)
     {
       if (err)
       {
         cb(null, {});
       }
       else
       {
         ////console.log(data.message);
         res.write(data.message);
         res.end();
       }
     });
   // }
   // else
   // {
   //   res.redirect('/admin');
   // }
 });

 /**/
var nodeExcel = require('excel-export');
const excel = require('node-excel-export');
 app.get('/test', function (req, res, cb)
 {
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
        rgb: 'FFFFCCFF'
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
  [{value: 'a1', style: styles.headerDark}, {value: 'b1', style: styles.headerDark}, {value: 'c1', style: styles.headerDark}],
  ['a2', 'b2', 'c2'] // <-- It can be only values
];

//Here you specify the export structure
const specification = {
  customer_name: { // <- the key should match the actual data key
    displayName: 'Customer', // <- Here you specify the column header
    headerStyle: styles.headerDark, // <- Header style
    cellStyle: function(value, row) { // <- style renderer function
      // if the status is 1 then color in green else color in red
      // Notice how we use another cell value to style the current one
      return (row.status_id == 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
    },
    width: 120 // <- width in pixels
  },
  status_id: {
    displayName: 'Status',
    headerStyle: styles.headerDark,
    cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
      return (value == 1) ? 'Active' : 'Inactive';
    },
    width: '10' // <- width in chars (when the number is passed as string)
  },
  note: {
    displayName: 'Description',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style
    width: 220 // <- width in pixels
  }
}

// The data set should have the following shape (Array of Objects)
// The order of the keys is irrelevant, it is also irrelevant if the
// dataset contains more fields as the report is build based on the
// specification provided above. But you should have all the fields
// that are listed in the report specification




const dataset = [
  {customer_name: 'IBM', status_id: 1, note: 'some note', misc: 'not shown'},
  {customer_name: 'HP', status_id: 0, note: 'some note'},
  {customer_name: 'MS', status_id: 0, note: 'some note', misc: 'not shown'}
]

// Define an array of merges. 1-1 = A:1
// The merges are independent of the data.
// A merge will overwrite all data _not_ in the top-left cell.
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
res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers)
  return res.send(report);

 });

/* upload Multiple file */

app.post('/uploadMultipleImage', upload.array('mulipleImages', 20), (req, res, next) => {
  //console.log(11111);
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }
  //req.flash('notify', files);
  res.redirect('./uploadQuestions');
})

/* upload Sound */

app.post('/uploadMultipleSound', upload1.array('mulipleSound', 20), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }
  res.redirect('./uploadQuestions');
})

/* upload Videos */

app.post('/uploadMultipleVideos', upload3.array('muliplevideos', 20), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }
  //req.flash('notify', files);
  res.redirect('./uploadQuestions');
})



app.get('/setting/:id',function(req,res,cb)
{
  if(req.session.token)
  {
    var other = require('../controllers/admin.js');
    other.data.getsetting(req, res, function (err, data)
    {
      res.render('./setting',{appversion:data.appVersion,userStatus:req.session.adminUserType});
    });
  }
  else
  {
    res.redirect('/admin');
  }
})


/* ============= update version ================== */

app.post('/appVersion', function(req, res)
{
 if(req.session.token)
 {
   var other = require('../controllers/admin.js');
   other.data.gameVersion(req, res, function (err, data)
   {
       res.redirect('/setting/0');
   });
 }
 else
 {
   res.redirect('/admin');
 }
});

/* ============= update version ================== */

app.post('/addPackage', function(req, res)
{

  adminController.data.buyPackLicence(req, res, function (err, data)
  {
    if (err)
    {
      cb(null, {status: 0});
    }
    else
    {
      res.write(JSON.stringify(data.status));
      res.end();
    }
  });
});

 /* ============== clean Licence =============*/

app.get('/cleanLicence/:id', function(req, res)
{
  adminController.data.cleanUserRemove(req, res, function (err, data)
  {
    if (err)
    {
      res.redirect('/exportedLicences/0/0/0');
    }
    else
    {
      res.redirect('/exportedLicences/0/0/0');
      //res.write(JSON.stringify(data.status));
      //res.end();
    }
  });
});


/* ============== Stop Licence =============*/

app.get('/stopLicence/:id', function(req, res)
{
 adminController.data.stopLicence(req, res, function (err, data)
 {
   if (err)
   {
     res.redirect('/exportedLicences/0/0/0');
   }
   else
   {
     res.redirect('/exportedLicences/0/0/0');
     //res.write(JSON.stringify(data.status));
     //res.end();
   }
 });
});



/* ============== Stop Licence =============*/

app.get('/startLicence/:id', function(req, res)
{
 adminController.data.startLicence(req, res, function (err, data)
 {
   if (err)
   {
     res.redirect('/exportedLicences/0/0/0');
   }
   else
   {
     res.redirect('/exportedLicences/0/0/0');
     //res.write(JSON.stringify(data.status));
     //res.end();
   }
 });
});


app.post('/searchLicence',function(req,res)
{
  //console.log("Hit")
  adminController.data.searchLinceces(req, res, function (err, data)
  {
    res.write(JSON.stringify(data.data));
    res.end();
  });

})


app.get('/userImages',function(req,res)
{
  let questions =  app.models.questions;
  let ds1 = questions.dataSource;
  ds1.connector.query("SELECT questions.id,questions.image_URL from questions where sound_URL !='' GROUP BY questionGroupId ",function(err,dtaa)
  {
    //console.log(err);
    res.render('./userImages',{data1:dtaa,userStatus:req.session.adminUserType});
  })

})


app.post('/getQuestionGroupId', function (req, res, cb) {
  if (req.session.token && req.session.adminUserType == 1)
  {
    ////console.log(req.body.data);
      adminController.data.getUserQuestiondetails(req, res, function (err, data)
      {
      if (err)
      {
        cb(null, {status: 0,message: err.message});
      }
      else
      {
        let obj = {category:data.category,packages:data.package,ageData:data.age
          ,country:data.country,question:data.question,subCategory:data.subCategory}
        res.write(JSON.stringify(obj));
        res.end();
      }
    });
  }
  else
  {
    res.redirect('/admin');
  }
});


/**/

app.get('/getGamesCounts',function(req,res)
{
  res.render('./getGamesCounts',{userStatus:req.session.adminUserType});

})



app.post('/getGameCountData', function (req, res, cb) {
  
  if (req.session.token && req.session.adminUserType == 1)
  {
    // let questions =  app.models.questions;
    // let ds1 = questions.dataSource;
    // ds1.connector.query("SELECT questions.id,questions.image_URL from questions where sound_URL !='' GROUP BY questionGroupId ",function(err,dtaa)
    // {
    //   //console.log(err);
    //   res.render('./userImages',{data1:dtaa});
    // })

    let userGameModel = app.models.user_games

    userGameModel.count({created: {between: [req.body.startDate,req.body.endDate]}},function(err,gameCount)
    {
      res.write(JSON.stringify(gameCount));
      res.end();
    })

    
  }
  else
  {
    res.redirect('/admin');
  }
});

/* Delete User child*/

 /* ============== clean Licence =============*/

 app.get('/deleteChild/:id/:userid', function(req, res)
 {
   ////console.log(req.params.id)
    adminController.data.deleteChildUser(req, res, function (err, data)
    {
      if (err)
      {
        res.redirect('/userDetails/'+req.params.userid);
      }
      else
      {
        //console.log("sssssssssssssssssssssssssss",data);
        res.redirect('/userDetails/'+req.params.userid);
        //res.write(JSON.stringify(data.status));
        //res.end();
      }
    });
 });

 /* Delete */

 app.get('/deleteTeam/:id/:userid', function(req, res)
 {
    if (req.session.token && req.session.adminUserType == 1)
    {
      adminController.data.deleteTeam(req, res, function (err, data)
      {
        if (err)
        {
          res.redirect('/userDetails/'+req.params.userid);
        }
        else
        {
          res.redirect('/userDetails/'+req.params.userid);
        }
      });
    }
    else
    {
      res.redirect('/admin');
    }
 });


 app.post('/setQuestionActiveInactive', function (req, res, cb) {
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.updateActiveInactiveQuestion(req, res, function (err, data)
    {
      if (err)
      {
        cb(null, {status: 0,message: err.message,cityInfo:null});
      }
      else
      {
        res.write(JSON.stringify(1));
        res.end();
      }
    });
  }
  else
  {
    res.redirect('/admin');
  }
});

/* Multiple Active inactive*/

app.post('/setQuestionActiveInactiveMultiple', function (req, res, cb) {
  if (req.session.token)
  {
    //console.log("sssssssssssssssssssssssssssss",req.body)
    adminController.data.updateActiveInactiveQuestionMultiple(req, res, function (err, data)
    {
      if (err)
      {
        cb(null, {status: 0,message: err.message});
      }
      else
      {
        res.write(JSON.stringify(data));
        res.end();
      }
    });
  }
  else
  {
    res.redirect('/admin');
  }
});


/* Multiple Delete */

app.post('/deleteMultipleQuestions', function (req, res, cb) {
  //console.log("-------------------------");
  if (req.session.token)
  {
    adminController.data.deleteMultipleQuestions(req, res, function (err, data)
    {
      if (err)
      {
        cb(null, {status: 0,message: err.message});
      }
      else
      {
        res.write(JSON.stringify(data));
        res.end();
      }
    });
  }
  else
  {
    res.redirect('/admin');
  }
});


/* Multiple Copy */

app.post('/copyMultipleQuestions', function (req, res, cb) {
  //console.log("-------------------------");
  if (req.session.token)
  {
    adminController.data.copyMultipleQuestions(req, res, function (err, data)
    {
      if (err)
      {
        cb(null, {status: 0,message: err.message});
      }
      else
      {
        res.write(JSON.stringify(data));
        res.end();
      }
    });
  }
  else
  {
    res.redirect('/admin');
  }
});


app.post('/changePackageMultipleQuestions', function (req, res, cb) {
  ////console.log("-------------------------",req.body);
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.moveMultipleQuestionsPacakge(req, res, function (err, data)
    {
      if (err)
      {
        cb(null, {status: 0,message: err.message});
      }
      else
      {
        res.write(JSON.stringify(data));
        res.end();
      }
    });
  }
  else
  {
    res.redirect('/admin');
  }
});


/* change question Type 4/6/2021 'shashank' */


app.post('/changeQuestionType', function (req, res, cb) {
  ////console.log("-------------------------",req.body);
  if (req.session.token)
  {
    adminController.data.changeQuestionType(req, res, function (err, data)
    {
      if (err)
      {
        cb(null, {status: 0,message: err.message});
      }
      else
      {
        res.write(JSON.stringify(data));
        res.end();
      }
    });
  }
  else
  {
    res.redirect('/admin');
  }
});


app.get('/errorLogsView', function (req, res, cb) {
  //console.log("-------------------------",req.body);
  if (req.session.token && req.session.adminUserType == 1)
  {
    let errorModel = app.models.errorlogs;
    errorModel.find({},function(err,data){
      if(err)
      {

      }
      else
      {
	//console.log('ssss');
        res.render('./errorLogsView',{data:data,userStatus:req.session.adminUserType});
      }
    })
    
  }
  else
  {
    res.redirect('/admin');
  }
});



app.get('/tempQuestions/:category/:subCategory/:package/:id', function (req, res, cb) {
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.getTempQuestions(req, res, function (err, data)
    {
      //console.log(data.count);
      res.render('./tempQuestions',{questionsData: data.questionsData,paginator:data.count,category:data.category,packages:data.package,category_page_id:req.params.category,sub_page_category_id:req.params.subCategory,package_id:req.params.package,page:req.params.id,userStatus:req.session.adminUserType});
    });
  }
  else
  {
    res.redirect('/admin');
  }
});


app.get('/addTempToLive', function (req, res, cb) {
  
    let tempQuestionModel = app.models.tempquestions;
    let countriesModel = app.models.countries;
    let obj;
    let groupId =[] ;
    let groupVal=0
    tempQuestionModel.find({},function(err,data){
      if(err)
      {

      }
      else
      {
        let x=0;
        async.eachSeries(data, function(fields, callback)
        {
          //console.log("fields",fields)
          countriesModel.findOne({where:{id:fields.region}},function(err,data1)
          {
            //console.log("fields age",fields.region)
            //console.log("fields age",data)
            let questionModel = app.models["questions_"+data1.language];
            x++;
            //console.log("============================================88888888888888888888888888",x)
            //console.log("============================================asdasd",data.length)
            if(x == data.length)
            {
              //console.log("============================================3333333333333333333333333333332")
              obj = { category_id:fields.category_id,sub_category_id:fields.sub_category_id,
                pack_ID:fields.pack_ID,time_Allowed:fields.time_Allowed,age_id:fields.age_id,
                region:fields.region,question:fields.question,answer1:fields.answer1,
                answer2:fields.answer2,answer3:fields.answer3,answer4:fields.answer4,
                correct_Answer:fields.correct_Answer,image_URL:fields.image_URL,video_URL:fields.video_URL,
                fileType:fields.fileType,sound_URL:fields.sound_URL
                ,creditBy:fields.creditBy,status:fields.status,
                created:new Date,hint:fields.hint,questionState:fields.questionState,
                questionActiveStatus:fields.questionActiveStatus,questionMasterId:fields.questionMasterId,modified:new Date()}
              questionModel.create(obj,function(err,addedQuestionInfo)
              {
                if(err)
                {
                  //console.log(err);
                }
                else
                {

                  //console.log("============================================22222222222222222222222")
                  // if(groupId.length > 0)
                  // {
                  //   if(groupId.includes(fields.questionGroupId))
                  //   {
                  //     groupVal =groupVal;
                  //   }
                  //   else
                  //   {
                  //     groupVal =addedQuestionInfo.id;
                  //     groupId.push(fields.questionGroupId);
                  //   }
                  // }
                  // else
                  // {
                  //   groupId.push(fields.questionGroupId);
                  //   groupVal =addedQuestionInfo.id;
                  // }
                  
                  // questionModel.updateAll({id:addedQuestionInfo.id},{questionGroupId:groupVal},function(err,addedQuestionInfo)
                  // {
                    res.redirect("./tempQuestions/0/0/0/0");
                  //})
                }
              })
              
            }
            else
            {
              obj = { category_id:fields.category_id,sub_category_id:fields.sub_category_id,
                pack_ID:fields.pack_ID,time_Allowed:fields.time_Allowed,age_id:fields.age_id,
                region:fields.region,question:fields.question,answer1:fields.answer1,
                answer2:fields.answer2,answer3:fields.answer3,answer4:fields.answer4,status:fields.status,
                correct_Answer:fields.correct_Answer,image_URL:fields.image_URL,video_URL:fields.video_URL,fileType:fields.fileType,sound_URL:fields.sound_URL,creditBy:fields.creditBy,
                created:new Date,questionActiveStatus:fields.questionActiveStatus
                ,questionMasterId:fields.questionMasterId,modified:new Date()}
              questionModel.create(obj,function(err,addedQuestionInfo)
              {
                if(err)
                {
                  //console.log(err);
                }
                else
                {

                  //console.log("============================================1111111111111")
                  // if(groupId.length > 0)
                  // {
                  //   if(groupId.includes(fields.questionGroupId))
                  //   {
                  //     groupVal =groupVal;
                  //   }
                  //   else
                  //   {
                  //     groupVal =addedQuestionInfo.id;
                  //     groupId.push(fields.questionGroupId);
                  //   }
                  // }
                  // else
                  // {
                  //   groupId.push(fields.questionGroupId);
                  //   groupVal =addedQuestionInfo.id;
                  // }
                  
                  // questionModel.updateAll({id:addedQuestionInfo.id},{questionGroupId:groupVal},function(err,addedQuestionInfo)
                  // {
                    
                    callback()
                  // })
                }
              })
            }
          })
        })         
      }
    })
});


app.get('/removeQuestionTemp', function (req, res, cb) {
  
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.removeQuestionTempInfo(req, res, function (err, data)
    {
      res.redirect('./tempQuestions/0/0/0/0');
    });
  }
  else
  {
    res.redirect('/admin');
  }
  
});



app.get('/removeErrorLogs', function (req, res, cb) {
  
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.removeErrorLogsInfo(req, res, function (err, data)
    {
      res.redirect('./errorlogsView');
    });
  }
  else
  {
    res.redirect('/admin');
  }
  
});

/* developer : Shahsank, date:16/5/21 */

app.get('/ageCategoryStats', function (req, res, cb) {
  
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.getCateAgeStats(req, res, function (err, data)
    {
      //console.log("data",data)
      res.render('./ageCategoryStats',{cateInfo:data.dataInfo,userStatus:req.session.adminUserType})
    });
  }
  else
  {
    res.redirect('/admin');
  }
  
});



/* developer : Shahsank, date:7/6/21 */

app.get('/regionAdmins/:id', function (req, res, cb) {
  
  if (req.session.token && req.session.adminUserType == 1)
  {
     adminController.data.getRegionAdmins(req, res, function (err, data)
     {
       ////console.log(data);
      res.render('./regionAdmins',{adminInfo:data.dataInfo,countryInfo:data.countryInfo,userInf:data.userInf,userStatus:req.session.adminUserType})
    });
  }
  else
  {
    res.redirect('/admin');
  }
  
});


/* developer : Shahsank, date:7/6/21 */

app.post('/setRegionAdmin', function (req, res, cb) {
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.addRegionAdmin(req, res, function (err, data)
    {
      res.redirect('/regionAdmins/0')
    });
  }
  else
  {
    res.redirect('/admin');
  }
  
});


app.get('/deleteAdmin/:id',function(req,res,cb)
{
  ////console.log('jjjjjjjjjjjjjjjjjjjjjjjjj')
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.deleteAdminUser(req, res, function (err, data)
    {
      res.redirect('/regionAdmins/0')
    });
  }
  else
  {
    res.redirect('/admin');
  }
})

/* update Package Status */

app.get('/updatePackageState/:type/:id',function(req,res,cb)
{
  
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.updatePackageStatus(req, res, function (err, data)
    {
      ////console.log(data);
      res.redirect('/packages/0')
    });
  }
  else
  {
    res.redirect('/admin');
  }
})



/* update category Status */

app.get('/updateCategoryState/:type/:id',function(req,res,cb)
{
  
  if (req.session.token && req.session.adminUserType == 1)
  {
    adminController.data.updateCategoryStatus(req, res, function (err, data)
    {
      ////console.log(data);
      res.redirect('/viewCategories/0')
    });
  }
  else
  {
    res.redirect('/admin');
  }
})


app.post('/setToFinalRound', function (req, res, cb) {
  if (req.session.token)
  {
    adminController.data.setFinlQuestions(req, res, function (err, data)
    {
      res.redirect('/viewQuestions/0/0/0/0/0/0/0/0/0/0')
    });
  }
  else
  {
    res.redirect('/admin');
  }
  
});


/* Upload redden code*/

/* ====================== View Questions Form ===================== */

  app.get('/redeemCode', function (req, res, cb)
  {
    if (req.session.token && req.session.adminUserType == 1)
    {
      //adminController.data.getredeenCode(req, res, function (err, data)
      //{
        ////console.log(data.packages);
        res.render('./redeemCode',{userStatus:req.session.adminUserType});
      //})
    }
    else
    {
      res.redirect('/admin');
    }
  });
  
  
  /* ======================= Add Question CSV File =======================*/

   app.post('/addUploadRedeemCode', function (req, res, cb)
   {
     if (req.session.token && req.session.adminUserType == 1)
     {
       adminController.data.setReddemCodeCSV(req, res, function (err, data)
       {
         if(data.status == "fail")
         {
           req.flash('notify', data.message);
           res.redirect('./redeemCode');
         }
         else
         {
           req.flash('notify', data.message);
           res.redirect('./redeemCode');
         }
       })
     }
     else
     {
       res.redirect('/admin');
     }
   });


  app.get('/redeemCodeView/:id', function (req, res, cb) {
    if (req.session.token && req.session.adminUserType == 1)
    {
        adminController.data.getRedeemCode(req, res, function (err, data)
        {
	      res.render('./redeemCodeView',{redeemCodeData: data.redeemCodeData,paginator:data.redeemCodeCount,page:req.params.id,userStatus:req.session.adminUserType});
        })
    }
    else
    {
      res.redirect('/admin');
    }
  });


 app.post('/getRedeemCodeSearch', function (req, res, cb)
    {

      if (req.session.token && req.session.adminUserType == 1)
      {
        adminController.data.getRedeemCodeValue(req, res, function (err, data)
        {
          if (err)
          {
            cb(null, {status: 0});
          }
          else
          {
            ////console.log("ssssssssssssssssssss",data);
            res.write(JSON.stringify(data.info));
            res.end();
          }
        });
      }
      else
      {
        res.redirect('/admin');
      }
    })




    app.get('/reviewQuestions/:type/:page', function (req, res, cb) {
      //////console.log('Review questions'); 
      adminController.data.getNewQuestions(req, res, function (err, data)
      {
          
        req.session.editType=2;
        res.render('./reviewQuestions',{userStatus:req.session.adminUserType
                                        ,tempQuestionInfo:data.info,
                                        category:data.category,
                                        type:req.params.type,
                                        paginator:data.questionCount,
                                        page:req.params.page,sessionRegion:req.session.regionCode
                                      });
      })
     
    });


    app.get('/updateIgnore/:id/:type', function (req, res, cb) 
    {
      adminController.data.updateIgnoreQuestion(req, res, function (err, data)
      {
        res.redirect('/reviewQuestions/1/0');
      })
     
    });


    / ====================  View New Category ============================ /

 app.get('/newCategory', function (req, res, cb)
 {
   if (req.session.token && req.session.adminUserType == 1)
   {
     adminController.data.getCategories(req, res, function (err, data)
     {
       console.log('datad==================================.','ssss');
       res.render('./viewNewCategory',{categoryData: data.categoryData,speficData:data.specificData,countries:data.countries,userStatus:req.session.adminUserType});
     });
   }
   else
   {
     res.redirect('/admin');
   }
 });



 app.post('/updateCatTagIndex', function (req, res, cb)
 {
      adminController.data.updateTagIndex(req, res, function (err, data)
     {
        res.write(JSON.stringify(data));
        res.end();
     });
   
 })

/* ====================== Export questions ==================================== */
app.get('/viewExportQuestion/:type', function (req, res, cb) 
{
   if (req.session.token && req.session.adminUserType == 1)
   {
    let mysql = require('mysql');
    let config = {
      host    : 'database-5.cm6yupdpuljv.eu-west-2.rds.amazonaws.com',
      user    : 'admin',
      password: '0ut3maRt321!',
      database: 'liveStage'
    };
    
    let connection = mysql.createConnection(config);
    //let sql = `CALL filterTodo(?)`;
    let countries = `CALL GetAllCountry()`;
    let categories = `CALL GetAllCategories()`;
    let packages = `CALL GetAllPackages()`;
    let allData = {countries:[],categories:[],packages:[]}
    connection.query(countries, (error, countriesData, fields) => {
      if (error) {
        return console.error(error.message);
      }
      else
      {
        
        allData.countries= countriesData[0]
        connection.query(categories, (error, categoriesData, fields) => {
          if (error) 
          {
            return console.error(error.message);
          }
          else
          {
            allData.categories= categoriesData[0]
            connection.query(packages, (error, packagesData, fields) => {
              if (error) 
              {
                return console.error(error.message);
              }
              else
              {
                allData.packages= packagesData[0]
                //allData.push(packagesData)
                res.render('./viewExportQuestion', {type:req.params.type,userStatus:req.session.adminUserType,categories:allData.categories,country:allData.countries,packages:allData.packages});
                
              }
            })
          }
        });
      }
    })
    
   }
   else
   {
     res.redirect('/admin');
   }
});

/* ====================== Export questions ==================================== */
app.get('/viewFinalRound', function (req, res, cb) 
  {
    if (req.session.token && req.session.adminUserType == 1)
    {
      // console.log(req.session.adminUserType+'111111111111111');
        adminController.data.viewFinalRound(req, res, function (err, data)
        {
          res.render('./viewFinalRound', {userStatus:req.session.adminUserType});
        });
      
    }
    else
    {
      res.redirect('/admin');
    }
  });



app.post('/exportAllData', function (req, res, cb) 
{
  adminController.data.getDataAndExport(req, res, function (err, data)
  {
	if(data.type ==1)
	{
	    res.redirect('./viewExportQuestion/1');
	}else{
		res.redirect('./viewExportQuestion/0');

	}
  })
});





}
