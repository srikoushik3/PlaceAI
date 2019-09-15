import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist

plt.rcParams['figure.figsize'] = (16, 9)
plt.style.use('ggplot')

df = pd.read_csv("../data/ontario_demographics.csv")

print(df.head())
# drop rows with any empty cells
df.dropna(axis=0, how='any', thresh=None, subset=None, inplace=True)

feat_loc = dict()

for index, row in df.iterrows():
    key = str(round(float(row['age']))) + str(round(float(row['income'])))
    # ignore duplicate points with exact same features and different location
    if not (key in feat_loc):
        feat_loc[str(key)] = row['pcode']

# visualize the age-income data - scatter plot
#f1 = df['age'].values
#f2 = df['income'].values
f1 = np.array(df['age'], dtype=np.float32)
f2 = np.array(df['income'], dtype=np.float32)

X = np.array(list(zip(f1, f2)))
plt.scatter(f1, f2, c='black', s=7)

plt.savefig('test.png')
plt.clf()

# create a clustering model with two dimensions (age and income)
CLASS_NUM = 3
kmeans = KMeans(n_clusters=CLASS_NUM, random_state=0).fit(X)
print(kmeans.labels_)

centroids = kmeans.cluster_centers_
print(centroids)

plt.scatter(f1, f2, c= kmeans.labels_.astype(float), s=50, alpha=0.5)
plt.scatter(centroids[:, 0], centroids[:, 1], c='red', s=50)
plt.savefig('clusters.png')

# 2D array of size [clusters, 20] - 20 is the number of postal codes returning
# map of cluster_id : array of 3-tuples (eucld_dist, age_value, income_value)
dist_map = dict()

# find the distance from each point in a cluster to its centroid
# keep track of index of each point
for ind, age_value, income_value in zip(kmeans.labels_, f1, f2):
    # ind: is the class of that point
    cur_class_ctr = centroids[ind]
    # distance between the class ctr and the current point
    eucld_dist = cdist([[age_value, income_value]], [cur_class_ctr])[0][0]

    if not (ind in dist_map):
        dist_map[ind] = [[eucld_dist, age_value, income_value]]
    else:
        dist_map[ind].append([eucld_dist, age_value, income_value])

    dist_map[ind].sort(key=lambda tup: tup[0])

# predict the value (get the index of the cluster the prediction belongs to)

input_array = np.array([[41.9, 32512]])
print(input_array.shape)

predicted_class = kmeans.predict(input_array)

print(predicted_class)

print('printing dict')
print(feat_loc)

# return the postal codes of the top 20 points
top_20_zipcodes = []
for index in range(CLASS_NUM):
    if index in dist_map:
        point_tuple = np.array(dist_map[index])
        print("shape of point_tuple: ", point_tuple.shape)
        all_features = point_tuple[:20, 1:]
        print("shape of all_features: ", all_features.shape)
        print(all_features[0])
        concat_feat = ""
        for feat in all_features:
            for value in feat:
                concat_feat += str(round(float(value)))
            top_20_zipcodes.append(feat_loc[concat_feat])
            concat_feat = ""

print(top_20_zipcodes)
