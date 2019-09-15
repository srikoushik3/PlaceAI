const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');
var appendQuery = require('append-query');
var request = require('request');


let serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

let docRef = db.collection('PostalCodes');
let compData = db.collection('PostalCodes');
data = []

// fs.createReadStream('./geometry_information.csv')
//   .pipe(csv())
//   .on('data', async function(row) {
//     data.push(row)
//   })
//   .on('end', () => {
//     data.forEach(async (row) => {
//       data = {
//         place: row['place'],
//         lat: parseFloat(row['lat']),
//         lng: parseFloat(row['lng']),
//         radius: parseFloat(row['radius']),
//         width: parseFloat(row['width']),
//         height: parseFloat(row['height']),
//         postal_code: row['postal_code']
//       }
//       let setDoc = await db.collection('PostalCodes').doc(row['postal_code']).set(data);
//     });
  // });

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
    console.log(url)
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
      tmp_obj['checkins'] = loc['checkins']
      competitor_info.push(tmp_obj)
    }
    console.log(competitor_info)
    competitor_info['postal_code'] = postal_code
    let dataRef = await compData.doc(postal_code).doc(category).set({'competitor_data': competitor_info});
    return competitor_info
  }

  


  let comp_info = getCompetitorInfo('P3E', 'SHOPPING_RETAIL')