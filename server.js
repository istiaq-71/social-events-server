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

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
 
    console.log("Attempting to connect to MongoDB...");
    
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db('socialEventsDB');
    const eventsCollection = database.collection('events');
    const joinedEventsCollection = database.collection('joinedEvents');

    
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
        
        res.send(events);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

 
    app.get('/api/events/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const event = await eventsCollection.findOne(query);
        res.send(event);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    
    app.get('/api/my-events/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const events = await eventsCollection
          .find({ creatorEmail: email })
          .sort({ eventDate: 1 })
          .toArray();
        res.send(events);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    app.post('/api/events', async (req, res) => {
      try {
        const event = req.body;
        
        if (!event.title || !event.description || !event.eventType || !event.location || !event.eventDate || !event.creatorEmail) {
          return res.status(400).send({ message: 'Missing required fields' });
        }
        
        if (event.title.length < 5) {
          return res.status(400).send({ message: 'Title must be at least 5 characters' });
        }
        if (event.description.length < 20) {
          return res.status(400).send({ message: 'Description must be at least 20 characters' });
        }
        
        event.createdAt = new Date();
        const result = await eventsCollection.insertOne(event);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // Update event
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
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // Delete event
    app.delete('/api/events/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await eventsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // Join event
    app.post('/api/join-event', async (req, res) => {
      try {
        const joinData = req.body;
        
        if (!joinData.eventId || !joinData.userEmail || !joinData.userName) {
          return res.status(400).send({ message: 'Missing required fields' });
        }
        
        const existingJoin = await joinedEventsCollection.findOne({
          eventId: joinData.eventId,
          userEmail: joinData.userEmail
        });

        if (existingJoin) {
          return res.status(400).send({ message: 'Already joined this event' });
        }

        joinData.joinedAt = new Date();
        const result = await joinedEventsCollection.insertOne(joinData);
        res.send(result);
      } catch (error)
      {
        res.status(500).send({ message: error.message });
      }
    });

    // Get joined events by user email
    app.get('/api/joined-events/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const joinedEvents = await joinedEventsCollection
          .find({ userEmail: email })
          .sort({ eventDate: 1 })
          .toArray();
        res.send(joinedEvents);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // Check if user joined specific event
    app.get('/api/check-join/:eventId/:email', async (req, res) => {
      try {
        const { eventId, email } = req.params;
        const joined = await joinedEventsCollection.findOne({
          eventId: eventId,
          userEmail: email
        });
        res.send({ joined: !!joined });
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // Health check
    app.get('/', (req, res) => {
      res.send('Social Events Server is running');
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  } finally {

  }
}

run().catch(console.dir);

// --- VERCEL DEPLOYMENT CHANGE ---
// Purono 'app.listen' line-ti comment out kora hoyeche
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


module.exports = app;