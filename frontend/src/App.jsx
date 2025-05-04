import React, { useState, useEffect } from 'react';
import Routers from './routes/Routers';
import Loading from './components/Loading';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Show for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  return loading ? <Loading/> : <Routers />;
}

export default App;
