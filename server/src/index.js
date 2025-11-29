require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const configureSocket = require('./config/socket');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  } 
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('io', io);

configureSocket(io);

app.use('/api', routes);

app.use((err, req, res, next) => {
  logger.error('Erreur serveur:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvee'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Serveur demarre sur le port ${PORT}`);
  logger.info(`Environnement: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesse rejetee non geree:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Exception non capturee:', error);
  process.exit(1);
});

module.exports = { app, server, io };
