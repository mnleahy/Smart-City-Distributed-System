var readlineSync = require('readline-sync')
var readline = require('readline') // allows us to take an input as well as receive requests back
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/traffic.proto"

var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var traffic_proto = grpc.loadPackageDefinition(packageDefinition).traffic
var client = new traffic_proto.TrafficManagement("0.0.0.0:40002", grpc.credentials.createInsecure());


// Client-2: Bi-directional Chat Streaming App to report/discuss emergency incidents in the city

// When a user logs on, they are required to enter their Traffic Officer ID
var trafficOfficerID = readlineSync.question("Enter your Traffic Officer ID: ")

// initialization of the gRPC call to the server
var call = client.incidentReport();

// Make the Bidirectional streaming gRPC call with the request object 
call.on('data', function(resp) {
    // Response received from server when the function call is made
    console.log("Traffic Officer " + resp.trafficOfficerID + ": " + resp.message)
})

// When a client connection to the server ends, nothing further happens, so the function is empty
call.on('end', function() {

})

// Error handling when communication from the server fails
call.on("error", function(e) {
    console.log("An error occurred",e)
})

// Obtain user input by asking to detail the emergency and assign to the variable 'message'
var message = readlineSync.question("Enter your emergency (type 'quit' to leave the chatroom):")

// Send a message to the server that a Traffic Officer has joined the chat room
call.write({
    message: message,
    trafficOfficerID: trafficOfficerID
});

// take our input from the console and send out output to the console to allow the chat proceed
var rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout
})

 
// Instance of readline.Interface is used to read the user input from the command line
rl.on('line', function(message) {
    // if the user enters 'quit', close the client connection
    if(message.toLowerCase() == "quit") {
        call.write({
            message: "Traffic Officer "+ trafficOfficerID + " left the report room",
            trafficOfficerID: trafficOfficerID
        });
        call.end(); 
        // Close the readline
        rl.close();
    } else {
        // writing messages to the server which will then be sent to all other users
        call.write({
            message: message,
            trafficOfficerID: trafficOfficerID
        });
    }
});