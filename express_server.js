const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers.js");
const { urlDatabase, users } = require("./database.js");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["abcde"],
    // Cookie Options
    // maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:id", (req, res) => {
  //   return res.status(400).send("400 error ! Please Login or Register");
  // } else {
  const longURL = urlDatabase[req.params.id].longURL;
  // console.log(longURL);
  res.redirect(longURL);
  // console.log(req.params.id);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: {},
    urls: {},
  };
  console.log(req.session.user_id);

  if (!req.session.user_id) {
    return res.status(400).send("Please log in");
  }
  if (req.session.user_id) {
    templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user: users[req.session.user_id],
    };
  }
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log();
  if (req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const urlId = req.params.id;
  if (!req.session.user_id) {
    return res.status(401).send("Please log in to perform that action");
  }
  if (!urlDatabase[urlId]) {
    return res.status(400).send("This URL does not exist");
  }
  if (urlDatabase[urlId].userID !== req.session.user_id) {
    return res.status(403).send("403 error ! This is not your URL");
  }
  const user = users[req.session.user_id];
  let templateVars = {
    id: urlId,
    longURL: urlDatabase[urlId].longURL,
    user: user,
  };
  res.render("urls_show", templateVars);
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
  const randomString = generateRandomString(6);
  if (!req.session.user_id) {
    return res.status(401).send("You must be logged in to perform that action");
  } else {
    urlDatabase[randomString] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${randomString}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortId = req.params.id;
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send("You must be logged in to perform that action");
  }
  if (!urlDatabase[shortId]) {
    return res.status(400).send("This URL does not exist");
  }
  if (urlDatabase[shortId].userID !== req.session.user_id) {
    return res.status(403).send("403 error ! This is not your URL");
  }
  delete urlDatabase[shortId];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  const longURL = req.body.longURL;
  if (!users[req.session.user_id]) {
    return res.status(401).send("Please log in to perform that action");
  }
  if (!urlDatabase[shortId]) {
    return res.status(404).send("This TinyURL does not exist");
  }
  if (req.session.user_id !== urlDatabase[shortId].userID) {
    return res.status(401).send("This TinyURL does not belong to you");
  }
  console.log("This is longURL ", longURL);
  urlDatabase[shortId].longURL = longURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUserID = generateRandomString(6);
  const user = {
    id: newUserID,
    email: email,
    password: hashedPassword,
  };
  if (!email || !hashedPassword) {
    return res.status(400).send("Email and/or password missing");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("This email is already registered");
  }

  users[newUserID] = user;
  console.log("This is new :" + newUserID);
  req.session.user_id = newUserID;
  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      const user_id = user.id;
      // set cookie with user id
      req.session.user_id = user_id;
      return res.redirect("/urls");
    } else {
      return res.status(403).send("403 Forbidden: Wrong Password");
    }
  } else {
    return res.status(403).send("403 Forbidden : Please Register");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
