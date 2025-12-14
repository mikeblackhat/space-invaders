const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const sounds = {
    shoot: () => playTone(880, 'square', 0.1, -10),
    alienDie: () => playTone(150, 'sawtooth', 0.2, -5),
    playerDie: () => playNoise(0.5),
    ufo: () => playUfoSound(),
    step1: () => playTone(180, 'square', 0.05, -20),
    step2: () => playTone(170, 'square', 0.05, -20),
    step3: () => playTone(160, 'square', 0.05, -20),
    step4: () => playTone(150, 'square', 0.05, -20),
};

function playTone(freq, type, duration, volDecibels) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Volume handling
    const volume = Math.pow(10, volDecibels / 20);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playNoise(duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    noise.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
}

function playUfoSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + 2);

    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 2);
}
