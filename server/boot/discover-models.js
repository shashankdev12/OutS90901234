'use strict';

const { resolve } = require('dns');

module.exports = function(app, callback) {
  // Obtain the datasource registered with the name "db"
  const dataSource = app.dataSources.db;

  // Step 1: define a model for "INVENTORY" table,
  // including any models for related tables (e.g. "PRODUCT").
  let question  =  app.models.countries;
  question.findOne({where:{status:0}},function(err,ttt){
    console.log(ttt);
    if(ttt)
    { 
        question.updateAll({id:ttt.id},{status:1,autoMigrate:1},function(err,tup)
        {
            console.log("-----",ttt.code)
            //callback();
            let TableName  ="questions_"+ttt.code;
            console.log("TableName",TableName)
            //console.log("TableName")
            dataSource.discoverAndBuildModels(
            TableName,
            {relations: true},
            function(err, models) 
            {
            
                console.log("000",err);
                if (err){ return callback(err)}

                // Step 2: expose all new models via REST API
                for (const modelName in models) {
                    app.model(models[modelName], {dataSource: dataSource});
                }
           
                callback();
           
            });

        const loopback = require('loopback');
        const promisify = require('util').promisify;
        const fs = require('fs');
        const writeFile = promisify(fs.writeFile);
        const readFile = promisify(fs.readFile);
        const mkdirp = promisify(require('mkdirp'));
        
        //const app = require('../server');
        const dbDataSource = app.datasources.db;
        const DATASOURCE_NAME = 'db';
        //const dataSourceConfig = require('../server/datasources.json');
        const db = new loopback.DataSource(dbDataSource[DATASOURCE_NAME]);
        discover(TableName).then(
        success => {
            console.log("-----",err)
            callback();
        },
        error => { console.error('UNHANDLED ERROR:\n', error); process.exit(1); },
        );
    })
    }
    else{
        //callback()
        
            console.log("-----",err)
            callback();
        
    }
})      

const promisify = require('util').promisify;
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdirp = promisify(require('mkdirp'));


    async function discover(TableName) {
      // It's important to pass the same "options" object to all calls
      // of dataSource.discoverSchemas(), it allows the method to cache
      // discovered related models
      const options = {relations: true};
      let data = {
        "name": TableName,
        "plural": TableName,
        "base": "PersistedModel",
        "idInjection": true,
        "options": {
          "validateUpsert": true
        },
        "properties": {
          "category_id": {
            "type": "number",
            "required": true,
            "index": true
          },
          "sub_category_id": {
            "type": "number",
            "required": true,
            "index": true
          },
          "age_id": {
            "type": "string",
            "required": true
          },
          "time_Allowed": {
            "type": "number",
            "index": true
          },
          "region": {
            "type": "string"
          },
          "question": {
            "type": "string"
          },
          "answer1": {
            "type": "string"
          },
          "answer2": {
            "type": "string"
          },
          "answer3": {
            "type": "string"
          },
          "answer4": {
            "type": "string"
          },
          "hint": {
            "type": "string"
          },
          "correct_Answer": {
            "type": "string"
          },
          "image_URL": {
            "type": "string"
          },
          "video_URL": {
            "type": "string"
          },
          "sound_URL": {
            "type": "string"
          },
          "fileType": {
            "type": "number"
          },
          "requires_Sound": {
            "type": "string"
          },
          "language": {
            "type": "string"
          },
          "pack_ID": {
            "type": "string"
          },
          "proofRead": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "questionMasterId": {
            "type": "number"
          },
          "status": {
            "type": "number",
            "index": true,
            "default": 0
          },
          "created": {
            "type": "date"
          },
          "modified": {
            "type": "date"
          },
          "creditBy": {
            "type": "string"
          },
          "questionActiveStatus": {
            "type": "number",
            "default": 0
          },
          "questionState": {
            "type": "number",
            "default": 1
          },
          "priority": {
            "type": "number",
            "default": 1
          },
          "SupportVideoURL": {
            "type": "string"
          },
          "AnswerOrder": {
            "type": "string"
          },
          "countryCreated": {
            "type": "number"
          }
        },
        "validations": [],
        "relations": {
          "categories": {
            "type": "belongsTo",
            "model": "categories",
            "foreignKey": "category_id"
          },
          "sub_categories": {
            "type": "belongsTo",
            "model": "sub_categories",
            "foreignKey": "sub_category_id"
          },
          "question_packages": {
            "type": "belongsTo",
            "model": "question_packages",
            "foreignKey": "pack_ID"
          }
        },
        "acls": [],
        "methods": {}
      }
    
      let data2 = JSON.stringify(data);
      //let data3 =new Buffer(+
      // Discover models and relations
      //const inventorySchemas = await db.discoverSchemas('questions_IND', options);
      //const productSchemas = await db.discoverSchemas('PRODUCT', options);
      // Create model definition files
      await mkdirp('common/models');
      await writeFile(
        'common/models/'+TableName+'.json',
        `{
            "name":"`+TableName+`",
            "plural": "`+TableName+`",
            "base": "PersistedModel",
            "idInjection": true,
            "options": {
              "validateUpsert": true
            },
            "properties": {
              "category_id": {
                "type": "number",
                "required": true,
                "index": true
              },
              "sub_category_id": {
                "type": "number",
                "required": true,
                "index": true
              },
              "age_id": {
                "type": "string",
                "required": true
              },
              "time_Allowed": {
                "type": "number",
                "index": true
              },
              "region": {
                "type": "string"
              },
              "question": {
                "type": "string"
              },
              "answer1": {
                "type": "string"
              },
              "answer2": {
                "type": "string"
              },
              "answer3": {
                "type": "string"
              },
              "answer4": {
                "type": "string"
              },
              "hint": {
                "type": "string"
              },
              "correct_Answer": {
                "type": "string"
              },
              "image_URL": {
                "type": "string"
              },
              "video_URL": {
                "type": "string"
              },
              "sound_URL": {
                "type": "string"
              },
              "fileType": {
                "type": "number"
              },
              "requires_Sound": {
                "type": "string"
              },
              "language": {
                "type": "string"
              },
              "pack_ID": {
                "type": "string"
              },
              "proofRead": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "questionMasterId": {
                "type": "number"
              },
              "status": {
                "type": "number",
                "index": true,
                "default": 0
              },
              "created": {
                "type": "date"
              },
              "modified": {
                "type": "date"
              },
              "creditBy": {
                "type": "string"
              },
              "questionActiveStatus": {
                "type": "number",
                "default": 0
              },
              "questionState": {
                "type": "number",
                "default": 1
              },
              "priority": {
                "type": "number",
                "default": 1
              },
              "SupportVideoURL": {
                "type": "string"
              },
              "AnswerOrder": {
                "type": "string"
              },
              "countryCreated": {
                "type": "number"
              }
            },
            "validations": [],
            "relations": {
              "categories": {
                "type": "belongsTo",
                "model": "categories",
                "foreignKey": "category_id"
              },
              "sub_categories": {
                "type": "belongsTo",
                "model": "sub_categories",
                "foreignKey": "sub_category_id"
              },
              "question_packages": {
                "type": "belongsTo",
                "model": "question_packages",
                "foreignKey": "pack_ID"
              }
            },
            "acls": [],
            "methods": {}
          }
          `
      )
      
      // await writeFile(
      //   'common/models/product.json',
      //   JSON.stringify(salariesSchemas['XE.PRODUCT'], null, 2)
      // );
    
      // Expose models via REST API
      const configJson = await readFile('server/model-config.json', 'utf-8');
      //console.log('MODEL CONFIG', configJson);
      const config = JSON.parse(configJson);
      config[TableName] = {dataSource: "db", public: true};
      //config.Product = {dataSource: DATASOURCE_NAME, public: true};

      await writeFile(
        'server/model-config.json',
        JSON.stringify(config, null, 2)
      );


    //   makeNew(TableName,config).then(
    //     success => {
    //         var lbTables1 = [TableName];
    //         const dbDataSource = app.datasources.db;
    //         dbDataSource.automigrate(lbTables1, function(er)
    //         {
    //           if (er) throw er;
    //           console.log('Loopback tables [' + lbTables1 + '] created in ', ds.adapter.name);
    //         });
    //     },
    //     error => { console.error('UNHANDLED ERROR:\n', error); process.exit(1); },
    //     );

        
    
      //resolve(1)
    }

    async function makeNew(TableName,config)
    {
        await writeFile(
            'server/model-config.json',
            JSON.stringify(config, null, 2)
          );
    }
    
}