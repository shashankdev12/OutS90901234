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



Categories.getCategory3 = function (req, cb) 
{
let reqObject = req.res.req;
let aData = JSON.parse(reqObject.body.data);
let userModel = app.models.user;
//let userCategoryModel = app.models.user_categories;
let questions =  app.models.questions;
let ds1 = questions.dataSource;
let regionCategories =  app.models.region_categories;

//console.log(JSON.parse(reqObject.body.data))		
//let aData ={ userId: 172649,region:'UK'}
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
console.log("userInfo",userInfo)
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

Categories.find({where:{isPackage:1,id:iIn},fields:{created:false,modified:false}}, function (err, categories2)
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
console.log("cateInfo",cateInfo)
async.eachSeries(cateInfo, function(value, callback)
{   

let regionCat = value.categoryRegion.split(',');
if(regionCat.includes(userInfo.country_id.toString()))
{
let obj ={category: value.category,iconImage: value.iconImage,buttonImage: value.buttonImage,description: value.description,
amountIndex: value.amountIndex,amount: value.amount,categoryRegion:value.categoryRegion,type: value.type,status: value.status,
id: value.id,purchased: value.purchased,finalRoundQuestions :0,
tag:value.tag,tagIndex:value.tag_index,generalQuestion:0
,PercentageUsed:"0%",generalAgeList:[],finalAgeList:[],generalQuestionCount:0,finalRoundQuestionsCount:0}


ds1.connector.query('SELECT category_id,age_id, COUNT(*) AS NUM FROM questions_'+aData.region+' WHERE category_id='+value.id+'  AND STATUS=0 AND questionActiveStatus =1 AND questionState=1 GROUP BY age_id  ', function (err, countInfo)
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

///console.log(objConfirm)

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
regionCategories.findOne({where:{category_id:obj.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
console.log(err);    
if(regiondata)
{
obj.category=regiondata.category;
obj.description=regiondata.description;
if(regiondata.tag){
obj.tag=regiondata.tag;
}
else
{
obj.tag="";

}                       
obj.tag_index=regiondata.tag_index;
categoryArray.push(obj); 
cb(null,{status:'success',data:categoryArray})
}
else
{
categoryArray.push(obj); 
cb(null,{status:'success',data:categoryArray})
}
})

}
else
{
if(sdata == null)
{
if(value.id == 1)
{


let num = userInfo.PubQuizQuestionAsked.split(",");
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
console.log("num.length",num.length)
console.log("num.length",count)
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 2)
{
let num = userInfo.BKSQuestionAsked.split(",");
//console.log(num.length)
//console.log(countInfo[0].NUM)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}

console.log("num.length",num.length)
console.log("num.length",count)
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 3)
{
let num = userInfo.QTQuestionAsked.split(",");
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 4)
{
let num = userInfo.SNMQuestionAsked.split(",");
// console.log(num.length)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 5)
{
let num = userInfo.TVBQuestionAsked.split(",");
// console.log(num.length)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 6)
{
let num = userInfo.BKNQuestionAsked.split(",");
//  console.log(num.length)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
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
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
//obj.PercentageUsed = Math.round((num.length/ countInfo[0].NUM)*100)+"%"
}
}


regionCategories.findOne({where:{category_id:obj.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
console.log(err);    
if(regiondata)
{
obj.category=regiondata.category;
obj.description=regiondata.description;
if(regiondata.tag){
obj.tag=regiondata.tag;
}
else
{
obj.tag="";

}

obj.tag_index=regiondata.tag_index;
categoryArray.push(obj); 
callback()
}
else
{
categoryArray.push(obj); 
callback()
}
})  

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
let n=0;
async.eachSeries(categoryArray, function(finalCatValues, callbackAgain)
{
n++
if(n == categoryArray.length){
regionCategories.findOne({where:{category_id:finalCatValues.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
if(regiondata)
{
finalCatValues.category=regiondata.category;
finalCatValues.description=regiondata.description;
let obj={}	

if(regiondata.tag){
	finalCatValues.tag=regiondata.tag;
}
else
{
	finalCatValues.tag="";
}

finalCatValues.tag_index=regiondata.tag_index;
cb(null,{status:'success',data:categoryArray})
}
else
{
cb(null,{status:'success',data:categoryArray})
}

})    

}
else
{
//console.log()
regionCategories.findOne({where:{category_id:finalCatValues.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
if(regiondata)
{
	finalCatValues.category=regiondata.category;
	finalCatValues.description=regiondata.description;
	let obj={}	
	if(regiondata.tag){
		finalCatValues.tag=regiondata.tag;
	}
        else
       {
	finalCatValues.tag="";

       }

	finalCatValues.tag_index=regiondata.tag_index;
callbackAgain()    
}
else
{
callbackAgain()    
}
})

}

//cb(null,{status:'success',data:categoryArray})
})
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
'getCategory3', {
accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
returns: [{arg: 'data',type: 'Object'}],
http: {path: '/getCategory3',verb: 'post'}
});

Categories.getCategory5 = function (req, cb) 
{
let reqObject = req.res.req;
let aData = JSON.parse(reqObject.body.data);
let userModel = app.models.user;
//let userCategoryModel = app.models.user_categories;
let questions =  app.models.questions;
let ds1 = questions.dataSource;
let regionCategories =  app.models.region_categories;

//console.log(JSON.parse(reqObject.body.data))		
//let aData ={ userId: 172649,region:'UK'}
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
console.log("userInfo",userInfo)
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

Categories.find({where:{isPackage:1,id:iIn},fields:{created:false,modified:false}}, function (err, categories2)
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
console.log("cateInfo",cateInfo)
async.eachSeries(cateInfo, function(value, callback)
{   

let regionCat = value.categoryRegion.split(',');
if(regionCat.includes(userInfo.country_id.toString()))
{
let obj ={category: value.category,iconImage: value.iconImage,buttonImage: value.buttonImage,description: value.description,
amountIndex: value.amountIndex,amount: value.amount,categoryRegion:value.categoryRegion,type: value.type,status: value.status,
id: value.id,purchased: value.purchased,finalRoundQuestions :0,
tag:value.tag,tagIndex:value.tag_index,generalQuestion:0
,PercentageUsed:"0%",generalAgeList:[],finalAgeList:[],generalQuestionCount:0,finalRoundQuestionsCount:0}


ds1.connector.query('SELECT category_id,age_id, COUNT(*) AS NUM FROM questions_'+aData.region+' WHERE category_id='+value.id+'  AND STATUS=0 AND questionActiveStatus =1 AND questionState=1 GROUP BY age_id  ', function (err, countInfo)
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

///console.log(objConfirm)

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
regionCategories.findOne({where:{category_id:obj.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
console.log(err);    
    if(regiondata)
    {
        obj.category=regiondata.category;
        obj.description=regiondata.description;
        if(regiondata.tag){
            obj.tag=regiondata.tag;
        }
        else
        {
            obj.tag="";

        }                       
            obj.tag_index=regiondata.tag_index;
            categoryArray.push(obj); 
        callNew(cb,categoryArray)    
        //cb(null,{status:'success',data:categoryArray})
    }
    else
    {
        categoryArray.push(obj);
        console.log("2") 
        callNew(cb,categoryArray)    
        //cb(null,{status:'success',data:categoryArray})
    }
})

}
else
{
if(sdata == null)
{
if(value.id == 1)
{


let num = userInfo.PubQuizQuestionAsked.split(",");
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
console.log("num.length",num.length)
console.log("num.length",count)
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 2)
{
let num = userInfo.BKSQuestionAsked.split(",");
//console.log(num.length)
//console.log(countInfo[0].NUM)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}

console.log("num.length",num.length)
console.log("num.length",count)
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 3)
{
let num = userInfo.QTQuestionAsked.split(",");
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 4)
{
let num = userInfo.SNMQuestionAsked.split(",");
// console.log(num.length)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 5)
{
let num = userInfo.TVBQuestionAsked.split(",");
// console.log(num.length)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
}
else if(value.id == 6)
{
let num = userInfo.BKNQuestionAsked.split(",");
//  console.log(num.length)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
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
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
//obj.PercentageUsed = Math.round((num.length/ countInfo[0].NUM)*100)+"%"
}
}


regionCategories.findOne({where:{category_id:obj.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
console.log(err);    
if(regiondata)
{
obj.category=regiondata.category;
obj.description=regiondata.description;
if(regiondata.tag){
obj.tag=regiondata.tag;
}
else
{
obj.tag="";

}

obj.tag_index=regiondata.tag_index;
categoryArray.push(obj); 
callback()
}
else
{
categoryArray.push(obj); 
callback()
}
})  

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
let n=0;
async.eachSeries(categoryArray, function(finalCatValues, callbackAgain)
{
n++
if(n == categoryArray.length){
regionCategories.findOne({where:{category_id:finalCatValues.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
if(regiondata)
{
finalCatValues.category=regiondata.category;
finalCatValues.description=regiondata.description;
let obj={}	

if(regiondata.tag){
	finalCatValues.tag=regiondata.tag;
}
else
{
	finalCatValues.tag="";
}

finalCatValues.tag_index=regiondata.tag_index;
console.log("3")
callNew(cb,categoryArray)    
//cb(null,{status:'success',data:categoryArray})
}
else
{
    console.log("4")
    callNew(cb,categoryArray)    
//cb(null,{status:'success',data:categoryArray})
}

})    

}
else
{
//console.log()
regionCategories.findOne({where:{category_id:finalCatValues.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
if(regiondata)
{
	finalCatValues.category=regiondata.category;
	finalCatValues.description=regiondata.description;
	let obj={}	
	if(regiondata.tag){
		finalCatValues.tag=regiondata.tag;
	}
        else
       {
	finalCatValues.tag="";

       }

	finalCatValues.tag_index=regiondata.tag_index;
callbackAgain()    
}
else
{
callbackAgain()    
}
})

}


})
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
'getCategory5', {
accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
returns: [{arg: 'data',type: 'Object'}],
http: {path: '/getCategory5',verb: 'post'}
});


function callNew(cb,arr)
{
    let n=0;let newArr=[]
    async.eachSeries(arr,function(fields, callback)
    {
        console.log("fileds",fields);
        let newObj ={category: fields.category,iconImage: fields.iconImage,
            buttonImage: fields.buttonImage,description: fields.description,
            amountIndex: fields.amountIndex,amount: fields.amount,categoryRegion:fields.categoryRegion,
            type: fields.type,status: fields.status,
            id: fields.id,purchased: fields.purchased,finalRoundQuestions :fields.finalRoundQuestions ,
            tag:fields.tag,tagIndex:fields.tag_index,generalQuestion:fields.generalQuestion
            ,PercentageUsed:fields.PercentageUsed,generalAgeList:fields.generalAgeList,
            finalAgeList:fields.finalAgeList,
            generalQuestionCount:fields.generalQuestionCount,
            finalRoundQuestionsCount:fields.finalRoundQuestionsCount}
        
        n++
        if(n == arr.length)
        {
            newArr.push(newObj)
            cb(null,{status:"success",data:newArr})
        }
        else
        {
            if(fields.tag)
            {
                let tags = fields.tag.split(',');
                for(let i=0;i<tags.length;i++)
                {
                    let newObj2 ={category: fields.category,iconImage: fields.iconImage,
                        buttonImage: fields.buttonImage,description: fields.description,
                        amountIndex: fields.amountIndex,amount: fields.amount,categoryRegion:fields.categoryRegion,
                        type: fields.type,status: fields.status,
                        id: fields.id,purchased: fields.purchased,finalRoundQuestions :fields.finalRoundQuestions ,
                        tag:tags[i],tagIndex:"",generalQuestion:fields.generalQuestion
                        ,PercentageUsed:fields.PercentageUsed,generalAgeList:fields.generalAgeList,
                        finalAgeList:fields.finalAgeList,
                        generalQuestionCount:fields.generalQuestionCount,
                        finalRoundQuestionsCount:fields.finalRoundQuestionsCount}
                    
                    newArr.push(newObj2)    
                }
                callback();
            }
            else
            {
                newArr.push(newObj)
                callback();     
            }
            

           
        }
    })
}

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



Categories.getCategory2 = function (req, cb) 
{
let reqObject = req.res.req;
//let aData = JSON.parse(reqObject.body.data);
let userModel = app.models.user;
//let userCategoryModel = app.models.user_categories;
let questions =  app.models.questions;
let ds1 = questions.dataSource;
let regionCategories =  app.models.region_categories;

//console.log(JSON.parse(reqObject.body.data))		
let aData ={ userId: 14,region:'UK'}
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
console.log("userInfo",userInfo)
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

Categories.find({where:{isPackage:1,id:iIn},fields:{created:false,modified:false}}, function (err, categories2)
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
console.log("cateInfo",cateInfo)
async.eachSeries(cateInfo, function(value, callback)
{   

let regionCat = value.categoryRegion.split(',');
if(regionCat.includes(userInfo.country_id.toString()))
{
let obj ={category: value.category,iconImage: value.iconImage,buttonImage: value.buttonImage,description: value.description,
amountIndex: value.amountIndex,amount: value.amount,categoryRegion:value.categoryRegion,type: value.type,status: value.status,
id: value.id,purchased: value.purchased,finalRoundQuestions :0,
tag:value.tag,tagIndex:value.tag_index,generalQuestion:0
,PercentageUsed:"0%",generalAgeList:[],finalAgeList:[],
generalQuestionCount:0,finalRoundQuestionsCount:0,image1:value.image1,image2:value.image2
,image3:value.image3,image4:value.image4,image5:value.image5,owned:false
}


ds1.connector.query('SELECT category_id,age_id, COUNT(*) AS NUM FROM questions_'+aData.region+' WHERE category_id='+value.id+'  AND STATUS=0 AND questionActiveStatus =1 AND questionState=1 GROUP BY age_id  ', function (err, countInfo)
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

///console.log(objConfirm)

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
regionCategories.findOne({where:{category_id:obj.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
console.log(err);    
    if(regiondata)
    {
        obj.category=regiondata.category;
        obj.description=regiondata.description;
        if(regiondata.tag){
            obj.tag=regiondata.tag;
        }
        else
        {
            obj.tag="";

        }                       
            obj.tag_index=regiondata.tag_index;
            categoryArray.push(obj); 
        callNew2(cb,categoryArray)    
        //cb(null,{status:'success',data:categoryArray})
    }
    else
    {
        categoryArray.push(obj);
        console.log("2") 
        callNew2(cb,categoryArray)    
        //cb(null,{status:'success',data:categoryArray})
    }
})

}
else
{
if(sdata == null)
{
if(value.id == 1)
{


    let num = userInfo.PubQuizQuestionAsked.split(",");
    let count =0;
    for(let i=0;i<countInfo.length;i++)
    {
    count=count+countInfo[i].NUM;
    }
    console.log("num.length",num.length)
    console.log("num.length",count)
    obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
    obj.owned=true;
}
else if(value.id == 2)
{
let num = userInfo.BKSQuestionAsked.split(",");
//console.log(num.length)
//console.log(countInfo[0].NUM)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}

console.log("num.length",num.length)
console.log("num.length",count)
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
obj.owned=true;
}
else if(value.id == 3)
{
let num = userInfo.QTQuestionAsked.split(",");
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
obj.owned=true;
}
else if(value.id == 4)
{
let num = userInfo.SNMQuestionAsked.split(",");
// console.log(num.length)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
obj.owned=true;
}
else if(value.id == 5)
{
let num = userInfo.TVBQuestionAsked.split(",");
// console.log(num.length)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
obj.owned=true;
}
else if(value.id == 6)
{
let num = userInfo.BKNQuestionAsked.split(",");
//  console.log(num.length)
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%";
obj.owned=true;
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
let count =0;
for(let i=0;i<countInfo.length;i++)
{
count=count+countInfo[i].NUM;
}
obj.PercentageUsed = Math.round((num.length/ count)*100)+"%"
//obj.PercentageUsed = Math.round((num.length/ countInfo[0].NUM)*100)+"%"
}
}


regionCategories.findOne({where:{category_id:obj.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
console.log(err);    
if(regiondata)
{
obj.category=regiondata.category;
obj.description=regiondata.description;
if(regiondata.tag){
obj.tag=regiondata.tag;
}
else
{
obj.tag="";

}

obj.tag_index=regiondata.tag_index;
categoryArray.push(obj); 
callback()
}
else
{
categoryArray.push(obj); 
callback()
}
})  

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
let n=0;
async.eachSeries(categoryArray, function(finalCatValues, callbackAgain)
{
n++
if(n == categoryArray.length){
regionCategories.findOne({where:{category_id:finalCatValues.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
if(regiondata)
{
finalCatValues.category=regiondata.category;
finalCatValues.description=regiondata.description;
let obj={}	

if(regiondata.tag){
	finalCatValues.tag=regiondata.tag;
}
else
{
	finalCatValues.tag="";
}

finalCatValues.tag_index=regiondata.tag_index;
console.log("3")
callNew2(cb,categoryArray)    
//cb(null,{status:'success',data:categoryArray})
}
else
{
    console.log("4")
    callNew2(cb,categoryArray)    
//cb(null,{status:'success',data:categoryArray})
}

})    

}
else
{
//console.log()
regionCategories.findOne({where:{category_id:finalCatValues.id
,country_id:userInfo.country_id}},function(err,regiondata)
{
if(regiondata)
{
	finalCatValues.category=regiondata.category;
	finalCatValues.description=regiondata.description;
	let obj={}	
	if(regiondata.tag){
		finalCatValues.tag=regiondata.tag;
	}
        else
       {
	finalCatValues.tag="";

       }

	finalCatValues.tag_index=regiondata.tag_index;
callbackAgain()    
}
else
{
callbackAgain()    
}
})

}


})
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

function callNew2(cb,arr)
{
    let n=0;let newArr=[];
    let tagModels = app.models.tags;

    async.eachSeries(arr,function(fields, callback)
    {
        if(fields.purchased == 1)
        {
            fields.owned = true 
        }

        if(fields.amount == 0)
        {
            fields.owned = true 
        }


        let newObj ={category: fields.category,iconImage: fields.iconImage,
            buttonImage: fields.buttonImage,description: fields.description,
            amountIndex: fields.amountIndex,amount: fields.amount,categoryRegion:fields.categoryRegion,
            type: fields.type,status: fields.status,
            id: fields.id,purchased: fields.purchased,finalRoundQuestions :fields.finalRoundQuestions ,
            tag:fields.tag,tagIndex:fields.tag_index,generalQuestion:fields.generalQuestion
            ,PercentageUsed:fields.PercentageUsed,generalAgeList:fields.generalAgeList,
            finalAgeList:fields.finalAgeList,generalQuestionCount:fields.generalQuestionCount,
            finalRoundQuestionsCount:fields.finalRoundQuestionsCount,image1:fields.image1,
            image2:fields.image2,image3:fields.image3,image4:fields.image4,image5:fields.image5
            ,owned:fields.owned
        }
        
        if(newObj.purchased == 1)
        {
            newObj.owned = true 
        }


        n++
        if(n == arr.length)
        {
            newArr.push(newObj)
            tagModels.find({fields:{id:true,category_id:true,tagName:true,order:true}},function(err,tagArr){
                cb(null,{status:"success",data:newArr,tags:tagArr})
            })
        }
        else
        {
            if(fields.tag)
            {
                let tags = fields.tag.split(',');
                // if(fields.purchased == 1)
                // {
                //     fields.owned = true 
                // }
                for(let i=0;i<tags.length;i++)
                {
                    let newObj2 ={category: fields.category,iconImage: fields.iconImage,
                        buttonImage: fields.buttonImage,description: fields.description,
                        amountIndex: fields.amountIndex,amount: fields.amount,categoryRegion:fields.categoryRegion,
                        type: fields.type,status: fields.status,
                        id: fields.id,purchased: fields.purchased,finalRoundQuestions :fields.finalRoundQuestions ,
                        tag:tags[i],tagIndex:"",generalQuestion:fields.generalQuestion
                        ,PercentageUsed:fields.PercentageUsed,generalAgeList:fields.generalAgeList,
                        finalAgeList:fields.finalAgeList,
                        generalQuestionCount:fields.generalQuestionCount,
                        finalRoundQuestionsCount:fields.finalRoundQuestionsCount
                        ,image1:fields.image1,
                        image2:fields.image2,image3:fields.image3,image4:fields.image4,
                        image5:fields.image5,owned:fields.owned
                    }
                    
                    newArr.push(newObj2)    
                }
                callback();
            }
            else
            {
                newArr.push(newObj)
                callback();     
            }
            

           
        }
    })
}

};