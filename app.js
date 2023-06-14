const express = require("express");
const bodyParser = require("body-parser");
const requestLib = require("request");
const https = require("https");
const client = require("@mailchimp/mailchimp_marketing");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res){
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    };

    client.setConfig({
        apiKey: "060fa7679b96533dcf26ee490f281d2b-us21",
        server: "us21"
    });

    const jsonData = JSON.stringify(data);

    const url = "https://us21.api.mailchimp.com/3.0/lists/8384f553a1";
    const options = {
        method: "POST",
        auth: "user:060fa7679b96533dcf26ee490f281d2b-us21",
    };

    const request = https.request(url, options, function(response){
        if (response.statusCode === 200) {
            let responseData = "";
            response.on("data", function(chunk){
                responseData += chunk;
            });
            response.on("end", function(){
                client.lists.batchListMembers("8384f553a1", data)
                    .then(() => {
                        console.log("Batch list members added successfully.");
                        res.sendFile(__dirname + "/success.html")
                    })
                    .catch((error) => {
                        console.log("Error adding batch list members:", error);
                        res.write("<h1>There was an error signing up, please try again later.</h1>");
                        res.end();
                    });
            });
        } else {
            res.write("<h1>There was an error signing up, please try again later.</h1>");
            res.end();
        };
    });

    request.write(jsonData);
    request.end();
});

app.listen(3000, function(){
    console.log("Server is running on port 3000.");
});
