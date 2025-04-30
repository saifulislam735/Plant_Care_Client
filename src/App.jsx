import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import GetHelp from "./pages/GetHelp"
import DataCollect from "./pages/DataCollect"
import Blogs from "./pages/Blogs"
import BlogDetail from "./pages/BlogDetail"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import History from "./pages/History"
import OfficerDashboard from "./pages/OfficerDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import OfficerRoute from "./components/OfficerRoute"
import { AuthProvider } from "./context/AuthContext"
import Code from "./pages/Code"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/get-help"
                element={
                  <ProtectedRoute>
                    <GetHelp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-collect"
                element={
                  <ProtectedRoute>
                    <DataCollect />
                  </ProtectedRoute>
                }
              />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/code"
                element={
                  <Code/>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <OfficerRoute>
                    <OfficerDashboard />
                  </OfficerRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
