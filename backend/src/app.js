import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import modelDefinitionRoutes from './routes/modelDefinitionRoutes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Middleware to attach the app instance to the request
// This allows controllers to mount new routes (req.app.use(...))
app.use((req, res, next) => {
  req.app = app;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/models', modelDefinitionRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Auto-CRUD Platform API' });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
