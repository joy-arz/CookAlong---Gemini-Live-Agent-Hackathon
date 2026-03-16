class PCMPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(24000 * 10); // 10 seconds buffer at 24kHz
    this.writeIndex = 0;
    this.readIndex = 0;

    this.port.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === 'audio') {
        const int16Array = new Int16Array(msg.data);
        for (let i = 0; i < int16Array.length; i++) {
          this.buffer[this.writeIndex] = int16Array[i] / 32768.0;
          this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
        }
      } else if (msg.type === 'clear') {
        this.readIndex = this.writeIndex;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channelData = output[0];
    for (let i = 0; i < channelData.length; i++) {
      if (this.readIndex !== this.writeIndex) {
        channelData[i] = this.buffer[this.readIndex];
        this.readIndex = (this.readIndex + 1) % this.buffer.length;
      } else {
        channelData[i] = 0;
      }
    }
    return true;
  }
}

registerProcessor('pcm-player', PCMPlayerProcessor);
