var readlineSync = require('readline-sync')
// var readline = require('readline') // allows us to take an input as well as receive requests back
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/traffic.proto"

var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var traffic_proto = grpc.loadPackageDefinition(packageDefinition).traffic
var client = new traffic_proto.TrafficManagement("0.0.0.0:40002", grpc.credentials.createInsecure());


// For Client-1: Server-side gRPC streaming of traffic data

// Ask for client/user input
var opName = readlineSync.question("What is your name?")

// initialization of the gRPC call to the server
var call = client.getTrafficDensity({ });
 
// Title to print just before the response from server
console.log("\n REAL-TIME TRAFFIC CONGESTION DATA FOR " + opName + ":\n" )

// Error handling when communication from the server fails
call.on('error', function(e){
    // prints a message to the console with details of the error
    console.log("\n" + opName + ", an error occurred. Details available below: \n\n",e);
    return;
})

// Make the Server-side streaming gRPC call with the request object & handle the data 
// received from the server
call.on('data', function(response) {
    // The response here is a message object
    console.log("Traffic Data for Area " + + response.area + ": ");
    console.log("Currently " + response.noVehicles + " vehicles with congestion level " +  response.congestion + ".\n")
});

// Handling end of the data stream
call.on('end', function(){
// Event indicates that the server has finished sending messages
// Performing cleanup with a final message
console.log(opName + ", the traffic density information stream has ended.\n");
});
