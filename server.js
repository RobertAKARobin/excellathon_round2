var express = require("express");
var app = express();

app.use(require("body-parser"));

app.listen(process.env.PORT || 3000, function(){
  console.log("Listening!");
});
