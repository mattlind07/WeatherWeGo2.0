# import statements
import pandas as pd
import requests
import time
import re
import geopandas as gpd
import numpy as np
from scipy.spatial import KDTree
from shapely.geometry import Point

# convert txt to csv
def txt_to_csv(txt_filepath, csv_filepath):
    try:
        df = pd.read_csv(txt_filepath, sep='\t')
        df.to_csv(csv_filepath, index=False)
        print(f"Successfully converted '{txt_filepath}' to '{csv_filepath}'")
    except FileNotFoundError:
        print(f"Error: File not found: '{txt_filepath}'")
    except Exception as e:
        print(f"An error occurred: {e}")

# file paths
txt_file = '2024_Gaz_place_national.txt'
csv_file = '2024_Gaz_place_national_processed.csv'
walk_file = 'EPA_SmartLocationDatabase_V3_Jan_2021_Final.csv'
processed_walk_file = 'walkability_index_processed.csv'
block_group_shape_file = 'cb_2022_us_bg_500k/cb_2022_us_bg_500k.shp'

# convert gazetter file from txt to csv
txt_to_csv(txt_file, '2024_Gaz_place_national_processed.csv')

# load city mapping data
df_gaz = pd.read_csv(csv_file, dtype={"GEOID": str, "NAME": str})
df_gaz.columns = df_gaz.columns.str.strip()

# load walkability data
df_walk = pd.read_csv(walk_file)

# generate 12 digit GEOID column
df_walk['GEOID_12digit'] = (
    df_walk['STATEFP'].astype(str).str.zfill(2) +
    df_walk['COUNTYFP'].astype(str).str.zfill(3) +
    df_walk['TRACTCE'].astype(str).str.zfill(6) +
    df_walk['BLKGRPCE'].astype(str).str.zfill(1)
)

# load shapefile
gdf = gpd.read_file(block_group_shape_file)
gdf = gdf.to_crs(epsg=3857)
gdf['centroid'] = gdf.geometry.centroid
gdf['LAT'] = gdf['centroid'].y
gdf['LON'] = gdf['centroid'].x

# merge walkability index and shapefile
df_walk = pd.merge(df_walk, gdf[['GEOID', 'LAT', 'LON']], left_on='GEOID_12digit', right_on='GEOID', how='left')

# Create geometry column for df_gaz using lat/lon
df_gaz['geometry'] = gpd.points_from_xy(df_gaz['INTPTLONG'], df_gaz['INTPTLAT'])
df_gaz = gpd.GeoDataFrame(df_gaz, geometry='geometry', crs="EPSG:4326")
df_gaz['LAT'] = df_gaz.geometry.y
df_gaz['LON'] = df_gaz.geometry.x

# convert to dictionary
city_lookup = df_gaz.set_index("GEOID")["NAME"].to_dict()
name_to_geoid = {v: k for k, v in city_lookup.items()}

# for not exact inputs
def fuzzy_place_lookup(place):
    for name in name_to_geoid:
        if place.lower() in name.lower():
            print(f"\nMatched input '{place}' to gazetteer name '{name}'\n"
                 "=======================================================================" \
                )
            df_gaz['GEOID'] = df_gaz['GEOID'].astype(str).str.zfill(7)
            geoid = str(name_to_geoid[name].zfill(7))
            return geoid
    print(f"No match found for '{place}'")
    return None

# get walkability from place
def get_walkability_from_place(place):
    place_geoid = fuzzy_place_lookup(place)
    if not place_geoid:
        print(f"No GEOID found for place name '{place}'")
        return None
    
    # get lat/lon of place
    row = df_gaz[df_gaz["GEOID"] == place_geoid]
    if row.empty:
        print(f"No row found for GEOID {place_geoid}")
        return None
    
    # if no lat/lon is found
    row_data = row.iloc[0]
    if 'LAT' not in row_data or pd.isna(row_data['LAT']) or pd.isna(row_data['LON']):
        print(f"No lat/lon found for GEOID {row_data.get('GEOID_12digit', 'unknown')}")
        return None

    lat, lon = row_data["LAT"], row_data["LON"]
    place_point = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326").to_crs(epsg=3857).iloc[0]

    # find nearest centroid
    nearest = gdf.geometry.distance(place_point).idxmin()
    nearest_geoid = gdf.loc[nearest, 'GEOID']
    walkability = df_walk[df_walk['GEOID_12digit'] == nearest_geoid]

    print(f"nearest block group to '{place}' is {nearest_geoid}")
    if not walkability.empty:
        nat_walk_ind = walkability.iloc[0]['NatWalkInd']
        print(f"walkability index (NatWalkInd): {nat_walk_ind}")
    else:
        print("no walkability data found for this block group")