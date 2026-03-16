export class WebSocketService {
    constructor() {
        this.ws = null;
        this.onConnect = null;
        this.onDisconnect = null;
        this.onMessage = null;
    }

    connect(url) {
        if (this.ws) {
            this.disconnect();
        }

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log("Connected to server");
            if (this.onConnect) this.onConnect();
        };

        this.ws.onclose = () => {
            console.log("Disconnected from server");
            if (this.onDisconnect) this.onDisconnect();
            this.ws = null;
        };

        this.ws.onerror = (e) => {
            console.error("WebSocket Error:", e.message);
        };

        this.ws.onmessage = async (event) => {
            // Receive binary audio chunks or JSON agent states
            let data = event.data;
            if (data instanceof Blob) {
                data = await data.arrayBuffer();
            }
            if (this.onMessage) {
               this.onMessage(data);
            }
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    sendControlMessage(action, recipe_id = null) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const payload = {
            type: "control",
            action: action
        };

        if (recipe_id) {
            payload.recipe_id = recipe_id;
        }

        this.ws.send(JSON.stringify(payload));
    }

    sendImageFrame(base64String) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const payload = {
            type: "image",
            data: base64String
        };

        this.ws.send(JSON.stringify(payload));
    }

    sendAudioChunk(binaryData) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        // Expo sends raw 16-bit PCM arrays here
        this.ws.send(binaryData);
    }
}
