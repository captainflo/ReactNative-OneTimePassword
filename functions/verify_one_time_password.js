const admin = require('firebase-admin');
const twilio = require('./twilio');

module.exports = function (req, res) {
  if (!req.body.phone || !req.body.code) {
    return res.status(422).send({ error: 'Phone and code must be provided' });
  }
  const phone = String(req.body.phone).replace(/[^\d]/g, '');
  const code = parseInt(req.body.code);

  // Fetching user
  admin
    .auth()
    .getUser(phone)
    .then(() => {
      // Look at users collection where is the value of this phone number
      // snapshot is all my key and value inside my user
      const ref = admin.database().ref('users/' + phone);

      ref.on('value', (snapshot) => {
        // dont aptempt to listen for anymore values changing , Stop listening
        ref.off();
        const user = snapshot.val();
        // if user code is note equal to code I send it
        if (user.code !== code || !user.codeValid) {
          return res.status(422).send({ error: 'Code not valid' });
        }
        // if yes : update codeValid to false
        ref.update({ codeValid: false });
        // Generate Token
        // to generate the token you have to pass the id in our case it's the phone number
        admin
          .auth()
          .createCustomToken(phone)
          .then((token) => res.send({ token: token }));
      });
    })
    .catch((err) => res.status(422).send({ error: err }));
};
