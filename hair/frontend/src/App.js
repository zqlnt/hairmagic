import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UploadPage from './components/UploadPage';
import CanvasPage from './components/CanvasPage';
import GridPage from './components/GridPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/canvas" element={<CanvasPage />} />
        <Route path="/grid" element={<GridPage />} />
      </Routes>
    </Router>
  );
};

export default App;
