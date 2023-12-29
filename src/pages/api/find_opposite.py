from scipy.spatial.distance import cosine
import pandas as pd 
import sys
import json
import os 

def find_opposite(artist_ids, df, n=5):
    """
    Find n artists that are most opposite in audio features to the given artist.
    
    Args:
    - artist_ids (list): List of artist ids.
    - df (DataFrame): Dataframe with average audio features.
    - n (int): Number of opposite artists to return.
    
    Returns:
    - list: A list of n artists that are most opposite to the given artist.
    """
    
    # Ensure 'artist_id' is the index, but only set it once
    all_opposites = []

    for artist_id in artist_ids:
        if artist_id not in df.index:
            # print(f"Artist '{artist_id}' not found in dataframe.")
            # load_single_artist(artist_id,)  # Uncomment if this function exists and is required
            continue

        # Get the features of the specified artist
        artist_features = df.loc[artist_id]

        # Scale features
        scaled_df = (df - df.min()) / (df.max() - df.min())
        scaled_features = (artist_features - df.min()) / (df.max() - df.min())

        # Compute cosine distances
        def calculate_distance(x):
            try:
                return cosine(x.values, scaled_features.values)
            except:
                return float('inf')  # Assigning a large value for invalid rows; they won't be chosen as most opposite

        distances = scaled_df.apply(calculate_distance, axis=1)

        # Get the top n artists with the highest cosine distance (i.e., most opposite)
        opposites = distances.nsmallest(n).index.tolist()
        all_opposites.append(set(opposites))

    try: 
        intersection_of_opposites = set.intersection(*all_opposites)
        return list(intersection_of_opposites)
    except: 
        raise TypeError('No opposites found for intersection')


# Import necessary modules and define the find_opposite function here

if __name__ == '__main__':
    artist_ids = json.loads(sys.argv[1])
    # df_data = json.loads(sys.argv[2])
    # n = int(sys.argv[3])

    # Get the directory of the current script
    script_dir = os.path.dirname(__file__)

    # Construct the absolute path to the CSV file
    csv_file_path = os.path.join(script_dir, 'artist_avg_features.csv')

    df = pd.read_csv(csv_file_path, on_bad_lines='skip')
    # Rest of your code
    if df.index.name != 'artist_id':
        df.set_index('artist_id', inplace=True)

    # Convert df_data to a DataFrame, perform computations and get results
    result = find_opposite(artist_ids, df)

    print(json.dumps(result))  # Output the result as a JSON string