import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({ cors: true })
export class TelegramGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private clients: WebSocket[] = [];

    handleConnection(client: WebSocket) {
        this.clients.push(client);
        console.log('🟢 WebSocket connected');
    }

    handleDisconnect(client: WebSocket) {
        this.clients = this.clients.filter((c) => c !== client);
        console.log('🔴 WebSocket disconnected');
    }

    broadcast(message: any) {
        for (const client of this.clients) {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(message));
            }
        }
    }
}
