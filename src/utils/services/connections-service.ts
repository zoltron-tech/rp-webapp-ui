
type ConnectionMetadata = {
    username: string;
    jwt: string;
};

type SocketConnection = {
    id: string;
    emit: (event: string, data: any) => void;
    data: ConnectionMetadata

};

export class ConnectionsService {
    static connections: SocketConnection[] = [];

    static addConnection(socket: any) {
        console.log("a user connected", socket.id);
        this.connections.push(socket);

        console.log("connections", this.connections.length);
    }

    static setMetadata(socket: any, metadata: ConnectionMetadata) {
        const index = this.connections.findIndex((s) => s.id === socket.id);
        this.connections[index].data = metadata;
        console.log("metadata set", this.connections[index].data);
    }

    static removeConnection(socket: any) {
        console.log("socket is:", socket.id);
        const index = this.connections.findIndex((s) => s.id === socket.id);
        this.connections.splice(index, 1);
        console.log("user disconnected", socket.id);
        console.log("connections", this.connections.length);
    }

    static getConnections() {
        return this.connections;
    }

    static getConnectionsCount() {
        return this.connections.length;
    }
}