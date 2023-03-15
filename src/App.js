import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";

const firebaseConfig = {
  apiKey: "AIzaSyBXJWfoOa4zXC8i-xJyADFYUC3C9JOq6bQ",

  databaseURL: "https://console.firebase.google.com/u/0/project/hci-app-2e9f2/database/hci-app-2e9f2-default-rtdb/data/~2F",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const db = getFirestore(app);

export default function App() {

  const [data, setData] = useState(null);
  const [lat, setLat] = useState("30.27");
  const [lon, setLon] = useState("-97.74");
  const [city, setCity] = useState("Austin");
  const [temps, setTemps] = useState(null);
  const [times, setTimes] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cityList, setCityList] = useState(["Houston", "Dallas", "Austin"]);
  const [currentCity, setCurrentCity] = useState("Houston");
  const [cityToOperate, setCityToOperate] = useState("");



  useEffect(() => {
    gatherWeatherData(city, 0);
  }, []);

  async function gatherWeatherData() {
    const forecast_url = "https://api.open-meteo.com/v1/forecast?";
    const geolocator_url = "https://geocoding-api.open-meteo.com/v1/search";
    const geolocator_suffix = "?name="
    const url_suffix = "&hourly=temperature_2m&temperature_unit=fahrenheit";
    const lat_s = "latitude=";
    const lon_s = "&longitude="
  
    try {
      setCityToOperate("");
      // 
      let url = geolocator_url + geolocator_suffix + cityToOperate;
      let response = await fetch(url);
      let json = await response.json();
      let city = json["results"][0]
      console.log(city);
      let searchLat = city["latitude"];
      let searchLon = city["longitude"];
      setLat(searchLat);
      setLon(searchLon);
      console.assert(cityToOperate != ""); // just to check if that's how React Hooks work
      // Capitalize City Name
      setCity(city["name"]);

      let fetch_url = forecast_url + lat_s + searchLat + lon_s + searchLon + url_suffix;

      response = await fetch(fetch_url);
      json = await response.json();
      // update Weather Data

      let temp = json.hourly.temperature_2m.slice(0, 10);
      temp = temp.map((x) => x.toString().substring(0, 2) + "\u00B0F")

      let time = json.hourly.time.slice(0, 10);
      time = time.map((x) => x.substring(11).substring(1, 2) + "PM");
      time[0] = '12PM'

      let daterr = time.map((x, i) => [x, temp[i]]);
      console.log(daterr)
      setData(daterr);

    } catch (err) {
      console.log(err);
    }
  }

  const handleCurrentCityChange = (event) => {
    setCurrentCity(event.target.value);
  }

  const handleCityBarChange = (event) => {
    setCityToOperate(event.target.value);
  }

  async function signUpUser() {
    setUsername("");
    setPassword("");

    createUserWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        console.log("Error\n Code:" + error.code + " \nMessage:" + error.message);
      });
  }

  async function loginUser() {
    setUsername("");
    setPassword("");

    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
        console.log(user);
        // Load user data for that username
        // setCityList
      })
      .catch((error) => {
        console.log("Error\n Code:" + error.code + " \nMessage:" + error.message);
      });
  }

  async function addToSaved() {
    // setCityToOperate("");
    console.log(cityToOperate);
  }

  async function searchCity() {
    console.log(cityToOperate);
  }

  function pageDisplay(loggedIn) {
    if (loggedIn) {
      return (
        <div className="container">
          <div className="row search-row">
            {/* Saved Cities */}
            <div className="col-sm-auto">
              <FormControl fullWidth>
                <InputLabel id="select-label">Saved Cities</InputLabel>
                <Select
                  labelId="select-label"
                  id="simple-select"
                  value={currentCity}
                  label="Saved Cities"
                  onChange={handleCurrentCityChange}
                >
                  {cityList &&
                    cityList.map(city =>
                      <MenuItem value={city}>{city}</MenuItem>
                    )}

                </Select>
              </FormControl>
            </div>
            {/* City Search or Add */}
            <div className="col-sm-auto"> {/* MOVE THIS THING TO THE RIGHT */}
              <div className="row">
                <TextField
                  id="city-search"
                  label="Type A City"
                  value={cityToOperate}
                  onChange={handleCityBarChange}>
                </TextField>
              </div>
              <div className="row">
                <div className="col-sm-auto">
                  <Button variant="contained" onClick={() => addToSaved()}>
                    Add to Saved
                  </Button>
                </div>
                <div className="col-sm-auto">
                  <Button variant="contained" onClick={() => gatherWeatherData()}>
                    Search
                  </Button>
                </div>
              </div>

            </div>
          </div>

          {/* Weather Data */}
          <div className='current-city'>
            Today's Weather in {city}
          </div>
          {
            data && data.map(hour =>
              <div className='row hourly'>
                <div className='col-sm-auto time'>
                  {hour[0]}
                </div>
                <div className='col-sm-auto'>
                  {hour[1]}
                </div>
              </div>
            )
          };
        </div>
      );
    } else { /* USER LOGIN SCREEN BELOW */ 
      return (
        <div className="container">
          <div className="row search-row">
            <div className="col-sm-auto">
              <TextField id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="col-sm-auto">
              <TextField id="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          
          <div className="row search-row">
            <div className="col-sm-auto">
              <Button variant="contained" id="login" onClick={() => loginUser()}>Login</Button>
            </div>
            <div className="col-sm-auto">
              <Button variant="contained" id="createNewUser" onClick={() => signUpUser()}>Create New User and Login</Button>
            </div>
          </div>
          
        </div>
      );

    }
  }

  return (
    <div>
    {/* Title */}
    <h1 className="title">Texas Sun</h1>
    {/* {pageDisplay(0)} */}


    {/* City Buttons */}
    {pageDisplay(1)}
    
    </div>
    
  )
}