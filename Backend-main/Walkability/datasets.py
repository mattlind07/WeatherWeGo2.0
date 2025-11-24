# import necessary libraries
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from tqdm import tqdm

# file paths
txt_file = '2024_Gaz_place_national.txt' # raw gazetteer data
csv_file = '2024_Gaz_place_national_processed.csv' # processed gazetteer file path
walk_file = 'EPA_SmartLocationDatabase_V3_Jan_2021_Final.csv' # raw walkability data
block_group_shape_file = 'cb_2022_us_bg_500k/cb_2022_us_bg_500k.shp' # block group shapefile path
output_file = 'city_walkability_data.csv' # final output file path

# step 1: convert txt to csv for easier processing
def txt_to_csv(txt_filepath, csv_filepath):
    df = pd.read_csv(txt_filepath, sep='\t')
    df.to_csv(csv_filepath, index=False)
    print(f"Converted '{txt_filepath}' to '{csv_filepath}'")
txt_to_csv(txt_file, csv_file)

# step 2: load and preprocess data
df_gaz = pd.read_csv(csv_file, dtype={"GEOID": str, "NAME": str})
df_gaz.columns = df_gaz.columns.str.strip()
df_walk = pd.read_csv(walk_file)

# step 2a: add a 12 digit geoid to match glock group data
df_walk['GEOID_12digit'] = (
    df_walk['STATEFP'].astype(str).str.zfill(2) +
    df_walk['COUNTYFP'].astype(str).str.zfill(3) +
    df_walk['TRACTCE'].astype(str).str.zfill(6) +
    df_walk['BLKGRPCE'].astype(str).str.zfill(1)
)

# step 2b: load block group shapefile and compute centroids
gdf_blocks = gpd.read_file(block_group_shape_file)
gdf_blocks = gdf_blocks.to_crs(epsg=3857)  # project to meters for distance calculations
gdf_blocks['centroid'] = gdf_blocks.geometry.centroid
gdf_blocks['LAT'] = gdf_blocks['centroid'].y
gdf_blocks['LON'] = gdf_blocks['centroid'].x

# step 2c: merge block group centroids with walkability data using geoid
df_walk = pd.merge(df_walk, gdf_blocks[['GEOID', 'LAT', 'LON']], left_on='GEOID_12digit', right_on='GEOID', how='left')

# step 4: prepare gazetteer data for spatial join with geometry
df_gaz['geometry'] = gpd.points_from_xy(df_gaz['INTPTLONG'], df_gaz['INTPTLAT'])  # EPSG:4326
df_gaz = gpd.GeoDataFrame(df_gaz, geometry='geometry', crs="EPSG:4326").to_crs(epsg=3857)
df_gaz['LAT'] = df_gaz.geometry.y
df_gaz['LON'] = df_gaz.geometry.x

# step 4a: rename columns for clarity
gdf_blocks = gdf_blocks[['GEOID', 'geometry']].rename(columns={
    'GEOID': 'GEOID_bg',
    'geometry': 'block_geom'
})
gdf_blocks = gdf_blocks.set_geometry("block_geom")

# step 4b: select relevant columns from gazetteer data
gdf_cities = df_gaz[['NAME', 'USPS', 'GEOID', 'LAT', 'LON', 'geometry']]
gdf_cities = gpd.GeoDataFrame(gdf_cities, geometry='geometry', crs="EPSG:3857")

# step 5: perform spatial join to find nearest block group for each city
gdf_cities = gpd.sjoin_nearest(gdf_cities, gdf_blocks, how="left", max_distance=50000, distance_col='dist_m')

# step 6: merge walkability data with nearest block group data
df_walk = df_walk.drop(columns=['LAT', 'LON'], errors='ignore')
df_result = pd.merge(gdf_cities, df_walk, left_on='GEOID_bg', right_on='GEOID', how='left')
print(df_result.columns)

# step 7: clean up and finalize the result
df_result_final = df_result[[
    'NAME', 'USPS', 'GEOID_bg', 'LAT', 'LON', 'GEOID_y', 'NatWalkInd'
]].rename(columns={
    'NAME': 'city', # city name
    'USPS': 'state', # state abbreviation
    'GEOID_bg': 'city_geoid', # matched block geoid
    'GEOID_y': 'nearest_bg_geoid', # geoid of the nearest block group
    'NatWalkInd': 'walkability_index' # walkability index (0-20)
})

print("City-walkability matching completed successfully") 

# step 8: export the final result to csv
df_result_final.to_csv(output_file, index=False)
print(f"Exported city-walkability data to '{output_file}'")
