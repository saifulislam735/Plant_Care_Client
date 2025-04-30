"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiCheckCircle, FiX, FiMessageSquare, FiDatabase, FiEdit, FiDownload, FiSearch, FiFilter, FiArrowRight, FiUser, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("help");
  const [helpRequests, setHelpRequests] = useState([]);
  const [dataEntries, setDataEntries] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogForm, setBlogForm] = useState({ title: "", content: "", excerpt: "", image: null });
  const [downloadFilters, setDownloadFilters] = useState({
    userId: "",
    diseaseLevel: "",
    prediction: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState({
    help: 1,
    data: 1,
    blogs: 1,
  });
  const [itemsPerPage] = useState(2); // Items per page for pagination
  const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

  useEffect(() => {
    fetchData();
    if (activeTab === "data") {
      fetchUsers();
      fetchPredictions();
    }
  }, [activeTab, filter, searchQuery, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (activeTab === "help") {
        const response = await fetch(
          `${BACKEND_URL}/gethelp/list${filter !== "all" ? `?status=${filter}` : ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to fetch help requests");
        }
        const data = await response.json();
        setHelpRequests(
          data.filter(
            (item) =>
              item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.message.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else if (activeTab === "data") {
        const response = await fetch(
          `${BACKEND_URL}/data/list${filter !== "all" ? `?status=${filter}` : ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to fetch data entries");
        }
        const data = await response.json();
        setDataEntries(
          data.filter(
            (item) =>
              (item.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else if (activeTab === "blogs") {
        const response = await fetch(`${BACKEND_URL}/blog/list`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to fetch blogs");
        }
        const data = await response.json();
        setBlogs(
          data.filter(
            (item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/users/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.message);
    }
  };

  const fetchPredictions = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/data/predictions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to fetch predictions");
      }
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      toast.error(error.message);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setResponseText("");
    setRejectionReason("");
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/gethelp/${selectedItem._id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response: responseText }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to send response");
      }
      toast.success("Response sent successfully");
      setHelpRequests(
        helpRequests.map((item) =>
          item._id === selectedItem._id
            ? {
                ...item,
                status: "responded",
                response: responseText,
                responderName: user.name,
                responseDate: new Date().toISOString(),
              }
            : item
        )
      );
      setSelectedItem(null);
      setResponseText("");
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error(error.message);
    }
  };

  const handleApproveData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/data/${selectedItem._id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to approve data");
      }
      toast.success("Data entry approved");
      setDataEntries(
        dataEntries.map((item) =>
          item._id === selectedItem._id
            ? {
                ...item,
                status: "approved",
                approvedBy: user.name,
                approvalDate: new Date().toISOString(),
              }
            : item
        )
      );
      setSelectedItem(null);
    } catch (error) {
      console.error("Error approving data:", error);
      toast.error(error.message);
    }
  };

  const handleRejectData = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/data/${selectedItem._id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to reject data");
      }
      toast.success("Data entry rejected");
      setDataEntries(
        dataEntries.map((item) =>
          item._id === selectedItem._id
            ? {
                ...item,
                status: "rejected",
                rejectionReason: rejectionReason,
              }
            : item
        )
      );
      setSelectedItem(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting data:", error);
      toast.error(error.message);
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.content.trim() || !blogForm.excerpt.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const formData = new FormData();
      formData.append("title", blogForm.title);
      formData.append("content", blogForm.content);
      formData.append("excerpt", blogForm.excerpt);
      if (blogForm.image) {
        formData.append("image", blogForm.image);
      }
      const response = await fetch(`${BACKEND_URL}/blog/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create blog");
      }
      toast.success("Blog created successfully");
      setBlogForm({ title: "", content: "", excerpt: "", image: null });
      fetchData();
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error(error.message);
    }
  };

  const handleDownload = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const queryParams = new URLSearchParams();
      if (downloadFilters.userId) queryParams.append("userId", downloadFilters.userId);
      if (downloadFilters.diseaseLevel) queryParams.append("diseaseLevel", downloadFilters.diseaseLevel);
      if (downloadFilters.prediction) queryParams.append("prediction", downloadFilters.prediction);
      if (downloadFilters.status) queryParams.append("status", downloadFilters.status);
      const response = await fetch(`${BACKEND_URL}/data/download?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to download data entries");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `data_entries_${new Date().toISOString().replace(/[:.]/g, "-")}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading data entries:", error);
      toast.error(error.message);
    }
  };

  // Pagination Logic
  const getPaginatedData = (data, tab) => {
    const indexOfLastItem = currentPage[tab] * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = {
    help: Math.ceil(helpRequests.length / itemsPerPage),
    data: Math.ceil(dataEntries.length / itemsPerPage),
    blogs: Math.ceil(blogs.length / itemsPerPage),
  };

  const handlePageChange = (tab, pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages[tab]) {
      setCurrentPage((prev) => ({ ...prev, [tab]: pageNumber }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading && !helpRequests.length && !dataEntries.length && !blogs.length) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-red-500 mb-6">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Officer Dashboard</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("help")}
                className={`flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "help"
                    ? "bg-green-100 text-green-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiMessageSquare className="mr-2" size={18} />
                Help Requests
              </button>
              <button
                onClick={() => setActiveTab("data")}
                className={`flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "data"
                    ? "bg-green-100 text-green-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiDatabase className="mr-2" size={18} />
                Data Entries
              </button>
              <button
                onClick={() => setActiveTab("blogs")}
                className={`flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "blogs"
                    ? "bg-green-100 text-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiEdit className="mr-2" size={18} />
                Blogs
              </button>
            </nav>
          </div>

          {activeTab !== "blogs" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FiFilter className="mr-2" size={18} />
                Filter
              </h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                {activeTab === "help" ? (
                  <option value="responded">Responded</option>
                ) : (
                  <>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${
                    activeTab === "help" ? "help requests" : activeTab === "data" ? "data entries" : "blogs"
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>
              <button
                onClick={fetchData}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300"
              >
                <FiFilter className="mr-2" size={18} />
                Apply Filters
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {activeTab === "help" ? "Help Requests" : activeTab === "data" ? "Data Entries" : "Blogs"}
            </h2>

            {activeTab === "data" && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Download Data Entries</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                    <select
                      value={downloadFilters.userId}
                      onChange={(e) => setDownloadFilters({ ...downloadFilters, userId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    >
                      <option value="">All Users</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disease Level</label>
                    <select
                      value={downloadFilters.diseaseLevel}
                      onChange={(e) => setDownloadFilters({ ...downloadFilters, diseaseLevel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    >
                      <option value="">All Levels</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AI Prediction</label>
                    <select
                      value={downloadFilters.prediction}
                      onChange={(e) => setDownloadFilters({ ...downloadFilters, prediction: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    >
                      <option value="">All Predictions</option>
                      {predictions.map((pred) => (
                        <option key={pred} value={pred}>
                          {pred.replace("Potato___", "Potato - ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={downloadFilters.status}
                      onChange={(e) => setDownloadFilters({ ...downloadFilters, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300"
                >
                  <FiDownload className="mr-2" size={18} />
                  Download Images
                </button>
              </div>
            )}

            {activeTab === "help" && helpRequests.length === 0 && (
              <p className="text-center py-6 text-gray-600 text-lg">No help requests found.</p>
            )}

            {activeTab === "data" && dataEntries.length === 0 && (
              <p className="text-center py-6 text-gray-600 text-lg">No data entries found.</p>
            )}

            {activeTab === "blogs" && blogs.length === 0 && (
              <p className="text-center py-6 text-gray-600 text-lg">No blogs found.</p>
            )}

            {activeTab === "help" && helpRequests.length > 0 && (
              <div className="space-y-6">
                {getPaginatedData(helpRequests, "help").map((request) => (
                  <div
                    key={request._id}
                    className={`bg-white rounded-xl shadow-md p-6 cursor-pointer ${
                      selectedItem?._id === request._id ? "border-2 border-green-500" : ""
                    }`}
                    onClick={() => handleSelectItem(request)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{request.userName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(request.requestDate).toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{request.message}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">AI Prediction:</span>{" "}
                      {request.prediction?.replace("Potato___", "Potato - ") || "N/A"} (
                      {((request.confidence || 0) * 100).toFixed(2)}%)
                    </p>
                  </div>
                ))}
                {totalPages.help > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center gap-2" aria-label="Help requests pagination">
                      <button
                        onClick={() => handlePageChange("help", currentPage.help - 1)}
                        disabled={currentPage.help === 1}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages.help)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange("help", index + 1)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage.help === index + 1
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                          aria-current={currentPage.help === index + 1 ? "page" : undefined}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange("help", currentPage.help + 1)}
                        disabled={currentPage.help === totalPages.help}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}

            {activeTab === "data" && dataEntries.length > 0 && (
              <div className="space-y-6">
                {getPaginatedData(dataEntries, "data").map((entry) => (
                  <div
                    key={entry._id}
                    className={`bg-white rounded-xl shadow-md p-6 cursor-pointer ${
                      selectedItem?._id === entry._id ? "border-2 border-green-500" : ""
                    }`}
                    onClick={() => handleSelectItem(entry)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{entry.userName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          entry.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : entry.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(entry.uploadDate).toLocaleString()}
                    </p>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="mr-4">
                        <span className="font-medium">Disease Level:</span>{" "}
                        <span className="capitalize">{entry.diseaseLevel}</span>
                      </span>
                      <span>
                        <span className="font-medium">AI Prediction:</span>{" "}
                        {entry.prediction?.replace("Potato___", "Potato - ") || "N/A"} (
                        {((entry.confidence || 0) * 100).toFixed(2)}%)
                      </span>
                    </div>
                    {entry.notes && <p className="text-sm text-gray-600 mb-3">{entry.notes}</p>}
                    {entry.status === "rejected" && entry.rejectionReason && (
                      <div className="p-3 bg-red-50 rounded-lg text-sm">
                        <span className="font-medium">Rejection Reason:</span> {entry.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
                {totalPages.data > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center gap-2" aria-label="Data entries pagination">
                      <button
                        onClick={() => handlePageChange("data", currentPage.data - 1)}
                        disabled={currentPage.data === 1}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages.data)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange("data", index + 1)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage.data === index + 1
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                          aria-current={currentPage.data === index + 1 ? "page" : undefined}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange("data", currentPage.data + 1)}
                        disabled={currentPage.data === totalPages.data}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}

            {activeTab === "blogs" && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Blog Post</h3>
                  <form onSubmit={handleBlogSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        placeholder="Enter blog title"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt
                      </label>
                      <textarea
                        id="excerpt"
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 min-h-[100px]"
                        placeholder="Enter a short excerpt"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        id="content"
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 min-h-[200px]"
                        placeholder="Enter blog content"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                        Image (Optional)
                      </label>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBlogForm({ ...blogForm, image: e.target.files[0] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300"
                    >
                      Create Blog Post
                    </button>
                  </form>
                </div>

                {blogs.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getPaginatedData(blogs, "blogs").map((blog) => (
                      <div
                        key={blog._id}
                        className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer ${
                          selectedItem?._id === blog._id ? "border-2 border-green-500" : ""
                        }`}
                        onClick={() => handleSelectItem(blog)}
                      >
                        <img
                          src={blog.image ? `${BACKEND_URL}${blog.image}` : "/placeholder.svg?height=200&width=300"}
                          alt={blog.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{blog.excerpt}</p>
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <div className="flex items-center mr-4">
                              <FiUser className="mr-1" size={16} />
                              <span>{blog.author}</span>
                            </div>
                            <div className="flex items-center">
                              <FiCalendar className="mr-1" size={16} />
                              <span>{new Date(blog.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="inline-flex items-center text-green-600 font-semibold text-sm">
                            View Details
                            <FiArrowRight className="ml-1" size={16} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {totalPages.blogs > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center gap-2" aria-label="Blogs pagination">
                      <button
                        onClick={() => handlePageChange("blogs", currentPage.blogs - 1)}
                        disabled={currentPage.blogs === 1}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages.blogs)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange("blogs", index + 1)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage.blogs === index + 1
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                          aria-current={currentPage.blogs === index + 1 ? "page" : undefined}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange("blogs", currentPage.blogs + 1)}
                        disabled={currentPage.blogs === totalPages.blogs}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detail View */}
          {selectedItem && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {activeTab === "help" ? "Help Request Details" : activeTab === "data" ? "Data Entry Details" : "Blog Details"}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {selectedItem.image && (
                    <img
                      src={`${BACKEND_URL}${selectedItem.image}`}
                      alt={activeTab === "blogs" ? selectedItem.title : "Plant"}
                      className="w-full h-auto rounded-lg mb-4"
                      loading="lazy"
                    />
                  )}
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>
                      <span className="font-medium">{activeTab === "blogs" ? "Title" : "User"}:</span>{" "}
                      {activeTab === "blogs" ? selectedItem.title : selectedItem.userName}
                    </p>
                    {activeTab === "blogs" && (
                      <p>
                        <span className="font-medium">Author:</span> {selectedItem.author}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(
                        selectedItem.requestDate || selectedItem.uploadDate || selectedItem.date
                      ).toLocaleString()}
                    </p>
                    {(activeTab === "help" || activeTab === "data") && (
                      <p>
                        <span className="font-medium">AI Prediction:</span>{" "}
                        {selectedItem.prediction?.replace("Potato___", "Potato - ") || "N/A"} (
                        {((selectedItem.confidence || 0) * 100).toFixed(2)}%)
                      </p>
                    )}
                    {activeTab === "data" && (
                      <p>
                        <span className="font-medium">Disease Level:</span>{" "}
                        <span className="capitalize">{selectedItem.diseaseLevel}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {activeTab === "help" && (
                    <>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">User's Question:</h3>
                        <p className="p-3 bg-gray-50 rounded-lg text-sm">{selectedItem.message}</p>
                      </div>
                      {selectedItem.status === "responded" ? (
                        <div>
                          <h3 className="font-medium text-gray-800 mb-2">Your Response:</h3>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm">{selectedItem.response}</p>
                            <p className="mt-2 text-xs text-gray-500">
                              Responded by {selectedItem.responderName} on{" "}
                              {new Date(selectedItem.responseDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-medium text-gray-800 mb-2">Your Response:</h3>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 min-h-[150px]"
                            placeholder="Write your response here..."
                          ></textarea>
                          <button
                            onClick={handleSubmitResponse}
                            className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 mt-2"
                          >
                            Send Response
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "data" && (
                    <>
                      {selectedItem.notes && (
                        <div>
                          <h3 className="font-medium text-gray-800 mb-2">User's Notes:</h3>
                          <p className="p-3 bg-gray-50 rounded-lg text-sm">{selectedItem.notes}</p>
                        </div>
                      )}
                      {selectedItem.status === "pending" && (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium text-gray-800 mb-2">Review Decision:</h3>
                            <div className="flex space-x-4">
                              <button
                                onClick={handleApproveData}
                                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center transition-all duration-300"
                              >
                                <FiCheckCircle className="mr-2" size={18} />
                                Approve
                              </button>
                              <button
                                onClick={() => document.getElementById("rejection-reason").focus()}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center transition-all duration-300"
                              >
                                <FiX className="mr-2" size={18} />
                                Reject
                              </button>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 mb-2">Rejection Reason (if applicable):</h3>
                            <textarea
                              id="rejection-reason"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 min-h-[100px]"
                              placeholder="Provide a reason for rejection..."
                            ></textarea>
                            <button
                              onClick={handleRejectData}
                              disabled={!rejectionReason.trim()}
                              className={`w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 ${
                                !rejectionReason.trim() ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      )}
                      {selectedItem.status === "approved" && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FiCheckCircle className="text-green-600 mr-2" size={18} />
                            <h3 className="font-medium text-gray-800">Approved</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Approved by {selectedItem.approvedBy} on{" "}
                            {new Date(selectedItem.approvalDate).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {selectedItem.status === "rejected" && (
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FiX className="text-red-600 mr-2" size={18} />
                            <h3 className="font-medium text-gray-800">Rejected</h3>
                          </div>
                          <p className="text-sm text-gray-600">Reason: {selectedItem.rejectionReason}</p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "blogs" && (
                    <>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Excerpt:</h3>
                        <p className="p-3 bg-gray-50 rounded-lg text-sm">{selectedItem.excerpt}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Content:</h3>
                        <p className="p-3 bg-gray-50 rounded-lg text-sm">{selectedItem.content}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;