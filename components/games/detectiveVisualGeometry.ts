import type { CSSProperties } from 'react';

// Measured from the ten supplied 2048x1152 cinematic case images.
// Each button rectangle aligns with the red artwork itself rather than
// assuming the ten cases use the same vertical position.
export type DetectiveRect = { left: number; top: number; width: number; height: number };
export const ADVANCED_START_BUTTON_RECTS: Record<number, DetectiveRect> = {
  "1": {
    "left": 3.62,
    "top": 64.4,
    "width": 25.52,
    "height": 8.45
  },
  "2": {
    "left": 3.62,
    "top": 69.2,
    "width": 25.52,
    "height": 8.7
  },
  "3": {
    "left": 3.62,
    "top": 66.88,
    "width": 25.52,
    "height": 9.18
  },
  "4": {
    "left": 3.62,
    "top": 67.8,
    "width": 25.52,
    "height": 9.22
  },
  "5": {
    "left": 3.62,
    "top": 65.82,
    "width": 25.52,
    "height": 8.7
  },
  "6": {
    "left": 3.62,
    "top": 66.48,
    "width": 25.52,
    "height": 8.75
  },
  "7": {
    "left": 3.62,
    "top": 68.22,
    "width": 25.52,
    "height": 9.03
  },
  "8": {
    "left": 3.62,
    "top": 66.62,
    "width": 25.52,
    "height": 9.07
  },
  "9": {
    "left": 3.62,
    "top": 64.55,
    "width": 25.52,
    "height": 8.84
  },
  "10": {
    "left": 3.62,
    "top": 65.58,
    "width": 25.52,
    "height": 8.72
  }
};

// The smaller beginner posters and original six intermediate posters use
// their own booklet button placements, never the advanced coordinates.
export const BEGINNER_START_BUTTON_RECTS: Record<number, DetectiveRect> = {
  "1": {
    "left": 3.6,
    "top": 65.15,
    "width": 25.57,
    "height": 7.65
  },
  "2": {
    "left": 3.6,
    "top": 65.18,
    "width": 25.57,
    "height": 7.65
  },
  "3": {
    "left": 3.6,
    "top": 65.02,
    "width": 25.57,
    "height": 7.65
  },
  "4": {
    "left": 3.6,
    "top": 64.88,
    "width": 25.57,
    "height": 7.65
  },
  "5": {
    "left": 3.6,
    "top": 65.1,
    "width": 25.57,
    "height": 7.65
  },
  "6": {
    "left": 3.6,
    "top": 62.1,
    "width": 25.57,
    "height": 7.65
  },
  "7": {
    "left": 3.6,
    "top": 65.18,
    "width": 25.57,
    "height": 7.65
  },
  "8": {
    "left": 3.6,
    "top": 65.09,
    "width": 25.57,
    "height": 7.65
  },
  "9": {
    "left": 3.6,
    "top": 64.97,
    "width": 25.57,
    "height": 7.65
  },
  "10": {
    "left": 3.6,
    "top": 65.06,
    "width": 25.57,
    "height": 7.65
  }
};

export function getDetectiveStartRect(level: 'beginner' | 'intermediate' | 'advanced', caseNumber: number): DetectiveRect {
 if (level === 'advanced') return ADVANCED_START_BUTTON_RECTS[caseNumber] || ADVANCED_START_BUTTON_RECTS[1];
 if (level === 'beginner') return BEGINNER_START_BUTTON_RECTS[caseNumber] || BEGINNER_START_BUTTON_RECTS[1];
 return { left: 3.60, top: 65.45, width: 25.57, height: 7.65 };
}

export function detectiveRectStyle(rect: DetectiveRect): CSSProperties {
 return { left: rect.left + '%', top: rect.top + '%', width: rect.width + '%', height: rect.height + '%' };
}

// Original advanced case posters already contain intact, correctly framed portraits.
// Display those photo regions directly instead of zooming the outdated cropped
// 185x200 exports, many of which included neighbouring faces or cut-off foreheads.
// Coordinates refer to the original 2048x1152 artwork and remain valid after
// the 1600x900 background image is scaled for the app.
type PosterPhotoStrip = { rows: number[][]; y: [number, number]; w: number; h: number };
export const ADVANCED_PORTRAIT_STRIPS: Record<number, PosterPhotoStrip> = {
  "1": {
    "rows": [
      [
        1296,
        1440,
        1584,
        1729,
        1874
      ],
      [
        1294,
        1439,
        1584,
        1729,
        1874
      ]
    ],
    "y": [
      284,
      535
    ],
    "w": 135,
    "h": 174
  },
  "2": {
    "rows": [
      [
        1277,
        1429,
        1581,
        1733,
        1885
      ],
      [
        1277,
        1429,
        1581,
        1733,
        1885
      ]
    ],
    "y": [
      266,
      502
    ],
    "w": 141,
    "h": 174
  },
  "3": {
    "rows": [
      [
        1248,
        1378,
        1508,
        1638,
        1768,
        1898
      ],
      [
        1248,
        1378,
        1508,
        1638,
        1768,
        1898
      ]
    ],
    "y": [
      271,
      530
    ],
    "w": 121,
    "h": 172
  },
  "4": {
    "rows": [
      [
        1302,
        1443,
        1584,
        1725,
        1866
      ],
      [
        1302,
        1443,
        1584,
        1725,
        1866
      ]
    ],
    "y": [
      291,
      539
    ],
    "w": 131,
    "h": 174
  },
  "5": {
    "rows": [
      [
        1204,
        1352,
        1500,
        1648,
        1796
      ],
      [
        1204,
        1352,
        1500,
        1648,
        1796
      ]
    ],
    "y": [
      224,
      452
    ],
    "w": 138,
    "h": 174
  },
  "6": {
    "rows": [
      [
        1188,
        1328,
        1468,
        1608,
        1748,
        1888
      ],
      [
        1188,
        1328,
        1468,
        1608,
        1748,
        1888
      ]
    ],
    "y": [
      258,
      526
    ],
    "w": 130,
    "h": 174
  },
  "7": {
    "rows": [
      [
        1181,
        1323,
        1465,
        1607,
        1749,
        1891
      ],
      [
        1181,
        1323,
        1465,
        1607,
        1749
      ]
    ],
    "y": [
      264,
      519
    ],
    "w": 132,
    "h": 174
  },
  "8": {
    "rows": [
      [
        1248,
        1378,
        1508,
        1638,
        1768,
        1898
      ],
      [
        1248,
        1378,
        1508,
        1638,
        1768
      ]
    ],
    "y": [
      275,
      523
    ],
    "w": 120,
    "h": 174
  },
  "9": {
    "rows": [
      [
        1259,
        1413,
        1567,
        1721,
        1875
      ],
      [
        1259,
        1413,
        1567,
        1721,
        1875
      ]
    ],
    "y": [
      290,
      539
    ],
    "w": 144,
    "h": 174
  },
  "10": {
    "rows": [
      [
        1193,
        1343,
        1493,
        1643,
        1793
      ],
      [
        1193,
        1343,
        1493,
        1643,
        1793
      ]
    ],
    "y": [
      239,
      467
    ],
    "w": 140,
    "h": 174
  }
};

/** Background-size/position crop the exact person's original photo without cropping another person. */
export function getAdvancedPosterPortraitStyle(caseNumber: number, suspectIndex: number, sceneImage: string): CSSProperties | null {
 const strip = ADVANCED_PORTRAIT_STRIPS[caseNumber];
 if (!strip) return null;
 const row = suspectIndex < strip.rows[0].length ? 0 : 1;
 const column = row === 0 ? suspectIndex : suspectIndex - strip.rows[0].length;
 const x0 = strip.rows[row]?.[column];
 if (x0 === undefined) return null;
 const x = x0 + 4, y = strip.y[row] + 5, w = strip.w - 6, h = strip.h - 5;
 const fullWidth = 2048, fullHeight = 1152;
 return {
   backgroundImage: sceneImage,
   backgroundRepeat: 'no-repeat',
   backgroundSize: (fullWidth / w * 100) + '% ' + (fullHeight / h * 100) + '%',
   backgroundPosition: (x / (fullWidth - w) * 100) + '% ' + (y / (fullHeight - h) * 100) + '%',
 };
}
