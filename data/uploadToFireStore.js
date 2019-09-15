const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');

let serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

let docRef = db.collection('PostalCodes');
data = []

fs.createReadStream('./geometry_information.csv')
  .pipe(csv())
  .on('data', async function(row) {
    data.push(row)
  })
  .on('end', () => {
    data.forEach(async (row) => {
      data = {
        place: row['place'],
        lat: parseFloat(row['lat']),
        lng: parseFloat(row['lng']),
        radius: parseFloat(row['radius']),
        width: parseFloat(row['width']),
        height: parseFloat(row['height']),
        postal_code: row['postal_code']
      }
      let setDoc = await db.collection('PostalCodes').doc(row['postal_code']).set(data);
    });
  });
