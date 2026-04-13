import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, List, Divider, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { fetchSosHistory } from '../utils/fetchSosHistory';

const SosHistoryScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const result = await fetchSosHistory(50);
      if (!result.ok) {
        setError(result.error || 'Could not load history');
        setItems([]);
        return;
      }
      setItems(result.items || []);
      setInfo(result.message || null);
    } catch (e) {
      setError(e.message || 'Could not load history');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const formatTime = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return String(iso);
    }
  };

  const renderItem = ({ item }) => (
    <>
      <List.Item
        title={formatTime(item.triggeredAt)}
        description={`Contacts: ${item.contactCount ?? 0} · SMS: ${item.smsStatus || '—'}`}
        left={(props) => <List.Icon {...props} icon="alarm-light" />}
      />
      <Divider />
    </>
  );

  if (loading && items.length === 0 && !error) {
    return (
      <View style={styles.fullCenter}>
        <ActivityIndicator size="large" color="#FF4081" />
      </View>
    );
  }

  if (!loading && error) {
    return (
      <View style={styles.fullCenter}>
        <Text style={styles.errorText} variant="bodyMedium">
          {error}
        </Text>
        <Button mode="contained" onPress={load} style={styles.retryBtn}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          items.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={
          <Text style={styles.emptyText} variant="bodyLarge">
            {info ? info : 'No SOS events yet.'}
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} colors={['#FF4081']} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fullCenter: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    color: '#c62828',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#FF4081',
  },
});

export default SosHistoryScreen;
