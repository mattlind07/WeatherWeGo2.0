import React from "react";

class Home extends React.Component {
    render() {
        return (
            <>
                <div className="main">
                    <div className="main__container">
                        <div className="main__content hidden">
                            <h1>WEATHER WE GO</h1>
                            <h2>United States Edition</h2>
                            <p>Find your ideal weather destination.</p>
                            <button className="main__btn">
                                <a href="/sigma">Search an Address</a>
                            </button>
                        </div>
                        <div className="main__img--container hidden">
                            <img src="./images/weather-illustration.svg" alt="Weather illustration" id="main__img" />
                        </div>
                    </div>
                </div>

                <div className="services">
                    <h1 className="hidden">Find the perfect conditions for you!</h1>
                    <div className="services__container">
                        <div className="services__card hidden">
                            <h2>Personality Test</h2>
                            <p>Find a weather destination for you.</p>
                            <a href="/personality-test"><button>Take Test</button></a>
                        </div>
                        <div className="services__card hidden">
                            <h2>Top Cities</h2>
                            <p>Find the best cities for your needs.</p>
                            <a href="/top-cities"><button>Top Cities</button></a>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default Home;
