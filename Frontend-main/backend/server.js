import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const publicPath = join(__dirname, 'public');

app.use(cors());

app.use(express.static(__dirname));
app.use(express.json());

// root path
app.get('/', (req, res) => {
  res.sendFile(join(publicPath, 'index.html'));
});

// API endpoint
app.post('/api/save-location', (req, res) => {
  console.log('Received location:', req.body);
  res.json({ status: 'success' });
});

// Login handler
app.post('/login', (req, res) => {
  res.redirect('/profile.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Public directory: ${publicPath}`);
  console.log(`Access walkability.html at http://localhost:${port}/walkability.html`);
});

app.use(cors({
  origin: ['https://brave-cliff-09a17e30f.6.azurestaticapps.net'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));