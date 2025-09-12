
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';

const app = express();
app.use(bodyParser.json());

// Mount API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;
