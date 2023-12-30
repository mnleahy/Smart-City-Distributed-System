var readlineSync = require('readline-sync')
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/environmental.proto"

var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var environmental_proto = grpc.loadPackageDefinition(packageDefinition).environmental
var client = new environmental_proto.EnvManagement("0.0.0.0:40000", grpc.credentials.createInsecure());


// Client-6: Water Quality Particulate Matter Spot Checks Unary gRPC connection

// Get client/user input to ask which treatment plant they require data from (1-4)
var treatPlantID = readlineSync.question(
    "Which Treatment Plant do you need data from?\n"
    + "\t 1 North Water Treatment Plant\n"
    + "\t 2 South Water Treatment Plant\n"
    + "\t 3 East Water Treatment Plant\n"
    + "\t 4 West Water Treatment Plant\n"
  )
  
  // convert the input into an integer
  treatPlantID = parseInt(treatPlantID)

  // Get client/user input and assign to 'opName' variable
  var opName = readlineSync.question("What is your name?")

  // Error handling for the server response

  // if the input is a number/integer
  if(!isNaN(treatPlantID)) {
    // try/catch block to handle errors with the main function
    // First try to execute the main function to return the data to the client
    try {
      // call the server waterData method on the object 'client' with treatPlantID and opName as parameters
      client.waterData({ treatPlantID: treatPlantID, opName: opName }, function(error, response) {
        // another try/catch block inside the callback function
        try {
          // if treatPlantID input is not between 1 and 4, the 'message' parameter will be printed
          if(response.message) {
            console.log(response.message)
          } 
          // otherwise the particulate data for that treatPlantID will be printed
          else {
            console.log(response.opName + ", the particulate matter value for treatment plant no. " + response.treatPlantID + " is " + response.result + "mg/l. Result observed on " + response.timeStamp + ".")
          }
          // if any errors within the callback/server response, print this message
        } catch(e) {
          console.log("\nAN ERROR OCCURRED AS FOLLOWS: \n\n",e)
        }
      })
      // if the main function cannot be executed, the catch will print an error message
    } catch(e) {
      console.log("\nAN ERROR OCCURRED AS FOLLOWS: \n\n",e)
    }
  // if treatPlantID is not a number, print an error message
  } else {
    console.log("Error: Operation not recognised")
  }
  