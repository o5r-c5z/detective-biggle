import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService implements OnDestroy {
  private audio: HTMLAudioElement | null = null;
  private _isPlaying = new BehaviorSubject<boolean>(false);
  private _volume = new BehaviorSubject<number>(0.5);
  
  public isPlaying$ = this._isPlaying.asObservable();
  public volume$ = this._volume.asObservable();
  
  constructor() { }
  
  /**
   * Initialize the background music with the given audio file
   * @param audioSource Path to the audio file
   */
  initBackgroundMusic(audioSource: string): void {
    if (!audioSource) return;
    
    if (!this.audio) {
      this.audio = new Audio(audioSource);
      this.audio.loop = true;
      this.audio.volume = this._volume.value;
      
      // Add audio element to the DOM for screen readers
      this.audio.id = 'background-music';
      this.audio.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.audio);
      
      // Add error handling for the audio
      this.audio.addEventListener('error', (e) => {
        console.error('Error loading audio file:', e);
        // Provide feedback to the console about the exact error
        if (this.audio) {
          const errorCodes = [
            'MEDIA_ERR_ABORTED',
            'MEDIA_ERR_NETWORK',
            'MEDIA_ERR_DECODE',
            'MEDIA_ERR_SRC_NOT_SUPPORTED'
          ];
          const error = this.audio.error;
          if (error) {
            console.error('Audio error code:', errorCodes[error.code - 1]);
          }
        }
      });
    } else {
      // If audio already exists, just update the source
      this.audio.src = audioSource;
      this.audio.load();
    }
  }
  
  /**
   * Play the background music from the beginning
   * @param resetToBeginning Whether to start from the beginning (default: true)
   */
  play(resetToBeginning: boolean = true): void {
    if (!this.audio) return;
    
    // Reset the audio to the beginning when requested
    if (resetToBeginning) {
      this.audio.currentTime = 0;
    }
    
    const playPromise = this.audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this._isPlaying.next(true);
        })
        .catch(error => {
          console.error('Error playing background music:', error);
          
          // Handle autoplay policy issues
          if (error.name === 'NotAllowedError') {
            console.log('Autoplay prevented. Will try to play on user interaction.');
            
            // Add a one-time event listener for user interaction
            const playOnInteraction = () => {
              this.audio?.play()
                .then(() => {
                  this._isPlaying.next(true);
                })
                .catch(e => console.error('Still could not play audio:', e));
              
              // Remove the event listeners after first interaction
              ['click', 'touchstart', 'keydown'].forEach(event => {
                document.removeEventListener(event, playOnInteraction);
              });
            };
            
            // Add listeners for common user interactions
            ['click', 'touchstart', 'keydown'].forEach(event => {
              document.addEventListener(event, playOnInteraction, { once: true });
            });
          }
        });
    }
  }
  
  /**
   * Pause the background music
   */
  pause(): void {
    if (!this.audio) return;
    
    this.audio.pause();
    this._isPlaying.next(false);
  }
  
  /**
   * Toggle play/pause state
   */
  toggle(): void {
    if (this._isPlaying.value) {
      this.pause();
    } else {
      // When toggling, don't reset to beginning
      this.play(false);
    }
  }
  
  /**
   * Set the volume of the background music
   * @param volume Volume value between 0-1
   */
  setVolume(volume: number): void {
    if (!this.audio) return;
    
    // Ensure volume is between 0 and 1
    const newVolume = Math.min(Math.max(volume, 0), 1);
    this.audio.volume = newVolume;
    this._volume.next(newVolume);
  }
  
  /**
   * Get the current volume
   * @returns Current volume (0-1)
   */
  getVolume(): number {
    return this._volume.value;
  }
  
  /**
   * Check if the audio is currently playing
   * @returns True if playing, false otherwise
   */
  isPlaying(): boolean {
    return this._isPlaying.value;
  }
  
  /**
   * Clean up resources when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      
      // Remove audio element from the DOM
      if (this.audio.parentNode) {
        this.audio.parentNode.removeChild(this.audio);
      }
      
      this.audio = null;
    }
    this._isPlaying.complete();
    this._volume.complete();
  }
} 