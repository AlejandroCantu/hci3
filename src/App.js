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
  const [currentCity, setCurrentCity] = useState(cityList[0]);
  const [cityToOperate, setCityToOperate] = useState("");



  useEffect(() => {
    gatherWeatherData(city, 0);
  }, []);

  async function gatherWeatherData(city, search) {
    const forecast_url = "https://api.open-meteo.com/v1/forecast?";
    const url_suffix = "&hourly=temperature_2m&temperature_unit=fahrenheit"
    const htx_coord = ["29.76", "-95.36"];
    const atx_coord = ["30.27", "-97.74"];
    const dtx_coord = ["32.78", "-96.81"];
    const lat_s = "latitude=";
    const lon_s = "&longitude="
    let coord;
  
    if (search) {
      // search
      const regex = new RegExp('^[-]?([0-9]+[.]?[0-9]*)');
      if (!(regex.test(lat) && regex.test(lon))) {
        alert("Incorrect coordinate format in search bar. Please correct and try again. Defaulting to Austin weather reports.")
        coord = atx_coord;
        city = "Austin";
      } else {
        coord = [lat, lon];
        city = lat + ", " + lon
  
      }
      
    } else {
      switch (city) {
        case "houston":
          coord = htx_coord;
          city = "Houston";
          break;
        case "dallas":
          coord = dtx_coord;
          city = "Dallas";
          break;
        default:
        case "austin":
            coord = atx_coord;
            city = "Austin";
            break;
      }
    }
    setLat(coord[0]);
    setLon(coord[1]);
    setCity(city);

  
    let fetch_url = forecast_url + lat_s + coord[0] + lon_s + coord[1] + url_suffix;
  
    try {
      const response = await fetch(fetch_url);
      const json = await response.json();
      // update Weather Data

      let temp = json.hourly.temperature_2m.slice(0, 10);
      temp = temp.map((x) => x.toString().substring(0,2) + "\u00B0F")

      let time = json.hourly.time.slice(0,10);
      time = time.map((x) => x.substring(11).substring(1,2) + "PM");
      time[0] = '12PM'

      let daterr = time.map((x, i) => [x, temp[i]]);
      console.log(daterr)
      setData(daterr);

    } catch (err) {
      console.log(err);
    }
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

  function pageDisplay(loggedIn) {
    if (loggedIn) {
      return (
        <div className="container">
          <div className="row">
            {/* Saved Cities */}
            <div className="col-sm-auto">
              <FormControl fullWidth>
                <InputLabel id="select-label">Saved Cities</InputLabel>
                <Select
                  labelId="select-label"
                  id="simple-select"
                  value={currentCity}
                  label="Saved Cities"
                  onChange={setCurrentCity}
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
                onChange={() => setCityToOperate}>
              </TextField>
              </div>
              <div className="row">
              <div className="col-sm-auto">
              <Button variant="contained" >
          Add to Saved
        </Button>
              </div>
              <div className="col-sm-auto">
              <Button variant="contained" >
          Search 
        </Button>
              </div>
              </div>
              
            </div>
          </div>

          

          


{/* 
          <div className="row ">
            <div className="col-sm city ">
              <button className="city-button" onClick={() => gatherWeatherData("houston", 0)}>Houston</button>
            </div>
            <div className="col-sm-auto city">
              <button className="city-button" onClick={() => gatherWeatherData("dallas", 0)}>Dallas</button>
            </div>
            <div className="col-sm city ">
              <button className="city-button" onClick={() => gatherWeatherData("austin", 0)}>Austin</button>
            </div>
          </div> */}

          {/* Search Bar */}
          <div className="row search-row">
            <div className="col-sm-auto">
              <input id="lat-input" type="search" placeholder="Latitude" onChange={(e) => setLat(e.target.value)} />
            </div>
            <div className="col-sm-auto">
              <input id="lon-input" type="search" placeholder="Longitude" onChange={(e) => setLon(e.target.value)} />
            </div>
            <div className="col-sm-auto search">
              <button id="search-button" className="search-button" onClick={() => gatherWeatherData(null, 1)}>Search</button>
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
          <div className="row">
            <input id="username" type="email" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="row">
            <input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="row login-button">
            <button id="login" onClick={() => loginUser()}>Login</button>
          </div>
          <div className="row login-button">
            <button id="createNewUser" onClick={() => signUpUser()}>Create New User and Login</button>
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