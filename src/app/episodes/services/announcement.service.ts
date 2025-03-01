import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService implements OnDestroy {
  private liveElement: HTMLElement;
  
  constructor(@Inject(DOCUMENT) private document: Document) {
    // Create a live region for accessibility announcements
    this.liveElement = this.document.createElement('div');
    this.liveElement.setAttribute('aria-live', 'polite');
    this.liveElement.setAttribute('aria-atomic', 'true');
    this.liveElement.setAttribute('class', 'sr-only');
    this.document.body.appendChild(this.liveElement);
  }
  
  /**
   * Announce a message to screen readers
   * @param message The message to announce
   */
  announce(message: string): void {
    // Clear previous announcements
    this.liveElement.textContent = '';
    
    // Force browser to pause before adding new announcement
    setTimeout(() => {
      this.liveElement.textContent = message;
    }, 100);
  }
  
  /**
   * Clean up the live region when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.liveElement && this.liveElement.parentNode) {
      this.liveElement.parentNode.removeChild(this.liveElement);
    }
  }
} 