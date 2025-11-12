const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected');
  mongoose.connection.db.collection('users').updateOne(
    { documentNumber: '1036518830' },
    { $set: { password: '$2b$10$gmegLWeqfgT1w.q5Xa4u6OVTce51vSRkLjg99i.7lmC8GASvBVl.K' } }
  ).then(result => {
    console.log('Update result:', result);
    process.exit(0);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
