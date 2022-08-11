const morgan = require('Morgan')
const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
const PORT = 8080; // default port 8080

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userID: {
    id: "userID",
    email: "user@example.com",
    password: "iburntthebrownies",
  },
  userID2: {
    id: "userID2",
    email: "user2@example.com",
    password: "christonacracker",
  },
};

function generateRandomString() {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length)
      );
    }
    return randomString;
  }
  
  //ROUTES
  app.post('/urls/:id/delete', (req, res) => {
    console.log('delete route id:', req.params.id);
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  });

  app.get("/urls", (req, res) => {
  const id = req.cookies['user_id']
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  }
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_register", templateVars)
})

app.post('/urls/:id', (req, res) => {
  let longURL = req.body.longURL
  let shortURL = req.params.id
  urlDatabase[shortURL] = longURL
  res.redirect("/urls")
})

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_show", templateVars)
});

app.post("/login", (req,res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls")
})

app.post("/logout", (req,res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
})

app.post("/register", (req, res) => {
  const id = generateRandomString()
  let email = req.body.email
  let password = req.body.password
  const user = {id: id, email: email, password: password}
  for (let key in users) {
    console.log(users[key].email)
    if (req.body.email === users[key].email) {
      res.status(400).send('Email already exists.')
    }
  }
  users[id] = user

  res.cookie('user_id', id)
  res.redirect("/urls")
});


app.post("/urls", (req, res) => {
  let longURL = req.body.longURL
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL
  console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






