import React from 'react';

const Unauthorized = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
    },
    image: {
      maxWidth: '200px', // Adjust the size of the image as needed
      marginBottom: '20px',
    },
    text: {
      fontSize: '22px',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <img
        src="./unauthorized.jpg" // Replace with the path to your image
        alt="Access Denied"
        style={styles.image}
      />
      <h2 style={styles.text}>Sorry, you don’t have access to this page. 🙁</h2>
    </div>
  );
};

export default Unauthorized;
