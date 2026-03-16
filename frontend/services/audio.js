import { Platform } from 'react-native';

const IS_WEB = Platform.OS === 'web';

// Native: react-native-live-audio-stream (capture) + optional playback
let LiveAudioStream = null;
let playPCMDataNative = null;

if (!IS_WEB) {
  try {
    LiveAudioStream = require('react-native-live-audio-stream').default;
  } catch (e) {
    console.warn('react-native-live-audio-stream not available:', e.message);
  }
  try {
    const twoWay = require('@speechmatics/expo-two-way-audio');
    playPCMDataNative = twoWay.playPCMData;
  } catch (e) {
    console.warn('expo-two-way-audio not available for playback:', e.message);
  }
}

export class AudioService {
  constructor(wsService) {
    this.wsService = wsService;
    this.audioContext = null;
    this.mediaStream = null;
    this.audioInput = null;
    this.processor = null;
    this.player = null;
    this.isRecording = false;
    this.nativeDataListener = null;
  }

  async init() {
    if (!IS_WEB) return;
    if (!this.audioContext) {
      const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!Ctx) return;
      this.audioContext = new Ctx({ sampleRate: 24000 });

      try {
        await this.audioContext.audioWorklet.addModule('/audio-processor.js');
        await this.audioContext.audioWorklet.addModule('/pcm-player.js');
        console.log('Audio Worklets loaded successfully.');
      } catch (e) {
        console.error('Failed to load audio worklets.', e);
      }
    }
  }

  async startRecording() {
    if (IS_WEB) {
      return this._startRecordingWeb();
    }
    return this._startRecordingNative();
  }

  async _startRecordingWeb() {
    if (this.isRecording) return;
    await this.init();

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      const captureContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      await captureContext.audioWorklet.addModule('/audio-processor.js');

      this.audioInput = captureContext.createMediaStreamSource(this.mediaStream);
      this.processor = new AudioWorkletNode(captureContext, 'audio-processor');

      this.processor.port.onmessage = (event) => {
        const pcmData = event.data;
        if (this.wsService) {
          this.wsService.sendAudioChunk(pcmData);
        }
      };

      this.audioInput.connect(this.processor);

      this.player = new AudioWorkletNode(this.audioContext, 'pcm-player');
      this.player.connect(this.audioContext.destination);

      this.isRecording = true;
      console.log('Audio recording and playback started (web).');
    } catch (e) {
      console.error('Error starting audio capture:', e);
    }
  }

  async _startRecordingNative() {
    if (!LiveAudioStream) {
      console.error('react-native-live-audio-stream is not available');
      return;
    }
    if (this.isRecording) return;

    try {
      const { Buffer } = require('buffer');
      LiveAudioStream.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        bufferSize: 4096,
      });

      this.nativeDataListener = LiveAudioStream.on('data', (base64Data) => {
        if (this.wsService && base64Data) {
          const chunk = Buffer.from(base64Data, 'base64');
          const arrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
          this.wsService.sendAudioChunk(arrayBuffer);
        }
      });

      LiveAudioStream.start();
      this.isRecording = true;
      console.log('Audio recording started (native).');
    } catch (e) {
      console.error('Error starting native audio capture:', e);
    }
  }

  playAudioChunk(arrayBuffer) {
    if (IS_WEB) {
      if (this.player) {
        this.player.port.postMessage({ type: 'audio', data: arrayBuffer });
      }
      return;
    }

    if (playPCMDataNative && arrayBuffer && arrayBuffer.byteLength > 0) {
      try {
        const pcmData = new Uint8Array(arrayBuffer);
        if (playPCMDataNative.length >= 2) {
          playPCMDataNative(pcmData, 24000);
        } else {
          playPCMDataNative(pcmData);
        }
      } catch (e) {
        console.warn('Playback error:', e.message);
      }
    }
  }

  clearPlaybackBuffer() {
    if (IS_WEB && this.player) {
      this.player.port.postMessage({ type: 'clear' });
    }
  }

  stopRecording() {
    if (!this.isRecording) return;

    if (IS_WEB) {
      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }
      if (this.audioInput) {
        this.audioInput.disconnect();
        this.audioInput = null;
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }
      if (this.player) {
        this.player.disconnect();
        this.player = null;
      }
    } else if (LiveAudioStream) {
      try {
        LiveAudioStream.stop();
        if (this.nativeDataListener && this.nativeDataListener.remove) {
          this.nativeDataListener.remove();
        }
        this.nativeDataListener = null;
      } catch (e) {
        console.warn('Error stopping native audio:', e.message);
      }
    }

    this.isRecording = false;
    console.log('Audio recording stopped.');
  }
}
