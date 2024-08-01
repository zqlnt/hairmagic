import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from './Loader';

const Canvas = ({ image }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const initCanvas = () => {
      const canvas = new fabric.Canvas(canvasRef.current, {
        height: 500,
        width: 500,
        backgroundColor: '#fff',
      });

      fabricCanvasRef.current = canvas;

      if (image) {
        fabric.Image.fromURL(image, (img) => {
          fabricCanvasRef.current.setBackgroundImage(img, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current), {
            scaleX: fabricCanvasRef.current.width / img.width,
            scaleY: fabricCanvasRef.current.height / img.height,
          });
          saveInitialState();
        });
      } else {
        saveInitialState();
      }

      updateBrush();

      canvas.on('path:created', saveState);
      canvas.on('object:modified', saveState);
      canvas.on('object:added', saveState);
      canvas.on('object:removed', saveState);

      return () => {
        canvas.off('path:created', saveState);
        canvas.off('object:modified', saveState);
        canvas.off('object:added', saveState);
        canvas.off('object:removed', saveState);
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    };

    const cleanup = initCanvas();

    return cleanup;
  }, [image]);

  useEffect(() => {
    updateBrush();
  }, [brushSize]);

  const updateBrush = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvasRef.current);
      fabricCanvasRef.current.freeDrawingBrush.width = brushSize;
      fabricCanvasRef.current.freeDrawingBrush.color = 'rgba(0, 255, 0, 0.5)';
      fabricCanvasRef.current.isDrawingMode = true;
    }
  };

  const saveInitialState = () => {
    try {
      if (fabricCanvasRef.current) {
        const canvasState = fabricCanvasRef.current.toDatalessJSON();
        undoStack.current = [canvasState];
        redoStack.current = [];
      }
    } catch (error) {
      console.error('Error saving initial canvas state:', error);
    }
  };

  const saveState = () => {
    try {
      if (fabricCanvasRef.current) {
        const canvasState = fabricCanvasRef.current.toDatalessJSON();
        if (JSON.stringify(undoStack.current[undoStack.current.length - 1]) !== JSON.stringify(canvasState)) {
          undoStack.current.push(canvasState);
          redoStack.current = [];
        }
      }
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  };

  const handleUndo = () => {
    try {
      if (undoStack.current.length > 1) {
        redoStack.current.push(undoStack.current.pop());
        const previousState = undoStack.current[undoStack.current.length - 1];
        fabricCanvasRef.current.loadFromJSON(previousState, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
      } else if (undoStack.current.length === 1) {
        handleReset();
      }
    } catch (error) {
      console.error('Error performing undo:', error);
    }
  };

  const handleRedo = () => {
    try {
      if (redoStack.current.length > 0) {
        const nextState = redoStack.current.pop();
        undoStack.current.push(nextState);
        fabricCanvasRef.current.loadFromJSON(nextState, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
      }
    } catch (error) {
      console.error('Error performing redo:', error);
    }
  };

  const handleReset = () => {
    try {
      const canvas = fabricCanvasRef.current;
      const objects = canvas.getObjects();
      objects.forEach((obj) => {
        if (obj !== canvas.backgroundImage) {
          canvas.remove(obj);
        }
      });
      canvas.renderAll();
      undoStack.current = [];
      redoStack.current = [];
      saveInitialState();
    } catch (error) {
      console.error('Error resetting canvas:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStartTime(Date.now());

    if (fabricCanvasRef.current) {
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = fabricCanvasRef.current.width;
      maskCanvas.height = fabricCanvasRef.current.height;
      const maskContext = maskCanvas.getContext('2d');

      maskContext.fillStyle = '#000';
      maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      fabricCanvasRef.current.getObjects().forEach((obj) => {
        if (obj.type === 'path' && obj.stroke === 'rgba(0, 255, 0, 0.5)') {
          const pathData = obj.toObject(['path', 'stroke', 'strokeWidth', 'left', 'top', 'scaleX', 'scaleY', 'angle']);
          const path = new fabric.Path(pathData.path);
          path.set({
            stroke: '#ffffff',
            strokeWidth: pathData.strokeWidth,
            left: pathData.left,
            top: pathData.top,
            scaleX: pathData.scaleX,
            scaleY: pathData.scaleY,
            angle: pathData.angle,
            fill: '',
          });
          path.render(maskContext);
        }
      });

      const maskDataURL = maskCanvas.toDataURL('image/png');
      const originalImageBlobUrl = sessionStorage.getItem('uploadedImageFile');
      const originalImageBlob = await fetch(originalImageBlobUrl).then(res => res.blob());

      const formData = new FormData();
      formData.append('image', originalImageBlob, 'uploadedImage.png');
      formData.append('mask_image', dataURLToBlob(maskDataURL));

      try {
        const response = await axios.post('http://localhost:5000/generate', formData, {
          responseType: 'blob',
        });

        if (response.status === 200) {
          const gridImageUrl = URL.createObjectURL(response.data);
          navigate('/grid', { state: { gridImageUrl } });
        } else {
          console.error('Server responded with an error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const dataURLToBlob = (dataURL) => {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  return (
    <div className="relative flex flex-col items-center border-2 border-gray-300 rounded overflow-hidden mt-5 p-2 bg-white">
      {loading && <Loader startTime={startTime} />}
      <div className="flex gap-2 justify-center mb-2">
        <button onClick={handleReset} className="bg-blue-500 text-white rounded p-2">Reset</button>
        <button onClick={handleUndo} className="bg-blue-500 text-white rounded p-2">Undo</button>
        <button onClick={handleRedo} className="bg-blue-500 text-white rounded p-2">Redo</button>
        <button onClick={handleSubmit} className="bg-blue-500 text-white rounded p-2">Submit</button>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(event) => setBrushSize(parseInt(event.target.value, 10))}
          className="w-24"
        />
      </div>
      <canvas id="canvas" ref={canvasRef} className="border border-gray-300"></canvas>
    </div>
  );
};

export default Canvas;
