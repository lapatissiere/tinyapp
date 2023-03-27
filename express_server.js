const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString(len) {
  const arr = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "e",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  let ans = "";
  for (let i = 0; i < len; i++) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log(longURL);
  res.redirect(longURL);
  console.log(req.params.id);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase , username: req.cookies["username"],};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: "www.lighthouselabs.com" , username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const randomString = generateRandomString(6);
  console.log(randomString);
  urlDatabase[randomString] = req.body.longURL;
  console.log(urlDatabase);
  //res.redirect(`/u/${randomString}`);
  res.send("Ok"); //Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId]
  console.log("This is longURL ", longURL);
    delete urlDatabase[shortId];
    res.redirect("/urls");
}); 

app.post("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  const longURL = req.body.updateURL
  console.log("This is longURL ", longURL);
  urlDatabase[shortId] = longURL;
    res.redirect("/urls");
}); 

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})