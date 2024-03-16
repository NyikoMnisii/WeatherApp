const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "f3cfab710dbc52ae28d74aaf2d111493"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
  const { dt_txt, main, wind, weather } = weatherItem;
  const temperature = (main.temp - 273.15).toFixed(2);
  const html = `
    ${index === 0 ? '<div class="details">' : '<li class="card">'}
      <h2>${cityName} (${dt_txt.split(" ")[0]})</h2>
      <h6>Temperature: ${temperature}°C</h6>
      <h6>Wind: ${wind.speed} M/S</h6>
      <h6>Humidity: ${main.humidity}%</h6>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}@4x.png" alt="weather-icon">
        <h6>${weather[0].description}</h6>
      </div>
    ${index === 0 ? '</div>' : '</li>'}`;
  return html;
};

const getWeatherDetails = async (cityName, latitude, longitude) => {
  try {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    const response = await fetch(WEATHER_API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    const data = await response.json();
    const uniqueForecastDays = [];
    const fiveDaysForecast = data.list.filter(forecast => {
      const forecastDate = new Date(forecast.dt_txt).getDate();
      return uniqueForecastDays.includes(forecastDate) ? false : uniqueForecastDays.push(forecastDate);
    });
    cityInput.value = "";
    currentWeatherDiv.innerHTML = "";
    weatherCardsDiv.innerHTML = "";
    fiveDaysForecast.forEach((weatherItem, index) => {
      const html = createWeatherCard(cityName, weatherItem, index);
      index === 0 ? currentWeatherDiv.insertAdjacentHTML("beforeend", html) : weatherCardsDiv.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    alert("An error occurred while fetching the weather forecast!");
  }
};

const getCityCoordinates = async () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  try {
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("City not found");
    }
    const data = await response.json();
    if (!data.length) {
      throw new Error(`No coordinates found for ${cityName}`);
    }
    const { lat, lon, name } = data[0];
    getWeatherDetails(name, lat, lon);
  } catch (error) {
    alert(error.message);
  }
};

const getUserCoordinates = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const { latitude, longitude } = position.coords;
    const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }
    const data = await response.json();
    const { name } = data[0];
    getWeatherDetails(name, latitude, longitude);
  } catch (error) {
    if (error.code === error.PERMISSION_DENIED) {
      alert("Geolocation request denied. Please reset location permission to grant access again.");
    } else {
      alert("An error occurred while fetching location data.");
    }
  }
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    getCityCoordinates();
  }
});
