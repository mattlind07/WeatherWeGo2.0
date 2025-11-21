# UPDATE 4/15

# TO DO

~~1. upload walkability index~~

~~2. upload gazetter place file~~

~~3. run and see the current workings of pulling from the datasets~~

~~4. fix any bugs~~

~~5. verify that it works properly and grabs the correct data and is works for majority of cities~~

6. if time: try to get it on front end, sorting function, compare mode

# ! NOTES !

## FEATURES
- converts gazetter file from txt to csv
- reads and merges location database with walkability data
- calculates geographic centroids from block group shapefiles
- matches user input city names to coordinates
- finds the nearest block group using spatial distance
- returns the row from the walkability data associated with the city

## GETTING STARTED

### DATA SOURCE
- [U.S. Census Gazetteer Files (2024)](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html)
- [EPA Smart Location Database](https://www.epa.gov/smartgrowth/smart-location-mapping#SLD)
- [TIGER/Line Shapefiles](https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html)

### PREREQUISITES
- python
- pandas
- numpy
- geopandas
- shapely
- scipy
- requests

install using
```bash
pip install -r requirements.txt
```

make sure you have the following datasets in the project directory
- 2024_Gaz_place_national.txt
- EPA_SmartLocationDatabase_V3_Jan_2021_Final.csv
- cb_2022_us_bg_500k/

run in terminal
```bash
python datasets.py
```

try city lookups by editing datasets.py and adding at the end for example
```python
get_walkability_from_place("Houston")
```

example output
```bash
Matched input 'Houston' to gazetteer name 'Houston city'
=======================================================================
nearest block group to 'Houston' is 482015104001
walkability index (NatWalkInd): 16.83333333
```