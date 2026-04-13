import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF4081',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 60, // Reduced from 80
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  cardContainer: {
    width: '48%', // Keep two cards per row
    marginBottom: 8, // Reduced from 16
  },
  cardSurface: {
    elevation: 4,
    borderRadius: 12,
    aspectRatio: 1.2, // Changed from 1 to make cards shorter
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  cardInner: {
    flex: 1,
    padding: 8, // Reduced from 12
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    marginTop: 4, // Reduced from 8
    marginBottom: 2, // Reduced from 4
    textAlign: 'center',
    color: '#333',
  },
  cardDescription: {
    fontSize: 11, // Reduced from 12
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 2,
  },
  sos: {
    position: 'absolute',
    margin: 16,
    left: 16,
    right: 16,
    top: -28,
    backgroundColor: '#FF4081',
    borderRadius: 30,
    zIndex: 1,
  },
  sosActive: {
    backgroundColor: '#f44336',
  },
  bottomNav: {
    backgroundColor: 'white',
    elevation: 8,
  },
  sosContainer: {
    position: 'relative',
  },
  cardElevation: {
    elevation: 4,
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
  alarmCard: {
    borderWidth: 2,
    borderColor: '#f44336',
  },
  alarmStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  alarmIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginRight: 4,
  },
  alarmActive: {
    backgroundColor: '#f44336',
  },
  alarmStatusText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
});