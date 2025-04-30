"use client"

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiUser, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Number of blogs per page
  const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/blog/list`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch blogs");
        }
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Calculate pagination details
  const totalItems = blogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="container mx-auto px-4 py-16 text-center">
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

  if (blogs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
          No Blogs Available
        </h2>
        <p className="text-gray-600 text-lg">
          Check back later for agricultural tips and insights!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-12 text-center">
        Agricultural Tips & Insights
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentBlogs.map((blog) => (
          <div
            key={blog._id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <img
              src={blog.image ? `${BACKEND_URL}${blog.image}` : "/placeholder.svg?height=200&width=300"}
              alt={blog.title}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                {blog.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {blog.excerpt}
              </p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center mr-4">
                  <FiUser className="mr-1" size={16} />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="mr-1" size={16} />
                  <span>{new Date(blog.date).toLocaleDateString()}</span>
                </div>
              </div>
              <Link
                to={`/blogs/${blog._id}`}
                className="inline-flex items-center text-green-600 font-semibold text-sm"
              >
                Read More
                <FiArrowRight className="ml-1" size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentPage === index + 1
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-current={currentPage === index + 1 ? "page" : undefined}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Blogs;