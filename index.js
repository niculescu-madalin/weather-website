const { apiKeys } = require('/env');


const search_terms = ['apple', 'apple watch', 'apple macbook', 'apple macbook pro', 'iphone', 'iphone 12'];

let input = document.getElementById("search-box-input");
let search_cities = [];
let weather = {}

let temp_grades = "celsius"

input.focus();
input.select();

input.addEventListener("keypress", function(event) {
    if(event.key == "Enter") {
        event.preventDefault();
        document.getElementById("search-button").click();
    }
})

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

    geolocation = `http://api.weatherapi.com/v1/search.json?key=${apiKeys.weatherAPI}&q=${input}`;
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
    res = document.getElementById("autocomplete-box");
    res.innerHTML = '';
    let list = '';
    let terms = autocompleteMatch(val);

    for (i = 0; i < terms.length; i++) {
      list += '<li>' + terms[i] + '</li>';
    }
    if(list) {
        res.innerHTML = '<ul>' + list + '</ul>';    
    } else 
        res.style.display = "none";

    search_cities = [];
  }

function getJSONfromUrl(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
        let status = xhr.status;
        if(status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };
    xhr.send();
} 

function selecWeahertBoxGradient (weather, hour) {

    console.log(weather.main);
    if (weather.main == "Rain") {
        document.getElementById("weather-box").style.background = "var(--rain-weather-gradient)";
    }

    if(weather.main == "Clouds" || weather.main == "Clear") {
        document.getElementById("weather-box").style.background = "var(--day-weather-gradient)";
    }
}

function updatePage(data) {
    let weather = {
        conditon: data[0].weather[0].description,
        temperature: (data[0].main.temp - 273.15).toFixed(0), 
        icon: data[0].weather[0].icon,
        main: data[0].weather[0].main
    };

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



