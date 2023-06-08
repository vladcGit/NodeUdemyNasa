const http = require("http");
const app = require("./app");
require("dotenv").config();

const { mongoConnect } = require("./services/mongo");
const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, async () => {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();
  console.log(`Listening on port ${PORT}`);
});
