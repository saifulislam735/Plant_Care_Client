
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

const ImageCapture = ({ onImageSelect }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Start webcam capture
  const startCapture = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCapturing(true);
        console.log("Camera feed started:", stream.getVideoTracks());
      } else {
        throw new Error("Video element not available");
      }
    } catch (error) {
      console.error("Error starting camera:", error.name, error.message);
      toast.error(
        error.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permissions."
          : "Failed to start camera. Try using file upload or check device settings."
      );
      stopCapture();
    } finally {
      setIsLoading(false);
    }
  };

  // Stop webcam capture
  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      console.log("Camera feed stopped");
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setIsLoading(false);
  };

  // Capture image from webcam
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Failed to capture image");
        return;
      }
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      console.log("Captured image file:", file);
      onImageSelect(file);
      stopCapture();
      toast.success("Image captured successfully");
    }, "image/jpeg", 0.9);
  };

  // Handle mobile capture
  const handleMobileCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Mobile captured file:", file);
      onImageSelect(file);
      toast.success("Image captured successfully");
      e.target.value = null; // Clear input
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCapture();
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      {isCapturing ? (
        <div className="flex flex-col items-center w-full max-w-md bg-gray-100 p-4 rounded-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg border border-gray-300 mb-4"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
          <div className="flex gap-4">
            <button
              type="button"
              onClick={captureImage}
              className="btn btn-primary px-4"
              disabled={isLoading}
            >
              Capture Image
            </button>
            <button
              type="button"
              onClick={stopCapture}
              className="btn btn-secondary px-4"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={startCapture}
            className={`btn btn-primary px-4 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Starting Camera..." : "Use Webcam"}
          </button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleMobileCapture}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="btn btn-primary px-4"
          >
            Use Mobile Camera
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCapture;