var server = require('../server');
var ds = server.dataSources.db;
// var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
// //var lbTables1 = ['User', 'AccessToken', 'ACL', 'RoleMapping','subjectQuestion'];
// ds.automigrate(lbTables, function(er)
// {
//   if (er) throw er;
//   console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);
// });
