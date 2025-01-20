// Importation des modules nécessaires
const WebSocket = require('ws');

// Création du serveur WebSocket
const wss = new WebSocket.Server({ port: 8090 });

console.log("Serveur WebSocket en écoute sur ws://localhost:8090");

// Gestion des connexions client
wss.on('connection', (ws) => {
  console.log('Nouveau client connecté');

  // Gestion des messages reçus du client
  ws.on('message', (message) => {
    const jsonMessage = message.toString();
    console.log("Nouveau message : ", jsonMessage);
    // Diffusion du message à tous les clients connectés
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(jsonMessage)); // Envoi du message
      }
    });

  });

  // Gestion de la déconnexion
  ws.on('close', () => {
    console.log('Client déconnecté');
  });

  // Gestion des erreurs
  ws.on('error', (error) => {
    console.error(`Erreur WebSocket : ${error}`);
  });
});
