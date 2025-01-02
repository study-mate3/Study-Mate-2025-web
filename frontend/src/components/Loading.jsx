import React from 'react';

const Loading = () => {
  return (
    <div style={styles.container}>
      <img
        src='../components/loading.gif'
        alt="Loading..."
        style={styles.gif}
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  gif: {
    width: '150px', // Adjust size as needed
  },
};

export default Loading;
