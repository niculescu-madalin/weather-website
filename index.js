import { apiKeys } from './env.js';

let search_cities = [];
let weather = {}

let temp_grades = "celsius"

document.addEventListener('DOMContentLoaded', () => {
    // Search input
    const searchInput = document.getElementById('search-box-input');
    searchInput.addEventListener('keyup', (e) => showResults(e.target.value));
    searchInput.addEventListener('keypress', (e) => {
        if(e.key == "Enter") {
            e.preventDefault();
            document.getElementById("search-button").click();
        }
    });
    
    // Search button
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', refresh);
    
    // Temperature grades button
    const tempGradesButton = document.getElementById('temp-grades');
    tempGradesButton.addEventListener('click', changeGrades);
});

window.showResults = showResults;
window.refresh = refresh;
window.changeGrades = changeGrades;

//--------------------------------------------------------------//

function getCity() {
    let cityName = document.getElementById("search-box-input").value;
    console.log(cityName);
    return cityName;
}

function getUrl(cityName) {
    let url = { ow: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKeys.openWeather}`,
                wapi: `http://api.weatherapi.com/v1/current.json?key=${apiKeys.weatherAPI}&q=${cityName}&aqi=no` };
    return url;
}

function autocompleteMatch(input) {
    if (input == '') {
        document.getElementById("autocomplete-box").style.display = "none";
      return [];  
    } else document.getElementById("autocomplete-box").style.display = "block";

    const geolocation = `http://api.weatherapi.com/v1/search.json?key=${apiKeys.weatherAPI}&q=${input}`;
    fetch(geolocation).then(response => response.json()).then(response => fillCitiesAutocomplete(response, input));
    console.log(search_cities);
    return search_cities;
}

function fillCitiesAutocomplete(data, input) {
    for(let i = 0; i < data.length; i++) {
        search_cities.push(`${data[i].name}, ${data[i].region}, ${data[i].country}`);
    }
}

function showResults(val) {
    const res = document.getElementById("autocomplete-box");
    res.innerHTML = '';
    let list = '';
    let terms = autocompleteMatch(val);

    for (let i = 0; i < terms.length; i++) {
      list += '<li>' + terms[i] + '</li>';
    }
    if(list) {
        res.innerHTML = '<ul>' + list + '</ul>';    
    } else {
        res.style.display = "none";
    }

    search_cities = [];
  }


function selecWeatherBoxGradient (weather, hour) {
    console.log(weather.main);
    if (weather.main == "Rain") {
        document.getElementById("weather-box").style.background = "var(--rain-weather-gradient)";
    }

    if(weather.main == "Clouds" || weather.main == "Clear") {
        document.getElementById("weather-box").style.background = "var(--day-weather-gradient)";
    }
}

function updatePage(data) {
    weather = {
        condition: data[1].current.condition.text,
        temperature: { temp_c: data[1].current.temp_c, temp_f: data[1].current.temp_f},
        icon: data[0].weather[0].icon
    };
    let location = {city: data[1].location.name, region:data[1].location.region, country: data[1].location.country};
    let dateTime = new Date(data[1].location.localtime_epoch * 1000);

    document.getElementById("temperature").innerHTML = `<b>${weather.temperature.temp_c}</b>`;
    document.getElementById("icon").src = `assets/weathericons/${weather.icon}.svg`;
    document.getElementById("location-text").innerHTML = `${location.city}, ${location.region}, ${location.country}`;
    document.getElementById("condition-text").innerHTML = `${weather.condition}`;
    document.getElementById("time-text").innerHTML = `${dateTime.getHours()}:${dateTime.getMinutes()} - 
                                        ${dateTime.getDate()}.${dateTime.getMonth() + 1}.${dateTime.getFullYear()}`;
    document.getElementById("search-box-input").value = "";
    document.getElementById("weather-box").style.display = "block"; 

    document.getElementById("autocomplete-box").style.display = "none";
}



function refresh() {
    let cityName = getCity();
    let url = getUrl(cityName);
    console.log(url);
    
    Promise.all([
        fetch(url.ow).then(response => response.json()),
        fetch(url.wapi).then(response => response.json())
      ]).then(response => updatePage(response))
}

function changeGrades() {
    if(temp_grades === "celsius") {
        document.getElementById("temperature").innerHTML = `<b>${weather.temperature.temp_f}</b>`;
        document.getElementById("temp-grades").innerHTML = "°F";
        temp_grades = "fanrenhein"
    } else {
        document.getElementById("temperature").innerHTML = `<b>${weather.temperature.temp_c}</b>`;
        document.getElementById("temp-grades").innerHTML = "°C";
        temp_grades = "celsius";
    }
}



