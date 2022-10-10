var server = require('../server');
var app = server.dataSources.db;
let question  =  app.models.countries;
  question.findOne({where:{autoMigrate:1}},function(err,ttt){
    console.log(ttt);
    if(ttt)
    { 
        
        question.updateAll({id:ttt.id},{autoMigrate:0},function(err,tup)
        {
            let TableName  ="questions_"+ttt.code;
            var lbTables = [TableName];
            //var lbTables1 = ['User', 'AccessToken', 'ACL', 'RoleMapping','subjectQuestion'];
            app.automigrate(lbTables, function(er)
            {
                if (er) throw er;
                console.log('Loopback tables [' + lbTables + '] created in ');
            });
        })
    }
})

