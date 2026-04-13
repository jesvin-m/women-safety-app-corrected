const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const SosHistory = require('./models/SosHistory');

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected:', MONGO_URI.replace(/\/\/.*@/, '//***@')))
    .catch((err) => console.error('MongoDB connection error:', err.message));
} else {
  console.warn('MONGO_URI not set; SOS history will not be saved.');
}

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

app.get('/api/sos-history', async (req, res) => {
  try {
    if (!isMongoReady()) {
      return res.json({
        ok: true,
        items: [],
        message: 'Database not connected. Set MONGO_URI and ensure MongoDB is running.',
      });
    }
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const items = await SosHistory.find()
      .sort({ triggeredAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    res.json({
      ok: true,
      items: items.map((doc) => ({
        id: String(doc._id),
        triggeredAt: doc.triggeredAt,
        contactCount: doc.contactCount,
        latitude: doc.latitude,
        longitude: doc.longitude,
        smsStatus: doc.smsStatus,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    console.error('sos-history error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Initialize activeEmergencies Map
const activeEmergencies = new Map();

// Single route handler for server status
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    message: 'Emergency alert server is operational'
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['polling', 'websocket']
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Twilio config (must match the account that owns the `from` number)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error(
    'Missing Twilio configuration. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in server/.env'
  );
}

const twilioClient = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('emergency_alert', async (data) => {
    const triggeredAt = new Date();
    let historyId = null;

    try {
      console.log('Received emergency alert:', data);
      const { phoneNumbers, message } = data;

      if (!phoneNumbers || phoneNumbers.length === 0) {
        throw new Error('No phone numbers provided');
      }

      // Persist SOS trigger time (even if SMS fails later)
      if (isMongoReady()) {
        try {
          const doc = await SosHistory.create({
            triggeredAt,
            socketId: socket.id,
            contactCount: phoneNumbers.length,
            latitude: data.location?.latitude,
            longitude: data.location?.longitude,
            messagePreview: (message || '').slice(0, 500),
            smsStatus: 'pending',
          });
          historyId = doc._id;
        } catch (e) {
          console.error('SOS history insert failed:', e.message);
        }
      }

      if (!twilioClient) {
        throw new Error('Twilio client not configured. Check server/.env');
      }
      if (!TWILIO_PHONE_NUMBER) {
        throw new Error('TWILIO_PHONE_NUMBER is missing. Check server/.env');
      }

      // Format phone numbers to E.164 format
      const formattedNumbers = phoneNumbers.map(number => {
        // Remove any non-digit characters
        const cleaned = number.replace(/\D/g, '');
        // Add country code if not present
        return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
      });

      const results = await Promise.all(
        formattedNumbers.map(async phoneNumber => {
          try {
            const result = await twilioClient.messages.create({
              body: message,
              to: phoneNumber,
              from: TWILIO_PHONE_NUMBER
            });
            console.log(`SMS sent to ${phoneNumber}:`, result.sid);
            return result;
          } catch (error) {
            console.error(`Failed to send SMS to ${phoneNumber}:`, error);
            throw error;
          }
        })
      );

      // Store emergency session with formatted numbers
      activeEmergencies.set(socket.id, {
        phoneNumbers: formattedNumbers,
        startTime: new Date(),
      });

      if (historyId) {
        await SosHistory.findByIdAndUpdate(historyId, {
          smsStatus: 'success',
          smsError: null,
        }).catch(() => {});
      }

      console.log('All SMS sent successfully:', results.map(r => r.sid));
      socket.emit('alert_sent', { 
        success: true, 
        message: 'Emergency alert sent successfully' 
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      if (historyId) {
        await SosHistory.findByIdAndUpdate(historyId, {
          smsStatus: 'failed',
          smsError: (error.message || 'unknown').slice(0, 500),
        }).catch(() => {});
      }
      socket.emit('alert_error', { 
        success: false, 
        message: error.message 
      });
    }
  });

  socket.on('location_update', async (data) => {
    try {
      console.log('Received location update:', data);
      const emergency = activeEmergencies.get(socket.id);
      if (!emergency) {
        console.log('No active emergency found for socket:', socket.id);
        return;
      }

      if (!twilioClient) {
        throw new Error('Twilio client not configured. Check server/.env');
      }
      if (!TWILIO_PHONE_NUMBER) {
        throw new Error('TWILIO_PHONE_NUMBER is missing. Check server/.env');
      }

      const { latitude, longitude } = data;
      const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = `Location Update (${new Date().toLocaleTimeString()}): Person in emergency is now at:\n${locationUrl}`;

      const results = await Promise.all(
        emergency.phoneNumbers.map(phoneNumber => 
          twilioClient.messages.create({
            body: message,
            to: phoneNumber,
            from: TWILIO_PHONE_NUMBER
          })
        )
      );

      console.log('Location update sent:', results);
      socket.emit('location_sent', { success: true });
    } catch (error) {
      console.error('Error sending location update:', error);
      socket.emit('location_error', { 
        success: false, 
        message: error.message 
      });
    }
  });

  socket.on('stop_emergency', () => {
    if (activeEmergencies.has(socket.id)) {
      activeEmergencies.delete(socket.id);
      socket.emit('emergency_stopped');
    }
  });

  socket.on('disconnect', () => {
    activeEmergencies.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log('Ready to receive emergency alerts');
});