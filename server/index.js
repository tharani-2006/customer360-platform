require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const ticketRoutes = require('./routes/tickets');
const subscriptionRoutes = require('./routes/subscriptions');

const errorHandler = require('./middlewares/errorHandler');


const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tickets', ticketRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
