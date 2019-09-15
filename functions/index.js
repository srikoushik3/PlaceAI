// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const cors = require('cors')({origin: true});  
var request = require('request');

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

function makeRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

// http://us-central1-hackthenorth.cloudfunctions.net/getOptimalPostalCodes?ageRangeLow=${data.ageRange[0]}&ageRangeHigh=${data.ageRange[1]}&incomeRangeLow=${data.incomeRange[0]}&incomeRangeHigh=${data.incomeRange[1]}&familySize=${data.familySize}
exports.getOptimalPostalCodes = functions.https.onRequest(async (req, res) => {
  postal_code_data = []
  let count = 1
  let ageRangeHigh = parseInt(req.query.ageRangeHigh)
  let ageRangeLow = parseInt(req.query.ageRangeLow)
  let incomeRangeLow = parseInt(req.query.incomeRangeLow)
  let incomeRangeHigh = parseInt(req.query.incomeRangeHigh)
  let avgAge = parseInt(ageRangeHigh + ageRangeLow)/2.0
  let avgIncome = parseInt(incomeRangeLow + incomeRangeHigh)/2.0
  let url = `http://evening-journey-71031.herokuapp.com/getPredictions?age=${avgAge}&income=${avgIncome}`
  console.log(url)
  let postal_codes = await makeRequest(url)
  postal_codes = JSON.parse(postal_codes)
  postal_codes = postal_codes['postal_codes']
  console.log(postal_codes)
  for(code of postal_codes){
    d = await get_data(code)
    if(!d){
      continue;
    }
    d['strength'] = count
    postal_code_data.push(d)
    count++
  }
  res.set('Access-Control-Allow-Origin', '*')
  res.send(JSON.stringify({'postal_code_data': postal_code_data}))
});

exports.getCompetitorData = functions.https.onRequest(async (req, res) => {
  fake_data = {heatMapData: {
    positions: [{
      lat: 43.8890,
      lng: -79.6441,
      weight: 1
    }, {
      lat: 43.8990,
      lng: -79.6241,
      weight: 0.3
    }, {
      lat: 43.9190,
      lng: -79.6341,
      weight: 1
    }, {
      lat: 43.9290,
      lng: -79.6541,
      weight: 0.4
    }, {
      lat: 43.8790,
      lng: -79.6441,
      weight: 0.2
    }, {
      lat: 43.8190,
      lng: -79.6341,
      weight: 0.4
    }, {
      lat: 43.9090,
      lng: -79.6241,
      weight: 0.9
    }]
  },competitorData: {
    positions: [{
      lat: 43.8890,
      lng: -79.6441,
      name: "C"
    }, {
      lat: 43.8990,
      lng: -79.6241,
      name: "B"
    }, {
      lat: 43.9190,
      lng: -79.6341,
      name: "A" }
    ]
  }
}
    res.send(JSON.stringify(fake_data))
});
