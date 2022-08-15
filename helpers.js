

const findEmail = function(user, email) {
  for (let key in user) {
    if (user[key].email === email) {
      return user[key];
    }
  }
  return false;
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

  const validTinyURL = function(user, database) {
    for (let key in database) {
      if (key === user) {
        return true;
      }
    }
    return false;
  };
  
  const urlsForUser = function(user, database) {
    const userURL = {};
    for (let key in database) {
      if (database[key].userID === user) {
        userURL[key] = database[key];
      }
    }
    return userURL;
  };

module.exports = {
  findEmail,
  generateRandomString,
  validTinyURL,
  urlsForUser
};