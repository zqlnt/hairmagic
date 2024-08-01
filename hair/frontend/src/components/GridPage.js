import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Loader from './Loader';

const GridPage = () => {
  const location = useLocation();
  const { gridImageUrl } = location.state || {};
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gridImageUrl) {
      setLoading(false);
    }
  }, [gridImageUrl]);

  const handleProcessNextPicture = () => {
    sessionStorage.removeItem('uploadedImage');
    sessionStorage.removeItem('uploadedImageFile');
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-100">
      {loading ? (
        <Loader />
      ) : (
        <>
          <img src={gridImageUrl} alt="Generated Grid" className="mt-5 max-w-full h-auto border-2 border-blue-500 rounded" />
          <button className="mt-5 p-2 bg-blue-500 text-white rounded hover:bg-blue-700" onClick={handleProcessNextPicture}>
            Process next picture
          </button>
        </>
      )}
    </div>
  );
};

export default GridPage;
