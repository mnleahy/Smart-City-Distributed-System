// var readlineSync = require('readline-sync')
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/environmental.proto"

var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var environmental_proto = grpc.loadPackageDefinition(packageDefinition).environmental
var client = new environmental_proto.EnvManagement("0.0.0.0:40000", grpc.credentials.createInsecure());

// CLIENT-5: Client-side gRPC streaming of natural light data and switching on street lights

// call our function on the service. Executes the listener function once the server sends back 
// down the message that the lights have been switched on 
var call = client.streetLights(function(error, response) {

    // if a response can't be retrieved from server, print error message to console
    if(error) {
        console.log("\nAN ERROR OCCURRED AS FOLLOWS: \n\n",error);
    }
    // if server invokes the function and returns a response, print the message
    if (response) {
        console.log(response.message);
    }
})

// Hard-coded array of light sensor data
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

  // send the data up to the server by iterating over it with a forEach loop
  data.forEach(item => {
    call.write({ 
        // send these parameters
        timeStamp: item.timeStamp,
        sensorID: item.sensorID,
        lightAmount: item.lightAmount
    });
});

// Title to print just before the response from server
console.log("RESULT OF LIGHT MEASUREMENTS:\n")

// End the stream i.e. close the client
call.end();