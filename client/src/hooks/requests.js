const API_URL = "http://localhost:8000";

async function httpGetPlanets() {
  const res = await fetch(API_URL + "/planets");
  const data = await res.json();
  return data;
}

async function httpGetLaunches() {
  const res = await fetch(API_URL + "/launches");
  const data = await res.json();
  return data.sort((a, b) => a.flightNumber - b.flightNumber);
}

async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${API_URL}/launches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(launch),
    });
  } catch (e) {
    return { ok: false };
  }
}

async function httpAbortLaunch(id) {
  try {
    return await fetch(`${API_URL}/launches/${id}`, { method: "DELETE" });
  } catch (e) {
    return {
      ok: false,
    };
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
