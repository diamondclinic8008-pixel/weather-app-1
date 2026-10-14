const startBtn = document.getElementById("startBtn");
const welcome = document.getElementById("welcome");
const weather = document.getElementById("weather");
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");

// Open the weather screen
startBtn.addEventListener("click", () => {
  welcome.classList.add("hidden");
  weather.classList.remove("hidden");
  getWeather("Dhaka");
});

// Search for a city
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city !== "") {
    getWeather(city);
  }
});

// Choose an icon based on weather condition
function getWeatherIcon(code) {
    if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "❄️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

// Convert weather code to description
function getDescription(code) {
  if (code === 0) return "Clear Sky";
  if (code <= 2) return "Mostly Clear";
  if (code === 3) return "Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

// Fetch weather information
async function getWeather(city) {
  message.textContent = "Loading weather...";

  try {
    // First API: convert city name to coordinates
    const geoURL =
      "https://geocoding-api.open-meteo.com/v1/search" +
      "?name=" + encodeURIComponent(city) +
      "&count=1&language=en&format=json";

    const geoResponse = await fetch(geoURL);

    if (!geoResponse.ok) {
      throw new Error("Location service unavailable");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || !geoData.results.length) {
      throw new Error("City not found");
    }

    const location = geoData.results[0];

    const latitude = location.latitude;
    const longitude = location.longitude;

    // Second API: get real weather data
    const weatherURL =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + latitude +
      "&longitude=" + longitude +
      "&current=temperature_2m,relative_humidity_2m," +
      "weather_code,wind_speed_10m" +
      "&hourly=temperature_2m,weather_code" +
      "&forecast_days=2&timezone=auto";

    const response = await fetch(weatherURL);

    if (!response.ok) {
      throw new Error("Weather service unavailable");
    }

    const data = await response.json();

    const current = data.current;

    // Update current weather
    document.getElementById("cityName").textContent =
      location.name;

    document.getElementById("temperature").textContent =
      Math.round(current.temperature_2m) + "°";

    document.getElementById("description").textContent =
      getDescription(current.weather_code);

    document.getElementById("weatherIcon").textContent =
      getWeatherIcon(current.weather_code);

    document.getElementById("weatherDetails").textContent =
      location.country + " • Current Weather";

    document.getElementById("humidity").textContent =
      current.relative_humidity_2m + "%";

    document.getElementById("wind").textContent =
      current.wind_speed_10m + " km/h";

    // Display next 5 hourly forecasts
    const hourlyBox =
      document.getElementById("hourlyForecast");

    hourlyBox.innerHTML = "";

    const currentHour = current.time.slice(0, 13);

    let startIndex = data.hourly.time.findIndex(
      time => time.startsWith(currentHour)
    );
    if (startIndex < 0) startIndex = 0;

    for (
      let i = startIndex;
      i < Math.min(startIndex + 5, data.hourly.time.length);
      i++
    ) {
      const time = data.hourly.time[i].slice(11, 16);
      const temp = Math.round(data.hourly.temperature_2m[i]);
      const code = data.hourly.weather_code[i];

      const card = document.createElement("div");
      card.className = "hour-card";

      const hour = document.createElement("p");
      hour.textContent = time;

      const icon = document.createElement("div");
      icon.className = "icon";
      icon.textContent = getWeatherIcon(code);

      const temperature = document.createElement("strong");
      temperature.textContent = temp + "°";

      card.append(hour, icon, temperature);
      hourlyBox.appendChild(card);
    }

    message.textContent = "";

  } catch (error) {
    message.textContent =
      error.message + ". Please try again.";
  }
}
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const searchPage = document.getElementById("searchPage");

// Go from second page to third page
nextBtn.addEventListener("click", function() {
  weather.classList.add("hidden");
  searchPage.classList.remove("hidden");
});

// Go back from third page to second page
backBtn.addEventListener("click", function() {
  searchPage.classList.add("hidden");
  weather.classList.remove("hidden");
});

// Search for a city from the third page
const locationForm = document.getElementById("locationForm");

locationForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const city = document.getElementById("locationInput").value.trim();

  if (city === "") return;

  searchPage.classList.add("hidden");
  weather.classList.remove("hidden");

  await getWeather(city);
});