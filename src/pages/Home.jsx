import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiCamera } from "react-icons/fi";
import ImageUploader from "../components/ImageUploader";

const Home = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setPrediction(null);
  };

  const handleQuickCheck = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error getting prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const diseaseInfo = {
    Potato___Early_blight: {
      description:
        "Early blight is a common fungal disease that affects potato plants, causing brown spots with concentric rings on leaves.",
      solution:
        "Remove infected leaves, ensure proper spacing for air circulation, and apply fungicides as needed. Rotate crops annually.",
    },
    Potato___Late_blight: {
      description:
        "Late blight is a serious fungal disease that causes dark, water-soaked spots on leaves and can quickly destroy entire potato crops.",
      solution:
        "Apply fungicides preventatively, remove infected plants immediately, and ensure good drainage. Plant resistant varieties when possible.",
    },
    Potato___healthy: {
      description: "Your potato plant appears healthy with no signs of disease.",
      solution:
        "Continue good agricultural practices: proper watering, adequate spacing, and regular monitoring for early signs of disease.",
    },
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Protect Your Crops with AI-Powered Disease Detection
              </h1>
              <p className="text-lg md:text-xl text-green-100">
                Instantly diagnose plant diseases by uploading images and receive expert treatment recommendations.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/get-help"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300"
                >
                  Get Help Now
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/data-collect"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all duration-300"
                >
                  Contribute Data
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/healthy.jpg"
                alt="Healthy plants"
                className="rounded-xl shadow-2xl w-full max-w-md mx-auto object-cover transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Check Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Quick Disease Check
          </h2>
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <ImageUploader onImageSelect={handleImageSelect} />
            <div className="text-center mt-6">
              <button
                onClick={handleQuickCheck}
                disabled={!selectedImage || loading}
                className={`inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 ${!selectedImage || loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                    ></path>
                  </svg>
                ) : null}
                {loading ? "Analyzing..." : "Check Disease"}
              </button>
            </div>

            {prediction && (
              <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-3">
                  Result: {prediction.prediction.replace("Potato___", "Potato - ")}
                </h3>
                <p className="text-gray-600 mb-4">
                  Confidence: {(prediction.confidence * 100).toFixed(2)}%
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">Description:</h4>
                    <p className="text-gray-600">{diseaseInfo[prediction.prediction]?.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Recommended Solution:</h4>
                    <p className="text-gray-600">{diseaseInfo[prediction.prediction]?.solution}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                  <FiCamera size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Upload Image</h3>
              </div>
              <p className="text-gray-600">
                Capture a clear photo of your plant or upload an existing image to start the analysis.
              </p>
            </div>
            <div className="card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">AI Analysis</h3>
              </div>
              <p className="text-gray-600">
                Our cutting-edge AI model examines the image to detect diseases with high precision.
              </p>
            </div>
            <div className="card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                  <FiCheckCircle size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Get Solutions</h3>
              </div>
              <p className="text-gray-600">
                Receive detailed insights about the disease and actionable treatment recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Safeguard Your Crops?
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Join our community of farmers and experts to access personalized support and contribute to our growing dataset.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300"
            >
              Sign Up Now
            </Link>
            <Link
              to="/blogs"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300"
            >
              Explore Our Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;