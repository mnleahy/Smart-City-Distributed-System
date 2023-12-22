var readlineSync = require('readline-sync')
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/public_transport.proto"

var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var public_transport_proto = grpc.loadPackageDefinition(packageDefinition).transport
var client = new public_transport_proto.PublicTransport("0.0.0.0:40001", grpc.credentials.createInsecure());

// Client-3: Server-side streaming of Real-Time Train Times

// Ask for client/user input
var trainNum = readlineSync.question("Enter Train Number for Estimated Arrival Time: ")

// initialization of the gRPC call to the server
var call = client.trainArrTime({trainNum: trainNum });

// Make the server-side streaming gRPC call with the request object and
// handle the data received from the server
call.on('data', function(response) {
    // The response prints for each item of the array
    console.log("\n REAL-TIME TRAIN ARRIVAL DATA FOR NUMBER " + response.trainNum + ":" )
    console.log("Scheduled to arrive in " + response.arrTime + " minutes\n")
});

// Handling end of the data stream
call.on('end', function(){
    // Event indicates that the server has finished sending messages
    // Performing cleanup with a final message  
    console.log("Your train has arrived!\n")
});

// Error handling when communication from the server fails
call.on('error', function(e){
    // prints a message to the console with details of the error
    console.log("AN ERROR OCCURRED. Details available below: \n\n",e);
    return;
})