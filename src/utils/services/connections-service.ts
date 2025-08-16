type ConnectionMetadata = {
  username: string;
  jwt: string;
};

type SocketConnection = {
  id: string;
  emit: (event: string, data: any) => void;
  data: ConnectionMetadata;
};

export class ConnectionsService {
  static connections: SocketConnection[] = [];

  static addConnection(socket: any) {
    console.log("a user connected", socket.id);
    ConnectionsService.connections.push(socket);

    console.log("connections", ConnectionsService.connections.length);
  }

  static setMetadata(socket: any, metadata: ConnectionMetadata) {
    const index = ConnectionsService.connections.findIndex(
      (s) => s.id === socket.id,
    );
    ConnectionsService.connections[index].data = metadata;
    console.log("metadata set", ConnectionsService.connections[index].data);
  }

  static removeConnection(socket: any) {
    console.log("socket is:", socket.id);
    const index = ConnectionsService.connections.findIndex(
      (s) => s.id === socket.id,
    );
    ConnectionsService.connections.splice(index, 1);
    console.log("user disconnected", socket.id);
    console.log("connections", ConnectionsService.connections.length);
  }

  static getConnections() {
    return ConnectionsService.connections;
  }

  static getConnectionsCount() {
    return ConnectionsService.connections.length;
  }
}
