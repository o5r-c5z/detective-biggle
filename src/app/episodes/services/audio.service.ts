import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioService implements OnDestroy {
  private audio: HTMLAudioElement | null = null;
  private soundEffects: HTMLAudioElement[] = [];
  private _isPlaying = new BehaviorSubject<boolean>(false);
  private _volume = new BehaviorSubject<number>(0.1);

  public isPlaying$ = this._isPlaying.asObservable();
  public volume$ = this._volume.asObservable();

  initBackgroundMusic(audioSource: string): void {
    if (!audioSource) {
      return;
    }

    if (!this.audio) {
      this.audio = new Audio(audioSource);
      this.audio.loop = true;
      this.audio.volume = this._volume.value;
      this.audio.id = 'background-music';
      this.audio.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.audio);

      this.audio.addEventListener('error', (e) => {
        console.error('Error loading audio file:', e);
        if (this.audio) {
          const errorCodes = [
            'MEDIA_ERR_ABORTED',
            'MEDIA_ERR_NETWORK',
            'MEDIA_ERR_DECODE',
            'MEDIA_ERR_SRC_NOT_SUPPORTED',
          ];
          const error = this.audio.error;
          if (error) {
            console.error('Audio error code:', errorCodes[error.code - 1]);
          }
        }
      });
    } else {
      this.audio.src = audioSource;
      this.audio.load();
    }
  }

  play(resetToBeginning: boolean = true): void {
    if (!this.audio) {
      return;
    }

    if (resetToBeginning) {
      this.audio.currentTime = 0;
    }

    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this._isPlaying.next(true);
        })
        .catch((error) => {
          console.error('Error playing background music:', error);

          if (error.name === 'NotAllowedError') {
            console.log(
              'Autoplay prevented. Will try to play on user interaction.',
            );

            const playOnInteraction = () => {
              this.audio
                ?.play()
                .then(() => {
                  this._isPlaying.next(true);
                })
                .catch((e) => console.error('Still could not play audio:', e));

              ['click', 'touchstart', 'keydown'].forEach((event) => {
                document.removeEventListener(event, playOnInteraction);
              });
            };

            ['click', 'touchstart', 'keydown'].forEach((event) => {
              document.addEventListener(event, playOnInteraction, {
                once: true,
              });
            });
          }
        });
    }
  }

  pause(): void {
    if (!this.audio) {
      return;
    }

    this.audio.pause();
    this._isPlaying.next(false);
  }

  toggle(): void {
    if (this._isPlaying.value) {
      this.pause();
    } else {
      this.play(false);
    }
  }

  setVolume(volume: number): void {
    if (!this.audio) {
      return;
    }

    const newVolume = Math.min(Math.max(volume, 0), 1);
    this.audio.volume = newVolume;
    this._volume.next(newVolume);
  }

  getVolume(): number {
    return this._volume.value;
  }

  isPlaying(): boolean {
    return this._isPlaying.value;
  }

  mute(): void {
    if (!this.audio) {
      return;
    }

    this.audio.muted = true;
  }

  unmute(): void {
    if (!this.audio) {
      return;
    }

    this.audio.muted = false;
  }

  isMuted(): boolean {
    return this.audio?.muted ?? false;
  }

  /**
   * Play a one-shot sound effect while background music continues playing
   * @param audioSource - The path to the sound effect audio file
   * @param volume - Optional volume for the sound effect (0-1), defaults to current volume
   * @returns Promise that resolves when the sound starts playing
   */
  playSoundEffect(audioSource: string, volume?: number): Promise<void> {
    if (!audioSource) {
      return Promise.reject(new Error('Audio source is required'));
    }

    const soundEffect = new Audio(audioSource);
    soundEffect.volume = volume ?? this._volume.value;
    soundEffect.id = `sound-effect-${Date.now()}`;
    soundEffect.setAttribute('aria-hidden', 'true');
    
    // Add to tracking array
    this.soundEffects.push(soundEffect);

    // Clean up when the sound finishes playing
    const cleanup = () => {
      const index = this.soundEffects.indexOf(soundEffect);
      if (index > -1) {
        this.soundEffects.splice(index, 1);
      }
      
      if (soundEffect.parentNode) {
        soundEffect.parentNode.removeChild(soundEffect);
      }
      
      soundEffect.removeEventListener('ended', cleanup);
      soundEffect.removeEventListener('error', cleanup);
    };

    soundEffect.addEventListener('ended', cleanup);
    soundEffect.addEventListener('error', cleanup);

    // Add error handling
    soundEffect.addEventListener('error', (e) => {
      console.error('Error playing sound effect:', e);
      cleanup();
    });

    document.body.appendChild(soundEffect);

    return soundEffect.play().catch((error) => {
      console.error('Error playing sound effect:', error);
      cleanup();
      throw error;
    });
  }

  /**
   * Stop all currently playing sound effects
   */
  stopAllSoundEffects(): void {
    this.soundEffects.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
    this.soundEffects = [];
  }

  /**
   * Get the number of currently playing sound effects
   */
  getActiveSoundEffectsCount(): number {
    return this.soundEffects.length;
  }

  /**
   * Set volume for all sound effects
   * @param volume - Volume level (0-1)
   */
  setSoundEffectsVolume(volume: number): void {
    const newVolume = Math.min(Math.max(volume, 0), 1);
    this.soundEffects.forEach(sound => {
      sound.volume = newVolume;
    });
  }

  ngOnDestroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';

      if (this.audio.parentNode) {
        this.audio.parentNode.removeChild(this.audio);
      }

      this.audio = null;
    }

    // Clean up all sound effects
    this.stopAllSoundEffects();

    this._isPlaying.complete();
    this._volume.complete();
  }
}
