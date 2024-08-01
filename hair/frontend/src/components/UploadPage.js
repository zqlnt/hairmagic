import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-cropper';
import Modal from 'react-modal';
import 'cropperjs/dist/cropper.css';

Modal.setAppElement('#root'); // Set the app root element for accessibility

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [cropData, setCropData] = useState('');
  const [croppedImage, setCroppedImage] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const cropperRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
      setModalIsOpen(true); // Open the modal when the image is loaded
    };

    reader.readAsDataURL(file);
  };

  const getCropData = () => {
    if (typeof cropperRef.current.cropper !== 'undefined') {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      croppedCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setCroppedImage(url);
        setCropData(croppedCanvas.toDataURL());
        sessionStorage.setItem('uploadedImage', croppedCanvas.toDataURL());
        sessionStorage.setItem('uploadedImageFile', url);
        setModalIsOpen(false); // Close the modal after cropping
        navigate('/canvas');
      });
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <label
        htmlFor="fileInput"
        className="w-96 h-96 border-2 border-dashed border-blue-500 flex justify-center items-center cursor-pointer transition duration-300 ease-in-out hover:bg-blue-50 hover:border-blue-700"
      >
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full h-full opacity-0 absolute cursor-pointer"
        />
        <div className="text-blue-500 text-lg">Click to upload a photo</div>
      </label>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Crop Image"
        className="flex flex-col items-center justify-center"
        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
      >
        <h2 className="text-2xl mb-4">Crop Image</h2>
        {image && (
          <div className="mt-5">
            <Cropper
              src={image}
              style={{ height: 400, width: '100%' }}
              initialAspectRatio={1}
              aspectRatio={1}
              guides={false}
              ref={cropperRef}
            />
            <button onClick={getCropData} className="mt-4 bg-blue-500 text-white rounded p-2">
              Crop & Proceed
            </button>
          </div>
        )}
      </Modal>
      
      {cropData && (
        <img src={cropData} alt="Cropped" className="mt-5 w-40 h-auto border-2 border-blue-500 rounded" />
      )}
    </div>
  );
};

export default UploadPage;
