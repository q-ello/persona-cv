type SoundBufferMap = Record<string, AudioBuffer>;

class SoundManager {
    private audioCtx: AudioContext | null = null;
    private buffers: SoundBufferMap = {};
    private gainNode: GainNode | null = null;

    async init() {
        // create ctx only once
        if (!this.audioCtx) {
            this.audioCtx = new AudioContext();

            this.gainNode = this.audioCtx.createGain();
            this.gainNode.gain.value = 0.3;

            this.gainNode.connect(this.audioCtx.destination);
        }
    }

    async loadSounds(sounds: Record<string, string>) {
        if (!this.audioCtx) await this.init();

        const entries = Object.entries(sounds);

        for (const [name, url] of entries) {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const buffer = await this.audioCtx!.decodeAudioData(arrayBuffer);
            this.buffers[name] = buffer;
        }
    }

    play(name: string, onEnd?: () => void) {
        if (!this.audioCtx || !this.gainNode) return;

        const buffer = this.buffers[name];
        if (!buffer) return;

        // allow overlapping plays
        const src = this.audioCtx.createBufferSource();
        src.buffer = buffer;

        src.connect(this.gainNode);

        if (onEnd)
        {
            src.onended = onEnd;
        }

        src.start(0);
        return src;
    }

    // optional: global volume control (later if needed)
    get ready() {
        return !!this.audioCtx;
    }

    setVolume(value: number)
    {
        if (this.gainNode)
        {
            this.gainNode.gain.value = value;
        }
    }
}

export const soundManager = new SoundManager();
