import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Dimensions, Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import { FAB, Portal, Dialog, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const MapScreen = ({ route }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSafeRoutes, setShowSafeRoutes] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', content: '' });

  useEffect(() => {
    (async () => {
      const routeLocation = route?.params?.location;
      if (routeLocation?.coords?.latitude && routeLocation?.coords?.longitude) {
        setLocation(routeLocation);
        setIsLoading(false);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(location);
        setIsLoading(false);
      } catch (error) {
        setErrorMsg('Error getting location');
        setIsLoading(false);
      }
    })();
  }, [route]);

  const region = useMemo(() => {
    if (!location?.coords) return null;
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }, [location]);

  const leafletHtml = useMemo(() => {
    const lat = region?.latitude ?? 20.5937;
    const lng = region?.longitude ?? 78.9629;
    const zoom = region ? 16 : 4;

    // OpenStreetMap + Leaflet (no Google API key needed)
    return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossorigin=""
    ></script>
    <script>
      const lat = ${lat};
      const lng = ${lng};
      const zoom = ${zoom};

      const map = L.map('map', { zoomControl: true }).setView([lat, lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup('Your location').openPopup();
    </script>
  </body>
</html>`;
  }, [region]);

  const showDialog = (title, content) => {
    setDialogContent({ title, content });
    setVisible(true);
  };

  const hideDialog = () => setVisible(false);

  const handleShareLocation = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    const message = `Here's my current location:\nhttps://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
    showDialog('Share Location', message);
  };

  const handleSafeRoutes = () => {
    setShowSafeRoutes(!showSafeRoutes);
    if (!showSafeRoutes && location) {
      // Here you would typically fetch safe routes from your backend
      showDialog('Safe Routes', 'Safe routes are being calculated...');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text>{errorMsg}</Text>
        {Platform.OS !== 'web' && (
          <Button
            mode="contained"
            style={{ marginTop: 12, backgroundColor: '#FF4081' }}
            onPress={async () => {
              try {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setLocation(loc);
                setErrorMsg(null);
              } catch {
                Alert.alert('Error', 'Could not fetch location');
              }
            }}
          >
            Retry
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: leafletHtml }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
      />

      <FAB
        style={[styles.fab, showSafeRoutes && styles.fabActive]}
        icon={showSafeRoutes ? "map-marker-path" : "map-marker"}
        label={showSafeRoutes ? "Hide Safe Routes" : "Show Safe Routes"}
        onPress={handleSafeRoutes}
      />

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{dialogContent.title}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>{dialogContent.content}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog} mode="contained" style={styles.dialogButton}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF4081',
  },
  fabActive: {
    backgroundColor: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutContainer: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: '#FF4081',
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4081',
  },
  dialogContent: {
    fontSize: 16,
    color: '#333',
  },
  dialogButton: {
    backgroundColor: '#FF4081',
    borderRadius: 8,
  },
});

export default MapScreen; 