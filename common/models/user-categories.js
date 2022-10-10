'use strict';
var app = require('../../server/server');

module.exports = function(Usercategories) {
    Usercategories.setPurchase = function (req, cb) 
    {
        let reqObject = req.res.req;
        let aData = JSON.parse(reqObject.body.data);
        let userModel = app.models.user;
        //let aData ={userId:31,categoryId:7}
	console.log("============================== Hit setPurchase =======================")

        userModel.findOne({where:{id:aData.userId}},function(err,userInfo){
            if(err)
            {
                cb(null,{status:"fail",message:'Error While getting user info'})
            }
            else
            {
                 console.log(userInfo);
                if(userInfo)
                {
                    let purchaseCat =userInfo.purchaseCategory.split(',');
                    console.log("  === ",purchaseCat);
                    let newPuchaseCate = purchaseCat+','+aData.categoryId


                    Usercategories.create({user_id:aData.userId,category_id:aData.categoryId,questionAsked:0
                        ,categoryRepeat:0,status:1,created:new Date(),modified:new Date},function(err,userCategory)
                    {
                        if(err)
                        {
                            cb(null,{status:"fail",message:'Error While pucharsing'})
                        }
                        else
                        {
                            userModel.updateAll({id:parseInt(userInfo.id)},{purchaseCategory:newPuchaseCate},function(err,userUpdate){
                                if(err)
                                {
                                    cb(null,{status:"fail",message:'Error While updating'})
                                }
                                else
                                {
                                    cb(null,{status:'success',message:"categoryPuchase"});
                                }
                            }) 
                            
                        }
                    })
                }
                else
                {
                    cb(null,{status:'fail',message:"userinfo not found"});
                }
            }
        })
        
    }
    
    Usercategories.remoteMethod(
    'setPurchase', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/setPurchase',verb: 'post'}
    });



    Usercategories.setAddOns = function (req, cb) 
    {
        console.log("nnnn")
        
        let userAddOns  = app.models.user_add_ons;
        
            let user =  app.models.user;
            let ds1 = user.dataSource;
            ds1.connector.query('SELECT id,purchaseCategory from user where purchaseCategory !="0"', function (err, data)
            { 
                let i=0;
                async.eachSeries(data, function(item, cback)
                { 
                    i++
                    let categories =  item.purchaseCategory.split(',')
                    let insertData = []
                    for(let i=0;i<categories.length;i++)
                    {
                        if(categories[i] != 0)
                        {
                            let obj = {user_id:item.id,category_id:categories[i],addOnType:2,created:new Date(),modified:new Date};
                            insertData.push(obj);
                        }
                    }
                    console.log(insertData);

                    userAddOns.create(insertData,function(err,add){
                        if(err)
                        {

                        }
                        else
                        {
                            if(i == data.length)
                            {
                                cb(null,{data:"success"})
                            }
                            else
                            {
                                cback()
                            }
                        }
                    })
                })
            })
        

        
    }
    
    Usercategories.remoteMethod(
    'setAddOns', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/setAddOns',verb: 'post'}
    });
};
