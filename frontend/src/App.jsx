import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

// Pages
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";
import NotificationPage from "./pages/notification/NotificationPage";

//Components
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import ProfilePage from "./pages/profile/ProfilePage";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  // useEffect(() => {
  //   const getCurrentUser = async () => {
  //     try {
  //       const res = await fetch("/api/auth/me");
  //       const data = await res.json();
  //       if (!res.ok) {
  //         throw new Error(data.error || "something went wrong");
  //       }

  //       console.log("currentUser", data);
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   };
  //   getCurrentUser();
  // }, []);

  const { isLoading, data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "something went wrong");
        }

        console.log("currentUser", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });
  console.log(currentUser);
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className=" flex max-w-6xl mx-auto">
      {currentUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={currentUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!currentUser ? <SignUpPage /> : <HomePage />}
        />
        <Route
          path="/login"
          element={!currentUser ? <LoginPage /> : <HomePage />}
        />
        <Route
          path="/notifications"
          element={
            currentUser ? <NotificationPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/profile/:username"
          element={currentUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      {currentUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
