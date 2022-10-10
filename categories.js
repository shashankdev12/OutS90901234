'use strict';
var app = require('../../server/server');
let async = require('async');
module.exports = function(Categories) {

    Categories.getCategory = function (req, cb) 
    {
	console.log("================================Get Category ===============================");
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
        let userModel = app.models.user;
        let categories =  app.models.categories;
        let ds1 = categories.dataSource;

        userModel.findOne({where:{id:aData .userId},fields:{id:true,country_id:true,purchaseCategory:true}},function(err,userInfo)
        {
            if(err)
            {
                cb(null,{status:"fail"})
            }
            else
            {
                let purchaseCate = userInfo.purchaseCategory.split(',');
                Categories.find({where:{type:2},fields:{created:false,modified:false}}, function (err, categories)
                {
                    if(err)
                    {
                        cb(null,{status:"fail"})     
                    }
                    else
                    {
                        if(categories.length > 0)
                        {
                            let x=0 ;
                            let categoryArray = [];
                            async.eachSeries(categories, function(value, callback)
                            {   
                                x++
                                if(purchaseCate.includes(value.id.toString()))
                                {
                                    value['purchased'] = 1
                                }
                                else
                                {
                                    value['purchased'] = 0
                                }
                                categoryArray.push(value);
                                if(x == categories.length)
                                {
                                    cb(null,{status:"success",data:categoryArray})
                                }
                                callback()
                            })
                        }
                        else
                        {
                            cb(null,{status:"success",data:[]})
                        }
                       
                    }
                })
                    
            }
        })
           
    }
    
    Categories.remoteMethod(
    'getCategory', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getCategory',verb: 'post'}
    });



Categories.getCategory2 = function (req, cb) 
{
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
    let userModel = app.models.user;
    //let userCategoryModel = app.models.user_categories;
    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    
    //console.log(JSON.parse(reqObject.body.data))		
	
    // let aData ={ userId: 31,region:'EN'}
      if(aData.region)
        {   
            let userCategoryModel = app.models.user_categories;
            userModel.findOne({where:{id:aData.userId,status:1}},function(err,userInfo)
            {
            if(err)
            {
                cb(null,{status:0})
            }
            else
            {
                let purchaseCate=[]
                if(userInfo.purchaseCategory != "0" && userInfo.purchaseCategory != "" && userInfo.purchaseCategory != null)
                {
                    purchaseCate = userInfo.purchaseCategory.split(',');
                }
               
                Categories.find({where:{status:1,isPackage:0},fields:{created:false,modified:false}}, function (err, categories)
                {
                        if(err)
                        {
                            cb(null,{status:0})     
                        }
                        else
                        {
                            let categoriesInfo = [];
                            categoriesInfo.push(categories)
                            let iIn = {};
                            if(aData.selectedPackageId != undefined)
                            {
                                iIn = {inq:aData.selectedPackageId}; 
                            }

                            Categories.find({where:{isPackage:1,categoryMasterId:iIn},fields:{created:false,modified:false}}, function (err, categories2)
                            {
                                let cateInfo=[];
                                if(categories2.length>0)
                                {
                                    cateInfo =[...categories,...categories2]
                                }
                                else
                                {
                                    cateInfo =categories
                                }
                                //cateInfo.prototype.push.apply(categories,categories2);                            
                            if(cateInfo.length > 0)
                            {
                                let x=0 ;
                                let categoryArray = [];
                                async.eachSeries(cateInfo, function(value, callback)
                                {   
                                    let regionCat = value.categoryRegion.split(',');
                                    if(regionCat.includes(userInfo.country_id.toString()))
                                    {
                                        let obj ={category: value.category,iconImage: value.iconImage,buttonImage: value.buttonImage,description: value.description,
                                            amountIndex: value.amountIndex,amount: value.amount,categoryRegion:value.categoryRegion,type: value.type,status: value.status,
                                            id: value.categoryMasterId,purchased: value.purchased,finalRoundQuestions :0,
                                            tag:value.tag,tagIndex:value.tag_index,generalQuestion:0
                                            ,PercentageUsed:"100%",generalAgeList:[],finalAgeList:[],generalQuestionCount:0,finalRoundQuestionsCount:0}
                                    

                                        ds1.connector.query('SELECT category_id,age_id, COUNT(*) AS NUM FROM questions_'+aData.region+' WHERE category_id='+value.id+'  AND STATUS=0 GROUP BY age_id  ', function (err, countInfo)
                                        {   
                                        if(err)
                                        {
                                            cb(null,{status:'fail',message:"Error while getting ages"})
                                        }
                                        else
                                        {
                                            ds1.connector.query('SELECT category_id,age_id, COUNT(*) AS NUM FROM questions_'+aData.region+' WHERE  category_id='+value.id+' AND STATUS=1 GROUP BY age_id', function (err, finalCountInfo)
                                            {
                                                if(err)
                                                {
                                                    cb(null,{status:'fail',message:"Error while getting final Ages"})
                                                }
                                                else
                                                {
                                                    if(countInfo.length > 0)
                                                    {
                                                      for(let i=0;i<countInfo.length;i++)
                                                      {
                                                        let age = countInfo[i].age_id.split(",");
                                                        for(let j=0;j<age.length;j++)
                                                        {
                                                            let ageExist = obj.generalAgeList.filter(a=>a == age[j])
                                                            if(ageExist.length == 0)
                                                            {
                                                                obj.generalAgeList.push(age[j])
                                                            }
                                                        }
                                                        obj.generalQuestionCount = obj.generalQuestionCount+countInfo[i].NUM
                                                      }

                                                      if(obj.generalAgeList.length == 3)
                                                      {
                                                        obj.generalQuestion=1;
                                                      }
                                                      else
                                                      {
                                                        obj.generalQuestion=0
                                                      }
                                                    }
                                                    else
                                                    {
                                                        obj.generalQuestion=0 
                                                    }

                                                    if(finalCountInfo.length > 0)
                                                    {
                                                        // if(parseInt(finalCountInfo[0].NUM) > 9 &&  parseInt(finalCountInfo[1].NUM) > 9 && parseInt(finalCountInfo[2].NUM) > 9)
                                                        // {
                                                        //     obj.finalRoundQuestions=1
                                                        // }
                                                        // else
                                                        // {
                                                        //     obj.finalRoundQuestions=0
                                                        // }
                                                        let objConfirm = {junior:0,teen:0,adult:0}
                                                        for(let i=0;i<finalCountInfo.length;i++)
                                                        {
                                                            let age = finalCountInfo[i].age_id.split(",");
                                                            for(let j=0;j<age.length;j++)
                                                            {
                                                                let ageExist = obj.finalAgeList.filter(a=>a == age[j])
                                                                if(ageExist.length == 0)
                                                                {
                                                                    obj.finalAgeList.push(age[j])
                                                                }
                                                            }
                                                            obj.finalRoundQuestionsCount = obj.finalRoundQuestionsCount+finalCountInfo[i].NUM

                                                           if(finalCountInfo[i].age_id.includes(1))
                                                           {
                                                               if(finalCountInfo[i].NUM > 9)
                                                               {
                                                                 objConfirm.junior=1
                                                               } 
                                                           }
                                                           else if(finalCountInfo[i].age_id.includes(2))
                                                           {
                                                                if(finalCountInfo[i].NUM > 9)
                                                               {
                                                                 objConfirm.teen=1
                                                               }
                                                           }
                                                           else if(finalCountInfo[i].age_id.includes(3))
                                                           {
                                                                if(finalCountInfo[i].NUM > 9)
                                                               {
                                                                 objConfirm.adult=1
                                                               }
                                                           }

                                                        }

                                                        console.log(objConfirm)

                                                        if(objConfirm.junior == 1 && objConfirm.teen==1 && objConfirm.adult == 1)
                                                        {

                                                            obj.finalRoundQuestions=1 
                                                        }

                                                    }
                                                    else
                                                    {
                                                        obj.finalRoundQuestions=0
                                                    }

                                                    x++
                                                    if(purchaseCate.includes(value.id.toString()))
                                                    {
                                                        obj.purchased = 1
                                                    }
                                                    else
                                                    {
                                                        obj.purchased = 0
                                                    }

                                                    userCategoryModel.findOne({where:{user_id:aData.userId,category_id:value.id}},function(err,sdata)
                                                    {
                                                        if(x == cateInfo.length)
                                                        {
                                                            cb(null,{status:'success',data:categoryArray})
                                                        }
                                                        else
                                                        {
                                                            if(sdata == null)
                                                            {
                                                                if(value.id == 1)
                                                                {
                                                                    let num = userInfo.PubQuizQuestionAsked.split(",");
                                                                    obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
                                                                }
                                                                else if(value.id == 2)
                                                                {
                                                                    let num = userInfo.BKSQuestionAsked.split(",");
                                                                    //console.log(num.length)
                                                                    //console.log(countInfo[0].NUM)
                                                                    obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
                                                                }
                                                                else if(value.id == 3)
                                                                {
                                                                    let num = userInfo.QTQuestionAsked.split(",");
                                                                    //console.log(num.length)
                                                                    obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
                                                                }
                                                                else if(value.id == 4)
                                                                {
                                                                    let num = userInfo.SNMQuestionAsked.split(",");
                                                                   // console.log(num.length)
                                                                    obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
                                                                }
                                                                else if(value.id == 5)
                                                                {
                                                                    let num = userInfo.TVBQuestionAsked.split(",");
                                                                   // console.log(num.length)
                                                                    obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
                                                                }
                                                                else if(value.id == 6)
                                                                {
                                                                    let num = userInfo.BKNQuestionAsked.split(",");
                                                                  //  console.log(num.length)
                                                                    obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
                                                                }
                                                                else
                                                                {
                                                                    obj.PercentageUsed=0+"%"; 
                                                                }
                                                                
                                                            } 
                                                            else
                                                            {
                                                                let num = sdata.questionAsked.split(",");
                                                                //console.log(num.length)
								if(countInfo[0] != undefined)
								{
                                                                	obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
								}
                                                            }
                                                            
                                                            categoryArray.push(obj); 
                                                            callback()
                                                        }
                                                    })
                                                    


                                                }
                                            })  
                                        }

                                        })
                                    }
                                    else
                                    {
                                        x++
                                        if(x == cateInfo.length)
                                        {
                                            cb(null,{status:'success',data:categoryArray})
                                        }
                                        callback()
                                        
                                    }
                                    
                                })
                            }
                            else
                            {
                                cb(null,{status:'success',data:[]})
                            }
                        })
                        
                        }
                    
                    })
                        
                }
            })
            }
            else
            {
                cb(null,{status:0,message:"region is not define"})
            }
            
        }
    
    Categories.remoteMethod(
    'getCategory2', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getCategory2',verb: 'post'}
    });

Categories.getCateAge = function (req, cb) 
    {
        let age_categoriesModel = app.models.age_categories    


        Categories.find({},function(err,cateInfo){
            if(err)
            {
                cb(null,{status:"fail",data:[]})
            }
            else
            {
                age_categoriesModel.find({},function(err,ageData){

                    if(err)
                    {
                        cb(null,{status:"fail",data:[]})
                    }
                    else
                    {
                        let info ={age:ageData,category:cateInfo}
                        cb(null,{status:"success",data:info})
                    }
                })
            }
        })


       
           
            
    }
        
    Categories.remoteMethod(
    'getCateAge', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getCateAge',verb: 'post'}
    });


    Categories.getCategory2T = function (req, cb) 
{
    let reqObject = req.res.req;
    let aData = JSON.parse(reqObject.body.data);
    let userModel = app.models.user;
    //let userCategoryModel = app.models.user_categories;
    let questions =  app.models.questions;
    let ds1 = questions.dataSource;
    
    //console.log("aaaaaaaaaaaaaaaaaaaaaaaa",aData)		
	
     //let aData ={ userId: 14,region:'USA'}
      if(aData.region)
        {   
		//console.log("---------------------SSSSS")
            let userCategoryModel = app.models.user_categories;
            let countryModel = app.models.countries;
            countryModel.findOne({where :{code:aData.region}},function(err,countryInfo){
            userModel.findOne({where:{id:aData.userId,status:1}},function(err,userInfo)
            {
            if(err)
            {
                cb(null,{status:0})
            }
            else
            {
                let purchaseCate=[]
                if(userInfo.purchaseCategory != "0" && userInfo.purchaseCategory != "" && userInfo.purchaseCategory != null)
                {
                    purchaseCate = userInfo.purchaseCategory.split(',');
                }
               
                Categories.find({where:{status:1,isPackage:0,categoryRegion:countryInfo.id},fields:{created:false,modified:false}}, function (err, categories)
                {
			
                        if(err)
                        {
                            cb(null,{status:0})     
                        }
                        else
                        {
				//console.log("------------------",categories)
                            let categoriesInfo = [];
                            categoriesInfo.push(categories)
                            let iIn = {};
                            if(aData.selectedPackageId != undefined)
                            {
                                iIn = {inq:aData.selectedPackageId}; 
                            }

                            Categories.find({where:{isPackage:1,categoryMasterId:iIn,categoryRegion:countryInfo.id},fields:{created:false,modified:false}}, function (err, categories2)
                            {
                                let cateInfo=[];
                                if(categories2.length>0)
                                {
                                    cateInfo =[...categories,...categories2]
                                }
                                else
                                {
                                    cateInfo =categories
                                }
                                //cateInfo.prototype.push.apply(categories,categories2);                            


                            if(cateInfo.length > 0)
                            {
				                                console.log("00000000000000000000",cateInfo)

                                let x=0 ;
                                let categoryArray = [];
                                async.eachSeries(cateInfo, function(value, callback)
                                {   
                                    //console.log("value",value)
                                    //let regionCat = value.categoryRegion.split(',');
				     console.log("userInfo.country_id",userInfo.country_id)		
				     console.log("userInfo.country_id",value.categoryRegion)		
                                    if(userInfo.country_id == value.categoryRegion)
                                    {
                                        
                                        let obj ={category: value.category,iconImage: value.iconImage,buttonImage: value.buttonImage,description: value.description,
                                            amountIndex: value.amountIndex,amount: value.amount,categoryRegion:value.categoryRegion,type: value.type,status: value.status,
                                            id: value.categoryMasterId,purchased: value.purchased,finalRoundQuestions :0,
                                            tag:value.tag,tagIndex:value.tag_index,generalQuestion:0
                                            ,PercentageUsed:"0%",generalAgeList:[],finalAgeList:[],generalQuestionCount:0,finalRoundQuestionsCount:0}
                                    
                                         console.log("sssssssssssss",obj)   
                                        ds1.connector.query('SELECT category_id,age_id, COUNT(*) AS NUM FROM questions_'+aData.region+' WHERE category_id='+value.categoryMasterId+'  AND STATUS=0 GROUP BY age_id  ', function (err, countInfo)
                                        {   
                                        if(err)
                                        {
                                            cb(null,{status:'fail',message:"Error while getting ages"})
                                        }
                                        else
                                        {
                                            ds1.connector.query('SELECT category_id,age_id, COUNT(*) AS NUM FROM questions_'+aData.region+' WHERE  category_id='+value.categoryMasterId+' AND STATUS=1 GROUP BY age_id', function (err, finalCountInfo)
                                            {
                                                if(err)
                                                {
                                                    cb(null,{status:'fail',message:"Error while getting final Ages"})
                                                }
                                                else
                                                {
                                                    if(countInfo.length > 0)
                                                    {
                                                      for(let i=0;i<countInfo.length;i++)
                                                      {
                                                        let age = countInfo[i].age_id.split(",");
                                                        for(let j=0;j<age.length;j++)
                                                        {
                                                            let ageExist = obj.generalAgeList.filter(a=>a == age[j])
                                                            if(ageExist.length == 0)
                                                            {
                                                                obj.generalAgeList.push(age[j])
                                                            }
                                                        }
                                                        obj.generalQuestionCount = obj.generalQuestionCount+countInfo[i].NUM
                                                      }

                                                      if(obj.generalAgeList.length == 3)
                                                      {
                                                        obj.generalQuestion=1;
                                                      }
                                                      else
                                                      {
                                                        obj.generalQuestion=0
                                                      }
                                                    }
                                                    else
                                                    {
                                                        obj.generalQuestion=0 
                                                    }

                                                    if(finalCountInfo.length > 0)
                                                    {
                                                        // if(parseInt(finalCountInfo[0].NUM) > 9 &&  parseInt(finalCountInfo[1].NUM) > 9 && parseInt(finalCountInfo[2].NUM) > 9)
                                                        // {
                                                        //     obj.finalRoundQuestions=1
                                                        // }
                                                        // else
                                                        // {
                                                        //     obj.finalRoundQuestions=0
                                                        // }
                                                        let objConfirm = {junior:0,teen:0,adult:0}
                                                        for(let i=0;i<finalCountInfo.length;i++)
                                                        {
                                                            let age = finalCountInfo[i].age_id.split(",");
                                                            for(let j=0;j<age.length;j++)
                                                            {
                                                                let ageExist = obj.finalAgeList.filter(a=>a == age[j])
                                                                if(ageExist.length == 0)
                                                                {
                                                                    obj.finalAgeList.push(age[j])
                                                                }
                                                            }
                                                            obj.finalRoundQuestionsCount = obj.finalRoundQuestionsCount+finalCountInfo[i].NUM

                                                           if(finalCountInfo[i].age_id.includes(1))
                                                           {
                                                               if(finalCountInfo[i].NUM > 9)
                                                               {
                                                                 objConfirm.junior=1
                                                               } 
                                                           }
                                                           else if(finalCountInfo[i].age_id.includes(2))
                                                           {
                                                                if(finalCountInfo[i].NUM > 9)
                                                               {
                                                                 objConfirm.teen=1
                                                               }
                                                           }
                                                           else if(finalCountInfo[i].age_id.includes(3))
                                                           {
                                                                if(finalCountInfo[i].NUM > 9)
                                                               {
                                                                 objConfirm.adult=1
                                                               }
                                                           }

                                                        }

                                                        console.log(objConfirm)

                                                        if(objConfirm.junior == 1 && objConfirm.teen==1 && objConfirm.adult == 1)
                                                        {

                                                            obj.finalRoundQuestions=1 
                                                        }

                                                    }
                                                    else
                                                    {
                                                        obj.finalRoundQuestions=0
                                                    }

                                                    x++
                                                    if(purchaseCate.includes(value.categoryMasterId.toString()))
                                                    {
                                                        obj.purchased = 1
                                                    }
                                                    else
                                                    {
                                                        obj.purchased = 0
                                                    }
                                                    
                                                    console.log("sssiii",obj )
                                                    userCategoryModel.findOne({where:{user_id:aData.userId,category_id:value.categoryMasterId}},function(err,sdata)
                                                    {
                                                        
                                                        console.log("ssss",sdata)
                                                        if(x == cateInfo.length)
                                                        {
                                                            console.log("ssssnnnnn",sdata)
                                                            //if(cateInfo.length == 1)
                                                            //{
                                                                categoryArray.push(obj);
                                                            //}
                                                            cb(null,{status:'success',data:categoryArray})
                                                        }
                                                        else
                                                        {
                                                            
                                                            if(sdata == null)
                                                            {   
                                                                
                                                               
                                                                if(value.categoryMasterId == 1)
                                                                {
                                                                    let num = userInfo.PubQuizQuestionAsked.split(",");
								    console.log("numnumnumnumnum",num);	
								    if(countInfo[0])
								    {	
                                                                    	obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
								    }	
                                                                }
                                                                else if(value.categoryMasterId == 2)
                                                                {
                                                                    let num = userInfo.BKSQuestionAsked.split(",");
                                                                    //console.log(num.length)
                                                                    //console.log(countInfo[0].NUM)
								    if(countInfo[0])
								    {
                                                                    	obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
								    }
                                                                }
                                                                else if(value.categoryMasterId == 3)
                                                                {
                                                                    let num = userInfo.QTQuestionAsked.split(",");
                                                                    //console.log(num.length)
								    if(countInfo[0])
								    {	
                                                                    	obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
								    }
                                                                }
                                                                else if(value.categoryMasterId == 4)
                                                                {
                                                                    let num = userInfo.SNMQuestionAsked.split(",");
                                                                   // console.log(num.length)
								if(countInfo[0])
								    {	
                                                                    obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"

                                                                  }
                                                                }
                                                                else if(value.categoryMasterId == 5)
                                                                {
                                                                    let num = userInfo.TVBQuestionAsked.split(",");
                                                                   // console.log(num.length)
									if(countInfo[0])
								    {
                                                                    	obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
								    }
                                                                }
                                                                else if(value.categoryMasterId == 6)
                                                                {
                                                                    let num = userInfo.BKNQuestionAsked.split(",");
                                                                  //  console.log(num.length)
									if(countInfo[0])
								    {
                                                                    	obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"		
								    }
								    	
                                                                }
                                                                else
                                                                {
                                                                    obj.PercentageUsed=0+"%"; 
                                                                }

                                                                console.log("sssnnn",obj)
                                                            categoryArray.push(obj); 
                                                            callback()
                                                                
                                                            } 
                                                            else
                                                            {
                                                                let num = sdata.questionAsked.split(",");
                                                                //console.log(num.length)
                                                                if(countInfo[0] != undefined)
                                                                {
                                                                	obj.PercentageUsed = Math.ceil((num.length/ countInfo[0].NUM)*100)+"%"
                                                                }
                                                                console.log("sssnnn",obj)
                                                                categoryArray.push(obj); 
                                                                callback()
                                                            }
                                                            
                                                        }
                                                    })
                                                    


                                                }
                                            })  
                                        }

                                        })
                                    }
                                    else
                                    {
                                        x++
                                        if(x == cateInfo.length)
                                        {
                                            cb(null,{status:'success',data:categoryArray})
                                        }
                                        callback()
                                        
                                    }
                                    
                                })
                            }
                            else
                            {
                                cb(null,{status:'success',data:[]})
                            }
                        })
                        
                        }
                    
                    })
                        
                }
            })
                })
            }
            else
            {
                cb(null,{status:0,message:"region is not define"})
            }
            
        }
    
    Categories.remoteMethod(
    'getCategory2T', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getCategory2T',verb: 'post'}
    });


};
