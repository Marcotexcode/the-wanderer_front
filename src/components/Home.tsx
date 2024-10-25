import { useAuth0 } from "@auth0/auth0-react";

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (!isAuthenticated) {
    return null;
  }

  return (
    isAuthenticated && (
      <div>
        <h2>Hello {user!.name}</h2>
      </div>
    )
  );
};

export default Home;
