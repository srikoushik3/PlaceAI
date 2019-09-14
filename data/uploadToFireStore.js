const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');

let serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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


async function test(){
  postal_codes = ['KOA', 'K0B', 'L5M', 'L8L', 'L8M', 'L9T', 'L9V', 'M4B', 'M4C', 'M4G']
  postal_code_data = []
  for(code of postal_codes){
    d = await get_data(code)
    postal_code_data.push(d)
  }
  console.log(postal_code_data)
}
test()