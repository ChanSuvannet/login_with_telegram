// src/services/WebSocketService.js
let socket;

export function connectWebSocket() {
    const wsUrl = "http://localhost:3000"; // your NestJS WebSocket server URL
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log("✅ Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📩 Message from server:", data);
    };

    socket.onclose = () => {
        console.log("❌ Disconnected from WebSocket server");
    };

    socket.onerror = (error) => {
        console.error("⚠️ WebSocket error:", error);
    };
}

export function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error("WebSocket is not open.");
    }
}
