const mongoose = require("mongoose");
require("dotenv").config();

const { USERNAME, PASSWORD } = process.env;

const mongo_url = `mongodb+srv://${USERNAME}:${PASSWORD}@udemynasa.kfndr9r.mongodb.net/`;

mongoose.connection.once("open", () => {
  console.log("Connection ready");
});

mongoose.connection.on("error", (err) => console.error(err));

async function mongoConnect() {
  await mongoose.connect(mongo_url);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = { mongoConnect, mongoDisconnect };
