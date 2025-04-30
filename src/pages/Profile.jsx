"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiPhone, FiEdit, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [helpResponses, setHelpResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    image: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2); // Number of responses per page
  const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = user?.token;
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch help responses from /user/history
        const response = await fetch(`${BACKEND_URL}/user/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch user history");
        }
        const history = await response.json();

        // Filter for responded help requests
        const responses = history
          .filter((item) => item.type === "help" && item.status === "responded")
          .map((item) => ({
            id: item._id,
            date: item.requestDate,
            question: item.message,
            response: item.response,
            officerName: item.responderName,
            image: item.image,
          }));

        setHelpResponses(responses);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
      setEditForm({
        name: user.name || "",
        phone: user.phone || "",
        image: null,
      });
    }
  }, [user]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      if (editForm.name && editForm.name !== user.name) {
        formData.append("name", editForm.name);
      }
      if (editForm.phone && editForm.phone !== user.phone) {
        formData.append("phone", editForm.phone);
      }
      if (editForm.image) {
        formData.append("image", GuangzhouForm.image);
      }

      if (!formData.has("name") && !formData.has("phone") && !formData.has("image")) {
        toast.error("No changes to save");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/user/profile/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const result = await response.json();
      const updatedUser = { ...user, ...result.user };
      setUser(updatedUser); // Update AuthContext
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Sync localStorage

      setIsEditing(false);
      setEditForm({
        name: result.user.name,
        phone: result.user.phone,
        image: null,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message);
    }
  };

  // Calculate pagination details
  const totalItems = helpResponses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResponses = helpResponses.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <p className="text-xl text-red-500">Please log in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 text-center">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="md:col-span-1">
            <div className="card">
              <div className="flex flex-col items-center mb-6">
                {user.image ? (
                  <img
                    src={`${BACKEND_URL}${user.image}`}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FiUser size={48} className="text-green-600" />
                  </div>
                )}
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-500">{user.role === "officer" ? "Officer" : "Farmer"}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <FiMail className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FiPhone className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{user.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <FiEdit className="mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Help Responses */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Expert Responses</h2>

            {helpResponses.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-500">You haven't received any responses yet.</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {currentResponses.map((item) => (
                    <div key={item.id} className="card">
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">Your Question:</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{item.question}</p>
                      </div>

                      <div className="flex items-start mb-4">
                        <img
                          src={item.image ? `${BACKEND_URL}${item.image}` : "/placeholder.svg"}
                          alt="Plant"
                          className="w-20 h-20 rounded object-cover mr-4"
                        />
                        <div>
                          <p className="text-sm text-gray-500">Uploaded Image</p>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-green-700">Expert Response:</h3>
                          <span className="text-sm text-gray-500">By {item.officerName}</span>
                        </div>
                        <p className="text-gray-700">{item.response}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === index + 1
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card bg-white max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="image" className="form-label">
                    Profile Image
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.files[0] })}
                    className="form-input"
                  />
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;