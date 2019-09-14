// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

let db = admin.firestore();

async function get_data(postal_code){
  let postalCodesRef = db.collection('PostalCodes');
  let query = await postalCodesRef.where('postal_code', '==', postal_code).get(); 
  docs = []
  for (doc of query.docs) {
    return new Promise(async (resolve, reject) => {
      resolve(doc.data())
    })
  }
}

exports.getOptimalPostalCodes = functions.https.onRequest(async (req, res) => {
  if (req.method != "POST") {
    respond.status(400).send("Invalid Request");
    return;
  }
  postal_codes = ['KOA', 'K0B', 'L5M', 'L8L', 'L8M', 'L9T', 'K1C', 'M4B', 'M4C', 'M4G']
  postal_code_data = []
  for(code of postal_codes){
    d = await get_data(code)
    console.log(d)
    postal_code_data.push(d)
  }
  res.send(JSON.stringify({'postal_code_data': postal_code_data}))
});
