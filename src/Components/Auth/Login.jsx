import { useState, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

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

    // load the script by passing the URL
    loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/api.js?render=${process.env.REACT_APP_SITE_KEY}`, function () {
      console.log("Script loaded!");
    });
  }, []);

  async function submitForm(event) {
    event.preventDefault();
    try {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(process.env.REACT_APP_SITE_KEY, { action: 'submit' }).then(token => {
          // Send the token to your server along with the form data
          console.log("reCAPTCHA token:", token);
          console.log("Form submission successful!");

          Cookies.set("token", token, {
            secure: true,
            sameSite: "strict",
          });
          navigate("/dashboard");

          // Here you would typically send the form data and token to your server
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