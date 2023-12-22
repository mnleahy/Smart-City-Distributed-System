var readlineSync = require('readline-sync')
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/environmental.proto"

var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var environmental_proto = grpc.loadPackageDefinition(packageDefinition).environmental
var client = new environmental_proto.EnvManagement("0.0.0.0:40000", grpc.credentials.createInsecure());

// #1 Street Lights Client-side rpc streaming

var data = [
    {
    timeStamp: 4, // 4pm UTC
    sensorID: 10,
    lightAmount: 1100
    },
    {
    timeStamp: 5, // 5pm UTC
    sensorID: 10,
    lightAmount: 754
    },
    {
    timeStamp: 6, // 6pm UTC
    sensorID: 10,
    lightAmount: 650
    },
    {
    timeStamp: 7, // 7pm UTC
    sensorID: 10,
    lightAmount: 200
    },
    {
    timeStamp: 8, // 8pm UTC
    sensorID: 10,
    lightAmount: 80
    },
    {
    timeStamp: 9, // 9pm UTC
    sensorID: 10,
    lightAmount: 10
    }
  ];

// call our function on the service. Executes listener function only invoked 
// once our server sends back down the message that the lights have been switched on 
var call = client.streetLights(function(error, response) {

    if(error) {
        console.log("An error occurred");
        return;
    }
    if (response) {
        console.log(response.message);
    }
})


  // send the data up to the server by iterating over it with a forEach loop
  data.forEach(item => {
    call.write({ 
        timeStamp: item.timeStamp,
        sensorID: item.sensorID,
        lightAmount: item.lightAmount
    });
});

// End the stream
call.end();


// #2 Water Quality Spot Checks Unary rpc connection

var treatPlantID = readlineSync.question(
    "Which Treatment Plant do you need data from?\n"
    + "\t 1 North Water Treatment Plant\n"
    + "\t 2 South Water Treatment Plant\n"
    + "\t 3 East Water Treatment Plant\n"
    + "\t 4 West Water Treatment Plant\n"
  )
  
  treatPlantID = parseInt(treatPlantID)

  var opName = readlineSync.question("What is your name?")

  if(!isNaN(treatPlantID)) {
    try {
      client.waterData({ treatPlantID: treatPlantID, opName: opName }, function(error, response) {
        try {
          if(response.message) {
            console.log(response.message)
          } 
          else {
            console.log(response.opName + ", the particulate matter value for the plant of interest, no. " + response.treatPlantID + " is " + response.result + "mg/l. Result observed on " + response.timeStamp + ".")
          }
        } catch(e) {
          console.log("Could not connect to server")
        }
      })
    } catch(e) {
      console.log("An error occurred")
    }
  } else {
    console.log("Error: Operation not recognised")
  }
  