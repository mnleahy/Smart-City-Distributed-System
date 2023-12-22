var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/environmental.proto"
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH
)

// define the package
var environmental_proto = grpc.loadPackageDefinition(packageDefinition).environmental


// For Client-5: Client-side gRPC streaming of natural light data and switching on street lights

// Invoke the function to use the array of data (from the client) to determine when to switch on street lights
function streetLights(call, callback) {
  var message = ""; // initialise the message to be returned to client
  // Define the function to determine when street lights should be switched on. 
  call.on('data', function(sensorData) {
  // Check if lightAmount equals 10
    if (sensorData.lightAmount <= 10) {
      message = "Lights have been switched on because light levels reached 10 Lux or less.\n"; 
    }
    else {
      message = "Light intensity values for the time analysed have not required street lighting.\n"; 
    }
  });

  // End the stream i.e. close the client
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

// For Client-6: Water Quality Particulate Matter Spot Checks Unary gRPC connection

// Define the function to determine the data to be sent back to the client
// using appropriate Error Handling

function waterData(call, callback) {
  // Use a try/catch block to catch any errors in data retrieval
  try {
    // try to execute the function dependending on values for treatPlantID
      // data values are generated using the Math.random() function
      let result = Math.floor(Math.random() * 10);
      // timestamp is hand coded for now
      let timeStamp = '21st January 2024, 1:35pm';
      let treatPlantID = parseInt(call.request.treatPlantID);
      let opName = String(call.request.opName);

      // Conditional Statement to deal with the value entered in the client UI for 'treatPlantID'

      // if the value entered is between 1 and 4 (inclusive), send back the vales for the listed parameters
      if (treatPlantID > 0 && treatPlantID < 5) {
          callback(null, {
              message: undefined,
              result: result,
              timeStamp: timeStamp,
              treatPlantID: treatPlantID,
              opName: opName
          })
      } 
    
      // else if the value entered for treatPlantID is less than 1, greater than 4 or not a number
      // send back the message indicated
      else if (treatPlantID < 1 || treatPlantID > 4 || isNaN(treatPlantID) ){
          callback(null, {
            message: opName + ", please specify a number between 1 and 4!"
        })
    }
    // catch block if error occurs during data retrieval
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

// Export the functions (to app.js) so that the server can be run once for all functions/services
module.exports = {
  waterData,
  streetLights
}