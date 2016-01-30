var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");

var env = require("./env.json");
var stations;

(function setStations(){
  api("jLines", {}, function(data){
    stations = data;
  });
}());

app.use(bodyParser.json());

app.post("/nearby", function(req, res){
  var params = {
    Lat: (req.body.latitude || null),
    Lon: (req.body.longitude || null),
    Radius: (req.body.radius || null)
  }
  api("jStationEntrances", params, getStationEntrances);

  function getStationEntrances(data){
    api("jStationInfo", {StationCode: data.Entrances[0]["StationCode1"]}, function(dat){
      res.json({
        station: dat.Name,
        stationLat: dat.Lat,
        stationLong: dat.Lon
      })
    });
  }
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Listening!");
});


function api(endpoint, params, callback){
  request({
    uri: "https://api.wmata.com/Rail.svc/json/" + endpoint,
    method: "GET",
    qs: (params || {}),
    headers: {
      "Content-Type": "application/json",
      "api_key": env.api_key
    }
  }, function(err, res){
    callback(JSON.parse(res.body), res);
  });
}
