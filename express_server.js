const helpers = require('./helpers')

const morgan = require('Morgan');
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'cookiemonster',
  keys: ['omnom', 'extranom']
}))
app.use(morgan('dev'));

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
    email: "help@whatever.com",
    password: "ifuckedupthebrownies",
  },
  userID2: {
    id: "userID2",
    email: "user2@example.com",
    password: "christonacracker",
  },
};

//helper functions
// function generateRandomString() {
//   let randomString = '';
//   let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   for (let i = 0; i < 6; i++) {
//     randomString += characters.charAt(
//       Math.floor(Math.random() * characters.length)
//       );
//     }
//     return randomString;
//   }

//   const helpers.findEmail = function(user, email) {
//     for (let key in user) {
//       if (user[key].email === email) {
//         return users[key]
//       }
//     }
//     return false
//   };
  
//   const helpers.validTinyURL = function(input, database) {
//     for (let key in database) {
//       if (key === input) {
//         return true
//       }
//     }
//     return false
//   }

//   const urlsForUser = function(user, database) {
//     const userURL = {};
//     for(let key in database) {
//       if (database[key].userID === user) {
//         userURL[key] = database[key]
//     }
//   }
//   return userURL;
// }

  
  //ROUTES
  app.post('/urls/:id/delete', (req, res) => {
    const smallURL = req.params.id
    if(!urlDatabase[req.params.id]) {
      return res.send('Invalid ID.')
    }
    if (!req.session.user_id) {
      return res.send('Please log in.')
    }
    if (req.session.user_id !== urlDatabase[smallURL].userID) {
      return res.send('You don\'t have access to this page.')
    }
    delete urlDatabase[req.params.id]
    res.redirect('/urls');
  });
  
  app.post('/urls/:id', (req, res) => {
    let longURL = req.body.longURL
    let smallURL = req.params.id
    if (!req.session.user_id) {
      return res.send('Please log in.')
    }
    if(!urlDatabase[req.params.id]) {
      return res.send('Invalid ID.')
    }
    if (req.session.user_id !== urlDatabase[smallURL].userID) {
      return res.send('You don\'t have access to this page.')
    }
    urlDatabase[req.params.id].longURL = longURL
    res.redirect("/urls");
  });
  
  app.get("/urls", (req, res) => {
    if (!req.session.user_id) {
      return res.redirect("/login")
    }
    const templateVars = {
      urls: helpers.urlsForUser(req.session['user_id'], urlDatabase),
      user: users[req.session['user_id']]
      };
    res.render("urls_index", templateVars);
  });
  
  app.get("/urls/new", (req, res) => {
    if (!req.session.user_id) {
      return res.redirect("/login")
    }
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session['user_id']]
    };
    res.render("urls_new", templateVars);
  });
  
  app.get("/register", (req, res) => {
    if (req.session.user_id) {
      return res.redirect("/urls")
    }    
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session['user_id']]
    };
    res.render("urls_register", templateVars);
  });
  
  app.get('/login', (req, res) => {
    if (req.session.user_id) {
      return res.redirect("/urls")
    }  
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session['user_id']]
    };
    res.render('urls_login', templateVars);
  });
  
  app.post('/login', (req,res) => {
    let email = req.body.email;
    let password = req.body.password;
    let user = helpers.findEmail(users, email)
    console.log('user:', user)
    let userID = user.id
    if (!email || !password) {
      return res.status(400).send('Email and password need to be defined.')
    }
    if (!helpers.findEmail(users, email)) {
      return res.status(403).send(`Account with ${email} does not exist.`);
    } else if (!bcrypt.compareSync(password, users[userID].password)) {
      return res.status(403).send('Email and/or password is incorrect, please try again!')
    }

      req.session.user_id = user.id
      return res.redirect('/urls')
    });
  
  app.post("/logout", (req,res) => {
    delete req.session.user_id
    res.redirect('/urls');
  });
  
  app.get("/urls/:id", (req, res) => {
    if (!helpers.validTinyURL(req.params.id, urlDatabase)) {
      return res.send('Invalid tinyurl.')
    }
    if (req.session.user_id !== urlDatabase[req.params.id].userID) {
      return res.send('You don\'t have access to this page.')
    }
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: users[req.session["user_id"]]
      };
      res.render("urls_show", templateVars);
    });
    
    
    
    app.post("/urls", (req, res) => {
      if (!req.session.user_id) {
        return res.send('Please log in.')
      }
      const id = helpers.generateRandomString();
      urlDatabase[id] = {
        longURL: req.body.longURL,
        userID: req.session['user_id']
      }
      console.log('urlDatabase:', urlDatabase)
      res.redirect(`/urls/${id}`);
    });
    
    app.post("/register", (req, res) => {
      const id = helpers.generateRandomString();
      let email = req.body.email;
      let password = req.body.password;
      if (!email || !password) {
        return res.status(400).send('Email and password need to be defined.')
      }
      if (helpers.findEmail(users, email)) {
        return res.status(400).send(`${email} already exists`)
      } else {
      bcrypt.genSalt(10)
      .then((salt) => {
        return bcrypt.hash(password, salt);
      })
      .then((hash) => {
        console.log(users)
        users[id] = {
          id: id,
          email: email,
          password: hash
        };
        req.session.user_id = id
        res.redirect("/urls");
      })
    }
  });

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    return res.status(404).send('Invalid URL.')
  }
  res.redirect(longURL.longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




