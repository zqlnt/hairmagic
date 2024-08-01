import React, { useState, useEffect } from 'react';
import Canvas from './Canvas';

const CanvasPage = () => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const uploadedImage = sessionStorage.getItem('uploadedImage');
    if (uploadedImage) {
      setImage(uploadedImage);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-12 bg-gray-100">
      {image ? (
        <Canvas image={image} />
      ) : (
        <p className="text-gray-600">No image uploaded. Please go back and upload an image.</p>
      )}
    </div>
  );
};

export default CanvasPage;
