"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiCalendar, FiCheckCircle, FiClock, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const History = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2); // Number of activities per page
  const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !user.token) {
        setError("Please log in to view your history");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/user/history`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch history");
        }

        const data = await response.json();
        console.log("Fetched activities:", data);
        setActivities(data);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter((activity) => activity.type === filter);

  // Calculate pagination details
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-red-500">Please log in to view your history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-6"></div>
          <div className="space-y-6 max-w-4xl mx-auto">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="card flex p-4">
                <div className="w-24 h-24 bg-gray-200 rounded mr-4"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-red-500">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn btn-secondary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Activity History</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${
              filter === "all" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Activities
          </button>
          <button
            onClick={() => setFilter("help")}
            className={`px-4 py-2 rounded-md ${
              filter === "help" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Help Requests
          </button>
          <button
            onClick={() => setFilter("data")}
            className={`px-4 py-2 rounded-md ${
              filter === "data" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Data Contributions
          </button>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No activities found.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentActivities.map((activity) => (
                <div key={activity._id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">{activity.type === "help" ? "Help Request" : "Data Contribution"}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <FiCalendar className="mr-1" />
                        <span>{new Date(activity.requestDate || activity.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {activity.status === "approved" && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                          <FiCheckCircle className="mr-1" /> Approved
                        </span>
                      )}
                      {activity.status === "pending" && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                          <FiClock className="mr-1" /> Pending
                        </span>
                      )}
                      {activity.status === "rejected" && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                          <FiX className="mr-1" /> Rejected
                        </span>
                      )}
                      {activity.status === "responded" && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                          <FiCheckCircle className="mr-1" /> Responded
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex">
                    <img
                      src={activity.image ? `${BACKEND_URL}${activity.image}` : "/placeholder.svg?height=100&width=100"}
                      alt="Plant"
                      className="w-24 h-24 rounded object-cover mr-4"
                    />
                    <div className="flex-1">
                      {activity.type === "help" && (
                        <div>
                          <p className="text-gray-700 mb-2">{activity.message}</p>
                          {activity.response && (
                            <div className="p-2 bg-blue-50 rounded text-sm">
                              <span className="font-semibold">Response: </span>
                              {activity.response} <br />
                              <span className="text-gray-500">— {activity.responderName}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {activity.type === "data" && activity.diseaseLevel && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Disease Level: </span>
                          <span className="capitalize">{activity.diseaseLevel}</span>
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">AI Prediction: </span>
                        <span>{activity.prediction ? activity.prediction.replace("Potato___", "Potato - ") : "Unknown"}</span>
                        {activity.confidence && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({(activity.confidence * 100).toFixed(2)}% confidence)
                          </span>
                        )}
                      </div>
                      {activity.status === "rejected" && activity.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                          <span className="font-semibold">Rejection reason: </span>
                          {activity.rejectionReason}
                        </div>
                      )}
                    </div>
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
  );
};

export default History;