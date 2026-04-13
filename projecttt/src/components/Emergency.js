import React, { useEffect, useState } from 'react';

function Emergency() {
  const [lastPress, setLastPress] = useState(0);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Handle power button press
    const handleKeyPress = (event) => {
      if (event.key === 'Power') {
        const currentTime = new Date().getTime();
        const lastPressTime = lastPress;
        const timeDiff = currentTime - lastPressTime;

        if (timeDiff < 500 && timeDiff > 0) {
          // Double press detected
          sendEmergencyLocation();
        }
        setLastPress(currentTime);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lastPress]);

  const sendEmergencyLocation = async () => {
    if (!location) {
      alert('Location not available. Please enable location services.');
      return;
    }

    const phoneNumber = '8946073744';
    const message = `Emergency Alert! My current location is: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    
    try {
      // Using the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Emergency Location',
          text: message,
          url: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
        });
      } else {
        // Fallback to SMS
        window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      }
    } catch (error) {
      console.error('Error sending location:', error);
      alert('Failed to send location. Please try again.');
    }
  };

  return (
    <div className="emergency-container">
      <h2>Emergency Features</h2>
      <p>Double press the power button to send your location to emergency contacts.</p>
      <p>Current location status: {location ? 'Available' : 'Not available'}</p>
    </div>
  );
}

export default Emergency; 