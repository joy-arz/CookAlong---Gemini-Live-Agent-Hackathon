export class AudioService {
    constructor(wsService) {
        this.wsService = wsService;
        this.audioContext = null;
        this.mediaStream = null;
        this.audioInput = null;
        this.processor = null;
        this.player = null;
        this.isRecording = false;
    }

    async init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

            try {
                await this.audioContext.audioWorklet.addModule('/audio-processor.js');
                await this.audioContext.audioWorklet.addModule('/pcm-player.js');
                console.log("Audio Worklets loaded successfully.");
            } catch(e) {
                console.error("Failed to load audio worklets.", e);
            }
        }
    }

    async startRecording() {
        if (this.isRecording) return;

        await this.init();

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1,
                    sampleRate: 16000
                }
            });

            const captureContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            await captureContext.audioWorklet.addModule('/audio-processor.js');

            this.audioInput = captureContext.createMediaStreamSource(this.mediaStream);
            this.processor = new AudioWorkletNode(captureContext, 'audio-processor');

            this.processor.port.onmessage = (event) => {
                const pcmData = event.data;
                // Send PCM data to WebSocket
                if (this.wsService) {
                    this.wsService.sendAudioChunk(pcmData);
                }
            };

            this.audioInput.connect(this.processor);

            // Player
            this.player = new AudioWorkletNode(this.audioContext, 'pcm-player');
            this.player.connect(this.audioContext.destination);

            this.isRecording = true;
            console.log("Audio recording and playback started.");
        } catch (e) {
            console.error("Error starting audio capture:", e);
        }
    }

    playAudioChunk(arrayBuffer) {
        if (this.player) {
            this.player.port.postMessage({ type: 'audio', data: arrayBuffer });
        }
    }

    clearPlaybackBuffer() {
        if (this.player) {
            this.player.port.postMessage({ type: 'clear' });
        }
    }

    stopRecording() {
        if (!this.isRecording) return;

        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }

        if (this.audioInput) {
            this.audioInput.disconnect();
            this.audioInput = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.player) {
            this.player.disconnect();
            this.player = null;
        }

        this.isRecording = false;
        console.log("Audio recording stopped.");
    }
}
