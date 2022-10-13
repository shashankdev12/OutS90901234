'use strict';

let loopback = require('loopback');
let boot = require('loopback-boot');
let cons = require('consolidate');
let path = require('path');
let bodyParser = require('body-parser');
let app = module.exports = loopback();
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
let async = require("async");
let http = require('http');
let HashMap = require('hashmap');
global.room = new HashMap();



app.use(bodyParser.urlencoded({extended: true,limit:10485760}));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use('/express-status', function(req, res, next) {
  res.json({ running: true });
});
app.set('view engine', 'ejs');

var logger = function(req, res, next)
{
  next(); // Passing the request to the next handler in the stack.
}
app.use(logger);

app.start = function() {
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    global.webURL="http://52.56.142.30:3000/";

    global.imageURL="https://outsmarted.s3.eu-west-2.amazonaws.com/";	
    global.adminUserType =1;
    global.region =1;
    global.regionName =1;
    global.packValG ='';


    

    //console.log(app.get('url'));
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};





app.use((req, res, next) => {
   //console.log(`${req.method} ${req.originalUrl}`) 
   next()
})






boot(app, __dirname, function(err) {
  if (err) throw err;
  if (require.main === module)
  {
    //app.io = require('socket.io')(app.start(), { wsEngine: 'ws',pingInterval: 100,
  //pingTimeout: 1000 });
    //app.io.sockets.setMaxListeners(0);
    //var socketInitialization  = require('../common/js/socketConnection');
    //socketInitialization.onConnection();
    app.start();
  }
});


var logger = function(req, res, next) {
//console.log("===================",app.get('url'));
  //console.log("Entry Point>>>>>>>>>>>",new Date());
 //console.log("==============",req.originalUrl);
if(req.originalUrl != "/api/")
{
  //console.log("Entry Point>>>>>>>>>>>");
  next(); // Passing the request to the next handler in the stack.
}
else
{
	res.end(' ok');
}
}
app.use(logger);

app.use(loopback.token({
  model: app.models.accessToken,
  currentUserLiteral: 'me',
  searchDefaultTokenKeys: false,
  cookies: ['access_token'],
  headers: ['access_token','Authorization'],
  params: ['access_token']
}));

// var server = require('http').createServer();
// var port = process.env.PORT || 3000;
//
// server.listen(port, function() {
//   console.log('Listening on ' + port);
// });


module.exports = function(server) {
  server.models.Dimension.find({
        where: {
            isSimple: true
        }
    }, function(err, list) {
      console.log(err);
      console.log("list=================",list);
        async.eachSeries(list, function(m, fn) {
            m.registerModel(fn);
        }, cb);
    });
};
