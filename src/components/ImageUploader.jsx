"use client"

import { useState, useRef } from "react"
import { FiUpload, FiCamera, FiX } from "react-icons/fi"

const ImageUploader = ({ onImageSelect }) => {
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
        onImageSelect(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraClick = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setShowCamera(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Could not access camera. Please check permissions.")
    }
  }

  const handleCapture = () => {
    const canvas = document.createElement("canvas")
    const video = videoRef.current

    if (video) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext("2d").drawImage(video, 0, 0)

      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
        setPreview(canvas.toDataURL("image/jpeg"))
        onImageSelect(file)
        stopCamera()
      }, "image/jpeg")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const clearImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageSelect(null)
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
        {!preview && !showCamera ? (
          <>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                <FiUpload className="mr-2" />
                Upload Image
              </button>
              <button
                type="button"
                onClick={handleCameraClick}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <FiCamera className="mr-2" />
                Use Camera
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <p className="text-sm text-gray-500">Upload a clear image of the plant for best results</p>
          </>
        ) : showCamera ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: "400px" }}
            />
            <div className="flex justify-center mt-4 space-x-4">
              <button
                type="button"
                onClick={handleCapture}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: "400px" }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <FiX size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUploader
