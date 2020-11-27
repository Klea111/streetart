const express = require("express");



const app = express();

app.get("*", (req,resp) => {
    resp.send("HELL WORLD");
});


app.listen(8080, ()=>{console.log("listening on 8080")});