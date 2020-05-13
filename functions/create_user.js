// this admin object give me acces to the Service Account
const admin = require('firebase-admin');

module.exports = function (req, res) {
  // Verify the user provided a phone
  if (!req.body.phone) {
    return res.status(422).send({ error: 'Bad input!' });
  }

  // Format the phone number to remove dashes and parens
  // String return number into string
  const phone = String(req.body.phone).replace(/[^\d]/g, '');

  //  Create a new user account using that phone number

  admin
    .auth()
    // create new user object,phone object will be the unique id as well
    .createUser({ uid: phone })
    .then((user) => res.send(user))
    .catch((err) => res.satus(422).send({ error: err }));

  // Respond to the user request, saying the account was made
};
