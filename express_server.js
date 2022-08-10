const morgan = require('Morgan')
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  // console.log("urls_new");
  //request: asking for form response: getting it back
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id]
  }
  console.log(urlDatabase)
  console.log(templateVars)
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL
  console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id/delete', (req, res) => {
  console.log('delete route id:', req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  let longURL = req.body.longURL
  let shortURL = req.params.id
  urlDatabase[shortURL] = longURL
  res.redirect("/urls")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});