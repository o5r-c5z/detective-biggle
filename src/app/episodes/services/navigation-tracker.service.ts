import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Types of screens in the application
 */
export enum ScreenType {
  VIDEO = 'video',
  NON_VIDEO = 'non-video'
}

/**
 * Service to track navigation between different screen types
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationTrackerService {
  // Track the previous screen type
  private _previousScreen = new BehaviorSubject<ScreenType>(ScreenType.NON_VIDEO);
  
  // Track the current screen type
  private _currentScreen = new BehaviorSubject<ScreenType>(ScreenType.NON_VIDEO);
  
  // Observable streams
  public previousScreen$ = this._previousScreen.asObservable();
  public currentScreen$ = this._currentScreen.asObservable();
  
  /**
   * Update the current screen type
   * This automatically updates the previous screen type
   */
  setCurrentScreen(screenType: ScreenType): void {
    const current = this._currentScreen.value;
    
    // Update previous screen with the current value
    this._previousScreen.next(current);
    
    // Update current screen with the new value
    this._currentScreen.next(screenType);
  }
  
  /**
   * Get the current screen type
   */
  getCurrentScreen(): ScreenType {
    return this._currentScreen.value;
  }
  
  /**
   * Get the previous screen type
   */
  getPreviousScreen(): ScreenType {
    return this._previousScreen.value;
  }
  
  /**
   * Check if navigating from video to non-video
   */
  isLeavingVideoScreen(): boolean {
    return (
      this._previousScreen.value === ScreenType.VIDEO &&
      this._currentScreen.value === ScreenType.NON_VIDEO
    );
  }
  
  /**
   * Check if navigating from non-video to video
   */
  isEnteringVideoScreen(): boolean {
    return (
      this._previousScreen.value === ScreenType.NON_VIDEO &&
      this._currentScreen.value === ScreenType.VIDEO
    );
  }
} 