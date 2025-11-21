import React, { useState } from "react";

const Top_Cities = () => {
  // State to store selected filter
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Function to handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    // You can fetch or filter data based on the selected filter
    // For example, you could call an API or filter a list of cities here
  };

  return (
    <div className="main">
      <h1 className="hero__heading">Top Cities</h1>
      <div className="main__container">
        <div className="main__content">
          {/* Dropdown selector */}
          <div className="dropdown">
            <input type="checkbox" id="touch" />
            <label htmlFor="touch">
              <span>Choose filter</span>
            </label>

            <ul className="slide">
              <li>
                <a
                  href="#"
                  data-filter="overall"
                  onClick={() => handleFilterChange("overall")}
                >
                  Overall
                </a>
              </li>
              <li>
                <a
                  href="#"
                  data-filter="walkable"
                  onClick={() => handleFilterChange("walkable")}
                >
                  Walkability
                </a>
              </li>
              <li>
                <a
                  href="#"
                  data-filter="warmest"
                  onClick={() => handleFilterChange("warmest")}
                >
                  Warmest
                </a>
              </li>
              <li>
                <a
                  href="#"
                  data-filter="coldest"
                  onClick={() => handleFilterChange("coldest")}
                >
                  Coldest
                </a>
              </li>
              <li>
                <a
                  href="#"
                  data-filter="rainiest"
                  onClick={() => handleFilterChange("rainiest")}
                >
                  Rainiest
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="main__content">
          {/* Results */}
          <div id="results">
            {selectedFilter ? (
              <p>Showing results for: {selectedFilter}</p>
            ) : (
              <p>Select a filter to see the results.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Top_Cities;
