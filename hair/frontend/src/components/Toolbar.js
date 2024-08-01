// src/components/Toolbar.js
import React from 'react';

const Toolbar = ({ onUndo, onRedo }) => {
  return (
    <div>
      <button onClick={onUndo}>Undo</button>
      <button onClick={onRedo}>Redo</button>
    </div>
  );
};

export default Toolbar;
