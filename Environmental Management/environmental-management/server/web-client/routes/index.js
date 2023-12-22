var express = require('express');
var router = express.Router();
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/../protos/environmental.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH);
var environmental_proto = grpc.loadPackageDefinition(packageDefinition).environmental;
var client = new environmental_proto.EnvManagement('0.0.0.0:40000', grpc.credentials.createInsecure());

/* GET home page. */
router.get('/', function(req, res, next) {
  var treatPlantID = req.query.treatPlantID;
  var result;
  var timeStamp;
  var opName = req.query.opName;
  var message;


  if(!isNaN(treatPlantID)) {
    try {
      client.waterData({ treatPlantID: treatPlantID, opName: opName }, function (error, response) {
        try {
          res.render('index', {
            title: 'Particulate Matter',
            error: error,
            timeStamp: response.timeStamp,
            treatPlantID: response.treatPlantID,
            result: response.result,
            opName: response.opName,
            message: response.message
          });
        } catch (error) {
          console.log(message);
          res.render('index', { 
            title: 'Particulate Matter', 
            error: "Particulate matter data is not available at the moment. Please try again later.", 
            response: null 
          });
        }
      });
  
    } catch (error) {
      res.render('index', { 
        title: 'Particulate Matter',
        error: "Calculator Service is not available at the moment please try again later", 
        result: null 
      });
    }
  } else {
    res.render('index', {
      title: 'Particulate Matter', 
      error: null, 
      result: result
    })
  }
});

module.exports = router;
