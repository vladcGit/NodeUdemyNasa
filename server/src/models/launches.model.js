const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const defaultFlightNumber = 100;
const spaceXApiUrl = "https://api.spacexdata.com/v5/launches/query";

async function populateDB() {
  console.log("Downloading from space x api...");
  const response = await axios.post(spaceXApiUrl, {
    query: {},
    options: {
      pagination: false,
      populate: [
        { path: "rocket", select: { name: 1 } },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });

    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data was already loaded");
  } else {
    await populateDB();
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function addNewLaunch(launch) {
  const planet = await planets.findOne({ kepler_name: launch.destination });
  if (!planet) {
    throw new Error("No matching planet was found");
  }

  const latestFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
    flightNumber: latestFlightNumber,
  });
  await saveLaunch(newLaunch);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber");
  if (!latestLaunch) return defaultFlightNumber;
  return latestLaunch.flightNumber;
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne(
    { flightNumber: launchId },
    { upcoming: false, success: false }
  );

  console.log(aborted);
  return aborted.matchedCount === 1 && aborted.modifiedCount === 1;
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
}

async function getAllLaunches(skip, limit) {
  return await launches
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

module.exports = {
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  getAllLaunches,
  loadLaunchesData,
};
