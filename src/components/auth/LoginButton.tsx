import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./AuthStyle.css";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button className="Buttons" onClick={() => {loginWithRedirect()}}>
      Log In
    </button>
  );
};

export default LoginButton;
