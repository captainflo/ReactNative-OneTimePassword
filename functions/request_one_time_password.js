const admin = require('firebase-admin');
const twilio = require('./twilio');

module.exports = function (req, res) {
  if (!req.body.phone) {
    return res.status(422).send({ error: 'you must provide phone number' });
  }

  // Regex : take out any chractere is not digit
  const phone = String(req.body.phone).replace(/[^\d]/g, '');

  // fetch user
  admin
    .auth()
    .getUser(phone)
    .then((userRecord) => {
      // Generate Code
      const code = Math.floor(Math.random() * 8999 + 1000);
      // Send Text Message
      twilio.messages.create(
        {
          body: 'Tour code is ' + code,
          to: phone,
          from: '+14752566918',
        },
        (err) => {
          if (err) {
            return res.status(422).send(err);
          }
          // Save code to user
          //  Because firebase don't allow you to create a new propreties on auth, so we will create a new collection on database
          // ".ref('users/' + phone)" : we are creating a new collection users and we add a new entre is equal to phone number
          admin
            .database()
            .ref('users/' + phone)
            // So we update the data we want to pass
            .update({ code: code, codeValid: true }, () => {
              res.send({ success: true });
            });
        }
      );
      return null;
    })
    .catch((err) => {
      res.status(422).send({ error: err });
    });
};
