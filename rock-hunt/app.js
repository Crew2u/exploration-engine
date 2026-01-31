const locationsDiv = document.getElementById("locations");
const detectorDiv = document.getElementById("detector");
const backBtn = document.getElementById("backBtn");
const statusEl = document.getElementById("status");
const distanceEl = document.getElementById("distance");
const hotFill = document.getElementById("hotFill");
const arrow = document.getElementById("arrow");

let currentLocation = null;
let selectedZone = null;

// --- SHOW PROSPECTING LOCATIONS ---
PROSPECTING_LOCATIONS.forEach(loc => {
  const btn = document.createElement("button");
  btn.innerText = loc.name;
  btn.onclick = () => selectZone(loc);
  locationsDiv.appendChild(btn);
});

// --- SELECT ZONE ---
function selectZone(zone) {
  selectedZone = zone;
  locationsDiv.style.display = "none";
  detectorDiv.style.display = "block";
  backBtn.style.display = "block";
  statusEl.innerText = "Getting GPS...";
  navigator.geolocation.watchPosition(positionUpdate, gpsError, { enableHighAccuracy:true });
}

// --- BACK BUTTON ---
backBtn.onclick = () => {
  detectorDiv.style.display = "none";
  locationsDiv.style.display = "block";
}

// --- GPS UPDATE ---
function positionUpdate(pos) {
  currentLocation = {lat:pos.coords.latitude, lng:pos.coords.longitude};
  const dist = getDistance(currentLocation, selectedZone);
  distanceEl.innerText = "Distance: " + Math.round(dist) + " m";
  updateHotCold(dist);
}

// --- GPS ERROR ---
function gpsError(err) {
  statusEl.innerText = "GPS error: " + err.message;
}

// --- DISTANCE CALC ---
function getDistance(from, to) {
  const R = 6371000;
  const dLat = (to.lat - from.lat) * Math.PI/180;
  const dLon = (to.lng - from.lng) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(from.lat*Math.PI/180)*Math.cos(to.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// --- HOT/COLD DETECTOR ---
function updateHotCold(distance){
  let heat = Math.max(0, 100 - distance/2);
  hotFill.style.width = Math.min(100, heat) + "%";
  if(distance < 10) statusEl.innerText = "High mineral concentration detected! Press Scan Rock.";
}

// --- COMPASS ---
window.addEventListener("deviceorientation", e=>{
  if(!currentLocation || e.alpha === null) return;
  const heading = e.alpha;
  const bearing = calculateBearing(currentLocation, selectedZone);
  const rotation = bearing - heading;
  arrow.style.transform = `rotate(${rotation}deg)`;
});

function calculateBearing(from,to){
  const y = Math.sin((to.lng - from.lng)*Math.PI/180)*Math.cos(to.lat*Math.PI/180);
  const x = Math.cos(from.lat*Math.PI/180)*Math.sin(to.lat*Math.PI/180) - Math.sin(from.lat*Math.PI/180)*Math.cos(to.lat*Math.PI/180)*Math.cos((to.lng - from.lng)*Math.PI/180);
  return (Math.atan2(y,x)*180/Math.PI+360)%360;
}

// --- SCAN ROCK ---
document.getElementById("scanRockBtn").onclick = () => {
  // Open QR scanner page (reuse your existing scan system)
  window.open("https://challengeaccepted.quest/scan-rock", "_blank");
}
