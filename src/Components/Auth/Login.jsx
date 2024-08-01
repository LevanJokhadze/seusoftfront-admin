import { useState, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios"; // Make sure to install axios: npm install axios

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadScriptByURL = (id, url, callback) => {
      const isScriptExist = document.getElementById(id);
      if (!isScriptExist) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.id = id;
        script.onload = function () {
          if (callback) callback();
        };
        document.body.appendChild(script);
      }
      if (isScriptExist && callback) callback();
    }
    loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/api.js?render=${process.env.REACT_APP_SITE_KEY}`, function () {
      console.log("Script loaded!");
    });
  }, []);

  async function submitForm(event) {
    event.preventDefault();
    try {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(process.env.REACT_APP_SITE_KEY, { action: 'submit' }).then(async token => {
          console.log("reCAPTCHA token:", token);
          
          // Send email, password, and reCAPTCHA token to backend
          try {
            const response = await axios.post(`${process.env.REACT_APP_API_KEY_ADMIN}login`, {
              email,
              password,
              recaptcha_token: token
            });

            console.log("Login response:", response.data);

            if (response.data.success) {
              // Assuming the backend sends a token upon successful login
              Cookies.set("token", response.data.access_token, {
                secure: true,
                sameSite: "strict",
              });
              navigate("/dashboard");
            } else {
              // Handle login failure (e.g., show error message)
              console.error("Login failed:", response.data.message);
            }
          } catch (error) {
            console.error("Error during login:", error);
            // Handle error (e.g., show error message to user)
          }
        });
      });
    } catch (error) {
      console.error("Error executing reCAPTCHA:", error);
    }
  }

  return (
    <div>
      <h1 className="txt">Login</h1>
      <form className="form" onSubmit={submitForm}>
        <input
          name="Email"
          type="email"
          value={email}
          required
          placeholder="joe@example.com"
          onChange={(event) => setEmail(event.target.value)}
          className="Loginput"
        />
        <input
          name="password"
          type="password"
          value={password}
          required
          placeholder="********"
          onChange={(event) => setPassword(event.target.value)}
          className="Loginput"
        />
        <button type="submit" className="Logbutton">Sign in</button>
      </form>
    </div>
  );
}

export default Login;