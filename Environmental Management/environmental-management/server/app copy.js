var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/environmental.proto"
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH
)

// define the package
var environmental_proto = grpc.loadPackageDefinition(packageDefinition).environmental

// #1 Street Lights Client-side rpc streaming


// call the function
function streetLights(call, callback) {
  var timeStamp = 0; 
  var sensorID = 0;
  var lightAmount = 0;
  var message = "";

  call.on('data', function(sensorData) {
       
      // Check if lightAmount equals 10
      if (sensorData.lightAmount <= 10) {
        message = "Lights have been switched on because light levels reached 10 Lux or less."; 
      }
      else {
        message = "Light intensity values for the time analysed have not required street lighting."; 
      }
  });

  call.on('end', function() {
      callback(null, { 
        message: message 
      });
  });

  // function will be invoked when an error occurs
  call.on('error', function(e) {
    console.log("An error occurred:", e)
    })
}

// #2 Water Quality Spot Checks Unary rpc connection

function waterData(call, callback) {
  try {
      let result = Math.floor(Math.random() * 10);
      let timeStamp = '21st January 2024, 1:35pm';
      let treatPlantID = parseInt(call.request.treatPlantID);
      let opName = String(call.request.opName);

      if (treatPlantID === 1) {
        console.log(treatPlantID);
          callback(null, {
              message: undefined,
              result: result,
              timeStamp: timeStamp,
              treatPlantID: treatPlantID,
              opName: opName
          })
      } 
      else if (treatPlantID === 2) {
        callback(null, {
            message: undefined,
            result: result,
            timeStamp: timeStamp,
            treatPlantID: treatPlantID,
            opName: opName
        })
      } 
      else if (treatPlantID === 3) {
        callback(null, {
          message: undefined,
          result: result,
          timeStamp: timeStamp,
          treatPlantID: treatPlantID,
          opName: opName
        })
      } 
      else if (treatPlantID === 4) {
        callback(null, {
          message: undefined,
          result: result,
          timeStamp: timeStamp,
          treatPlantID: treatPlantID,
          opName: opName
        })
      } 
      else if (treatPlantID < 0 || treatPlantID > 4 || isNaN(treatPlantID) ){
        console.log(treatPlantID);
          callback(null, {
            message: opName + ", please specify a number between 1 and 4!"
        })
    }
  } catch(e) {
      callback(null, {
          message: "An error occurred during data retrieval"
      })
    }
}


// add the service
var server = new grpc.Server()
server.addService(environmental_proto.EnvManagement.service, { 
  streetLights: streetLights,
  waterData: waterData
})
server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), function() {
  server.start()
})
