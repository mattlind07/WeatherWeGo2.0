import React from "react";

class Header extends React.Component {
  render() {  
    return (
      <header>
        <nav className="navbar">
          <div className="navbar__container">
            <a href="/" id="navbar__logo">WeatherWeGo</a>
            <div className="navbar__toggle" id="mobile-menu">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
            <ul className="navbar__menu">
              <li className="navbar__item">
                <a href="/" className="navbar__links" style={{ color: '#fe938c' }}>Home</a>
              </li>
              <li className="navbar__item">
                <a href="/sigma" className="navbar__links">Find a Walkability</a>
              </li>
              <li className="navbar__item">
                <a href="/top-cities" className="navbar__links">Top Cities</a>
              </li>
              <li className="navbar__item">
                <a href="/personality-test" className="navbar__links">Personality Test</a>
              </li>
              <li className="navbar__btn">
                <a href="/login" className="button">Log In</a>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    );
  }
}

export default Header;
