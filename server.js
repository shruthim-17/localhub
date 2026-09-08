const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { translate } = require('google-translate-api-x');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const translationCache = new Map();

app.get('/api/translate', async (req, res) => {
  const text = String(req.query.text || '').trim();
  const target = String(req.query.target || 'en').trim().toLowerCase();
  const source = String(req.query.source || 'en').trim().toLowerCase();
  if (!text || target === source) return res.json({ success: true, text });

  const cacheKey = source + '|' + target + '|' + text;
  if (translationCache.has(cacheKey)) return res.json({ success: true, text: translationCache.get(cacheKey) });

  try {
    const result = await translate(text, { from: source, to: target });
    const translated = result && result.text ? result.text : text;
    translationCache.set(cacheKey, translated);
    res.json({ success: true, text: translated });
  } catch (error) {
    console.warn('Translation unavailable:', error.message);
    res.json({ success: false, text });
  }
});

function hashPassword(password) {
  return crypto.createHash('sha256').update('localhub_salt_' + password).digest('hex');
}

// In-Memory Fallback Stores
const users = [
  {
    id: 1,
    name: 'Shruthi',
    email: 'shruthi@example.com',
    passwordHash: hashPassword('123456'),
    role: 'Customer',
    phone: '+91 98765 43210',
    location: 'Hyderabad, Telangana',
    verified: true,
    phoneVerified: false,
    trustScore: 4.9,
    ratingCount: 1,
    lastLoginAt: new Date(),
    actions: ['My Requests', 'My Jobs', 'My Posts', 'Settings'],
  }
];

let jobs = [
  { 
    id: 1, 
    title: 'Restaurant Helper & Service Assistant', 
    salary: '₹850/day', 
    timing: 'Full-Time (10 AM - 7 PM)', 
    location: 'Banjara Hills, Hyderabad', 
    phone: '+91 98765 11223', 
    contactName: 'Suresh Reddy', 
    ownerPhone: '+91 98765 11223',
    ownerEmail: 'suresh@example.com',
    description: 'Looking for an active assistant for food prep, table service, and customer hospitality. Daily cash payout.', 
    distance: '1.2 km', 
    status: 'active',
    createdAt: new Date().toISOString() 
  },
  { 
    id: 2, 
    title: 'Instant Delivery Rider', 
    salary: '₹750/shift', 
    timing: 'Evening Shift (5 PM - 11 PM)', 
    location: 'Koramangala, Bengaluru', 
    phone: '+91 98765 22334', 
    contactName: 'Anand Kumar', 
    ownerPhone: '+91 98765 22334',
    ownerEmail: 'anand@example.com',
    description: 'Need local delivery partner with 2-wheeler for express parcel delivery. Fuel allowance provided.', 
    distance: '1.8 km', 
    status: 'active',
    createdAt: new Date().toISOString() 
  },
  { 
    id: 3, 
    title: 'House Cleaning & Organizing Helper', 
    salary: '₹800/day', 
    timing: 'Morning (8 AM - 2 PM)', 
    location: 'Madhapur, Hyderabad', 
    phone: '+91 98765 43210', 
    contactName: 'Shruthi', 
    ownerPhone: '+91 98765 43210',
    ownerEmail: 'shruthi@example.com',
    description: 'Deep house cleaning support needed for a 3BHK flat. Flexible hours and lunch provided.', 
    distance: '2.0 km', 
    status: 'active',
    createdAt: new Date().toISOString() 
  },
  { 
    id: 4, 
    title: 'Supermarket Inventory & Packaging Assistant', 
    salary: '₹700/day', 
    timing: 'Immediate Joining (9 AM - 6 PM)', 
    location: 'Indiranagar, Bengaluru', 
    phone: '+91 98765 44556', 
    contactName: 'Vikram Singh', 
    ownerPhone: '+91 98765 44556',
    ownerEmail: 'vikram@example.com',
    description: 'Assist in stacking shelves, inventory barcode scanning, and order packing.', 
    distance: '2.5 km', 
    status: 'active',
    createdAt: new Date().toISOString() 
  }
];

let services = [
  { 
    id: 1, 
    title: 'Emergency Plumbing & Leak Fixes', 
    category: 'Plumbing', 
    icon: '🚰', 
    price: '₹299 Visit Fee', 
    providerName: 'Ramesh Plumber', 
    phone: '+91 98765 55667', 
    ownerPhone: '+91 98765 55667',
    ownerEmail: 'ramesh@example.com',
    location: 'Banjara Hills, Hyderabad', 
    description: 'Expert pipe repairs, bathroom fittings, tap installations, and water tank leak solutions.', 
    rating: 4.9,
    status: 'active'
  },
  { 
    id: 2, 
    title: 'Home Deep Cleaning & Sanitization', 
    category: 'Cleaning', 
    icon: '🧹', 
    price: '₹999 Full House', 
    providerName: 'Sparkle Cleaners', 
    phone: '+91 98765 66778', 
    ownerPhone: '+91 98765 66778',
    ownerEmail: 'sparkle@example.com',
    location: 'Koramangala, Bengaluru', 
    description: 'Complete floor scrubbing, kitchen chimney degreasing, bathroom descaling, and sofa vacuuming.', 
    rating: 4.8,
    status: 'active'
  },
  { 
    id: 3, 
    title: 'Licensed Electrician & Appliance Repair', 
    category: 'Electrical', 
    icon: '⚡', 
    price: '₹249 Inspection', 
    providerName: 'Kiran Electricals', 
    phone: '+91 98765 77889', 
    ownerPhone: '+91 98765 77889',
    ownerEmail: 'kiran@example.com',
    location: 'Gachibowli, Hyderabad', 
    description: 'Switchboard wiring, fan installation, inverter setup, MCB tripping repair, and short circuit fixes.', 
    rating: 5.0,
    status: 'active'
  },
  { 
    id: 4, 
    title: 'Furniture Carpentry & Door Repairs', 
    category: 'Carpentry', 
    icon: '🪚', 
    price: '₹349 Base Charge', 
    providerName: 'Master Woodworks', 
    phone: '+91 98765 88990', 
    ownerPhone: '+91 98765 88990',
    ownerEmail: 'wood@example.com',
    location: 'Indiranagar, Bengaluru', 
    description: 'Custom cupboards, lock installations, hinge replacements, table assembly, and wood polish.', 
    rating: 4.9,
    status: 'active'
  },
  { 
    id: 5, 
    title: 'General Home Repairs & Masonry', 
    category: 'Home Repairs', 
    icon: '🏠', 
    price: '₹399 Base Charge', 
    providerName: 'BuildRight Services', 
    phone: '+91 98765 99001', 
    ownerPhone: '+91 98765 99001',
    ownerEmail: 'build@example.com',
    location: 'Jubilee Hills, Hyderabad', 
    description: 'Tile replacement, wall drillings, curtain rods, waterproofing, and minor plastering fixes.', 
    rating: 4.7,
    status: 'active'
  },
  { 
    id: 6, 
    title: 'Interior & Exterior Painting', 
    category: 'Painting', 
    icon: '🎨', 
    price: '₹12/sq.ft', 
    providerName: 'ColourCraft Painters', 
    phone: '+91 98765 00112', 
    ownerPhone: '+91 98765 00112',
    ownerEmail: 'colour@example.com',
    location: 'Whitefield, Bengaluru', 
    description: 'Waterproof primer, royal emulsion painting, texture walls, and stencil art.', 
    rating: 4.9,
    status: 'active'
  },
  { 
    id: 7, 
    title: 'AC, Fridge & Washing Machine Repair', 
    category: 'Appliance Repair', 
    icon: '🔌', 
    price: '₹299 Diagnosis', 
    providerName: 'CoolTech Appliances', 
    phone: '+91 98765 11335', 
    ownerPhone: '+91 98765 11335',
    ownerEmail: 'cool@example.com',
    location: 'Kukatpally, Hyderabad', 
    description: 'AC gas refill, compressor repair, drum replacement, and PCB board testing.', 
    rating: 4.8,
    status: 'active'
  },
  { 
    id: 8, 
    title: 'Safe Pest Control & Termite Spray', 
    category: 'Pest Control', 
    icon: '🐜', 
    price: '₹799 2BHK', 
    providerName: 'GreenShield Pests', 
    phone: '+91 98765 22446', 
    ownerPhone: '+91 98765 22446',
    ownerEmail: 'green@example.com',
    location: 'HSR Layout, Bengaluru', 
    description: '100% herbal cockroach gel, bed bug eradication, and anti-termite treatment.', 
    rating: 4.8,
    status: 'active'
  },
  { 
    id: 9, 
    title: 'Packers & Movers Shifting Crew', 
    category: 'Packers & Movers', 
    icon: '📦', 
    price: '₹2499 Local Shift', 
    providerName: 'SwiftRelocations', 
    phone: '+91 98765 33557', 
    ownerPhone: '+91 98765 33557',
    ownerEmail: 'swift@example.com',
    location: 'Hitec City, Hyderabad', 
    description: 'Bubble wrap packing, loading/unloading truck, furniture dismantle and reassembly.', 
    rating: 4.9,
    status: 'active'
  },
  { 
    id: 10, 
    title: 'Lawn Gardening & Plant Maintenance', 
    category: 'Gardening', 
    icon: '🌱', 
    price: '₹499 Session', 
    providerName: 'Urban Greens', 
    phone: '+91 98765 44668', 
    ownerPhone: '+91 98765 44668',
    ownerEmail: 'urban@example.com',
    location: 'Koramangala, Bengaluru', 
    description: 'Grass trimming, organic compost adding, hedge pruning, and balcony plant care.', 
    rating: 4.9,
    status: 'active'
  }
];

let posts = [
  { 
    id: 1, 
    type: 'help', 
    category: 'Emergency Help', 
    title: 'Emergency B+ Blood Donor Needed', 
    detail: 'Looking for 2 units of B+ blood for an emergency surgery at Apollo Hospital. Please call immediately if eligible.', 
    contactName: 'Kavitha Rao', 
    phone: '+91 98765 12345', 
    ownerPhone: '+91 98765 12345',
    location: 'Jubilee Hills, Hyderabad', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 2, 
    type: 'notice', 
    category: 'Notice', 
    title: 'Neighborhood Cleanliness & Tree Planting Drive', 
    detail: 'Join us this Sunday 8:00 AM at Community Park Sector 3 for sapling plantation and park cleanup. Tools provided.', 
    contactName: 'Green Committee', 
    phone: '+91 98765 23456', 
    ownerPhone: '+91 98765 23456',
    location: 'Koramangala, Bengaluru', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 3, 
    type: 'help', 
    category: 'Help Needed', 
    title: 'Lost Golden Retriever Puppy near Park Street', 
    detail: 'Wearing a red collar named Bruno. Friendly with people. Cash reward for any helpful leads.', 
    contactName: 'Deepak Verma', 
    phone: '+91 98765 34567', 
    ownerPhone: '+91 98765 34567',
    location: 'Banjara Hills, Hyderabad', 
    createdAt: new Date().toISOString() 
  }
];

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localhub';
const useMongo = process.env.USE_IN_MEMORY !== 'true';
let mongoReady = false;
const otpStore = new Map();
const feedbackStore = [];
const supportRequests = [];

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  id: Number,
  phone: String,
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: String,
  location: String,
  verified: Boolean,
  phoneVerified: Boolean,
  trustScore: Number,
  ratingCount: Number,
  lastLoginAt: Date,
  actions: [String],
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  id: Number,
  title: String,
  salary: String,
  timing: String,
  location: String,
  phone: String,
  contactName: String,
  ownerPhone: String,
  ownerEmail: String,
  description: String,
  distance: String,
  status: { type: String, default: 'active' }, // 'active', 'fulfilled', 'deleted'
  closedAt: String,
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  id: Number,
  title: String,
  category: String,
  icon: String,
  price: String,
  providerName: String,
  phone: String,
  ownerPhone: String,
  ownerEmail: String,
  location: String,
  description: String,
  rating: Number,
  status: { type: String, default: 'active' }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  id: Number,
  type: String,
  category: String,
  title: String,
  detail: String,
  contactName: String,
  phone: String,
  ownerPhone: String,
  location: String,
}, { timestamps: true });

const User = mongoose.models.LocalHubUser || mongoose.model('LocalHubUser', userSchema);
const Job = mongoose.models.LocalHubJob || mongoose.model('LocalHubJob', jobSchema);
const Service = mongoose.models.LocalHubService || mongoose.model('LocalHubService', serviceSchema);
const Post = mongoose.models.LocalHubPost || mongoose.model('LocalHubPost', postSchema);

async function connectDatabase() {
  if (!useMongo) return;
  try {
    await mongoose.connect(mongoUri, { dbName: process.env.MONGODB_DB || 'localhub' });
    mongoReady = true;
    console.log('MongoDB connected to localhub.');
  } catch (error) {
    console.log('MongoDB connection fallback; using in-memory store.');
  }
}

async function seedDatabase() {
  if (!mongoReady) return;
  if (await Service.countDocuments() === 0) await Service.insertMany(services);
  if (await Job.countDocuments() === 0) await Job.insertMany(jobs);
  if (await Post.countDocuments() === 0) await Post.insertMany(posts);
}

function cleanDocuments(documents) {
  return documents.map((document) => {
    const item = document.toObject ? document.toObject() : document;
    delete item._id;
    delete item.__v;
    return item;
  });
}

// Health & Ping
app.get('/api/health', (req, res) => {
  res.json({ success: true, database: mongoReady ? 'connected' : 'in-memory', authMode: 'password' });
});

// Authentication
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const trimmedName = name ? name.trim() : '';
  const trimmedPassword = password ? password.trim() : '';

  if (!trimmedName || !normalizedEmail || !trimmedPassword || trimmedPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'Full name, valid email, and 6-digit password are required.' });
  }

  const existingUser = mongoReady
    ? await User.findOne({ email: normalizedEmail }).lean()
    : users.find((u) => u.email === normalizedEmail);

  if (existingUser) {
    return res.status(409).json({ success: false, error: 'An account already exists for this email. Please login.' });
  }

  const newUser = {
    id: Date.now(),
    name: trimmedName,
    email: normalizedEmail,
    passwordHash: hashPassword(trimmedPassword),
    role: 'Customer',
    phone: '+91 98765 43210',
    location: 'Hyderabad, Telangana',
    verified: true,
    phoneVerified: false,
    trustScore: 4.9,
    ratingCount: 1,
    lastLoginAt: new Date(),
    actions: ['My Requests', 'My Jobs', 'My Posts', 'Settings'],
  };

  if (mongoReady) await User.create(newUser);
  else users.push(newUser);

  res.json({
    success: true,
    message: 'Account created successfully!',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, location: newUser.location, verified: newUser.verified, phoneVerified: newUser.phoneVerified, trustScore: newUser.trustScore, ratingCount: newUser.ratingCount, active: true, lastLoginAt: newUser.lastLoginAt }
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const trimmedPassword = password ? password.trim() : '';

  if (!normalizedEmail || !trimmedPassword) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const user = mongoReady
    ? await User.findOne({ email: normalizedEmail }).lean()
    : users.find((u) => u.email === normalizedEmail);

  if (!user) {
    return res.status(404).json({ success: false, error: 'No account found with this email. Please create an account.' });
  }

  const inputHash = hashPassword(trimmedPassword);
  if (user.passwordHash && user.passwordHash !== inputHash) {
    return res.status(401).json({ success: false, error: 'Incorrect 6-digit password.' });
  }

  const lastLoginAt = new Date();
  if (mongoReady) await User.updateOne({ email: normalizedEmail }, { $set: { lastLoginAt } });
  else user.lastLoginAt = lastLoginAt;

  res.json({
    success: true,
    message: 'Logged in successfully!',
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone || '+91 98765 43210', location: user.location || 'Hyderabad, Telangana', verified: Boolean(user.verified), phoneVerified: Boolean(user.phoneVerified), trustScore: user.trustScore, ratingCount: user.ratingCount || 0, active: true, lastLoginAt }
  });
});

function publicUser(user) {
  const lastLoginAt = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
  const active = Boolean(lastLoginAt && Date.now() - lastLoginAt.getTime() <= 24 * 60 * 60 * 1000);
  return {
    id: user.id, name: user.name, email: user.email, phone: user.phone || '', location: user.location || '', role: user.role || 'Customer',
    verified: Boolean(user.verified), phoneVerified: Boolean(user.phoneVerified), trustScore: typeof user.trustScore === 'number' ? user.trustScore : null,
    ratingCount: user.ratingCount || 0, active, lastLoginAt: user.lastLoginAt || null
  };
}

function matchesCity(location, city) {
  if (!city) return true;
  return String(location || '').toLowerCase().includes(String(city).trim().toLowerCase());
}

app.get('/api/user/profile', async (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });
  const user = mongoReady ? await User.findOne({ email }).lean() : users.find(item => item.email === email);
  if (!user) return res.status(404).json({ success: false, error: 'Profile not found.' });
  res.json({ success: true, user: publicUser(user) });
});

app.post('/api/user/phone/request-otp', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();
  if (!email || !phone) return res.status(400).json({ success: false, error: 'Email and phone number are required.' });
  const user = mongoReady ? await User.findOne({ email }).lean() : users.find(item => item.email === email);
  if (!user) return res.status(404).json({ success: false, error: 'Profile not found.' });

  const otp = String(crypto.randomInt(100000, 1000000));
  otpStore.set(email, { otp, phone, expiresAt: Date.now() + 10 * 60 * 1000 });
  const providerUrl = process.env.OTP_API_URL;
  if (providerUrl) {
    try {
      const response = await fetch(providerUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (process.env.OTP_API_KEY || '') },
        body: JSON.stringify({ phone, message: 'Your LocalHub verification code is ' + otp })
      });
      if (!response.ok) throw new Error('OTP provider rejected the request.');
    } catch (error) {
      otpStore.delete(email);
      return res.status(502).json({ success: false, error: 'Could not send the verification code.' });
    }
  }
  const payload = { success: true, message: providerUrl ? 'A verification code was sent to your phone.' : 'OTP generated.' };
  if (!providerUrl || process.env.LOCAL_OTP_MODE === 'true') payload.developmentOtp = otp;
  res.json(payload);
});

app.post('/api/user/phone/verify-otp', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const pending = otpStore.get(email);
  if (!pending || pending.expiresAt < Date.now() || pending.otp !== otp) return res.status(400).json({ success: false, error: 'The OTP is invalid or expired.' });
  if (mongoReady) await User.updateOne({ email }, { $set: { phone: pending.phone, phoneVerified: true } });
  else {
    const user = users.find(item => item.email === email);
    if (user) { user.phone = pending.phone; user.phoneVerified = true; }
  }
  otpStore.delete(email);
  const user = mongoReady ? await User.findOne({ email }).lean() : users.find(item => item.email === email);
  res.json({ success: true, user: publicUser(user) });
});

app.post('/api/feedback', async (req, res) => {
  const { authorEmail, targetEmail, type, recordId, rating, comment } = req.body;
  const score = Number(rating);
  if (!authorEmail || !targetEmail || !Number.isInteger(score) || score < 1 || score > 5) return res.status(400).json({ success: false, error: 'A valid rating is required.' });
  feedbackStore.push({ authorEmail: String(authorEmail).toLowerCase(), targetEmail: String(targetEmail).toLowerCase(), type, recordId, rating: score, comment: String(comment || '').trim(), createdAt: new Date() });
  const ratings = feedbackStore.filter(item => item.targetEmail === String(targetEmail).toLowerCase()).map(item => item.rating);
  const trustScore = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
  if (mongoReady) await User.updateOne({ email: String(targetEmail).toLowerCase() }, { $set: { trustScore, ratingCount: ratings.length } });
  else {
    const user = users.find(item => item.email === String(targetEmail).toLowerCase());
    if (user) { user.trustScore = trustScore; user.ratingCount = ratings.length; }
  }
  if (type === 'service' && recordId) {
    if (mongoReady) await Service.updateOne({ id: Number(recordId) }, { $set: { rating: trustScore } });
    else { const service = services.find(item => item.id === Number(recordId)); if (service) service.rating = trustScore; }
  }
  res.json({ success: true, trustScore, ratingCount: ratings.length });
});

app.post('/api/help', (req, res) => {
  const question = String(req.body.question || '').trim().toLowerCase();
  if (!question) return res.status(400).json({ success: false, error: 'A question is required.' });
  let answer = 'I can help with LocalHub navigation, language, voice, profiles, posts, phone verification, ratings, and support.';
  if (/phone|otp|verify/.test(question)) answer = 'Open your profile, enter your phone number, choose Send OTP, then enter the six-digit code to verify your phone.';
  else if (/language|telugu|hindi|kannada|urdu|voice|speak|microphone/.test(question)) answer = 'Open your profile and choose Assistant language. The app text, voice commands, and spoken action announcements will use that language when a matching browser voice is installed.';
  else if (/post|job|service|community/.test(question)) answer = 'Use the Post button to choose a job, service, or community post. Your saved counts and activity history update automatically.';
  else if (/rating|trust/.test(question)) answer = 'Ratings from customers and service providers update the profile trust score and appear in the profile summary.';
  else if (/login|sign in|password/.test(question)) answer = 'Use your email and password on the login page. A login within the last 24 hours keeps your profile marked active.';
  res.json({ success: true, answer });
});

app.post('/api/support/request', (req, res) => {
  const issue = String(req.body.issue || '').trim();
  if (!issue) return res.status(400).json({ success: false, error: 'Please describe the issue.' });
  const request = { id: Date.now(), name: String(req.body.name || 'LocalHub member'), email: String(req.body.email || ''), language: String(req.body.language || 'en-US'), issue, status: 'open', createdAt: new Date().toISOString() };
  supportRequests.push(request);
  console.log('Human support request received:', request.id, request.email || request.name);
  res.json({ success: true, requestId: request.id, message: 'Human support request sent.' });
});

// Jobs Endpoints (Only returns active jobs)
app.get(['/api/jobs', '/api/work'], async (req, res) => {
  const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
  const city = req.query.city ? req.query.city.trim() : '';
  let list = mongoReady 
    ? cleanDocuments(await Job.find({ status: { $ne: 'fulfilled', $nin: ['deleted', 'fulfilled'] } }).sort({ createdAt: -1 })) 
    : jobs.filter(j => j.status !== 'fulfilled' && j.status !== 'deleted');
  list = list.filter(job => matchesCity(job.location, city));
  
  if (q) {
    list = list.filter(j => 
      (j.title && j.title.toLowerCase().includes(q)) || 
      (j.location && j.location.toLowerCase().includes(q)) ||
      (j.description && j.description.toLowerCase().includes(q)) ||
      (j.salary && j.salary.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, jobs: list, total: list.length });
});

// Mark Job as Fulfilled (Helper Found) -> Removes from public board and keeps in user history
app.post('/api/jobs/:id/fulfill', async (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  const closedTimestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (mongoReady) {
    await Job.updateOne({ id: jobId }, { $set: { status: 'fulfilled', closedAt: closedTimestamp } });
  } else {
    const j = jobs.find(item => item.id === jobId);
    if (j) {
      j.status = 'fulfilled';
      j.closedAt = closedTimestamp;
    }
  }

  res.json({ success: true, message: 'Job marked as fulfilled! Helper found and moved to history.' });
});

// Delete Job
app.delete('/api/jobs/:id', async (req, res) => {
  const jobId = parseInt(req.params.id, 10);

  if (mongoReady) {
    await Job.deleteOne({ id: jobId });
  } else {
    jobs = jobs.filter(j => j.id !== jobId);
  }

  res.json({ success: true, message: 'Job listing removed successfully.' });
});

// Services Endpoints (Returns active services)
app.get('/api/services', async (req, res) => {
  const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
  const city = req.query.city ? req.query.city.trim() : '';
  let list = mongoReady 
    ? cleanDocuments(await Service.find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 })) 
    : services.filter(s => s.status !== 'deleted');
  list = list.filter(service => matchesCity(service.location, city));

  if (q) {
    list = list.filter(s => 
      (s.title && s.title.toLowerCase().includes(q)) || 
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.providerName && s.providerName.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, services: list, total: list.length });
});

// Delete Service Profile (Owner deletes their work profile)
app.delete('/api/services/:id', async (req, res) => {
  const serviceId = parseInt(req.params.id, 10);

  if (mongoReady) {
    await Service.deleteOne({ id: serviceId });
  } else {
    services = services.filter(s => s.id !== serviceId);
  }

  res.json({ success: true, message: 'Service work profile deleted successfully!' });
});

// Community Posts Endpoints
app.get(['/api/posts', '/api/community'], async (req, res) => {
  const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
  const city = req.query.city ? req.query.city.trim() : '';
  let list = mongoReady ? cleanDocuments(await Post.find().sort({ createdAt: -1 })) : posts;
  list = list.filter(post => matchesCity(post.location, city));

  if (q) {
    list = list.filter(p => 
      (p.title && p.title.toLowerCase().includes(q)) || 
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.detail && p.detail.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, posts: list, total: list.length });
});

// Delete Community Post
app.delete('/api/posts/:id', async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (mongoReady) await Post.deleteOne({ id: postId });
  else posts = posts.filter(p => p.id !== postId);

  res.json({ success: true, message: 'Community post removed.' });
});

// User History Endpoint (All jobs active + fulfilled, services, and posts)
app.get('/api/user/history', async (req, res) => {
  const phone = req.query.phone || '';
  const email = req.query.email || '';
  const name = (req.query.name || 'Shruthi').toLowerCase();

  const allJobs = mongoReady ? cleanDocuments(await Job.find().sort({ createdAt: -1 })) : jobs;
  const allServices = mongoReady ? cleanDocuments(await Service.find().sort({ createdAt: -1 })) : services;
  const allPosts = mongoReady ? cleanDocuments(await Post.find().sort({ createdAt: -1 })) : posts;

  const normalize = (value) => String(value || '').replace(/\s+/g, '').toLowerCase();
  const normalizedPhone = normalize(phone);
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const isOwner = (item) => {
    if (normalizedPhone && (normalize(item.phone) === normalizedPhone || normalize(item.ownerPhone) === normalizedPhone)) return true;
    if (normalizedEmail && String(item.ownerEmail || '').trim().toLowerCase() === normalizedEmail) return true;
    if (item.contactName && item.contactName.toLowerCase().includes(name)) return true;
    if (item.providerName && item.providerName.toLowerCase().includes(name)) return true;
    return false;
  };

  const myJobs = allJobs.filter(isOwner);
  const myServices = allServices.filter(isOwner);
  const myPosts = allPosts.filter(isOwner);

  res.json({
    success: true,
    myJobs,
    myServices: myServices.filter(service => service.status !== 'deleted'),
    myPosts,
    jobCount: myJobs.length,
    serviceCount: myServices.filter(service => service.status !== 'deleted').length,
    postCount: myPosts.length
  });
});

// Unified Search Endpoint
app.get('/api/search', async (req, res) => {
  const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
  if (!q) {
    return res.json({ success: true, results: { jobs: [], services: [], posts: [], totalCount: 0 } });
  }

  const allJobs = mongoReady ? cleanDocuments(await Job.find({ status: { $ne: 'fulfilled' } })) : jobs.filter(j => j.status !== 'fulfilled');
  const allServices = mongoReady ? cleanDocuments(await Service.find()) : services;
  const allPosts = mongoReady ? cleanDocuments(await Post.find()) : posts;

  const matchedJobs = allJobs.filter(j => {
    const title = (j.title || '').toLowerCase();
    const desc = (j.description || j.detail || '').toLowerCase();
    const loc = (j.location || '').toLowerCase();
    return title.includes(q) || desc.includes(q) || loc.includes(q);
  });

  const matchedServices = allServices.filter(s => {
    const title = (s.title || s.name || '').toLowerCase();
    const category = (s.category || '').toLowerCase();
    const desc = (s.description || s.detail || '').toLowerCase();
    const prov = (s.providerName || '').toLowerCase();
    return title.includes(q) || category.includes(q) || desc.includes(q) || prov.includes(q);
  });

  const matchedPosts = allPosts.filter(p => {
    const title = (p.title || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const detail = (p.detail || p.content || '').toLowerCase();
    return title.includes(q) || cat.includes(q) || detail.includes(q);
  });

  res.json({
    success: true,
    results: {
      jobs: matchedJobs,
      services: matchedServices,
      posts: matchedPosts,
      totalCount: matchedJobs.length + matchedServices.length + matchedPosts.length
    }
  });
});

// Create Post Endpoint (Handles Job, Service, and Community types)
app.post('/api/post', async (req, res) => {
  const { type, title, detail, description, salary, timing, price, category, location, phone, contactName, name, email } = req.body;
  const postType = (type || 'job').toLowerCase();
  const postTitle = (title || '').trim();
  const postDesc = (description || detail || '').trim();
  const contactPerson = (contactName || name || 'Local Member').trim();
  const contactPhone = (phone || '+91 98765 43210').trim();
  const contactEmail = (email || 'user@example.com').trim();
  const postLocation = (location || 'Hyderabad, Telangana').trim();

  if (!postTitle) {
    return res.status(400).json({ success: false, error: 'Title / Name of work is required.' });
  }

  const newId = Date.now();

  if (postType === 'job' || postType === 'work') {
    const newJob = {
      id: newId,
      title: postTitle,
      salary: salary ? salary.trim() : '₹800/day',
      timing: timing ? timing.trim() : 'Immediate / Flexible',
      location: postLocation,
      phone: contactPhone,
      contactName: contactPerson,
      ownerPhone: contactPhone,
      ownerEmail: contactEmail,
      description: postDesc || 'Looking for an energetic worker to assist nearby. Direct contact and quick payout.',
      distance: 'Nearby (0.5 km)',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    if (mongoReady) await Job.create(newJob);
    jobs.unshift(newJob);

    return res.json({ success: true, message: 'Job posted successfully!', job: newJob });
  } 
  
  if (postType === 'service') {
    const iconMap = {
      'Plumbing': '🚰', 'Cleaning': '🧹', 'Electrical': '⚡', 'Carpentry': '🪚',
      'Home Repairs': '🏠', 'Painting': '🎨', 'Appliance Repair': '🔌',
      'Pest Control': '🐜', 'Packers & Movers': '📦', 'Gardening': '🌱'
    };
    const cat = (category || 'Home Repairs').trim();

    const newService = {
      id: newId,
      title: postTitle,
      category: cat,
      icon: iconMap[cat] || '🛠️',
      price: price ? price.trim() : '₹299 Base Charge',
      providerName: contactPerson,
      phone: contactPhone,
      ownerPhone: contactPhone,
      ownerEmail: contactEmail,
      location: postLocation,
      description: postDesc || 'Verified local service provider offering reliable doorstep repair and maintenance.',
      rating: 5.0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    if (mongoReady) await Service.create(newService);
    services.unshift(newService);

    return res.json({ success: true, message: 'Service listed successfully!', service: newService });
  }

  // Community Type
  const newPost = {
    id: newId,
    type: 'community',
    category: (category || 'Help Needed').trim(),
    title: postTitle,
    detail: postDesc || 'Community notice shared by neighborhood resident.',
    contactName: contactPerson,
    phone: contactPhone,
    ownerPhone: contactPhone,
    location: postLocation,
    createdAt: new Date().toISOString()
  };

  if (mongoReady) await Post.create(newPost);
  posts.unshift(newPost);

  return res.json({ success: true, message: 'Community post published successfully!', post: newPost });
});

connectDatabase().then(seedDatabase).then(() => {
  app.listen(PORT, () => {
    console.log('LocalHub backend running at http://localhost:' + PORT);
  });
});
