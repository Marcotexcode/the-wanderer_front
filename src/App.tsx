import "./App.css";
import Header from "./components/Header/Header";
import Home from "./components/Home";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/private-route/PrivateRoute";
import Map from "./components/map/Map";
import { useAuth0 } from "@auth0/auth0-react";
function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/map"
              element={
                <PrivateRoute>
                  <Map />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
