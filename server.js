var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

try{
  var env = require("./env.json");
}catch(e){
  var env = process.env;
}

var stations;

(function setStations(){
  api("jLines", {}, function(data){
    stations = data;
  });
}());

app.get("/", function(req, res){
  res.json({success: true});
});

app.post("/", function(req, res){
  var body = req.body;
  var params = {
    Lat: (body.latitude || null),
    Lon: (body.longitude || null),
    Radius: (body.radius || null)
  }
  api("jStationEntrances", params, getStationEntrances);

  function getStationEntrances(data){
    api("jStationInfo", {StationCode: data.Entrances[0]["StationCode1"]}, function(dat){
      res.send({
        station: dat.Name,
        stationLat: dat.Lat,
        stationLong: Number(dat.Lon.toFixed(6))
      });
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
