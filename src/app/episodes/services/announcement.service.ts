import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  constructor(private liveAnnouncer: LiveAnnouncer) {}
  
  announce(message: string): void {
    this.liveAnnouncer.announce(message);
    console.debug(message);
  }
} 