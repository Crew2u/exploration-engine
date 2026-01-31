// ===============================
// PROSPECTING SCANNER ENGINE
// ===============================

const locationsDiv = document.getElementById("locations");
const detectorDiv = document.getElementById("detector");
const statusEl = document.getElementById("status");
const distanceEl = document.getElementById("distance");
const hotFill = document.getElementById("hotFill");
const arrow = document.getElementById("arrow");
const backBtn = document.getElementById("backBtn");
const scanRockBtn = document.getElementById("scanRockBtn");

let selectedZone = null;
let currentPosition = null;
let gpsWatchId = null;

// ===============================
// BUILD LOCATION BUTTONS
// ===============================
PROSPECTING_LOCATIONS.forEach(zone => {
  const btn = document.createElement("button");
  btn.innerText = zone.name;
  btn.onclick = () => selectZone(zone);
  locationsDiv.appendChild(btn);
});

// ===============================
// SELECT ZONE (USER TAP REQUIRED)
// ===============================
function selectZone(zone) {
  selectedZone = zone;
  locationsDiv.style.display = "none";
  detectorDiv.style.display = "block";
  statusEl.innerText = "GPS initializing...";
  startGPS();
}

// ===============================
// START GPS (AFTER USER ACTION)
// ===============================
function startGPS() {
  if (gpsWatchId !== null) return;

  gpsWatchId = navigator.geolocation.watchPosition(
    positionUpdate,
    gpsError,
    { enableHighAccuracy: true }
  );
}

// ===============================
// GPS UPDATE
// ===============================
function positionUpdate(pos) {
  currentPosition = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude
  };

  const distance = getDistance(
    currentPosition.lat,
    currentPosition.lng,
    selectedZone.lat,
    selectedZone.lng
  );

  distanceEl.innerText = "Distance: " + Math.round(distance) + " m";
  updateDetector(distance);
}

// ===============================
// HOT / COLD DETECTOR
// ===============================
function updateDetector(distance) {
  const heat = Math.max(0, 100 - distance);
  hotFill.style.width = Math.min(100, heat) + "%";

  if (distance < 10) {
    statusEl.innerText = "HIGH MINERAL SIGNAL — SEARCH AREA";
  } else if (distance < 50) {
    statusEl.innerText = "Signal increasing...";
  } else {
    statusEl.innerText = "Scanning...";
  }
}

// ===============================
// DISTANCE CALC
// ===============================
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ===============================
// COMPASS DIRECTION
// ===============================
window.addEventListener("deviceorientation", e => {
  if (!currentPosition || e.alpha === null) return;

  const heading = e.alpha;
  const bearing = calculateBearing(
    currentPosition.lat,
    currentPosition.lng,
    selectedZone.lat,
    selectedZone.lng
  );

  arrow.style.transform = `rotate(${bearing - heading}deg)`;
});

function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x =
    Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.cos((lon2 - lon1) * Math.PI / 180);

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// ===============================
// GPS ERROR HANDLING
// ===============================
function gpsError(err) {
  if (err.code === 1) {
    statusEl.innerText =
      "Location access denied. Enable GPS permissions and reload.";
  } else {
    statusEl.innerText = "GPS error: " + err.message;
  }
}

// ===============================
// SCAN ROCK BUTTON
// ===============================
scanRockBtn.onclick = () => {
  // Replace this with your existing QR scan page
  window.location.href = "https://challengeaccepted.quest/scan-rock";
};

// ===============================
// BACK BUTTON
// ===============================
backBtn.onclick = () => {
  detectorDiv.style.display = "none";
  locationsDiv.style.display = "block";
};
