const getUserByEmail = (email, users) => {
  for (let userID in users) {
    const userEmail = users[userID].email;
    if (userEmail === email) {
      return users[userID];
    }
  }
  return null;
};

module.exports =  getUserByEmail ;