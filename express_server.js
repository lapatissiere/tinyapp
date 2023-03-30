const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["abcde"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  if (!req.session["userID"]) {
    return res.status(400).send("400 error ! Please Login or Register");
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    // console.log(longURL);
    res.redirect(longURL);
    // console.log(req.params.id);
  }
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
  const password = "purple-monkey-dinosaur"; 
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUserID = generateRandomString();
  const user = {
    id: newUserID,
    email: email,
    password: hashedPassword,
  };
  if (!email || !hashedPassword) {
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
  // console.log(req.params)
  if (!req.session.user_id) {
    // let templateVars = {
    //   status: 401,
    //   message: "Please register or login",
    //   user: users[req.session.user_id],
    // };
    return res.status(401).send("Please register or login");
  } else {
    let templateVars = {
      urls: urlsForUser(id)(req.session.userID, urlDatabase),
      user: users[req.session.user_id],
    };
    return res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("urls_login");
  }
});

app.get("/urls/:id", (req, res) => {
  // let templateVars = {
  //   id: req.params.id,
  //   longURL: "https://www.tsn.ca",
  //   user: users[req.session.user_id],
  // };
  if (!req.session.user_id) {
    let templateVars = {
      status: 401,
      message: "Please log in to perform that action",
      user: users[req.session.user_id],
    };
    return res.status(401).send("Please log in to perform that action");
  }
  if (!req.session.user_id) {
    let templateVars = {
      status: 401,
      message: "This TinyURL does not belong to you",
      user: users[req.session.user_id],
    };
    res.status(401).send("This TinyURL does not belong to you");
    res.render("urls_show", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_registration", templateVars);
  } else {
    res.redirect("/urls");
  }
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
  // console.log(req.body);
  const randomString = generateRandomString(6);
  // console.log(randomString);
  urlDatabase[randomString] = req.body.longURL;
  if (!req.session.user_id) {
    let templateVars = {
      status: 401,
      message: "You must be logged in to perform that action",
      user: users[req.session.user_id],
    };
    return res.status(401).send("You must be logged in to perform that action");
  } else {
    // console.log(urlDatabase);
    res.send("Ok");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId].longURL;
  if (!req.session.user_id) {
    let templateVars = {
      status: 401,
      message: "You must be logged in to perform that action",
      user: users[req.session.user_id],
    };
    return res.status(401).send("You must be logged in to perform that action");
  }
  if (!req.session.user_id) {
    let templateVars = {
      status: 401,
      message: "Please log in to perform that action",
      user: users[req.session.user_id],
    };
    return res.status(401).send("Please log in to perform that action");
  }
  if (!req.session.user_id) {
    let templateVars = {
      status: 401,
      message: "This TinyURL does not belong to you",
      user: users[req.session.user_id],
    };
    res.status(401).send("This TinyURL does not belong to you");
    res.render("urls_show", templateVars);
  }
  console.log("This is longURL ", longURL);
  delete urlDatabase[shortId];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  const longURL = req.body.longURL;
  if (!req.session.user_id) {
    let templateVars = {
      status: 401,
      message: "Please log in to perform that action",
      user: users[req.session.user_id],
    };
    res.status(401).send("Please log in to perform that action");
    res.render("/urls", templateVars);
  }
  if (!urlDatabase[shortID]) {
    let templateVars = {
      status: 404,
      message: "This TinyURL does not exist",
      user: users[req.session.user_id],
    };
    res.status(404).send("This TinyURL does not exist");
    res.render("/urls", templateVars);
  }
  if (req.session.user_id !== urlDatabase[templateVars.shortID].userID) {
    let templateVars = {
      status: 401,
      message: "This TinyURL does not belong to you",
      user: users[req.session.user_id],
    };
    res.status(401).send("This TinyURL does not belong to you");
    res.render("urls_show", templateVars);
  }
  console.log("This is longURL ", longURL);
  urlDatabase[shortId].longURL = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = "purple-monkey-dinosaur";
const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email, users);
  if (user) {
    if (bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)) {
      const user_id = user.id;
      // set cookie with user id
      req.session["user_id"] = user_id;
      return res.redirect("/urls");
    } 
    if (bcrypt.compareSync("pink-donkey-minotaur", hashedPassword)) {
      return res.status(403).send("403 Forbidden: Wrong Password");
    }
  } else {
    return res.status(403).send("403 Forbidden : Please Register");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.user_id);
  res.redirect("/login");
});
