const swagger_jsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  info: {
    // 정보 작성
    title: "offchain-server",
    version: "1.0.0",
    description: "offchain-server API Docs",
  },
  host: "localhost:3001", // base-url
  basePath: "/", // base path
};

const options = {
  swaggerDefinition: swaggerDefinition,
  apis: [__dirname + "/../routes/*.js"],
};

const swaggerSpec = swagger_jsdoc(options);

module.exports = swaggerSpec;
