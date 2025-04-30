

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCalendar, FiUser, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/blog/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch blog");
        }
        const data = await response.json();
        setBlog(data);
      } catch (error) {
        console.error("Error fetching blog:", error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-xl text-red-500">{error || "Blog not found"}</p>
        <Link
          to="/blogs"
          className="mt-4 inline-flex items-center text-green-600 hover:text-green-700 font-medium"
        >
          <FiArrowLeft className="mr-2" /> Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Link
        to="/blogs"
        className="inline-flex items-center text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to Blogs
      </Link>

      <article className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

        <div className="flex items-center text-sm text-gray-500 mb-6">
          <div className="flex items-center mr-4">
            <FiUser className="mr-1" />
            <span>{blog.author}</span>
          </div>
          <div className="flex items-center">
            <FiCalendar className="mr-1" />
            <span>{new Date(blog.date).toLocaleDateString()}</span>
          </div>
        </div>

        <img
          src={blog.image ? `${BACKEND_URL}${blog.image}` : "/placeholder.svg?height=400&width=800"}
          alt={blog.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />

        <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: blog.content }} />
      </article>
    </div>
  );
};

export default BlogDetail;