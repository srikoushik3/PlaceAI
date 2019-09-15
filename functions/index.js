// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const cors = require('cors')({origin: true});  
var request = require('request');
var appendQuery = require('append-query');

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

async function getCompetitorInfo(postal_code, category){
  let data = await get_data(postal_code)
  let params = {
    center: `${data['lat']},${data['lng']}`,
    distance: data['radius'],
    categories : [category],
    fields:'location,about,name',
    type:'place',
    access_token:'701461230329751|6f459631352c8c79a445adf906750d94'
  }
  let url = appendQuery('https://graph.facebook.com/search?', params)
  let body = await makeRequest(url)
  body = JSON.parse(body)
  let graph_data = body['data']
  if (!graph_data){
    graph_data = []
  }
  let competitor_info = []
  for(loc of graph_data){
    let tmp_obj = {}
    location_info = loc['location']
    if(!location_info){
      location_info = {}
    }
    tmp_obj['lat'] = location_info['latitude']
    tmp_obj['lng'] = location_info['longitude']
    tmp_obj['name'] = loc['name']
    competitor_info.push(tmp_obj)
  }
  return competitor_info
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
  let bt = req.query.businessType
  let postal_code = req.query.postal_code
  compData = await getCompetitorInfo(postal_code, bt)
  return_data = {
    heatMapData: [
      {
        "lat": 43.889,
        "lng": -79.6441,
        "weight": 1
      },
      {
          "lat": 43.899,
          "lng": -79.6241,
          "weight": 0.3
      },
      {
          "lat": 43.919,
          "lng": -79.6341,
          "weight": 1
      },
      {
          "lat": 43.929,
          "lng": -79.6541,
          "weight": 0.4
      }
    ],
    competitorData: compData
  }
  res.set('Access-Control-Allow-Origin', '*')
  res.send(JSON.stringify(return_data))
});

exports.getTDdata = functions.https.onRequest(async (req, finalRes) => {
  const accId = "544853ae-f9f3-4145-b11d-00347b932808"
  axios.get(`https://api.td-davinci.com/api/accounts/${accId}`, 
  {
    headers: {
      "AuthorizationKey": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJDQlAiLCJ0ZWFtX2lkIjoiMjg1MGE2NTYtODc3MC0zY2IxLWFhODAtYTJiOTIyOWMwYjZjIiwiZXhwIjo5MjIzMzcyMDM2ODU0Nzc1LCJhcHBfaWQiOiI4YzJiMzRjNi1kYjJjLTRiOTctYTE1Mi1hMjBkZjI4N2U5NmIifQ.6zCMQ0r5a-Wv4vS0tlZi6WOAkeKwKrXnA-T62yzP7eI"
    }
  }).then(res => {
       finalRes.send(res)
     
  });
});

