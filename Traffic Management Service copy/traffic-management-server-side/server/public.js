var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/public_transport.proto"
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH
)

// define the package
var public_transport_proto = grpc.loadPackageDefinition(packageDefinition).transport

// For Client-3: Data and function for gRPC call, Server-side streaming of train arrival times

// Array of data to act as train arrival information
var data = [
  {
    arrTime: 5 // train arrival time (mins)
  },
  {
    arrTime: 4
  },
  {
    arrTime: 3
  },
  {
    arrTime: 2
  },
  {
    arrTime: 1
  },
  {
    arrTime: 0
  }
]

// Define function to return the train arrival data as a stream
function trainArrTime(call, callback) {
  try {
    // iterate through the array of data and write to the call stream
    for(var i = 0; i < data.length; i++){
      // send the data back to the client as a stream containing trainNum and arrTime values
      call.write({
        arrTime: data[i].arrTime,
        trainNum: trainNum
      })
    }
    // end the call function
    call.end()
  } catch (error) {
    // Handle any unexpected errors during the call.write operation
    // Logging the error for debugging purposes
    console.error("Server-side Processing Error Details: \n\n", error);

    // Return the error to the client with gRPC status code for internal server errors
    error.code = grpc.status.INTERNAL;
    callback(error);
  }
}


// For Client-4: Data and function for gRPC call, Client-side streaming of passenger numbers

// Invoke the function to use the array of data (from the client) to send back a "Success" message
function busNumbers(call, callback) {
  // initialise the "Success" message to be returned to client
  var success = "";

  // Define the function to determine when street lights should be switched on. 
  call.on('data', function(response) {
  
  // Send success message when all data has been recorded
    success = "Passenger data for 14:30 12A Bus route successfully recorded!\n\n"; 
  });

  // When the streaming operation has finished, execute this function
  call.on('end', function() {
    callback(null, { 
      success: success 
    });
  });

  // function will be invoked if/when an error occurs
  call.on('error', function(e) {
  console.log("An error occurred:", e)
  })

}

var server = new grpc.Server()
// Add a service to our server
server.addService(public_transport_proto.PublicTransport.service, { 
  trainArrTime: trainArrTime,
  busNumbers: busNumbers
})
server.bindAsync("0.0.0.0:40001", grpc.ServerCredentials.createInsecure(), function() {
  server.start()
})

// Export the functions to be required in the app.js file so that server can be opened once for all functions
module.exports = {
  trainArrTime,
  busNumbers
};
