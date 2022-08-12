const morgan = require('Morgan');
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ481W"
  },
    "9sm5xK": {
      longURL: "http://www.google.com",
      userID: "a5644",
  }
};

const users = {
  aJ481w: {
    id: "aJ481w",
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

  const findEmail = function(user, email) {
    let emailInput = false;
    for (let key in user) {
      if (users[key].email === email) {
        return users[key]
      }
    }
    return emailInput;
  };
  
  const findPassword = function(user, password) {
    let passwordInput = false;
    for (let key in user) {
      if (users[key].password === password) {
        passwordInput = true;
      }
    }
    return passwordInput;
  };
  
  const validTinyURL = function(input, database) {
    let shortID = false
    for (let key in database) {
      if (key === input) {
        return shortID = true
      }
    }
    return shortID
  }

  const findUserURL = function(id) {
    let userNum = {}
    for (key in urlDatabase) {
      if (urlDatabase[key].userID === id) {
        userNum[key] = urlDatabase[key]
      }
    }
    return userNum
    }

  
  //ROUTES
  app.post('/urls/:id/delete', (req, res) => {
    console.log('delete route id:', req.params.id);
    let user = req.cookies['user_id']
    letsmallURL = ''
    let urls = findUserURL(req.cookies['user_id'])
    for (let key in urls) {
      smallURL = key
    }
    console.log(urlDatabase[smallURL])
    delete urlDatabase[smallURL]
    res.redirect('/urls');
  });
  
  app.post('/urls/:id', (req, res) => {
    let user = req.cookies['user_id']
    let longURL = req.body.longURL
    let smallURL = ''
    let urls = findUserURL(req.cookies['user_id'])
    for (let key in urls) {
      smallURL = key
    }
    if (!req.cookies['user_id']) {
      return res.send('You don\'t have permission to edit this link.')
    }
    urlDatabase[smallURL].longURL = longURL
    res.redirect("/urls");
  });
  
  app.get("/urls", (req, res) => {
    if (!req.cookies["user_id"]) {
      res.redirect("/login")
    }
    let smallURL = ''
    let urls = findUserURL(req.cookies['user_id'])
    for (let key in urls) {
      smallURL = key
    }
    const templateVars = {
      id: smallURL,
      urls: urls,
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_index", templateVars);
  });
  
  app.get("/urls/new", (req, res) => {
    if (!req.cookies["user_id"]) {
      res.redirect("/login")
    }
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
  });
  
  app.get("/register", (req, res) => {
    if (req.cookies["user_id"]) {
      res.redirect("/urls")
    }     
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_register", templateVars);
  });
  
  app.get('/login', (req, res) => {
    if (req.cookies["user_id"]) {
      res.redirect("/urls")
    }  
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies['user_id']]
    };
    res.render('urls_login', templateVars);
  });
  
  app.post('/login', (req,res) => {
    let email = req.body.email;
    let password = req.body.password;
    const user = findEmail(users, email)
    if (!findEmail(users, email)) {
      return res.status(403).send(`Account with ${email} does not exist.`);
    }
    if (!findPassword(users, password)) {
      return res.status(403).send('Email and/or password is incorrect, please try again!');
    }
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  });
  
  app.post("/logout", (req,res) => {
    res.clearCookie('user_id');
    res.redirect('/urls');
  });
  
  app.get("/urls/:id", (req, res) => {
    if (!validTinyURL(req.params.id, urlDatabase)) {
      return res.send('Invalid tinyurl.')
    }
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: users[req.cookies["user_id"]],
      };
      res.render("urls_show", templateVars);
    });
    
    
    
    app.post("/urls", (req, res) => {
      if (!req.cookies['user_id']) {
        res.send('Please log in.')
      }
      const id = generateRandomString();
      urlDatabase[id] = {
        longURL: req.body.longURL,
        userID: req.cookies['user_id']
      }
      console.log(req.params.longURL)
      res.redirect(`/urls/${id}`);
    });
    
    app.post("/register", (req, res) => {
      const id = generateRandomString();
      let email = req.body.email;
      let password = req.body.password;
      const user = {
        id: id,
        email: email,
        password: password
      }; 
      for (let key in users) {
        if (users[key].email === email)
        return res.status(400).send(`${email} already exists`);
      }
      users[id] = user;
      res.cookie('user_id', id);
      res.redirect("/urls");
    });
    
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL.longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






