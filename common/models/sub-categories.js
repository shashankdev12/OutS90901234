'use strict';
var app = require('../../server/server');
var loopback =  require('loopback');
let randomstring = require("randomstring");
var path = require('path');
let serverUrl = require('../js/config');
let async = require("async");
const excel = require('node-excel-export');

module.exports = function(Subcategories) {

  Subcategories.getQuestions = function (req,res, cb)
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


  }

  Subcategories.remoteMethod(
      'getQuestions', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{arg: 'data',type: 'Object'}],
        http: {path: '/getQuestions',verb:'post'}
      });
};

/* ==================== Get User Score Data  =================   */

function userScoreInfo(info)
{
  return new Promise(function(resolve, reject)
  {
    let userScoreModel =  app.models.user_score;
    userScoreModel.findOne({where:{user_game_id:info.gameId,user_child_id:info.childId},fields:{id:true,user_game_id:true,user_child_id:true,totalRings:true}},function(err,userScoreData)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        if(userScoreData)
        {
          resolve(userScoreData);
        }
        else
        {
          reject(0);
        }
      }
    })
  });
}


/* ==================== check / insert user Ring  =================   */

function checkOrInsert(info,userScoreData)
{
  return new Promise(function(resolve, reject)
  {
    let userRingsModel =  app.models.user_rings;
    userRingsModel.findOne({where:{user_score_id:info.id,ringType:info.ringNo}},function(err,userRings)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        if(userRings)
        {
          resolve(1);
        }
        else
        {
          userRingsModel.create({user_score_id:userScoreData.id,ringType:info.ringNo,created:new Date(),modified:new Date()},function(err,userRings)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              resolve(0)
            }
          })
        }
      }
    })
  });
}


/* ==================== update Rings  =================   */

function updateTotalRings(userScoreData)
{
  return new Promise(function(resolve, reject)
  {
    userScoreData.updateAttributes({totalRings:userScoreData.totalRings+1}, function(err, userInstance)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        resolve(1)
      }
    });
  });
}
