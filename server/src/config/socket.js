const logger = require('../utils/logger');

const configureSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Client connecte: ${socket.id}`);

    socket.on('subscribe:dashboard', (data) => {
      const { parkingId } = data || {};
      
      if (parkingId) {
        socket.join(`parking:${parkingId}`);
        logger.info(`Client ${socket.id} abonne au parking ${parkingId}`);
      } else {
        socket.join('dashboard:general');
        logger.info(`Client ${socket.id} abonne au dashboard general`);
      }

      socket.emit('subscription:confirmed', {
        success: true,
        message: 'Abonnement reussi',
        parkingId: parkingId || 'general'
      });
    });

    socket.on('unsubscribe:dashboard', (data) => {
      const { parkingId } = data || {};
      
      if (parkingId) {
        socket.leave(`parking:${parkingId}`);
        logger.info(`Client ${socket.id} desabonne du parking ${parkingId}`);
      } else {
        socket.leave('dashboard:general');
        logger.info(`Client ${socket.id} desabonne du dashboard general`);
      }

      socket.emit('unsubscription:confirmed', {
        success: true,
        message: 'Desabonnement reussi'
      });
    });

    socket.on('request:parking:status', async (data) => {
      try {
        const { parkingId } = data;
        
        socket.emit('parking:status', {
          success: true,
          parkingId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Erreur lors de la requete de statut parking', error);
        socket.emit('error', {
          success: false,
          message: 'Erreur lors de la recuperation du statut'
        });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Client deconnecte: ${socket.id}, raison: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Erreur socket ${socket.id}:`, error);
    });
  });

  return io;
};

module.exports = configureSocket;
