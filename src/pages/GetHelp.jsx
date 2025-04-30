"use client"

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ImageUploader from "../components/ImageUploader";
import toast from "react-hot-toast";

const GetHelp = () => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0); // For forcing ImageUploader reset
  const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setPrediction(null); // Reset prediction when a new image is selected
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPrediction(null);
    setMessage("");
    setUploaderKey((prev) => prev + 1); // Increment key to force ImageUploader re-render
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get prediction");
      }

      const data = await response.json();
      console.log("Prediction response:", data); // Debug: Log prediction response
      setPrediction(data);
      toast.success("Prediction received successfully");
    } catch (error) {
      console.error("Error getting prediction:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.token) {
      toast.error("Please log in to send a help request");
      return;
    }

    if (!selectedImage || !message || !prediction) {
      toast.error("Please select an image, describe your problem, and get a prediction");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("userId", user.id);
    formData.append("message", message);
    formData.append("prediction", prediction.prediction);
    formData.append("confidence", prediction.confidence);

    try {
      console.log("Submitting help request to /gethelp/send"); // Debug: Log request
      const response = await fetch(`${BACKEND_URL}/gethelp/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send help request");
      }

      const responseData = await response.json();
      console.log("Help request response:", responseData); // Debug: Log response
      toast.success("Help request sent successfully! An officer will respond soon.");
      resetForm(); // Clear form and reset ImageUploader
    } catch (error) {
      console.error("Error sending help request:", error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-red-500">Please log in to request help</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Get Expert Help</h1>

        <div className="mb-6">
          <p className="text-gray-700">
            Upload an image of your plant and describe the problem. Our AI will provide an initial assessment, and our
            agricultural experts will review your case and provide personalized advice.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Plant Image</h2>
            <ImageUploader
              key={uploaderKey}
              value={selectedImage}
              onImageSelect={handleImageSelect}
            />

            {selectedImage && !prediction && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={loading}
                  className={`btn btn-primary ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Analyzing..." : "Get AI Prediction"}
                </button>
              </div>
            )}

            {prediction && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">AI Prediction:</h3>
                <p>Disease: {prediction.prediction ? prediction.prediction.replace("Potato___", "Potato - ") : "Unknown"}</p>
                <p>Confidence: {prediction.confidence ? (prediction.confidence * 100).toFixed(2) : "0.00"}%</p>
                <p className="mt-2 text-sm text-gray-600">
                  This is an automated prediction. Our experts will review your case for a more accurate assessment.
                </p>
              </div>
            )}
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Describe Your Problem</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-input min-h-[150px]"
              placeholder="Describe the symptoms, when you first noticed them, growing conditions, and any treatments you've already tried..."
              required
            ></textarea>
          </div>

          {prediction && (
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting}
                className={`btn btn-primary px-8 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {submitting ? "Sending..." : "Send Help Request"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default GetHelp;