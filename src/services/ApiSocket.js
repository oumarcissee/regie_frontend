// WebSocket.js

class WebSocketManager {

  //Le domaine complet
  myDomain = 'localhost:8000'
  socket
  onOpenHandlers
  onMessageHandlers
  constructor() {
    this.socket = null;
    this.onOpenHandlers = [];
    this.onMessageHandlers = [];
  }
  /**
   *
   * @param {String} endPoint
   * @returns
   */
  connect(endPoint) {
    this.socket = new WebSocket( (window.location.protocol  === 'https:' ? 'wss' : 'ws') + `://${this.myDomain}/ws/${endPoint}/`);

    this.socket.onopen = () => {
      this.onOpenHandlers.forEach(handler => handler());
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onMessageHandlers.forEach(handler => handler(data));
    };

    return new Promise((resolve, reject) => {
      this.socket.onopen = () => {
        resolve();
      };

      this.socket.onclose = (event ) => {
        reject(event);
      };
    });
  }

  send(data ) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  close() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  // Fonction pour ajouter un gestionnaire onopen
  addOnOpenHandler(handler) {
    this.onOpenHandlers.push(handler);
  }

  // Fonction pour ajouter un gestionnaire onmessage
  addOnMessageHandler(handler ) {
    this.onMessageHandlers.push(handler);
  }
}

export default WebSocketManager;
