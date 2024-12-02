const express = require("express")
const app = express()
const mongoose = require('mongoose');
const cors = require('cors')

app.use(cors())

async function connectDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');
        console.log('Successfully connected to MongoDB.');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

const unicornSchema = new mongoose.Schema({
    name: String,
    dob: Date,
    loves: [String],
    weight: Number,
    gender: String,
    vampires: Number,
    vaccinated: Boolean
});

const Unicorn = mongoose.model('unicorns', unicornSchema);

app.get('/', (req, res) => {
    res.send("Unicorn API is running!")
})

app.get('/unicorns', async (req, res) => {
    try {
        const query = {};
        const sort = {};

        if (req.query.name) query.name = req.query.name;
        if (req.query.dob) query.dob = new Date(req.query.dob);
        if (req.query.loves) query.loves = req.query.loves;
        if (req.query.weightGreaterThan) query.weight = { $gt: Number(req.query.weightGreaterThan) };
        if (req.query.weightLessThan) query.weight = { ...query.weight, $lt: Number(req.query.weightLessThan) };
        if (req.query.vampiresGreaterThan) query.vampires = { $gt: Number(req.query.vampiresGreaterThan) };
        if (req.query.vampiresExists) query.vampires = { $exists: req.query.vampiresExists === 'true' };
        if (req.query.vaccinated) query.vaccinated = req.query.vaccinated === 'true';
        if (req.query.gender) query.gender = req.query.gender;

        if (req.query.sort) {
            const sortParams = req.query.sort.split(',');
            sortParams.forEach(param => {
                const [field, order] = param.split('.');
                sort[field] = order === 'desc' ? -1 : 1;
            });
        }

        const result = await Unicorn.find(query).sort(sort);
        res.json(result);
    } catch (error) {
        console.error('Error fetching unicorns:', error);
        res.status(500).json({ error: error.message });
    }
})

async function startServer() {
    await connectDB();
    app.listen(3000, () => {
        console.log("Server running on port 3000");
    })
}

startServer().catch(console.error);