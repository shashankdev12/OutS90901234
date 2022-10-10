'use strict';
var app = require('../../server/server');

module.exports = function(Redeemcodes) {
	
	/* =================  Redeem Cards ===========*/
	
	Redeemcodes.setRedeemCode= function (req, cb) 
	{
		console.log("=====================Set Redeem Code ==========================")
		let userModel = app.models.user;
		let reqObject = req.res.req;
       		let aData = JSON.parse(reqObject.body.data);
		console.log("=============",aData)
		//let aData = {userId:31,licence:12,emailId:"shashank",redeemCode:"SPtP3cJH"};
			try
			{
				userModel.findOne({where:{id:parseInt(aData.userId)},fields:{id:true,packages:true,purchaseCategory:true}},function(err,userInfo)
				{
					if(err)
					{
							cb(null,{status:"fail",message:"Error while getting userinfo info"});
					}
					else
					{
						if(userInfo)
						{
							Redeemcodes.findOne({where:{redeem_code:aData.redeemCode},fields:{id:true,redeem_code:true,packages:true,categories:true,status:true}},function(err,redeemInfo){
								if(err)
								{
									console.log(err)
									cb(null,{status:"fail",message:"Error while getting redeem info"});
								}
								else
								{
									if(redeemInfo)
									{
										if(redeemInfo.status == 0)
										{
											//cb(null,{status:"fail",message:"Redeem card not exist"});
											let userPackages = userInfo.packages.split(',');
											let redeemPack = redeemInfo.packages.split(',')
											let userCategories =[];
											if(userInfo.purchaseCategory!=null){
												userCategories = userInfo.purchaseCategory.split(',');
											}

											let redeemCategories = redeemInfo.categories.split(',')


											if(redeemPack[0] != '')
											{						
											for(let i=0;i<redeemPack.length;i++)
											{
												if(!userPackages.includes(redeemPack[i]))
												{
													userPackages.push(redeemPack[i])
												}
											}
											}
			
											if(redeemCategories[0] != '')
											{
											for(let j=0;j<redeemCategories.length;j++)
											{
												if(!userCategories.includes(redeemCategories[j]))
												{
													userCategories.push(redeemCategories[j])
												}
											}
											}
											
											
											userModel.updateAll({id:aData.userId},{packages:userPackages,purchaseCategory:userCategories},function(err,updateUser){
												if(err)
												{
														cb(null,{status:"fail",message:"Error While update User"});
												}
												else
												{
													Redeemcodes.updateAll({id:parseInt(redeemInfo.id)},{username:aData.userName,user_id:parseInt(aData.userId),licence_id:aData.licence,email:aData.emailId,status:1},function(err,redeenUpdate){
														if(err)
														{
															cb(null,{status:"fail",message:"Error While update User"});
														}
														else
														{
															cb(null,{status:"success",message:"Redeem Code updated"});
														}
													})
												}
											})
											
											
										}
										else
										{
											cb(null,{status:"fail",message:"Redeem Code already used"});
										}
									}
									else
									{
										cb(null,{status:"fail",message:"Redeem Code not exist"});
									}
								
								}
							})	
						}
						else
						{
							cb(null,{status:"fail",message:"user not exist"});
						}
					}
			})
			}
			catch(e)
			{
				cb(null,{status:"fail",message:"Exception Error",err:e});
			}
	}
	
	Redeemcodes.remoteMethod(
    'setRedeemCode', {
      accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
      returns: [{arg: 'data',type: 'Object'}],
      http: {path: '/setRedeemCode',verb: 'post'}
    });
};
