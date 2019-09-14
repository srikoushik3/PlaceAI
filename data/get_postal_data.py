import pandas as pd 
import requests 
import os
import math

_API_KEY = os.getenv('GOOGLE_API_KEY')

def get_sri_data():
  postal_beg = ['K','L','M','N', 'P']
  postal_codes = []
  loc = []
  for prefix in postal_beg:
    df = pd.read_csv('%s_Postal.csv' % prefix)
    cur_postal_code = ''
    for i, row in df.iterrows():
      if cur_postal_code != row['FSA']:
        postal_codes.append(row['FSA'])
        loc.append(row['Place Name'])
      cur_postal_code = row['FSA']
  result_df = pd.DataFrame({'postal_code': postal_codes, 'place': loc})
  result_df.drop_duplicates('postal_code', inplace=True)
  result_df.to_csv('postal_code_loc.csv', index=False)
  return result_df

def get_radius_lat_long_info():
  df = pd.read_csv('postal_code_loc.csv')
  pd_raw_data = {'postal_code':[], 'place':[], 'lat': [], 'lng': [], 'radius': [], 'width': [], 'height': []}
  for i, row in df.iterrows():
    try:
      uri = 'https://maps.googleapis.com/maps/api/geocode/json'
      params = {'address': '%s, ON %s' % (row['place'], row['postal_code']),
                'key': _API_KEY}
      res = requests.get(url=uri, params=params)
      data = res.json() or {}
      if not data:
        continue
      results = data.get('results') or [{}]
      bounds = results[0].get('geometry', {}).get('bounds')
      if not bounds:
        continue
      northeast_bnd = bounds.get('northeast')
      southwest_bnd = bounds.get('southwest')
      
      center = results[0].get('geometry', {}).get('location')
      if not (center and northeast_bnd and southwest_bnd):
        continue
      R = 6371*1000 # in meters
      lat_diff = math.radians(northeast_bnd.get('lat') - southwest_bnd.get('lat'))
      lng_diff = math.radians(northeast_bnd.get('lng') - southwest_bnd.get('lng'))
      haversine = math.pow(math.sin(lat_diff/2),2) + math.cos(math.radians(northeast_bnd.get('lat')))*math.cos(math.radians(southwest_bnd.get('lat'))) * math.pow(math.sin(lng_diff/2),2)
      c = 2 * math.atan2(math.sqrt(haversine), math.sqrt(1-haversine))
      dist = c * R # in meters
      pd_raw_data['radius'].append(dist/2)
      pd_raw_data['postal_code'].append(row['postal_code'])
      pd_raw_data['place'].append(row['place'])
      pd_raw_data['lat'].append(center.get('lat'))
      pd_raw_data['lng'].append(center.get('lng'))
      pd_raw_data['width'].append(northeast_bnd.get('lng') - southwest_bnd.get('lng'))
      pd_raw_data['height'].append(northeast_bnd.get('lat') - southwest_bnd.get('lat'))
      print('Processed data for: (%s, %s), %s' %(row['postal_code'],row['place'], i))
    except Exception as e:
      print('Could not process data for: (%s, %s), Error: %s' %(row['postal_code'],row['place'], str(e)))
    result_df = pd.DataFrame(pd_raw_data)
    result_df.to_csv('geometry_information.csv', index=False)

if __name__ == '__main__':
  get_radius_lat_long_info()