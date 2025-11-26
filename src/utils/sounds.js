// Sound effects utility for crate opening
// You can add your own sound files to public/sounds/ folder

class SoundManager {
  constructor() {
    this.sounds = {};
    this.volume = 0.7;
    this.enabled = true;
  }

  // Load a sound file
  loadSound(name, path) {
    if (typeof Audio !== 'undefined') {
      this.sounds[name] = new Audio(path);
      this.sounds[name].volume = this.volume;
    }
  }

  // Play a sound
  play(name, options = {}) {
    if (!this.enabled) return;
    
    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`Sound "${name}" not found`);
      return null;
    }

    try {
      // Clone the audio to allow overlapping sounds
      const audio = sound.cloneNode();
      audio.volume = options.volume !== undefined ? options.volume : this.volume;
      audio.loop = options.loop || false;
      
      if (options.startTime !== undefined) {
        audio.currentTime = options.startTime;
      }
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Auto-play was prevented, user interaction required
          console.log('Audio play prevented:', error);
        });
      }
      
      return audio; // Return audio element so it can be stopped later
    } catch (error) {
      console.warn('Error playing sound:', error);
      return null;
    }
  }

  // Stop a sound
  stop(name) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  // Enable/disable sounds
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Initialize sounds (you can add your own sound files)
// Place sound files in public/sounds/ folder
soundManager.loadSound('crateOpen', '/sounds/tick.mp3');
soundManager.loadSound('tick', '/sounds/tick.mp3');
soundManager.loadSound('whoosh', '/sounds/whoosh.mp3');
soundManager.loadSound('reveal', '/sounds/reveal.mp3');
soundManager.loadSound('success', '/sounds/success.mp3');
soundManager.loadSound('backgroundMusic', '/sounds/background-music.mp3');

// Fallback: Generate simple tones if sound files don't exist
// You can replace these with actual sound files
const generateTone = (frequency, duration, type = 'sine') => {
  if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
    return null;
  }
  
  const AudioContextClass = AudioContext || webkitAudioContext;
  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
  
  return audioContext;
};

// Export sound manager and helper functions
export default soundManager;

export const playCrateOpen = () => {
  soundManager.play('crateOpen', { volume: 0.8 });
  // Fallback tone if sound file doesn't exist
  if (!soundManager.sounds['crateOpen']) {
    generateTone(200, 0.2, 'sine');
  }
};

export const playTick = (loop = false) => {
  return soundManager.play('tick', { volume: 0.3, loop: loop });
  // Fallback: subtle tick sound
  if (!soundManager.sounds['tick']) {
    generateTone(800, 0.05, 'square');
  }
};

export const playWhoosh = () => {
  soundManager.play('whoosh', { volume: 0.5 });
  // Fallback: whoosh-like sound
  if (!soundManager.sounds['whoosh']) {
    const audioContext = generateTone(300, 0.3, 'sawtooth');
    if (audioContext) {
      setTimeout(() => generateTone(200, 0.2, 'sawtooth'), 100);
    }
  }
};

export const playReveal = () => {
  soundManager.play('reveal', { volume: 0.9 });
  // Fallback: dramatic reveal sound
  if (!soundManager.sounds['reveal']) {
    generateTone(400, 0.4, 'sine');
    setTimeout(() => generateTone(600, 0.3, 'sine'), 200);
  }
};

export const playSuccess = () => {
  soundManager.play('success', { volume: 0.8 });
  // Fallback: success fanfare
  if (!soundManager.sounds['success']) {
    generateTone(523, 0.2, 'sine'); // C
    setTimeout(() => generateTone(659, 0.2, 'sine'), 200); // E
    setTimeout(() => generateTone(784, 0.3, 'sine'), 400); // G
  }
};

// Background music functions
let backgroundMusicInstance = null;

export const playBackgroundMusic = () => {
  // Stop any existing background music
  stopBackgroundMusic();
  
  // Play background music with low volume and loop
  backgroundMusicInstance = soundManager.play('backgroundMusic', { 
    volume: 0.05, // Subtle volume (10%)
    loop: true 
  });
  
  return backgroundMusicInstance;
};

export const stopBackgroundMusic = () => {
  if (backgroundMusicInstance) {
    backgroundMusicInstance.pause();
    backgroundMusicInstance.currentTime = 0;
    backgroundMusicInstance = null;
  }
};

export const setBackgroundMusicVolume = (volume) => {
  if (backgroundMusicInstance) {
    backgroundMusicInstance.volume = Math.max(0, Math.min(1, volume));
  }
};

