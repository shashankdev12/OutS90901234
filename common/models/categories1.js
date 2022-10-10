'use strict';
var app = require('../../server/server');
let async = require('async');
module.exports = function(Categories) {

    Categories.getCategory = function (req, cb) 
    {
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
        let questions =  app.models.questions;
        let ds1 = questions.dataSource;

        userModel.findOne({where:{id:aData.userId},fields:{id:true,country_id:true,purchaseCategory:true}},function(err,userInfo)
        {
            if(err)
            {
                cb(null,{status:0})
            }
            else
            {
		console.log(userInfo);
                let purchaseCate = userInfo.purchaseCategory.split(',');
                console.log(purchaseCate);
                Categories.find({where:{type:2,status:1},fields:{created:false,modified:false}}, function (err, categories)
                {
                    if(err)
                    {
                        cb(null,{status:0})     
                    }
                    else
                    {
                        if(categories.length > 0)
                        {
                            let x=0 ;
                            let categoryArray = [];
                            async.eachSeries(categories, function(value, callback)
                            {   
                                let regionCat = value.categoryRegion.split(',');
                                console.log("sssss",regionCat.includes(userInfo.country_id.toString()));
                                if(regionCat.includes(userInfo.country_id.toString()))
                                {
                                    let obj ={category: value.category,iconImage: value.iconImage,buttonImage: value.buttonImage,description: value.description,
                                          amountIndex: value.amountIndex,amount: value.amount,categoryRegion:value.categoryRegion,type: value.type,status: value.status,
                                          id: value.id,purchased: value.purchased,finalRoundQuestions :0,generalQuestion:0}
                                
                                    //console.log('SELECT age_id, COUNT(*) AS NUM FROM questions WHERE category_id='+value.id+' AND region='+userInfo.country_id+' AND STATUS=0 GROUP BY age_id');
                                    ds1.connector.query('SELECT age_id, COUNT(*) AS NUM FROM questions WHERE category_id='+value.id+' AND region='+userInfo.country_id+' AND STATUS=0 GROUP BY age_id', function (err, countInfo)
                                    {   
                                    if(err)
                                    {
                                        cb(null,{status:'fail',message:"Error while getting ages"})
                                    }
                                    else
                                    {
                                        ds1.connector.query('SELECT age_id, COUNT(*) AS NUM FROM questions WHERE  category_id='+value.id+' AND  region='+userInfo.country_id+' AND STATUS=1 GROUP BY age_id', function (err, finalCountInfo)
                                        {
                                            if(err)
                                            {
                                                cb(null,{status:'fail',message:"Error while getting final Ages"})
                                            }
                                            else
                                            {
                                                console.log("count Info",countInfo)
                                                //console.log("Final Count",finalCountInfo)
                                                if(countInfo.length > 0)
                                                {
                                                    console.log(countInfo[0])
                                                    if(countInfo[0] &&  countInfo[1] && countInfo[2])
                                                    {
                                                        console.log(2)
                                                        obj.generalQuestion=1
                                                    }
                                                    else
                                                    {
                                                        console.log(3)
                                                        obj.generalQuestion=0
                                                    }
                                                }
                                                else
                                                {
                                                    obj.generalQuestion=0 
                                                }


                                                if(finalCountInfo.length > 0)
                                                {
                                                    if(parseInt(finalCountInfo[0].NUM) > 9 &&  parseInt(finalCountInfo[1].NUM) > 9 && parseInt(finalCountInfo[2].NUM) > 9)
                                                    {
                                                        obj.finalRoundQuestions=1
                                                    }
                                                    else
                                                    {
                                                        obj.finalRoundQuestions=0
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
                                                categoryArray.push(obj);
                                                if(x == categories.length)
                                                {
                                                    console.log("2222");
                                                    cb(null,{status:1,data:categoryArray})
                                                }
                                                callback()


                                            }
                                        })  
                                    }

                                    })
                                }
                                else
                                {
                                    console.log('2222222');
                                    x++
                                    if(x == categories.length)
                                    {
                                        cb(null,{status:1,data:categoryArray})
                                    }
                                    //console.log("s")
									callback()
                                }
                                
                            })
                        }
                        else
                        {
                            cb(null,{status:1,data:[]})
                        }
                       
                    }
                })
                    
            }
        })
           
    }
    
    Categories.remoteMethod(
    'getCategory2', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getCategory2',verb: 'post'}
    });

};
