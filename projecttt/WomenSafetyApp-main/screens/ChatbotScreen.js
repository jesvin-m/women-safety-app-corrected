import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import Constants from 'expo-constants';

function getGeminiApiKey() {
  // Prefer Expo config extra (loaded from app.config.js + .env via dotenv).
  const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
  return (
    extra.EXPO_PUBLIC_GEMINI_API_KEY ||
    // Fallback: sometimes available in dev
    process.env.EXPO_PUBLIC_GEMINI_API_KEY
  );
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_LIST_MODELS = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL_CANDIDATES = [
  // Newer models are more likely to be enabled on fresh API keys.
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
];

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hi, I am your safety assistant. Ask me anything about staying safe or using the app.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    const GEMINI_API_KEY = getGeminiApiKey();
    if (!GEMINI_API_KEY) {
      setError('Gemini API key is not configured. Set EXPO_PUBLIC_GEMINI_API_KEY and reload the app.');
      return;
    }

    const userMessage = { id: Date.now().toString(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setError(null);

    try {
      let lastError = null;
      let data = null;
      let attemptedModels = [];

      // Prefer models actually enabled on this key.
      let modelsToTry = [...GEMINI_MODEL_CANDIDATES];
      try {
        const lm = await fetch(`${GEMINI_LIST_MODELS}?key=${GEMINI_API_KEY}`);
        if (lm.ok) {
          const lmData = await lm.json();
          const available = (lmData?.models || [])
            .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
            .map((m) => String(m.name || '').replace(/^models\//, ''))
            .filter(Boolean);

          // Keep our preferred order, but only if present; then append others.
          const preferred = GEMINI_MODEL_CANDIDATES.filter((m) => available.includes(m));
          const rest = available.filter((m) => !preferred.includes(m));
          modelsToTry = preferred.length ? [...preferred, ...rest] : available;
        }
      } catch {
        // ignore listModels failures; fallback to static candidates
      }

      for (const model of modelsToTry) {
        attemptedModels.push(model);
        const endpoint = `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: trimmed }] }],
          }),
        });

        if (resp.ok) {
          data = await resp.json();
          lastError = null;
          break;
        }

        const text = await resp.text();
        lastError = new Error(`Gemini model ${model} error ${resp.status}: ${text}`);

        // If the key is invalid/blocked, no point trying more models.
        if (resp.status === 401 || resp.status === 403) break;
      }

      if (!data) {
        console.error('Gemini attempted models:', attemptedModels);
        throw lastError || new Error('Gemini request failed');
      }

      const modelText =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join(' ') ||
        'Sorry, I could not generate a response.';

      const botMessage = {
        id: Date.now().toString() + '-bot',
        role: 'model',
        text: modelText,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      console.error('Gemini request failed', e);
      setError('Failed to contact Gemini. Please check your internet and API key.');
      const botMessage = {
        id: Date.now().toString() + '-error',
        role: 'model',
        text: 'I had trouble talking to the AI service. Please try again in a moment.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Safety Chatbot</Text>
        <Text style={styles.subtitle}>Ask questions about safety or how to use SOSAngel.</Text>
      </View>

      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.map((m) => (
          <Card
            key={m.id}
            style={[
              styles.messageCard,
              m.role === 'user' ? styles.userMessageCard : styles.botMessageCard,
            ]}
          >
            <Card.Content>
              <Text style={m.role === 'user' ? styles.userText : styles.botText}>{m.text}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <Button
          mode="contained"
          onPress={sendMessage}
          disabled={isSending || !input.trim()}
          style={styles.sendButton}
        >
          {isSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendLabel}>Send</Text>}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF4081',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
  messages: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  messageCard: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  userMessageCard: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFEBF2',
  },
  botMessageCard: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
  },
  userText: {
    color: '#C2185B',
  },
  botText: {
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
  },
  sendLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default ChatbotScreen;

