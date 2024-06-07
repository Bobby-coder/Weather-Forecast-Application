const apiKey = "511c0d53e786d6e701870951d85c605d";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

const cityInput = document.getElementById("cityInput");

// Function to fetch current weather by city name
async function getWeather(city) {
  try {
    const response = await fetch(
      `${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    if (data.cod === 200) {
      displayWeather(data);
      await getExtendedForecast(city);
      addRecentCity(city.toLowerCase()); // Normalize city name to lowercase
      cityInput.value = "";
      document.getElementById("recentCities").value = ""; // Reset recent cities dropdown
    } else {
      cityInput.value = "";
      showError("City not found");
    }
  } catch (error) {
    showError("Unable to fetch weather data");
  }
}

// Function to fetch weather by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    if (data.cod === 200) {
      displayWeather(data);
      await getExtendedForecastByCoords(lat, lon);
    } else {
      showError("Location not found");
    }
  } catch (error) {
    showError("Unable to fetch weather data");
  }
}

// Function to fetch extended forecast by city name
async function getExtendedForecast(city) {
  try {
    const response = await fetch(
      `${forecastUrl}?q=${encodeURIComponent(
        city
      )}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    displayExtendedForecast(data);
  } catch (error) {
    showError("Unable to fetch extended forecast");
  }
}

// Function to fetch extended forecast by coordinates
async function getExtendedForecastByCoords(lat, lon) {
  try {
    const response = await fetch(
      `${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    displayExtendedForecast(data);
  } catch (error) {
    showError("Unable to fetch extended forecast");
  }
}

// Function to display current weather
function displayWeather(data) {
  const weatherData = document.getElementById("weatherData");
  weatherData.innerHTML = `
    <div class="text-center">
      <h2 class="text-3xl font-bold">${data.name}, ${data.sys.country}</h2>
      <p class="text-lg"><i class="fas fa-${getWeatherIcon(
        data.weather[0].main
      )}"></i> ${data.weather[0].description}</p>
      <p class="text-5xl font-semibold">${data.main.temp}°C</p>
      <p class="text-xl">Humidity: ${data.main.humidity}%</p>
      <p class="text-xl">Wind Speed: ${data.wind.speed} m/s</p>
    </div>
  `;
  document.getElementById("error").textContent = "";
}

// Function to display extended forecast
function displayExtendedForecast(data) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML =
    '<h2 class="text-2xl font-bold mb-4 col-span-full text-center">5-Day Forecast</h2>';
  const forecastList = data.list.filter((item) =>
    item.dt_txt.endsWith("12:00:00")
  );
  forecastList.forEach((item) => {
    const forecastItem = document.createElement("div");
    forecastItem.className = "p-4 bg-white rounded-lg shadow";
    forecastItem.innerHTML = `
      <div class="text-center mb-2">
        <div class="text-xl font-semibold">${new Date(
          item.dt_txt
        ).toLocaleDateString()}</div>
        <div class="text-lg"><i class="fas fa-${getWeatherIcon(
          item.weather[0].main
        )}"></i> ${item.weather[0].description}</div>
      </div>
      <div class="flex flex-col items-center">
        <div class="text-xl">${item.main.temp}°C</div>
        <div class="text-lg">Wind: ${item.wind.speed} m/s</div>
        <div class="text-lg">Humidity: ${item.main.humidity}%</div>
      </div>
    `;
    forecastContainer.appendChild(forecastItem);
  });
}

// Function to get weather icon class
function getWeatherIcon(weather) {
  switch (weather) {
    case "Clear":
      return "sun";
    case "Clouds":
      return "cloud";
    case "Rain":
      return "cloud-rain";
    case "Snow":
      return "snowflake";
    case "Thunderstorm":
      return "bolt";
    case "Drizzle":
      return "cloud-showers-heavy";
    case "Atmosphere":
      return "smog";
    default:
      return "cloud";
  }
}

// Function to show error messages
function showError(message) {
  document.getElementById("error").textContent = message;
}

// Event listener for form submission
document.getElementById("weatherForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    showError("Please enter a city");
  }
});

// Event listener for recent cities dropdown
document.getElementById("recentCities").addEventListener("change", (e) => {
  const city = e.target.value;
  if (city) {
    getWeather(city);
  }
});

// Function to add recent cities to dropdown and local storage
function addRecentCity(city) {
  const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!recentCities.includes(city.toLowerCase())) {
    // Normalize city name to lowercase
    recentCities.push(city.toLowerCase());
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    updateRecentCitiesDropdown();
  }
}

// Function to update recent cities dropdown
function updateRecentCitiesDropdown() {
  const dropdown = document.getElementById("recentCities");
  const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (recentCities.length === 0) {
    dropdown.classList.add("hidden");
  } else {
    dropdown.classList.remove("hidden");
    dropdown.innerHTML = '<option value="">Select recent city</option>';
    recentCities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      dropdown.appendChild(option);
    });
  }
}

// Initial call to populate recent cities dropdown
updateRecentCitiesDropdown();

// Event listener for current location button
document.getElementById("currentLocationBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      () => {
        showError("Unable to retrieve your location");
      }
    );
  } else {
    showError("Geolocation is not supported by this browser");
  }
});
