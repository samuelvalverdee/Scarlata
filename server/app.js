const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connection');
const Spot = require('./models/spot');

const app = express();

async function main() {
    await connectDB();
}

main().catch((err) => console.log(`Connection error: ${err}`));

// CORS: allow the future Vite dev server (default port 5173) to call this API
// with cookies once auth lands. Update the origin if your client runs elsewhere.
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());

// *********************************************************************
// Same CRUD shape as your YelpCamp app.js, but res.json(...) instead of
// res.render(...) — no views here, this only ever speaks JSON.

app.get('/api/spots', async (req, res) => {
    const spots = await Spot.find({});
    res.json(spots);
});

app.post('/api/spots', async (req, res) => {
    const spot = new Spot(req.body.spot);
    await spot.save();
    res.status(201).json(spot);
});

app.get('/api/spots/:id', async (req, res) => {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    res.json(spot);
});

app.put('/api/spots/:id', async (req, res) => {
    const { id } = req.params;
    const spot = await Spot.findByIdAndUpdate(id, { ...req.body.spot }, { new: true });
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    res.json(spot);
});

app.delete('/api/spots/:id', async (req, res) => {
    const { id } = req.params;
    await Spot.findByIdAndDelete(id);
    res.status(204).send();
});

app.listen(3001, () => {
    console.log('Scarlata API listening on port 3001');
});
