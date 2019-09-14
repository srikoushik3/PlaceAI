import pandas as pd 

def get_sri_data():
  postal_beg = ['K','L','M','N', 'P']
  postal_codes = []
  places = []
  for prefix in postal_beg:
    df = pd.read_csv('%s_Postal.csv' % prefix)
    cur_postal_code = ''
    for i, row in df.iterrows():
      if row['FSA'] != cur_postal_code:
        postal_codes.append(row['FSA'])
        places.append(row['Place Name'])
      cur_postal_code = row['FSA']
  result_df = pd.DataFrame({'postal_codes': postal_codes, 'places': places})
  result_df.reset_index().to_csv('postal_code_data.csv', index=False)

if __name__ == '__main__':
  get_sri_data()