const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://social-events-client.vercel.app', 
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- 💡 PORIBORTON EKHANE ---
// Health check route-ti BAIRE thakte hobe
app.get('/', (req, res) => {
  res.send('Social Events Server is running');
});
// --- PORIBORTON SHESH ---

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let eventsCollection;
let joinedEventsCollection;
let subscribersCollection;
let routesRegistered = false;

async function run() {
  try {
    console.log("Attempting to connect to MongoDB...");

    // Connect (or reuse existing connection)
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = client.connect();
    }
    await global._mongoClientPromise;

    const database = client.db('socialEventsDB');
    eventsCollection = database.collection('events');
    joinedEventsCollection = database.collection('joinedEvents');
    subscribersCollection = database.collection('subscribers');

    console.log("Connected to MongoDB and collections initialized");

    // Register routes only once
    if (routesRegistered) return;
    routesRegistered = true;

    app.get('/api/events', async (req, res) => {
      try {
        const { eventType, search } = req.query;
        const currentDate = new Date().toISOString().split('T')[0];

        let query = {
          eventDate: { $gte: currentDate }
        };

        if (eventType && eventType !== 'all') {
          query.eventType = eventType;
        }

        if (search) {
          query.title = { $regex: search, $options: 'i' };
        }

        const events = await eventsCollection
          .find(query)
          .sort({ eventDate: 1 })
          .toArray();

        res.json(events);
      } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: error.message });
      }
    });

    app.get('/api/events/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const event = await eventsCollection.findOne(query);
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
      } catch (error) {
        console.error('Error fetching event:', error);
        if (error.name === 'BSONError' || error.message.includes('ObjectId')) {
          return res.status(400).json({ message: 'Invalid event ID' });
        }
        res.status(500).json({ message: error.message });
      }
    });

    app.get('/api/my-events/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const events = await eventsCollection
          .find({ creatorEmail: email })
          .sort({ eventDate: 1 })
          .toArray();
        res.json(events);
      } catch (error) {
        console.error('Error fetching my events:', error);
        res.status(500).json({ message: error.message });
      }
    });

    app.post('/api/events', async (req, res) => {
      try {
        const event = req.body;
        console.log('Received event data:', JSON.stringify(event, null, 2));

        // Validate required fields
        if (!event.title || !event.description || !event.eventType || !event.location || !event.eventDate || !event.creatorEmail) {
          console.error('Missing required fields:', {
            title: !!event.title,
            description: !!event.description,
            eventType: !!event.eventType,
            location: !!event.location,
            eventDate: !!event.eventDate,
            creatorEmail: !!event.creatorEmail
          });
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate field lengths
        if (event.title.length < 5) {
          return res.status(400).json({ message: 'Title must be at least 5 characters' });
        }
        if (event.description.length < 20) {
          return res.status(400).json({ message: 'Description must be at least 20 characters' });
        }

        // Ensure collections are initialized
        if (!eventsCollection) {
          console.error('Events collection not initialized');
          return res.status(500).json({ message: 'Database not initialized. Please try again.' });
        }

        // Prepare event document
        const eventDocument = {
          title: event.title.trim(),
          description: event.description.trim(),
          eventType: event.eventType,
          thumbnailUrl: event.thumbnailUrl || '',
          location: event.location.trim(),
          eventDate: event.eventDate,
          creatorEmail: event.creatorEmail,
          creatorName: event.creatorName || event.creatorEmail,
          createdAt: new Date()
        };

        console.log('Inserting event document:', JSON.stringify(eventDocument, null, 2));
        
        const result = await eventsCollection.insertOne(eventDocument);
        console.log('Event inserted successfully:', result.insertedId);
        
        res.status(201).json({
          success: true,
          insertedId: result.insertedId,
          message: 'Event created successfully'
        });
      } catch (error) {
        console.error('Error creating event:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
          return res.status(400).json({ message: 'Duplicate event detected' });
        }
        if (error.name === 'MongoServerError') {
          return res.status(500).json({ 
            message: 'Database error occurred',
            error: error.message 
          });
        }
        if (error.name === 'MongoNetworkError') {
          return res.status(503).json({ 
            message: 'Database connection error. Please try again later.',
            error: error.message 
          });
        }
        
        res.status(500).json({ 
          message: error.message || 'Failed to create event',
          error: error.toString()
        });
      }
    });

    app.put('/api/events/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const event = req.body;

        if (!event.title || !event.description || !event.eventType || !event.location || !event.eventDate) {
          return res.status(400).send({ message: 'Missing required fields' });
        }

        if (event.title.length < 5) {
          return res.status(400).send({ message: 'Title must be at least 5 characters' });
        }
        if (event.description.length < 20) {
          return res.status(400).send({ message: 'Description must be at least 20 characters' });
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            thumbnailUrl: event.thumbnailUrl,
            location: event.location,
            eventDate: event.eventDate,
            updatedAt: new Date()
          }
        };
        const result = await eventsCollection.updateOne(filter, updateDoc);
        res.json(result);
      } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: error.message });
      }
    });

    app.delete('/api/events/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        
        // First, check if event exists
        const event = await eventsCollection.findOne(query);
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }

        // Delete all joined events related to this event
        const deleteJoinedEventsResult = await joinedEventsCollection.deleteMany({
          eventId: id
        });
        console.log(`Deleted ${deleteJoinedEventsResult.deletedCount} joined event(s) for event ${id}`);

        // Now delete the event itself
        const result = await eventsCollection.deleteOne(query);
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Event not found or already deleted' });
        }

        res.json({
          success: true,
          message: 'Event and related joined events deleted successfully',
          deletedEvent: result.deletedCount,
          deletedJoinedEvents: deleteJoinedEventsResult.deletedCount
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        console.error('Error stack:', error.stack);
        
        // Handle invalid ObjectId
        if (error.name === 'BSONError' || error.message.includes('ObjectId')) {
          return res.status(400).json({ message: 'Invalid event ID' });
        }
        
        res.status(500).json({ 
          message: error.message || 'Failed to delete event. Please try again.'
        });
      }
    });

    app.post('/api/join-event', async (req, res) => {
      try {
        const joinData = req.body;

        if (!joinData.eventId || !joinData.userEmail || !joinData.userName) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingJoin = await joinedEventsCollection.findOne({
          eventId: joinData.eventId,
          userEmail: joinData.userEmail
        });

        if (existingJoin) {
          return res.status(400).json({ message: 'Already joined this event' });
        }

        joinData.joinedAt = new Date();
        const result = await joinedEventsCollection.insertOne(joinData);
        res.json(result);
      } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).json({ message: error.message });
      }
    });

    app.get('/api/joined-events/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const joinedEvents = await joinedEventsCollection
          .find({ userEmail: email })
          .sort({ eventDate: 1 })
          .toArray();
        res.json(joinedEvents);
      } catch (error) {
        console.error('Error fetching joined events:', error);
        res.status(500).json({ message: error.message });
      }
    });

    app.delete('/api/joined-events/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        
        // Check if joined event exists
        const joinedEvent = await joinedEventsCollection.findOne(query);
        if (!joinedEvent) {
          return res.status(404).json({ message: 'Joined event not found' });
        }

        // Delete the joined event
        const result = await joinedEventsCollection.deleteOne(query);
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Joined event not found or already deleted' });
        }

        res.json({
          success: true,
          message: 'Event removed from your joined events successfully',
          deletedCount: result.deletedCount
        });
      } catch (error) {
        console.error('Error removing joined event:', error);
        console.error('Error stack:', error.stack);
        
        // Handle invalid ObjectId
        if (error.name === 'BSONError' || error.message.includes('ObjectId')) {
          return res.status(400).json({ message: 'Invalid joined event ID' });
        }
        
        res.status(500).json({ 
          message: error.message || 'Failed to remove event. Please try again.'
        });
      }
    });

    app.get('/api/check-join/:eventId/:email', async (req, res) => {
      try {
        const { eventId, email } = req.params;
        const joined = await joinedEventsCollection.findOne({
          eventId: eventId,
          userEmail: email
        });
        res.json({ joined: !!joined });
      } catch (error) {
        console.error('Error checking join status:', error);
        res.status(500).json({ message: error.message });
      }
    });

    app.post('/api/subscribe', async (req, res) => {
      try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.trim()) {
          return res.status(400).json({ message: 'Email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Check if email already exists
        const existingSubscriber = await subscribersCollection.findOne({
          email: email.trim().toLowerCase()
        });

        if (existingSubscriber) {
          return res.status(400).json({ message: 'This email is already subscribed' });
        }

        // Ensure collection is initialized
        if (!subscribersCollection) {
          console.error('Subscribers collection not initialized');
          return res.status(500).json({ message: 'Database not initialized. Please try again.' });
        }

        // Insert subscriber
        const subscriberData = {
          email: email.trim().toLowerCase(),
          subscribedAt: new Date(),
          isActive: true
        };

        console.log('Subscribing email:', email.trim().toLowerCase());
        const result = await subscribersCollection.insertOne(subscriberData);
        console.log('Subscriber added successfully:', result.insertedId);

        res.status(201).json({
          success: true,
          message: 'Successfully subscribed to newsletter!',
          insertedId: result.insertedId
        });
      } catch (error) {
        console.error('Error subscribing:', error);
        console.error('Error stack:', error.stack);
        
        // Handle duplicate key error
        if (error.code === 11000) {
          return res.status(400).json({ message: 'This email is already subscribed' });
        }
        
        res.status(500).json({ 
          message: error.message || 'Failed to subscribe. Please try again later.'
        });
      }
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

// Export a handler for serverless platforms (Vercel) and also support local start
let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await run();
    initialized = true;
  }
}

if (require.main === module) {
  // Local development: initialize and start listener
  ensureInitialized()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to initialize server:', err);
      process.exit(1);
    });
} else {
  // Export a handler for serverless (Vercel will call this)
  module.exports = async (req, res) => {
    try {
      await ensureInitialized();
      app(req, res);
    } catch (err) {
      console.error('Serverless handler init error:', err);
      res.status(500).send('Server initialization error');
    }
  };
}