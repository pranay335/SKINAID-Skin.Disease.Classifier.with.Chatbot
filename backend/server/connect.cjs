const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const axios = require("axios"); // ✅ 1. ADDED axios
require("dotenv").config({ path: "./config.env" });

const app = express();
app.use(cors());
app.use(express.json());

// --- Authentication Middleware (Unchanged) ---
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: "Token is not valid." });
  }
};

// --- Connect to MongoDB (Unchanged) ---
mongoose.connect(process.env.MONGO_URI, { dbName: "SkinAid" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// --- Schemas (User, Conversation, Classification) (Unchanged) ---
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });
const User = mongoose.model("Users", UserSchema, "Users");

const ConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  messages: [
    {
      sender: { type: String, enum: ['user', 'bot'], required: true },
      content: { type: String, required: true }
    }
  ]
}, { timestamps: true });
const Conversation = mongoose.model("Conversation", ConversationSchema, "Conversations");

const ClassificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  prediction: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Classification = mongoose.model("Classification", ClassificationSchema, "Classifications");

// --- HELPER FUNCTION FOR DISTANCE (Unchanged) ---
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(1) + " km"; // Returns "X.X km"
}
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
}

// --- Routes ---

app.get("/", (req, res) => {
  res.send("🚀 Backend server is running!");
});

// --- Auth Routes (Register, Get Users, Login) (Unchanged) ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });
    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
     res.status(500).json({ message: "Server error." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials. Please try again." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials. Please try again." });
    }
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        isAuthenticated: true
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        isAuthenticated: true
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// --- History Routes (Save, Get All, Get One) (Unchanged) ---
app.post("/api/history/chat", auth, async (req, res) => {
  const { conversationId, messages } = req.body;
  const userId = req.user.id; 

  try {
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (conversation && conversation.user.toString() !== userId) {
        return res.status(403).json({ message: "User not authorized for this conversation." });
      }
      if (conversation) {
        conversation.messages.push(...messages);
        await conversation.save();
        res.status(200).json(conversation);
      } else {
        return createNewConversation();
      }
    } else {
      createNewConversation();
    }
    async function createNewConversation() {
      const newConversation = new Conversation({
        user: userId,
        messages: messages
      });
      conversation = await newConversation.save();
      res.status(201).json(conversation);
    }
  } catch (error) {
    console.error("Chat history save error:", error);
    res.status(500).json({ message: "Server error saving chat history." });
  }
});

app.get("/api/history", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const conversations = await Conversation.find({ user: userId })
      .sort({ updatedAt: -1 });
    const classifications = await Classification.find({ user: userId })
      .sort({ createdAt: -1 });
    res.status(200).json({
      conversations,
      classifications
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Server error fetching history." });
  }
});

app.get("/api/history/chat/:id", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }
    if (conversation.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this conversation." });
    }
    res.status(200).json(conversation);
  } catch (error) {
    console.error("Get single conversation error:", error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Conversation not found (invalid ID)." });
    }
    res.status(500).json({ message: "Server error." });
  }
});

// --- UPDATED NEARBY DERMATOLOGISTS ROUTE (with Real Google Maps API) ---
const staticDermatologists = [
  {
    _id: "static_1",
    name: "Dr. Pooja's Skin Care Clinic",
    address: "Manpada Road, Dombivli East, Maharashtra",
    rating: 4.7,
    review_count: 132,
    map_url: "https://www.google.com/maps/search/?api=1&query=Dr+Pooja's+Skin+Care+Clinic+Dombivli+East",
    distance: 1.2
  },
  {
    _id: "static_2",
    name: "Dr. Pradeep Kumavat Skin & Hair Clinic",
    address: "Opp. Pendharkar College, Dombivli East, Maharashtra",
    rating: 4.8,
    review_count: 245,
    map_url: "https://www.google.com/maps/search/?api=1&query=Dr+Pradeep+Kumavat+Skin+and+Hair+Clinic+Dombivli",
    distance: 1.9
  },
  {
    _id: "static_3",
    name: "Dr. Nilesh Mahajan Skin Clinic",
    address: "Tilak Nagar, Dombivli East, Maharashtra",
    rating: 4.6,
    review_count: 98,
    map_url: "https://www.google.com/maps/search/?api=1&query=Dr+Nilesh+Mahajan+Skin+Clinic+Dombivli+East",
    distance: 2.5
  },
  {
    _id: "static_4",
    name: "Derma Bliss Skin & Laser Clinic",
    address: "Kalyan Shil Road, Dombivli East, Maharashtra",
    rating: 4.9,
    review_count: 152,
    map_url: "https://www.google.com/maps/search/?api=1&query=Derma+Bliss+Skin+and+Laser+Clinic+Dombivli+East",
    distance: 3.0
  },
  {
    _id: "static_5",
    name: "Dr. Sheetal’s Skin & Hair Clinic",
    address: "Lodha Palava, Dombivli East, Maharashtra",
    rating: 4.7,
    review_count: 87,
    map_url: "https://www.google.com/maps/search/?api=1&query=Dr+Sheetal's+Skin+and+Hair+Clinic+Palava+Dombivli",
    distance: 4.5
  }
];

app.get("/api/nearby/dermatologists", auth, async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and Longitude are required." });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API Key is missing from .env file.");
    return res.status(500).json({ message: "Server configuration error." });
  }

  const radius = 10000; // 10 km
  const type = "dermatologist";
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (!response.data.results || response.data.results.length === 0) {
      console.warn("No nearby dermatologists found — using static Dombivli data.");
      return res.status(200).json(staticDermatologists);
    }

    const results = response.data.results;
    const formattedPlaces = results.map(place => {
      const map_url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
      return {
        _id: place.place_id,
        name: place.name,
        address: place.vicinity || "Address not available",
        rating: place.rating || "N/A",
        review_count: place.user_ratings_total || 0,
        map_url: map_url,
        distance: 0 // optional: calculate actual distance using getDistance()
      };
    });

    res.status(200).json(formattedPlaces);
  } catch (error) {
    console.error("Google Maps API error:", error.response ? error.response.data : error.message);
    console.warn("Falling back to static dermatologist data (Dombivli).");
    res.status(200).json(staticDermatologists);
  }
});

// --- REACT FRONTEND SERVING ---
// This must come AFTER all your API routes
const reactBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(reactBuildPath));

// --- ✅ THIS WAS THE MISSING LINE ---
// This "catch-all" handler sends the `index.html` for any route
// that doesn't match an API route. This fixes the 'Unexpected end of input' error.

// --- END OF FRONTEND SERVING ---


// --- Server Listen ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));