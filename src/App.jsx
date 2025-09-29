import { useState } from 'react'
import './App.css'
import MainView from './MainView.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProfilePage from "./ProfilePage.jsx"
import PostPage from "./PostPage.jsx"
import ExplorePage from "./ExplorePage.jsx"
import EditProfilePage from "./EditProfilePage.jsx";
import CreatePostPage from "./CreatePostPage.jsx";
import LoginPage from "./LoginPage.jsx";
import RegistrationPage from "./RegistrationPage.jsx";
import WelcomePage from "./WelcomePage.jsx";
import SearchPage from "./SearchPage.jsx";
import AdminRoute from "./AdminRoute.jsx";
import AdminPage from "./AdminPage.jsx";
import OAuth2RedirectHandler from "./OAuth2RedirectHandler.jsx";
import GuestRoute from "./GuestRoute.jsx";
function App() {
    return (
      <Router>
          <Routes>
              <Route path="/" element={<MainView />} />
              <Route path="/profile/:username" element={<ProfilePage />}/>
              <Route path="/post/:postId" element={<PostPage />}/>
              <Route path="/explore" element={<ExplorePage />}/>
              <Route path="/profile/edit" element={<EditProfilePage />}/>
              <Route path="/posts/create" element={<CreatePostPage />} />
              <Route
                  path="/login"
                  element={
                      <GuestRoute>
                          <LoginPage />
                      </GuestRoute>
                  }
              />
              <Route
                  path="/register"
                  element={
                      <GuestRoute>
                          <RegistrationPage />
                      </GuestRoute>
                  }
              />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminPage />} />
              </Route>
              <Route path="/oauth-redirect" element={<OAuth2RedirectHandler />} />
          </Routes>
      </Router>
  )
}
export default App
