const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["abcde"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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
}

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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getUserByEmail = (email, users) => {
  return Object.values(users).find((user) => user.email === email);
};

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const newUserID = generateRandomString();
  const user = {
    id: newUserID,
    email: email,
    password: password,
  };
  if (!email || !password) {
    // let templateVars = {
    //   status: 400,
    //   message: "Email and/or password missing",
    //   user: users[req.session.user_id],
    // }
    return res.status(400).send("Email and/or password missing");
  }
  if (getUserByEmail(email, users)) {
    // let templateVars = {
    //   status: 400,
    //   message: "This email is already registered",
    //   user: users[req.session.user_id],
    // }
    return res.status(400).send("This email is already registered");
  }

  users[newUserID] = user;
  req.session.user_id = newUserID;
  return res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    id: req.params.id,
    longURL: "www.lighthouselabs.com",
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  // let templateVars = {user: users[req.session.user_id]};
  res.render("urls_registration");
});

app.get("/login", (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const randomString = generateRandomString(6);
  console.log(randomString);
  urlDatabase[randomString] = req.body.longURL;
  console.log(urlDatabase);
  res.send("Ok");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  console.log("This is longURL ", longURL);
  delete urlDatabase[shortId];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  const longURL = req.body.updateURL;
  console.log("This is longURL ", longURL);
  urlDatabase[shortId] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (user) {
    if ((password === user.password)) {
      const user_id = user.id;
      // set cookie with user id
      req.session["user_id"] = user_id;
      res.redirect("/urls");
    } else {
      res.status(403).send("403 Forbidden: Wrong Password");
      res.redirect("/urls");
    }
  } else {
    res.status(403).send("403 Forbidden : Please Register");
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.user_id);
  res.redirect("/login");
});
