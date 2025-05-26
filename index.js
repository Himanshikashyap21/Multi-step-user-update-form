const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads/
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userProfile', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Define user schema
const userSchema = new mongoose.Schema({
    profilePhoto: String,
    username: { type: String, unique: true, required: true },
    currentPassword: String,
    newPassword: { type: String, required: true },
    profession: { type: String, required: true },
    companyName: String,
    addressLine1: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    subscriptionPlan: { type: String, required: true },
    newsletter: { type: Boolean, default: false },
});


const User = mongoose.model('User', userSchema);

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG and PNG images are allowed'));
        }
    }
});

// Route to upload profile photo (optional)
app.post('/api/upload', upload.single('profilePhoto'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ filePath: req.file.path });
});

// Route to create a user profile
app.post('/api/user', upload.single('profilePhoto'), async (req, res) => {
    try {
        const {
            username,
            currentPassword,
            newPassword,
            profession,
            companyName,
            addressLine1,
            country,
            state,
            city,
            subscriptionPlan,
            newsletter
        } = req.body;

        const user = new User({
            profilePhoto: req.file ? req.file.path : '',
            username,
            currentPassword,
            newPassword,
            profession,
            companyName: profession === 'Entrepreneur' ? companyName : '',
            addressLine1,
            country,
            state,
            city,
            subscriptionPlan,
            newsletter: newsletter === 'true' || newsletter === true,
        });

        console.log("Saving user to DB:", user);

        const savedUser = await user.save();

        console.log("Saved user:", savedUser);

        res.status(201).json({ message: "User profile created", user: savedUser });
    } catch (error) {
        console.error("Save error:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/test-save', async (req, res) => {
    try {
        const dummy = new User({
            profilePhoto: '',
            username: 'testuser_' + Date.now(),
            currentPassword: '123456',
            newPassword: 'Test@1234',
            profession: 'Developer',
            companyName: '',
            addressLine1: '123 Test Street',
            country: 'India',
            state: 'Maharashtra',
            city: 'Mumbai',
            subscriptionPlan: 'Basic',
            newsletter: true,
        });

        const saved = await dummy.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Dummy location data
const countries = [
    { name: 'USA', states: ['California', 'Texas', 'New York'] },
    { name: 'India', states: ['Maharashtra', 'Karnataka', 'Delhi'] },
];

const cities = {
    California: ['Los Angeles', 'San Francisco'],
    Texas: ['Houston', 'Dallas'],
    New_York: ['New York City', 'Buffalo'],
    Maharashtra: ['Mumbai', 'Pune'],
    Karnataka: ['Bangalore', 'Mysore'],
    Delhi: ['New Delhi', 'Old Delhi'],
};

// Country/state/city routes
app.get('/api/countries', (req, res) => {
    res.json(countries);
});

app.get('/api/states/:country', (req, res) => {
    const country = countries.find(c => c.name === req.params.country);
    if (country) {
        res.json(country.states);
    } else {
        res.status(404).send('Country not found');
    }
});

app.get('/api/cities/:state', (req, res) => {
    const stateCities = cities[req.params.state];
    if (stateCities) {
        res.json(stateCities);
    } else {
        res.status(404).send('State not found');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
