import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "TapAndTravel API",
    description: "API documentation for the TapAndTravel application",
  },
  host: "localhost:8080",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./server.js"];

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  import("./server.js");
});
