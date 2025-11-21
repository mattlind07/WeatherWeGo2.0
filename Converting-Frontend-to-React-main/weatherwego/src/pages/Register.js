import React from "react";

class Register extends React.Component {
  render() {
    return (
      <div className="register">
        <div className="overlay"></div>
        <div className="box">
          <h1>Weather We Go</h1>

          <div className="container">
            <div className="left">
              <h3>Register!</h3>

              <form action="/login" method="post">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username:"
                  required
                />
                <br />

                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password:"
                  required
                />
                <br />

                <button type="submit">Register</button>
              </form>

              <div>
                <p>
                  Already have an account?{" "}
                  <a href="/login">Sign in here!</a>
                </p>
                <p>
                  Or <a href="/">continue as a guest.</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
