// Create web server
// 1. Load libraries
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

// 2. Configure environment
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

// 3. Create an instance of express
const app = express();

// 4. Load the JSON body parser
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan('combined'));
app.use(cors());

// 5. Connect to the database
const MONGO_URL = 'mongodb://localhost:27017';
const MONGO_DB = 'blog';
const MONGO_COLLECTION = 'comments';

let mongoClient;

const connect = async () => {
    try {
        mongoClient = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true });
        console.info('Connected to MongoDB');
    } catch (e) {
        console.error('Error connecting to MongoDB:', e);
    }
}

const disconnect = () => {
    mongoClient.close();
    console.info('Disconnected from MongoDB');
}

// 6. Define endpoints
app.get('/api/comments', async (req, res) => {
    const db = mongoClient.db(MONGO_DB);
    const collection = db.collection(MONGO_COLLECTION);
    const comments = await collection.find().toArray();
    res.status(200).type('application/json').json(comments);
});

app.post('/api/comments', async (req, res) => {
    const db = mongoClient.db(MONGO_DB);
    const collection = db.collection(MONGO_COLLECTION);
    const result = await collection.insertOne(req.body);
    res.status(200).type('application/json').json(result);
});

app.delete('/api/comments/:id', async (req, res) => {
    const db = mongoClient.db(MONGO_DB);
    const collection = db.collection(MONGO_COLLECTION);
    const result = await collection.deleteOne({ _id: ObjectId(req.params.id) });
    res.status(200).type('application/json').json(result);
});

// 7. Start the server
app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`);
    connect();
});

// 8. Graceful shutdown
process.on('SIGINT', () => {
    console.info('Received SIGINT');
});