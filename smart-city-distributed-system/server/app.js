// Import required modules
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/public_transport.proto"
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH
)

// Require the functions from the modules whose paths are indicated in brackets

// Traffic Management Service
var { getTrafficDensity, incidentReport } = require('./traffic');

// Environmental Management Service
var { waterData, streetLights } = require('./environmental');

// Public Transport Service
var { trainArrTime, busNumbers } = require('./public');