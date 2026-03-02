import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import { faker } from '@faker-js/faker';

import Endpoint from './models/Endpoint.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mockify')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Routes

// Create a new mock API endpoint
app.post('/api/create-endpoint', async (req, res) => {
    try {
        const { rowCount, fields } = req.body;

        if (!fields || !Array.isArray(fields) || fields.length === 0) {
            return res.status(400).json({ error: 'Fields are required to create a schema.' });
        }

        // Generate unique 8-character ID
        const endpointId = nanoid(8);

        const newEndpoint = new Endpoint({
            endpointId,
            rowCount: rowCount || 10,
            fields,
        });

        await newEndpoint.save();

        const url = `http://localhost:${PORT}/api/mock/${endpointId}`;
        res.status(201).json({ url, endpointId });
    } catch (error) {
        console.error('Error creating endpoint:', error);
        res.status(500).json({ error: 'Server error while creating endpoint' });
    }
});

// Helper function to map dataType to Faker.js methods
const generateFakeData = (dataType) => {
    switch (dataType) {
        case 'UUID':
            return faker.string.uuid();
        case 'First Name':
            return faker.person.firstName();
        case 'Last Name':
            return faker.person.lastName();
        case 'Email':
            return faker.internet.email();
        case 'Avatar URL':
            return faker.image.avatar();
        default:
            return faker.lorem.word();
    }
};

// Hit the dynamically created mock API
app.get('/api/mock/:endpointId', async (req, res) => {
    try {
        const { endpointId } = req.params;

        const endpoint = await Endpoint.findOne({ endpointId });

        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint not found' });
        }

        const { rowCount, fields } = endpoint;
        const generatedData = [];

        // Generate 'rowCount' number of objects
        for (let i = 0; i < rowCount; i++) {
            const rowData = {};
            fields.forEach(field => {
                // Map frontend readable types to Faker functions
                rowData[field.fieldName] = generateFakeData(field.dataType);
            });
            generatedData.push(rowData);
        }

        res.status(200).json(generatedData);

    } catch (error) {
        console.error('Error serving mock data:', error);
        res.status(500).json({ error: 'Server error while generating mock data' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
