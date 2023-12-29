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

// If the treatPlantID is a number
  if(!isNaN(treatPlantID)) {
    // try/catch block to handle errors with the main function
    // First try to execute the main function to return the data to the client
    try {
       // call the server waterData method on the object 'client' with treatPlantID and opName as parameters
      client.waterData({ treatPlantID: treatPlantID, opName: opName }, function (error, response) {
        // another try/catch block inside the callback function
        try {
          // render the resulting data parameters on the web GUI
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
          // catch any error in rendering the data in the web GUI
          console.log(message);
          res.render('index', { 
            title: 'Particulate Matter', 
            error: "Particulate matter data is not available at the moment. Please try again later.", 
            response: null 
          });
        }
      });
  
    } catch (error) {
      // if the server waterData method cannot be executed, the catch will print an error message
      res.render('index', { 
        title: 'Particulate Matter',
        error: 'Particulate matter data is not available at the moment please try again later', 
        result: null 
      });
    }
  } else {
    // if treatPlantID is not a number
    res.render('index', {
      title: 'Particulate Matter', 
      error: null, 
      result: result
    })
  }
});

module.exports = router;
