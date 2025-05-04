import React from 'react';

const Loading = () => {
  return (
    <div style={styles.container}>
      <img
        src='/loading.gif'
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
    width: '250px', // Adjust size as needed
  },
};

export default Loading;
