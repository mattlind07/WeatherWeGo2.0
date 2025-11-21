import React from "react";

class Quiz extends React.Component {
  componentDidMount() {
    // Simple animation trigger if needed
    document.querySelectorAll(".hidden").forEach(el => el.classList.add("show"));
  }

  render() {
    return (
      <>

        <div className="main personality--main">
          <div className="main__container vertical-layout">
            <div className="main__content hidden">
              <h1>Personality Test</h1>
              <h2>Discover Your Ideal Weather Match</h2>
              <p>Choose the answer that best represents you!</p>
            </div>

            <div className="personality__test">
              <div className="progress-container">
                <div id="progress-bar" className="progress-bar" style={{ height: "100%" }}></div>
              </div>

              <h2 className="question">Random question here</h2>

              <div className="options-container">
                <button className="option" onClick={() => console.log("Answer 0")}>
                  <img src="./images/default.png" alt="Option 1" />
                  <p>Option 1 description</p>
                </button>
                <button className="option" onClick={() => console.log("Answer 1")}>
                  <img src="./images/default.png" alt="Option 2" />
                  <p>Option 2 description</p>
                </button>
                <button className="option" onClick={() => console.log("Answer 2")}>
                  <img src="./images/default.png" alt="Option 3" />
                  <p>Option 3 description</p>
                </button>
                <button className="option" onClick={() => console.log("Answer 3")}>
                  <img src="./images/default.png" alt="Option 4" />
                  <p>Option 4 description</p>
                </button>
              </div>

              <button id="backButton" onClick={() => console.log("Back pressed")} className="main__btn" style={{ display: "none" }}>Back</button>
            </div>

            <div id="results-container" style={{ display: "none" }}>
              <h2>Your Quiz Results</h2>
              <p id="quizOutcome"></p>
              <img src="./images/default.png" alt="Result" style={{ display: "none" }} />
              <button id="retakeButton" onClick={() => console.log("Retake pressed")} className="main__btn" style={{ display: "none" }}>Retake Quiz</button>
            </div>
          </div>
        </div>

      </>
    );
  }
}

export default Quiz;
