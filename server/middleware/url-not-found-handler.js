'use strict';
var dsConfig = require('../datasources.json');
var path = require('path');
var another = require('../controllers/admin.js');
var app = require('../../server/server');
module.exports = function () {
    console.log(app.get('url'))
    return function customRaiseUrlNotFoundError(req, res, next) {
        res.sendFile('index.html', { root: __dirname }, function (err) {
            if (err) {
                console.error(err);
                res.status(err.status).end();
            }
        });
    };

    // app.get('/admin', function(req, res)
    // {
    //   try
    //   {
    //     res.render('./admin');
    //   }
    //   catch(e)
    //   {
    //     console.log(e);
    //   }
    // });
};
