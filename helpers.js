// const getUserByEmail = (email, users) => {
//   Object.values(users).find((user) => user.email === email);
//   return user;
// };

const getUserByEmail = (email, users) => {
  for (userID in users) {
    const userEmail = users[userID].email;
    if (userEmail === email) {
      return users[userID];
    }
  }
  return null;
};

module.exports = { getUserByEmail };
