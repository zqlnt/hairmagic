import React, { useEffect, useState } from 'react';

const Loader = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-24 h-24 animate-spin"></div>
      <div className="mt-4 text-xl">{elapsedTime} seconds</div>
    </div>
  );
};

export default Loader;
