import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import OfflineBanner from "./components/OfflineBanner";
import Nav from "./components/Nav";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import ScrollToTop from "./components/ScrollToTop";
import { ProfileSkeleton } from "./components/Skeletons";
// These pages pull in the Markdown libraries (the biggest part of the app),
// so they are downloaded only when someone opens one of them
const PostDetail = lazy(() => import("./pages/PostDetail"));
const NewPost = lazy(() => import("./pages/NewPost"));
const EditPost = lazy(() => import("./pages/EditPost"));

export default function App() {
  const location = useLocation();
  const [menu, setMenu] = useState({ open: false, key: null });

  // The menu counts as open only on the page where it was opened, so going
  // anywhere else (even with the browser's back button) closes it by itself
  const menuOpen = menu.open && menu.key === location.key;

  const openMenu = () => setMenu({ open: true, key: location.key });
  const closeMenu = () => setMenu({ open: false, key: null });

  // While the drawer is open: stop the page behind from scrolling, and close on Escape
  useEffect(() => {
    if (!menuOpen) return;

    document.body.classList.add("menu-open");
    function onKeyDown(e) {
      if (e.key === "Escape") setMenu({ open: false, key: null });
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("menu-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="app">
      <ScrollToTop />
      <OfflineBanner />
      <Nav menuOpen={menuOpen} onMenuClick={openMenu} />
      <div className="container layout">
        <Sidebar open={menuOpen} onClose={closeMenu} />
        <main className="page" inert={menuOpen}>
          <Suspense fallback={<ProfileSkeleton />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/u/:username" element={<UserProfile />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new"
                element={
                  <ProtectedRoute>
                    <NewPost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditPost />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<p>Page not found</p>} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <Footer menuOpen={menuOpen} />
    </div>
  );
}
