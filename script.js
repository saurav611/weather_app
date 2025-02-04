// API Key for OpenWeatherMap
const apiKey = "9d9fe202b0dd1682ffd7bff169c5c7bc";

// DOMContentLoaded Event Listener
document.addEventListener("DOMContentLoaded", function () {
  // Load recent searches on page load
  loadRecentSearches();

  // Search Button Event Listener
  document.getElementById("searchBtn").addEventListener("click", function () {
    const city = document.getElementById("cityInput").value.trim();
    if (city) {
      fetchWeather(city);
      addRecentSearch(city);
    } else {
      alert("Please enter a city name.");
    }
  });

  // Current Location Button Event Listener
  document
    .getElementById("currentLocationBtn")
    .addEventListener("click", function () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
          },
          (error) => {
            alert("Unable to retrieve your location.");
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    });
});

// Fetch Weather by City Name
async function fetchWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(url),
      fetch(forecastUrl),
    ]);

    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    if (weatherData.cod === "404") {
      throw new Error("City not found.");
    }

    displayWeather(weatherData);
    displayForecast(forecastData);
  } catch (error) {
    console.error("Error fetching weather:", error);
    document.getElementById(
      "weatherInfo"
    ).innerHTML = `<p class='text-red-500 text-center'>Error fetching weather data.</p>`;
  }
}

// Fetch Weather by Coordinates
async function fetchWeatherByCoords(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(url),
      fetch(forecastUrl),
    ]);

    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    displayWeather(weatherData);
    displayForecast(forecastData);
    addRecentSearch(weatherData.name);
  } catch (error) {
    console.error("Error fetching weather:", error);
    document.getElementById(
      "weatherInfo"
    ).innerHTML = `<p class='text-red-500 text-center'>Error fetching weather data.</p>`;
  }
}

// Display Current Weather
function displayWeather(data) {
  const weatherIcon = getWeatherIcon(data.weather[0].main);
  document.getElementById("weatherInfo").innerHTML = `
          <div class="flex flex-col md:flex-row items-center justify-between">
            <div class="text-center md:text-left">
              <h2 class="text-3xl font-bold text-blue-900 mb-2">${data.name}</h2>
              <p class="text-xl text-blue-600">${data.weather[0].description}</p>
            </div>
            <i class="${weatherIcon} text-6xl text-blue-500 my-4 md:my-0"></i>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div class="bg-blue-50 p-4 rounded-lg text-center">
              <p class="text-sm text-blue-600">Temperature</p>
              <p class="text-2xl font-bold text-blue-900">${data.main.temp}°C</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg text-center">
              <p class="text-sm text-blue-600">Humidity</p>
              <p class="text-2xl font-bold text-blue-900">${data.main.humidity}%</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg text-center">
              <p class="text-sm text-blue-600">Wind Speed</p>
              <p class="text-2xl font-bold text-blue-900">${data.wind.speed} m/s</p>
            </div>
          </div>
        `;
}

// Display 5-Day Forecast
function displayForecast(data) {
  let forecastHTML =
    '<h2 class="text-2xl font-bold text-blue-900 mb-6">5-Day Forecast</h2>';
  data.list.forEach((item, index) => {
    if (index % 8 === 0) {
      const weatherIcon = getWeatherIcon(item.weather[0].main);
      forecastHTML += `
              <div class="weather-card bg-blue-50 p-4 rounded-lg text-center">
                <p class="font-semibold text-blue-800 mb-2">${new Date(
                  item.dt_txt
                )
                  .toDateString()
                  .slice(0, 10)}</p>
                <i class="${weatherIcon} text-3xl text-blue-500 mb-2"></i>
                <p class="text-blue-900 font-bold">${item.main.temp}°C</p>
                <p class="text-sm text-blue-600">${
                  item.weather[0].description
                }</p>
                <div class="mt-2 space-y-1">
                  <p class="text-sm text-blue-600">Wind: ${
                    item.wind.speed
                  } m/s</p>
                  <p class="text-sm text-blue-600">Humidity: ${
                    item.main.humidity
                  }%</p>
                </div>
              </div>
            `;
    }
  });
  document.getElementById("forecastInfo").innerHTML = forecastHTML;
}

// Add Recent Search to Local Storage
function addRecentSearch(city) {
  let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  if (!searches.includes(city)) {
    searches = [city, ...searches].slice(0, 5); // Limit to 5 items
    localStorage.setItem("recentSearches", JSON.stringify(searches));
  }
  loadRecentSearches();
}

// Load Recent Searches
function loadRecentSearches() {
  const searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  const recentList = document.getElementById("recentSearchesList");
  const container = document.getElementById("recentSearchesContainer");

  recentList.innerHTML = ""; // Clear existing entries

  searches.forEach((city) => {
    const cityElement = document.createElement("div");
    cityElement.className =
      "flex items-center justify-between p-3 mb-2 transition-colors rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100";
    cityElement.innerHTML = `
            <span class="text-blue-800">${city}</span>
            <i class="wi wi-direction-right text-blue-500"></i>
          `;
    cityElement.addEventListener("click", () => {
      document.getElementById("cityInput").value = city;
      fetchWeather(city);
    });
    recentList.appendChild(cityElement);
  });

  // Show/hide container based on searches
  container.style.display = searches.length > 0 ? "block" : "none";
}

// Get Weather Icon
function getWeatherIcon(condition) {
  switch (condition.toLowerCase()) {
    case "clear":
      return "wi wi-day-sunny";
    case "clouds":
      return "wi wi-cloudy";
    case "rain":
      return "wi wi-rain";
    case "snow":
      return "wi wi-snow";
    default:
      return "wi wi-day-sunny";
  }
}
