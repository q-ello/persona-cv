type SoundBufferMap = Record<string, AudioBuffer>;

class SoundManager {
    private audioCtx: AudioContext | null = null;
    private buffers: SoundBufferMap = {};

    async init() {
        // create ctx only once
        if (!this.audioCtx) {
            this.audioCtx = new AudioContext();
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
        if (!this.audioCtx) return;
        const buffer = this.buffers[name];
        if (!buffer) return;

        // allow overlapping plays
        const src = this.audioCtx.createBufferSource();
        src.buffer = buffer;
        src.connect(this.audioCtx.destination);

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
}

export const soundManager = new SoundManager();
