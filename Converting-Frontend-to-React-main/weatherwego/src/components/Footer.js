import React from "react";

class Footer extends React.Component {
  render() {  // Corrected this line
    return (
    <footer>
      <div className="footer__container">
        <div className="footer__links">
          <div className="footer__link--wrapper">
            <div className="footer__link--items">
              <h2>The Team</h2>
              <a href="/">Braiden Pysher</a>
              <a href="/">Sam Guglielmino</a>
              <a href="/">Chuck Dunne</a>
              <a href="/">Zoe Bailey</a>
              <a href="/">Zachary Haufe</a>
              <a href="/">Travor Dinh</a>
              <a href="/">Matthew Lindsey</a>
              <a href="/">Wesley Davis</a>
            </div>
          </div>
        </div>
        <div className="social__media">
          <div className="social__media--wrap">
            <div className="footer__logo">
              <a href="/" id="footer__logo">
                <i className="wwg-logo"></i>WeatherWeGo
              </a>
            </div>
            <p className="website__rights">© WeatherWeGo 2025. All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
    );
  }
}

export default Footer;
