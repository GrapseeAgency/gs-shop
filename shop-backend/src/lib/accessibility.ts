import { NextRequest, NextResponse } from 'next/server';

// Accessibility compliance configuration
interface AccessibilityConfig {
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
  enableVoiceControl: boolean;
  colorBlindnessMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  language: string;
  readingLevel: 'basic' | 'intermediate' | 'advanced';
}

interface AccessibilityAudit {
  timestamp: Date;
  violations: AccessibilityViolation[];
  score: number;
  recommendations: string[];
}

interface AccessibilityViolation {
  type: 'error' | 'warning' | 'notice';
  rule: string;
  description: string;
  element: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  helpUrl?: string;
}

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig = {
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableHighContrast: false,
    enableReducedMotion: false,
    enableLargeText: false,
    enableVoiceControl: false,
    colorBlindnessMode: 'none',
    language: 'en',
    readingLevel: 'intermediate'
  };
  private auditHistory: AccessibilityAudit[] = [];

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  // Update accessibility configuration
  updateConfig(newConfig: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Accessibility configuration updated:', this.config);
  }

  // Get current configuration
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  // Validate content for accessibility
  validateContent(content: any): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Check for missing alt text on images
    if (content.images) {
      content.images.forEach((image: any, index: number) => {
        if (!image.alt || image.alt.trim() === '') {
          violations.push({
            type: 'error',
            rule: 'WCAG 1.1.1 - Non-text Content',
            description: `Image at index ${index} is missing alt text`,
            element: `img[${index}]`,
            impact: 'serious',
            helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html'
          });
        }
      });
    }

    // Check for proper heading structure
    if (content.headings) {
      let previousLevel = 0;
      content.headings.forEach((heading: any, index: number) => {
        const currentLevel = parseInt(heading.level.replace('h', ''));
        if (currentLevel > previousLevel + 1) {
          violations.push({
            type: 'warning',
            rule: 'WCAG 1.3.1 - Info and Relationships',
            description: `Heading level skipped at index ${index}`,
            element: heading.tag,
            impact: 'moderate'
          });
        }
        previousLevel = currentLevel;
      });
    }

    // Check for color contrast
    if (content.colors) {
      content.colors.forEach((color: any, index: number) => {
        const ratio = this.calculateContrastRatio(color.foreground, color.background);
        if (ratio < 4.5) {
          violations.push({
            type: 'error',
            rule: 'WCAG 1.4.3 - Contrast (Minimum)',
            description: `Insufficient color contrast at index ${index}: ${ratio.toFixed(2)}:1`,
            element: `color[${index}]`,
            impact: 'serious'
          });
        }
      });
    }

    // Check for keyboard accessibility
    if (content.interactiveElements) {
      content.interactiveElements.forEach((element: any, index: number) => {
        if (!element.tabIndex && element.tabIndex !== 0) {
          violations.push({
            type: 'warning',
            rule: 'WCAG 2.1.1 - Keyboard',
            description: `Interactive element at index ${index} may not be keyboard accessible`,
            element: element.tag,
            impact: 'serious'
          });
        }
      });
    }

    return violations;
  }

  // Calculate color contrast ratio
  private calculateContrastRatio(foreground: string, background: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = this.hexToRgb(hex);
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  // Convert hex to RGB
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  // Generate accessibility report
  generateReport(): AccessibilityAudit {
    const violations: AccessibilityViolation[] = [];
    const recommendations: string[] = [];

    // Simulate comprehensive accessibility audit
    

    violations.push(...[]);

    // Generate recommendations
    if (violations.some(v => v.type === 'error')) {
      recommendations.push('Fix all critical accessibility violations before production');
    }
    if (violations.some(v => v.impact === 'critical')) {
      recommendations.push('Prioritize fixing critical impact violations');
    }
    recommendations.push('Run automated accessibility tests regularly');
    recommendations.push('Conduct user testing with assistive technology users');

    // Calculate accessibility score
    const score = this.calculateAccessibilityScore(violations);

    const audit: AccessibilityAudit = {
      timestamp: new Date(),
      violations,
      score,
      recommendations
    };

    this.auditHistory.push(audit);
    return audit;
  }

  // Calculate accessibility score
  private calculateAccessibilityScore(violations: AccessibilityViolation[]): number {
    const weights = {
      critical: 10,
      serious: 5,
      moderate: 2,
      minor: 1
    };

    const totalDeductions = violations.reduce((sum, violation) => {
      return sum + weights[violation.impact];
    }, 0);

    const maxScore = 100;
    const score = Math.max(0, maxScore - totalDeductions);

    return score;
  }

  // Apply accessibility optimizations
  applyOptimizations(content: any): any {
    const optimizedContent = { ...content };

    // Add ARIA labels
    if (optimizedContent.interactiveElements) {
      optimizedContent.interactiveElements = optimizedContent.interactiveElements.map((element: any) => ({
        ...element,
        'aria-label': element['aria-label'] || this.generateAriaLabel(element),
        'role': element['role'] || this.inferRole(element),
        'tabIndex': element.tabIndex !== undefined ? element.tabIndex : 0
      }));
    }

    // Add keyboard navigation
    if (optimizedContent.navigation) {
      optimizedContent.navigation = {
        ...optimizedContent.navigation,
        'role': 'navigation',
        'aria-label': 'Main navigation'
      };
    }

    // Add skip links
    optimizedContent.skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' }
    ];

    // Add live regions for dynamic content
    if (optimizedContent.dynamicContent) {
      optimizedContent.dynamicContent = optimizedContent.dynamicContent.map((region: any) => ({
        ...region,
        'aria-live': 'polite',
        'aria-atomic': 'true'
      }));
    }

    return optimizedContent;
  }

  // Generate ARIA label
  private generateAriaLabel(element: any): string {
    if (element.text) return element.text;
    if (element.title) return element.title;
    if (element.placeholder) return element.placeholder;
    return `${element.tag} element`;
  }

  // Infer ARIA role
  private inferRole(element: any): string {
    const tag = element.tag?.toLowerCase();
    
    const roleMap: Record<string, string> = {
      'button': 'button',
      'input': 'textbox',
      'select': 'combobox',
      'textarea': 'textbox',
      'a': 'link',
      'nav': 'navigation',
      'main': 'main',
      'header': 'banner',
      'footer': 'contentinfo'
    };

    return roleMap[tag] || 'generic';
  }

  // Generate screen reader announcements
  generateScreenReaderAnnouncement(message: string, priority: 'polite' | 'assertive' = 'polite'): string {
    return `
      <div aria-live="${priority}" aria-atomic="true" class="sr-only">
        ${message}
      </div>
    `;
  }

  // Validate neural interface accessibility
  validateNeuralInterface(neuralData: any): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Check for alternative input methods
    if (!neuralData.alternativeInputs) {
      violations.push({
        type: 'error',
        rule: 'WCAG 2.1.1 - Keyboard',
        description: 'Neural interface must provide alternative input methods',
        element: 'neural-interface',
        impact: 'critical'
      });
    }

    // Check for visual feedback
    if (!neuralData.visualFeedback) {
      violations.push({
        type: 'warning',
        rule: 'WCAG 1.4.1 - Use of Color',
        description: 'Neural interface should provide visual feedback for non-visual users',
        element: 'neural-feedback',
        impact: 'serious'
      });
    }

    return violations;
  }

  // Validate holographic display accessibility
  validateHolographicDisplay(holographicData: any): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Check for 2D alternative
    if (!holographicData.alternative2D) {
      violations.push({
        type: 'error',
        rule: 'WCAG 1.1.1 - Non-text Content',
        description: 'Holographic displays must have 2D alternatives',
        element: 'holographic-display',
        impact: 'critical'
      });
    }

    // Check for audio descriptions
    if (!holographicData.audioDescriptions) {
      violations.push({
        type: 'warning',
        rule: 'WCAG 1.2.3 - Audio Description or Media Alternative',
        description: 'Holographic content should include audio descriptions',
        element: 'holographic-content',
        impact: 'serious'
      });
    }

    return violations;
  }

  // Generate accessibility-compliant API responses
  generateAccessibleResponse(data: any, request: NextRequest): NextResponse {
    const response = NextResponse.json(data);

    // Add accessibility headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Add screen reader friendly content type
    const userAgent = request.headers.get('user-agent') || '';
    if (this.isScreenReader(userAgent)) {
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      response.headers.set('X-Accessibility-Mode', 'screen-reader');
    }

    return response;
  }

  // Detect screen reader user agent
  private isScreenReader(userAgent: string): boolean {
    const screenReaderPatterns = [
      /NVDA/,
      /JAWS/,
      /VoiceOver/,
      /TalkBack/,
      /ChromeVox/,
      /ZDSR/
    ];

    return screenReaderPatterns.some(pattern => pattern.test(userAgent));
  }

  // Get accessibility statistics
  getStatistics(): any {
    const latestAudit = this.auditHistory[this.auditHistory.length - 1];
    const averageScore = this.auditHistory.length > 0 
      ? this.auditHistory.reduce((sum, audit) => sum + audit.score, 0) / this.auditHistory.length
      : 0;

    return {
      currentScore: latestAudit?.score || 0,
      averageScore,
      totalAudits: this.auditHistory.length,
      configuration: this.config,
      recentViolations: latestAudit?.violations || []
    };
  }

  // Export accessibility report
  exportReport(): string {
    const statistics = this.getStatistics();
    const latestAudit = this.auditHistory[this.auditHistory.length - 1];

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        overallScore: statistics.currentScore,
        averageScore: statistics.averageScore,
        totalAudits: statistics.totalAudits,
        configuration: statistics.configuration
      },
      latestAudit,
      recommendations: latestAudit?.recommendations || [],
      nextSteps: [
        'Fix all critical violations',
        'Implement automated accessibility testing',
        'Conduct regular user testing with assistive technology',
        'Monitor accessibility metrics over time'
      ]
    };

    return JSON.stringify(report, null, 2);
  }
}

// Accessibility middleware
export function withAccessibility(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const accessibilityManager = AccessibilityManager.getInstance();

    // Check for accessibility preferences in headers
    const accessibilityHeader = request.headers.get('X-Accessibility-Preferences');
    if (accessibilityHeader) {
      try {
        const preferences = JSON.parse(accessibilityHeader);
        accessibilityManager.updateConfig(preferences);
      } catch (error) {
        console.warn('Invalid accessibility preferences header');
      }
    }

    // Execute handler
    const result = await handler(request, ...args);

    // Make response accessible
    if (result instanceof NextResponse) {
      return accessibilityManager.generateAccessibleResponse(
        await result.json(),
        request
      );
    }

    return result;
  };
}

// Export singleton instance
export const accessibilityManager = AccessibilityManager.getInstance();
