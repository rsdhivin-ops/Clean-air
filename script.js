
const $ = (id) => document.getElementById(id);

const places = [
  { name: "Chennai", area: "City centre", aqi: 42, pm25: 12, pm10: 24, temp: 29, humidity: 60 },
  { name: "Coimbatore", area: "Residential sample", aqi: 28, pm25: 8, pm10: 18, temp: 27, humidity: 65 },
  { name: "Tiruchirappalli", area: "Urban sample", aqi: 76, pm25: 24, pm10: 42, temp: 31, humidity: 55 },
  { name: "Madurai", area: "Traffic sample", aqi: 112, pm25: 41, pm10: 65, temp: 32, humidity: 48 },
  { name: "Bengaluru", area: "Residential sample", aqi: 58, pm25: 17, pm10: 30, temp: 26, humidity: 58 },
  { name: "Delhi", area: "Urban sample", aqi: 168, pm25: 72, pm10: 105, temp: 30, humidity: 42 }
];

let user = { name: "Explorer", email: "" };
let authMode = "login";
let selected = places[0];
let notificationsEnabled = false;
let reducedMotion = false;

function showScreen(screen) {
  $("welcome").hidden = screen !== "welcome";
  $("login").hidden = screen !== "login";
  $("application").hidden = true;
  window.scrollTo(0, 0);
}

function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === "signup";

  $("nameField").hidden = !signup;
  $("fullName").required = signup;
  $("loginTab").classList.toggle("active", !signup);
  $("signupTab").classList.toggle("active", signup);
  $("authSubmit").textContent = signup ? "Create my account ↗" : "Log in ↗";
  $("password").autocomplete = signup ? "new-password" : "current-password";
  $("authError").textContent = "";
}

function togglePassword() {
  const input = $("password");
  const visible = input.type === "password";
  input.type = visible ? "text" : "password";
  document.querySelector(".eye").textContent = visible ? "Hide" : "Show";
}

// Front-end demo only. It does not create or verify real accounts.
$("authForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = $("email").value.trim();
  const password = $("password").value;
  const name = $("fullName").value.trim();

  if (password.length < 4) {
    $("authError").textContent = "Enter at least four characters for this demo.";
    return;
  }

  if (authMode === "signup" && !name) {
    $("authError").textContent = "Please enter your name.";
    return;
  }

  user = {
    name: authMode === "signup"
      ? name
      : (email.split("@")[0] || "Explorer"),
    email
  };

  $("helloName").textContent = user.name;
  $("profileName").textContent = user.name;
  $("profileEmail").textContent = user.email;

  $("application").hidden = false;
  $("welcome").hidden = true;
  $("login").hidden = true;

  renderHomePlaces();
  renderExplore();
  selectPlace(places[0]);
  renderTrend();
  showPage("home");
  window.scrollTo(0, 0);
});

function logout() {
  user = { name: "Explorer", email: "" };
  $("authForm").reset();
  setAuthMode("login");
  showScreen("welcome");
}

function showPage(page) {
  document.querySelectorAll(".page").forEach((element) => {
    element.hidden = element.id !== `page-${page}`;
  });

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  window.scrollTo({
    top: 0,
    behavior: reducedMotion ? "instant" : "smooth"
  });
}

function getStatus(aqi) {
  if (aqi <= 50) return { name: "Good", css: "good" };
  if (aqi <= 100) return { name: "Moderate", css: "moderate" };
  return { name: "Poor", css: "poor" };
}

function makePlaceCard(place) {
  const status = getStatus(place.aqi);

  const card = document.createElement("article");
  card.className = "place-card";

  const top = document.createElement("div");
  top.className = "place-top";

  const symbol = document.createElement("span");
  symbol.className = "place-symbol";
  symbol.textContent = "⌖";

  const badge = document.createElement("span");
  badge.className = `status ${status.css}`;
  badge.textContent = status.name;
  top.append(symbol, badge);

  const title = document.createElement("h3");
  title.textContent = place.name;

  const area = document.createElement("p");
  area.className = "muted";
  area.textContent = place.area;

  const aqi = document.createElement("div");
  aqi.className = "place-aqi";
  aqi.textContent = place.aqi;

  const unit = document.createElement("small");
  unit.textContent = " AQI · demo";
  aqi.appendChild(unit);

  const track = document.createElement("div");
  track.className = "meter";

  const fill = document.createElement("span");
  fill.className =
    status.css === "good" ? "good-fill" :
    status.css === "moderate" ? "moderate-fill" : "poor-fill";
  fill.style.width = `${Math.min(place.aqi / 200 * 100, 100)}%`;
  track.appendChild(fill);

  const details = document.createElement("p");
  details.className = "muted small";
  details.textContent = place.aqi > 100
    ? "Higher sample AQI"
    : place.aqi > 50
      ? "Moderate sample AQI"
      : "Lower sample AQI";

  const button = document.createElement("button");
  button.className = "btn secondary";
  button.textContent = "Explore this place";
  button.addEventListener("click", () => {
    selectPlace(place);
    showPage("home");
  });

  card.append(top, title, area, aqi, track, details, button);
  return card;
}

function renderHomePlaces() {
  const grid = $("homePlaces");
  grid.replaceChildren();

  [...places]
    .sort((a, b) => a.aqi - b.aqi)
    .slice(0, 3)
    .forEach((place) => grid.appendChild(makePlaceCard(place)));
}

function renderExplore() {
  const query = $("search").value.trim().toLowerCase();
  const sort = $("sort").value;
  const filter = $("qualityFilter").value;

  let results = places.filter((place) => {
    const matchesName =
      `${place.name} ${place.area}`.toLowerCase().includes(query);

    const matchesLevel =
      filter === "all" || getStatus(place.aqi).css === filter;

    return matchesName && matchesLevel;
  });

  if (sort === "highest") {
    results.sort((a, b) => b.aqi - a.aqi);
  } else if (sort === "lowest") {
    results.sort((a, b) => a.aqi - b.aqi);
  } else {
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  const grid = $("explorePlaces");
  grid.replaceChildren();
  results.forEach((place) => grid.appendChild(makePlaceCard(place)));

  $("resultCount").textContent = `${results.length} sample locations`;
  $("emptyState").hidden = results.length !== 0;
}

function selectPlace(place) {
  selected = place;
  const status = getStatus(place.aqi);

  $("homeAQI").textContent = place.aqi;
  $("ringAQI").textContent = place.aqi;
  $("homeLocation").textContent = `${place.name} · Sample location`;
  $("homeStatus").textContent = status.name;
  $("homeStatus").className = `status ${status.css}`;

  $("homeMessage").textContent =
    place.aqi <= 50 ? "Lower sample AQI in this comparison." :
    place.aqi <= 100 ? "Moderate sample AQI in this comparison." :
    "Higher sample AQI. Check current official readings.";

  const degrees = Math.min(place.aqi / 200 * 360, 360);
  const color =
    status.css === "good" ? "#91f2b9" :
    status.css === "moderate" ? "#ffcf68" : "#ff8598";

  $("homeRing").style.background =
    `conic-gradient(${color} ${degrees}deg, #31515a ${degrees}deg 360deg)`;

  $("pm25").innerHTML = `${place.pm25} <small>µg/m³</small>`;
  $("pm10").innerHTML = `${place.pm10} <small>µg/m³</small>`;
  $("temp").innerHTML = `${place.temp} <small>°C</small>`;
  $("humidity").innerHTML = `${place.humidity} <small>%</small>`;

  $("insightTitle").textContent = place.name;
  $("insightText").textContent =
    `Demo AQI ${place.aqi} — ${status.name}. This is a sample reading, not a live report.`;
}

function renderTrend() {
  const chart = $("trendChart");
  chart.replaceChildren();

  // Fictional data for visual demonstration, not a forecast.
  const values = [32, 39, 35, 48, 42, 54];
  const labels = ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"];

  values.forEach((value, index) => {
    const column = document.createElement("div");
    column.className = "trend-column";

    const number = document.createElement("strong");
    number.textContent = value;

    const bar = document.createElement("div");
    bar.className = "trend-bar";
    bar.style.height = `${value / 60 * 100}%`;

    const label = document.createElement("small");
    label.textContent = labels[index];

    column.append(number, bar, label);
    chart.appendChild(column);
  });
}

// Explore controls
$("search").addEventListener("input", renderExplore);
$("sort").addEventListener("change", renderExplore);
$("qualityFilter").addEventListener("change", renderExplore);

// Browser notification permission
$("notificationBtn").addEventListener("click", async () => {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    notificationsEnabled = permission === "granted";

    $("notificationBtn").textContent =
      notificationsEnabled ? "Enabled ✓" : "Not enabled";
  } catch {
    alert("Could not request notification permission.");
  }
});

// Accessibility preference
$("motionBtn").addEventListener("click", () => {
  reducedMotion = !reducedMotion;
  document.body.classList.toggle("reduced-motion", reducedMotion);
  $("motionBtn").textContent = reducedMotion ? "On ✓" : "Off";
});

// Initial screen
showScreen("welcome");
