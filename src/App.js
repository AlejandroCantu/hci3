import { useEffect, useState } from "react";

export default function App() {

  const [data, setData] = useState(null);
  const [lat, setLat] = useState("30.27");
  const [lon, setLon] = useState("-97.74");
  const [city, setCity] = useState("Austin");
  const [temps, setTemps] = useState(null);
  const [times, setTimes] = useState(null);

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

  return (
    <div>
    {/* Title */}
    <h1 className="title">Texas Sun</h1>
    
    {/* City Buttons */}
    <div className="row ">  
      <div className="col-sm city ">
        <button className="city-button" onClick={() =>gatherWeatherData("houston", 0)}>Houston</button>
      </div>
      <div className="col-sm-auto city">
        <button className="city-button" onClick={() =>gatherWeatherData("dallas", 0)}>Dallas</button>
      </div>
      <div className="col-sm city ">
        <button className="city-button" onClick={() =>gatherWeatherData("austin", 0)}>Austin</button>
      </div>
    </div>

    {/* Search Bar */}
    <div className="row search-row">
      <div className="col-sm-auto">
        <input id="lat-input" type="search" placeholder="Latitude" onChange={(e) => setLat(e.target.value)}/>
      </div>
      <div className="col-sm-auto">
        <input id="lon-input" type="search" placeholder="Longitude" onChange={(e) => setLon(e.target.value)}/>
      </div>
      <div className="col-sm-auto search">
        <button id="search-button" className="search-button" onClick={() => gatherWeatherData(null, 1)}>Search</button>
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
      )};
    </div>
    
  )
}