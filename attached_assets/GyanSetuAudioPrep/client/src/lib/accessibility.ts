export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
}

export interface AccessibilityAnnouncement {
  message: string;
  priority: "polite" | "assertive" | "off";
  language?: "english" | "hindi";
  delay?: number;
}

export class AccessibilityManager {
  private settings: AccessibilitySettings;
  private announceQueue: AccessibilityAnnouncement[] = [];
  private isAnnouncing: boolean = false;
  private lastAnnouncement: string = "";

  constructor(initialSettings?: Partial<AccessibilitySettings>) {
    this.settings = {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      speechRate: 0.9,
      speechPitch: 1.0,
      speechVolume: 1.0,
      keyboardNavigation: true,
      screenReaderOptimized: true,
      ...initialSettings
    };

    this.initializeAccessibility();
  }

  private initializeAccessibility(): void {
    // Apply initial settings
    this.applyContrastMode();
    this.applyTextSize();
    this.applyMotionPreferences();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.detectUserPreferences();
  }

  private detectUserPreferences(): void {
    // Detect system preferences
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.updateSetting('highContrast', true);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.updateSetting('reduceMotion', true);
    }

    // Listen for preference changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.updateSetting('highContrast', e.matches);
    });

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.updateSetting('reduceMotion', e.matches);
    });
  }

  updateSetting<K extends keyof AccessibilitySettings>(
    setting: K, 
    value: AccessibilitySettings[K]
  ): void {
    this.settings[setting] = value;
    
    // Apply setting immediately
    switch (setting) {
      case 'highContrast':
        this.applyContrastMode();
        break;
      case 'largeText':
        this.applyTextSize();
        break;
      case 'reduceMotion':
        this.applyMotionPreferences();
        break;
    }

    // Save to localStorage
    localStorage.setItem('gyansetu_accessibility', JSON.stringify(this.settings));
  }

  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  private applyContrastMode(): void {
    const root = document.documentElement;
    
    if (this.settings.highContrast) {
      root.setAttribute('data-contrast', 'high');
      root.style.setProperty('--accessibility-contrast', '1');
    } else {
      root.removeAttribute('data-contrast');
      root.style.removeProperty('--accessibility-contrast');
    }
  }

  private applyTextSize(): void {
    const root = document.documentElement;
    
    if (this.settings.largeText) {
      root.style.setProperty('--accessibility-font-scale', '1.25');
      root.classList.add('large-text');
    } else {
      root.style.setProperty('--accessibility-font-scale', '1');
      root.classList.remove('large-text');
    }
  }

  private applyMotionPreferences(): void {
    const root = document.documentElement;
    
    if (this.settings.reduceMotion) {
      root.style.setProperty('--accessibility-motion', 'reduce');
      root.classList.add('reduce-motion');
    } else {
      root.style.setProperty('--accessibility-motion', 'auto');
      root.classList.remove('reduce-motion');
    }
  }

  private setupKeyboardNavigation(): void {
    if (!this.settings.keyboardNavigation) return;

    // Ensure all interactive elements are focusable
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], a, input, select, textarea, [tabindex]'
    );

    interactiveElements.forEach((element) => {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
    });

    // Add keyboard event handlers
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    // ESC key handling
    if (event.key === 'Escape') {
      this.handleEscapeKey();
    }

    // Arrow key navigation for custom components
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      this.handleArrowKeyNavigation(event);
    }

    // Space and Enter for activation
    if (event.key === ' ' || event.key === 'Enter') {
      this.handleActivationKeys(event);
    }
  }

  private handleEscapeKey(): void {
    // Close any open modals, menus, etc.
    const openElements = document.querySelectorAll('[aria-expanded="true"]');
    openElements.forEach((element) => {
      element.setAttribute('aria-expanded', 'false');
    });

    // Announce escape action
    this.announce("Escaped to main content", "polite");
  }

  private handleArrowKeyNavigation(event: KeyboardEvent): void {
    const focusedElement = document.activeElement as HTMLElement;
    
    // Handle radio group navigation
    if (focusedElement?.getAttribute('role') === 'radio') {
      event.preventDefault();
      this.navigateRadioGroup(event.key, focusedElement);
    }

    // Handle menu navigation
    if (focusedElement?.closest('[role="menu"]')) {
      event.preventDefault();
      this.navigateMenu(event.key, focusedElement);
    }
  }

  private handleActivationKeys(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    if (target.getAttribute('role') === 'button' && event.key === ' ') {
      event.preventDefault();
      target.click();
    }
  }

  private navigateRadioGroup(key: string, currentElement: HTMLElement): void {
    const radioGroup = currentElement.closest('[role="radiogroup"]');
    if (!radioGroup) return;

    const radios = Array.from(radioGroup.querySelectorAll('[role="radio"]'));
    const currentIndex = radios.indexOf(currentElement);
    
    let nextIndex: number;
    if (key === 'ArrowDown' || key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % radios.length;
    } else {
      nextIndex = (currentIndex - 1 + radios.length) % radios.length;
    }

    (radios[nextIndex] as HTMLElement).focus();
  }

  private navigateMenu(key: string, currentElement: HTMLElement): void {
    const menu = currentElement.closest('[role="menu"]');
    if (!menu) return;

    const menuItems = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    const currentIndex = menuItems.indexOf(currentElement);
    
    let nextIndex: number;
    if (key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % menuItems.length;
    } else if (key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
    } else {
      return;
    }

    (menuItems[nextIndex] as HTMLElement).focus();
  }

  private setupFocusManagement(): void {
    // Trap focus in modals
    document.addEventListener('focusin', (event) => {
      const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (modal && !modal.contains(event.target as Node)) {
        const firstFocusable = modal.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }
    });

    // Announce focus changes for screen readers
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const ariaLabel = target.getAttribute('aria-label');
      const ariaLabelledBy = target.getAttribute('aria-labelledby');
      
      if (ariaLabel) {
        this.announce(`Focused: ${ariaLabel}`, "polite", undefined, 100);
      } else if (ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        if (labelElement) {
          this.announce(`Focused: ${labelElement.textContent}`, "polite", undefined, 100);
        }
      }
    });
  }

  announce(
    message: string, 
    priority: "polite" | "assertive" | "off" = "polite",
    language: "english" | "hindi" = "english",
    delay: number = 0
  ): void {
    const announcement: AccessibilityAnnouncement = {
      message,
      priority,
      language,
      delay
    };

    this.announceQueue.push(announcement);
    
    if (!this.isAnnouncing) {
      this.processAnnounceQueue();
    }
  }

  private async processAnnounceQueue(): Promise<void> {
    if (this.announceQueue.length === 0) {
      this.isAnnouncing = false;
      return;
    }

    this.isAnnouncing = true;
    const announcement = this.announceQueue.shift()!;

    // Add delay if specified
    if (announcement.delay) {
      await new Promise(resolve => setTimeout(resolve, announcement.delay));
    }

    // Update screen reader announcement area
    this.updateScreenReaderAnnouncement(announcement);

    // Also use speech synthesis if available
    if ('speechSynthesis' in window && this.settings.screenReaderOptimized) {
      this.speakAnnouncement(announcement);
    }

    this.lastAnnouncement = announcement.message;

    // Process next announcement after a brief delay
    setTimeout(() => {
      this.processAnnounceQueue();
    }, 100);
  }

  private updateScreenReaderAnnouncement(announcement: AccessibilityAnnouncement): void {
    const announcementElement = document.getElementById('current-announcement');
    if (announcementElement) {
      // Clear first to ensure screen readers notice the change
      announcementElement.textContent = '';
      
      // Set the announcement after a brief delay
      setTimeout(() => {
        announcementElement.textContent = announcement.message;
      }, 10);
    }

    // Also update the live region priority
    const liveRegion = document.getElementById('audio-announcements');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', announcement.priority);
    }
  }

  private speakAnnouncement(announcement: AccessibilityAnnouncement): void {
    const utterance = new SpeechSynthesisUtterance(announcement.message);
    utterance.lang = announcement.language === "hindi" ? "hi-IN" : "en-US";
    utterance.rate = this.settings.speechRate;
    utterance.pitch = this.settings.speechPitch;
    utterance.volume = this.settings.speechVolume;

    speechSynthesis.speak(utterance);
  }

  getLastAnnouncement(): string {
    return this.lastAnnouncement;
  }

  repeatLastAnnouncement(): void {
    if (this.lastAnnouncement) {
      this.announce(this.lastAnnouncement, "assertive");
    }
  }

  // Color contrast utilities
  static checkColorContrast(foreground: string, background: string): number {
    const getLuminance = (color: string): number => {
      // Convert color to RGB values
      const rgb = this.hexToRgb(color);
      if (!rgb) return 0;

      // Calculate relative luminance
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Touch target utilities
  static ensureTouchTargets(): void {
    const minTouchSize = 44; // 44px minimum as per WCAG
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], a, input[type="checkbox"], input[type="radio"]'
    );

    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      
      if (rect.width < minTouchSize || rect.height < minTouchSize) {
        (element as HTMLElement).style.minWidth = `${minTouchSize}px`;
        (element as HTMLElement).style.minHeight = `${minTouchSize}px`;
        element.classList.add('touch-target');
      }
    });
  }

  // ARIA live region utilities
  createLiveRegion(id: string, priority: "polite" | "assertive" = "polite"): HTMLElement {
    const existing = document.getElementById(id);
    if (existing) return existing;

    const liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    
    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  // Form accessibility helpers
  static enhanceFormAccessibility(): void {
    // Add required indicators
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach((field) => {
      field.setAttribute('aria-required', 'true');
      
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label && !label.textContent?.includes('*')) {
        label.innerHTML += ' <span aria-label="required">*</span>';
      }
    });

    // Add error associations
    const errorElements = document.querySelectorAll('[id$="-error"]');
    errorElements.forEach((error) => {
      const fieldId = error.id.replace('-error', '');
      const field = document.getElementById(fieldId);
      
      if (field) {
        field.setAttribute('aria-describedby', error.id);
        field.setAttribute('aria-invalid', 'true');
      }
    });
  }
}

// Create default instance
export const accessibilityManager = new AccessibilityManager();

// Utility functions
export function announceToScreenReader(
  message: string, 
  priority: "polite" | "assertive" = "polite"
): void {
  accessibilityManager.announce(message, priority);
}

export function repeatLastAnnouncement(): void {
  accessibilityManager.repeatLastAnnouncement();
}

export function setupAccessibilityFeatures(): void {
  // Initialize all accessibility features
  AccessibilityManager.ensureTouchTargets();
  AccessibilityManager.enhanceFormAccessibility();
  
  // Setup global keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Alt + H for help
    if (event.altKey && event.key === 'h') {
      event.preventDefault();
      announceToScreenReader("Help: Press tab to navigate, space or enter to activate, escape to cancel", "assertive");
    }
    
    // Alt + R to repeat last announcement
    if (event.altKey && event.key === 'r') {
      event.preventDefault();
      repeatLastAnnouncement();
    }
  });
}

// Initialize accessibility features when module loads
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', setupAccessibilityFeatures);
}
