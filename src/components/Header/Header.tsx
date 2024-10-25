import { Link } from "react-router-dom"; // Importa Link
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../auth/LoginButton";
import LogoutButton from "../auth/LogoutButton";
import "./HeaderStyle.css";

const Header = () => {
  const { isAuthenticated, user } = useAuth0();

  return (
    <header className="App-header">
      {isAuthenticated && (
        <div className="LogoUser">
          <img className="Logo" src={user!.picture} alt={user!.name} />
        </div>
      )}
      {isAuthenticated ? (
        <>
          <div>
            <Link className="Link-button" to="/home">
              Home
            </Link>
            <Link className="Link-button" to="/map">
              Mappa
            </Link>
          </div>
          <LogoutButton />
        </>
      ) : (
        <LoginButton />
      )}
    </header>
  );
};

export default Header;
