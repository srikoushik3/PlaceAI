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
    console.log(data);
    data.forEach(e => {
      data = {
        place: row['place'],
        lat: row['lat'],
        lng: row['lng'],
        radius: row['radius'],
        width: row['width'],
        height: row['height']
      }
      let setDoc = await db.collection('PostalCodes').doc(row['postal_code']).set(data);
    });
  });