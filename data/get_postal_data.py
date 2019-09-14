import pandas as pd 

def get_sri_data():
  postal_beg = ['K','L','M','N', 'P']
  postal_codes = set()
  for prefix in postal_beg:
    df = pd.read_csv('%s_Postal.csv' % prefix)
    cur_postal_code = ''
    for i, row in df.iterrows():
      postal_codes.add(row['FSA'])
  postal_codes = list(postal_codes)
  result_df = pd.DataFrame({'postal_codes': postal_codes})
  result_df.reset_index().to_csv('postal_code_data.csv', index=False)

if __name__ == '__main__':
  get_sri_data()