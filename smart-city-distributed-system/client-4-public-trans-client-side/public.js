var readlineSync = require('readline-sync')
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/public_transport.proto"

var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var public_transport_proto = grpc.loadPackageDefinition(packageDefinition).transport
var client = new public_transport_proto.PublicTransport("0.0.0.0:40001", grpc.credentials.createInsecure());

// Client-4: Client-side streaming gRPC call to collect passenger numbers on the 14:30 12A Bus


// Title to print just before the response from server
console.log("RESULT OF PASSENGER NUMBER COLLECTION:\n")

/* 
Call our function on the service. Executes the listener function which is only invoked 
once our server sends back down the message that the data collection has been successful
*/

var call = client.busNumbers(function(error, response) {
    // ERROR HANDLING
    // if a response can't be retrieved from server, print error message to console
    if(error) {
        console.log("\nAN ERROR OCCURRED AS FOLLOWS: \n\n",error);
    }
    // if server invokes the function and returns a response, print the message
    if (response) {
        console.log(response.success);
    }
})

// Array of data representing the number of passengers onboard at particular stops and times
var data = [
    {
    timeStamp: "2:30", // 4pm UTC
    street: "Harcourt Street",
    numPass: 10
    },
    {
    timeStamp: "2:45", // 5pm UTC
    street: "Henry Street",
    numPass: 13
    },
    {
    timeStamp: "3:00", // 6pm UTC
    street: "Grafton Street",
    numPass: 20
    },
    {
    timeStamp: "3:15", // 7pm UTC
    street: "O'Connell Street",
    numPass: 40
    },
    {
    timeStamp: "3:30", // 8pm UTC
    street: "Stephen Street",
    numPass: 35
    },
    {
    timeStamp: "3:45", // 9pm UTC
    street: "James Street",
    numPass: 23
    }
  ];


// send the data up to the server by iterating over it with a forEach loop
data.forEach(item => {
    call.write({ 
        timeStamp: item.timeStamp,
        street: item.street,
        numPass: item.numPass
    });
});


// End the stream i.e. close the client
call.end();
