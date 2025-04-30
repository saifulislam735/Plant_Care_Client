
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const OfficerRoute = ({ children }) => {
  const { user, loading, isOfficer } = useAuth()

  if (loading) {
    return <div className="container py-8 text-center">Loading...</div>
  }

  if (!user || !isOfficer()) {
    return <Navigate to="/" />
  }

  return children
}

export default OfficerRoute
