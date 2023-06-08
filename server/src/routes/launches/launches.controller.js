const {
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  getAllLaunches,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(Array.from(launches));
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.destination
  ) {
    return res.status(400).json({ error: "missing property" });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({ error: "invalid date" });
  }
  await addNewLaunch(launch);
  res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = parseInt(req.params.id);
  console.log(launchId);
  const existsLaunch = await existsLaunchWithId(launchId);
  if (!existsLaunch) return res.status(404).json({ error: "launch not found" });

  const aborted = await abortLaunchById(launchId);
  if (!aborted) return res.status(400).json({ error: "Launch not aborted" });
  return res.status(200).json({ ok: true });
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
