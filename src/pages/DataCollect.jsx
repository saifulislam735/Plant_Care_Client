"use client"

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ImageUploader from "../components/ImageUploader";
import ImageCapture from "../components/ImageCapture";
import toast from "react-hot-toast";
import { FiInfo } from "react-icons/fi";

const DataCollect = () => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [diseaseLevel, setDiseaseLevel] = useState("medium");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0); // For forcing ImageUploader reset
  const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setPrediction(null);
    // Generate preview URL
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      console.log("Image selected for preview:", previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
    setUploaderKey((prev) => prev + 1);
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
    setDiseaseLevel("medium");
    setNotes("");
    setUploaderKey((prev) => prev + 1);
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      toast.error("Please select or capture an image");
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
      console.log("Prediction response:", data);
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
      toast.error("Please log in to submit data");
      return;
    }

    if (!selectedImage || !prediction) {
      toast.error("Please select or capture an image and get a prediction");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("userId", user.id);
    formData.append("diseaseLevel", diseaseLevel);
    formData.append("notes", notes);
    formData.append("prediction", prediction.prediction);
    formData.append("confidence", prediction.confidence);

    try {
      console.log("Submitting data to /upload/image");
      const response = await fetch(`${BACKEND_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit data");
      }

      const responseData = await response.json();
      console.log("Data submission response:", responseData);
      toast.success("Data submitted successfully! It will be reviewed by an officer.");
      resetForm();
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-red-500">Please log in to contribute data</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Contribute to Our Dataset</h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Your contributions help improve our disease detection model. All uploaded or captured images will be reviewed by our officers before being added to the dataset.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload or Capture Plant Image</h2>
            <div className="space-y-4">
              <ImageUploader
                key={uploaderKey}
                value={selectedImage}
                onImageSelect={handleImageSelect}
              />
              <ImageCapture onImageSelect={handleImageSelect} />
            </div>

            {imagePreview && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Image Preview</h3>
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Selected or captured image"
                    className="w-full max-w-md rounded-lg border border-gray-300 mb-4"
                    style={{ maxHeight: "300px", objectFit: "contain" }}
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="btn btn-secondary px-4"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}

            {selectedImage && !prediction && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={loading}
                  className={`btn btn-primary px-4 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
              </div>
            )}
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>

            <div className="mb-4">
              <label className="form-label">Disease Severity Level</label>
              <select value={diseaseLevel} onChange={(e) => setDiseaseLevel(e.target.value)} className="form-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="No Disease">No Disease</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input min-h-[100px]"
                placeholder="Add any additional information about the plant or growing conditions..."
              ></textarea>
            </div>
          </div>

          {prediction && (
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting}
                className={`btn btn-primary px-8 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {submitting ? "Submitting..." : "Submit to Dataset"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DataCollect;