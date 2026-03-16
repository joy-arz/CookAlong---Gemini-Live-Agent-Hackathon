class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    // this port receives messages from the main thread
    this.port.onmessage = this.onMessage.bind(this);
  }

  onMessage(event) {
     // placeholder if needed
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      // Convert Float32 to Int16
      const int16Data = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        let s = Math.max(-1, Math.min(1, channelData[i]));
        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
