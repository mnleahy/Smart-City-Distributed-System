var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/traffic.proto"
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH
)
var traffic_proto = grpc.loadPackageDefinition(packageDefinition).traffic


// For Client-1: Server-side streaming of traffic density at particular areas

// Array of data to pass as the traffic density data at verious areas of the city
var data = [
  {
    area: 1,
    noVehicles: 50,
    congestion: "HIGH"
  },
  {
    area: 2,
    noVehicles: 5,
    congestion: "LOW"
  },
  {
    area: 3,
    noVehicles: 13,
    congestion: "LOW"
  },
  {
    area: 4,
    noVehicles: 45,
    congestion: "HIGH"
  },
  {
    area: 5,
    noVehicles: 4,
    congestion: "LOW"
  },
  {
    area: 6,
    noVehicles: 49,
    congestion: "HIGH"
  },
  {
    area: 7,
    noVehicles: 4,
    congestion: "LOW"
  }
]


// Define function to obtain Traffic Density Data and return to the client

function getTrafficDensity(call, callback) {

  try {
    // Iterate over the data array and write to the call stream
    for(var i = 0; i < data.length; i++){
      call.write({
          area: data[i].area,
          noVehicles: data[i].noVehicles,
          congestion: data[i].congestion
      });

    }
    // end the call function
    call.end();

  } catch (error) {
    // Handle any unexpected errors during the call.write operation
    // Logging the error for debugging purposes
    console.error("Server-side Processing Error Details: \n\n", error);

    // Return the error to the client with gRPC status code for internal server errors
    error.code = grpc.status.INTERNAL;
    callback(error);
  }
}


// Client-2: Bi-directional Chat Streaming App to report/discuss emergency incidents in the city

// Declare 'clients' object and initialise as an empty object with no properties
// This will be populated with properties once the chat begins
var clients = {

}

// Invoke the function to start the chat
// Call will tell us what request came in and allow us to respond to the request
function incidentReport(call){
  // function takes in chat information and comments
  call.on('data', function(report) {
    // if the user is not in our clients, then add them to the clients
    if(!(report.trafficOfficerID in clients)) {
      clients[report.trafficOfficerID] = { 
        trafficOfficerID: report.trafficOfficerID,
        call: call
      }
    }

    // 'for' loop to report the chat information to multiple clients i.e. clients[client]
    for(var client in clients) {
      clients[client].call.write(
        {
          trafficOfficerID: report.trafficOfficerID, // key: value pair
          message: report.message // key: value pair
        }
      )
    }

  })

  // end the communication i.e. when a client types 'quit'
  call.on('end', function() {
    call.end()
  })

  // Error handling if there is an issue with the connection
  call.on("error", function(e) {
    console.log("An error occurred:", e)
  })

}

var server = new grpc.Server()
// Add a service to our server
server.addService(traffic_proto.TrafficManagement.service, {
  getTrafficDensity: getTrafficDensity,
  incidentReport: incidentReport
})
server.bindAsync("0.0.0.0:40002", grpc.ServerCredentials.createInsecure(), function() {
  server.start()
})

// Export the functions to be required in the app.js file so that server can be opened once for all functions
module.exports = {
  getTrafficDensity,
  incidentReport
};