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
  console.log("String:" , ans)
  return ans;
};

const getUserByEmail = (email, users) => {
  for (let userID in users) {
    const userEmail = users[userID].email;
    if (userEmail === email) {
      return users[userID];
    }
  }
  return null;
};

//userID is equal to the id of the currently logged-in user
function urlsForUser(id, urlDatabase){
  //create a resulting database object
  let result = {};
  // scan the urlDatabase
  for (let key in urlDatabase) {
    // if userID(urlDatabase) = id
    if (urlDatabase[key].userID === id) {
      //push object into resulting database
      result[key] = urlDatabase[key];
    }
  }
  return result;
};

module.exports =  {getUserByEmail, generateRandomString, urlsForUser} ;