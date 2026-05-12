export class AudioSystem {
  constructor() {
    this.context = null;
    this.master = null;
    this.nodes = [];
    this.started = false;
  }

  async start() {
    if (this.started) {
      await this.context?.resume?.();
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.master.gain.value = 0.045;
    this.master.connect(this.context.destination);

    this.addHum(55, 0.018);
    this.addHum(119.5, 0.006);
    this.addVentilation();
    this.started = true;
    await this.context.resume();
  }

  addHum(frequency, gainValue) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue;
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start();
    this.nodes.push(oscillator, gain);
  }

  addVentilation() {
    const bufferSize = this.context.sampleRate * 2;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.18;
    }

    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    gain.gain.value = 0.018;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start();
    this.nodes.push(source, filter, gain);
  }

  dispose() {
    this.nodes.forEach(node => {
      try {
        node.stop?.();
      } catch {
        // Some audio nodes are not sources.
      }
      node.disconnect?.();
    });
    this.nodes = [];
    this.master?.disconnect?.();
    this.context?.close?.();
    this.context = null;
    this.master = null;
    this.started = false;
  }
}
