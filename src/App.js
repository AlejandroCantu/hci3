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
import { wait } from "@testing-library/user-event/dist/utils";

const firebaseConfig = {
  apiKey: "AIzaSyBXJWfoOa4zXC8i-xJyADFYUC3C9JOq6bQ",
  databaseURL: "https://console.firebase.google.com/u/0/project/hci-app-2e9f2/database/hci-app-2e9f2-default-rtdb/data/~2F",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const db = getFirestore(app);

export default function App() {

  const [data, setData] = useState("");
  const [city, setCity] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cityList, setCityList] = useState([]);
  const [cityToOperate, setCityToOperate] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [uid, setUid] = useState("");



  useEffect(() => {
    console.log("USING EFFECT")
    gatherWeatherData();
  }, []);

  async function gatherWeatherData(city_p) {
    const forecast_url = "https://api.open-meteo.com/v1/forecast?";
    const geolocator_url = "https://geocoding-api.open-meteo.com/v1/search";
    const geolocator_suffix = "?name="
    const url_suffix = "&hourly=temperature_2m&temperature_unit=fahrenheit";
    const lat_s = "latitude=";
    const lon_s = "&longitude="
    let cityToSearch = cityToOperate;

    if (city_p) {
      cityToSearch = city_p;
    } else if (cityList && cityList[0] && cityList[0].length > 0) {
      cityToSearch = cityList[0];
    }

    try {
      let url = geolocator_url + geolocator_suffix + cityToSearch;
      console.log("CHECK THIS: " + cityToSearch);
      let response = await fetch(url);
      let json = await response.json();     
      console.log(json) 
      let city = json["results"][0];
      let searchLat = city["latitude"];
      let searchLon = city["longitude"];
      setCityToOperate(cityToSearch);
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
    const value = event.target.value;
    setCityToOperate(value);
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
        console.log(user["uid"]);
        const uid = user["uid"];
        // PUT new user key for city list data
        const new_user_url = "https://hci-app-2e9f2-default-rtdb.firebaseio.com/users/" + uid + ".json";
        let data_dict = {"cities": ["Austin"]};

        fetch(new_user_url, {method: "PUT", body: JSON.stringify(data_dict)})
            .then((response) => {
              console.log(response);
              loginUser()
            })
            .catch((error) => {
              console.log("Error\n Code:" + error.code + " \nMessage:" + error.message);
            })
      })
      .catch((error) => {
        console.log("Error\n Code:" + error.code + " \nMessage:" + error.message);
      });
  }

  async function loginUser() {

    setLoggedIn(true);

    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        const uid = user["uid"];
        setUid(uid);
        setUsername(username);
        // ...
        console.log(user);
        
        // Load user data for that username
        const get_city_list_url = "https://hci-app-2e9f2-default-rtdb.firebaseio.com/users/" + uid + ".json?print=pretty";
        fetch(get_city_list_url, {method: "GET"})
          .then((response) => {
            response.json()
              .then((json) => {
                const cityList = json["cities"];
                setCityList(cityList);
                setCity(cityList[0])
                setCityToOperate(cityList[0]);
                console.log("GATHERING WEATHER DATA for " + cityList[0]);
                gatherWeatherData(cityList[0]);
              })
          })
          .catch((error) => {
            console.log("Error\n Code:" + error.code + " \nMessage:" + error.message);
          })
      })
      .catch((error) => {
        console.log("Error\n Code:" + error.code + " \nMessage:" + error.message);
      });
    }

  async function logOut() {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
  }

  async function addToSaved() {
    const save_url = "https://hci-app-2e9f2-default-rtdb.firebaseio.com/users/" + uid + ".json";
    let local_city_list = cityList;
    local_city_list.push(cityToOperate);
    const body = {};
    body["cities"] = local_city_list;
    fetch(save_url, {method: "PUT", body: JSON.stringify(body)})
      .then((response) => {
        gatherWeatherData(cityToOperate);
      })
      .catch((error) => {
        console.log("Error\n Code:" + error.code + " \nMessage:" + error.message);
      });
  };

  function pageDisplay(loggedIn) {
    if (loggedIn) {
      return (
        <div className="container">
          <div className="row welcome">
            <div className="col-sm-auto welcome">
              <h3 className="welcome">Welcome {username}!</h3> 
              <Button variant="contained" onClick={() => logOut()}>Log Out</Button>
            </div>
          </div>
          <div className="row search-row">
            {/* Saved Cities */}
            <div className="col-sm-auto">
              <div className="row">
              <FormControl fullWidth>
                <InputLabel id="select-label">Saved Cities</InputLabel>
                <Select
                  labelId="select-label"
                  id="simple-select"
                  value={cityToOperate}
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
              <div className="row">
                <Button variant="contained" onClick={() => gatherWeatherData(cityToOperate)}>
                  Show Data
                </Button>
              </div>
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
                    Add to Saved and Show Data
                  </Button>
                </div>
                <div className="col-sm-auto">
                  <Button variant="contained" onClick={() => gatherWeatherData(cityToOperate)}>
                    Show Data
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Data */}
          <div className='current-city'>
            Today's Weather in {city}
          </div>
          {data && data.map(hour =>
              <div className='row hourly'>
                <div className='col-sm-auto time'>
                  {hour[0]}
                </div>
                <div className='col-sm-auto'>
                  {hour[1]}
                </div>
              </div>
            )}
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
    {pageDisplay(loggedIn)}


    {/* City Buttons */}
    {/* {pageDisplay(1)} */}
    
    </div>
    
  )
}