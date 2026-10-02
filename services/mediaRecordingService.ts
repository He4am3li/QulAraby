import html2canvas from 'html2canvas';

// Media Recording and Screenshot utilities for Whiteboard and Live Classroom

export interface ScreenRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  durationSec: number;
  mode?: 'screen' | 'canvas';
}

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingTimer: any = null;
let activeStream: MediaStream | null = null;

/**
 * Helper to obtain stream either via getDisplayMedia or canvas.captureStream fallback
 */
const getRecordingStream = async (): Promise<{ stream: MediaStream; mode: 'screen' | 'canvas' }> => {
  // 1. Try Screen / Display capture first if supported & permitted
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true
      });
      return { stream, mode: 'screen' };
    } catch (err: any) {
      console.warn("getDisplayMedia not permitted or disallowed by policy, falling back to Canvas Stream recording:", err);
    }
  }

  // 2. Fallback: Canvas captureStream (Works 100% inside iframes without permission policy blocks)
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("لم يتم العثور على لوحة الرسم لتسجيل الفيديو");
  }

  // capture stream at 30 fps
  const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
  if (!canvasStream) {
    throw new Error("متصفحك لا يدعم تسجيل لوحة الرسم captureStream");
  }

  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((track: MediaStreamTrack) => combinedStream.addTrack(track));

  // Optionally attempt to capture microphone audio
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    } catch (audioErr) {
      console.log("Audio permission skipped or not available:", audioErr);
    }
  }

  return { stream: combinedStream, mode: 'canvas' };
};

export const startVideoRecording = async (
  onStateChange: (state: ScreenRecorderState) => void,
  onError?: (err: any) => void
) => {
  try {
    const { stream, mode } = await getRecordingStream();
    activeStream = stream;
    recordedChunks = [];
    
    // Choose optimal mimeType supported by browser
    let mimeType = 'video/webm;codecs=vp9,opus';
    let fileExtension = 'webm';

    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')) {
      mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
      fileExtension = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
      fileExtension = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      mimeType = 'video/webm;codecs=vp9,opus';
      fileExtension = 'webm';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      mimeType = 'video/webm;codecs=vp8,opus';
      fileExtension = 'webm';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
      fileExtension = 'webm';
    }

    mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    let seconds = 0;
    recordingTimer = setInterval(() => {
      seconds += 1;
      onStateChange({
        isRecording: true,
        isPaused: false,
        durationSec: seconds,
        mode
      });
    }, 1000);

    // When user stops sharing from browser UI directly (if display capture)
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        stopVideoRecording(onStateChange);
      };
    }

    mediaRecorder.onstop = () => {
      clearInterval(recordingTimer);
      if (recordedChunks.length > 0) {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const todayStr = new Date().toISOString().slice(0, 10);
        // Ensure playable download format
        a.href = url;
        a.download = `QulBoard-${todayStr}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }

      // Stop all stream tracks
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        activeStream = null;
      }

      onStateChange({
        isRecording: false,
        isPaused: false,
        durationSec: 0
      });
    };

    mediaRecorder.start(1000); // collect 1s slices
    onStateChange({
      isRecording: true,
      isPaused: false,
      durationSec: 0,
      mode
    });
  } catch (err) {
    console.error("Failed to start video recording:", err);
    if (onError) onError(err);
  }
};

export const pauseVideoRecording = (onStateChange: (state: ScreenRecorderState) => void) => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    clearInterval(recordingTimer);
    onStateChange({
      isRecording: true,
      isPaused: true,
      durationSec: 0 // keeps current
    });
  }
};

export const resumeVideoRecording = (onStateChange: (state: ScreenRecorderState) => void) => {
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
    onStateChange({
      isRecording: true,
      isPaused: false,
      durationSec: 0
    });
  }
};

export const stopVideoRecording = (onStateChange: (state: ScreenRecorderState) => void) => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  clearInterval(recordingTimer);
  onStateChange({
    isRecording: false,
    isPaused: false,
    durationSec: 0
  });
};

/**
 * Capture high-resolution screenshot of the whiteboard container (including all cards, shapes, text, videos, and strokes)
 */
export const captureWhiteboardScreenshot = async (
  targetSelector = '#whiteboard-canvas-container'
): Promise<string | null> => {
  try {
    const targetElement = document.querySelector(targetSelector) as HTMLElement ||
                          document.querySelector('.whiteboard-board-container') as HTMLElement;
    
    if (targetElement) {
      // Find any floating toolbar elements that shouldn't be in the snapshot
      const renderedCanvas = await html2canvas(targetElement, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: null,
        logging: false,
        ignoreElements: (el) => {
          // Skip floating toolbars / submenus / laser cursors if any
          return el.classList.contains('teacher-toolbar-container') ||
                 el.classList.contains('sub-menu-container') ||
                 el.classList.contains('laser-pointer-cursor');
        }
      });

      // Add watermark
      const ctx = renderedCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 22px Tajawal, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('منصة قُل للغة العربية', renderedCanvas.width - 28, renderedCanvas.height - 28);
      }

      const dataUrl = renderedCanvas.toDataURL('image/png');
      
      // Trigger download with QulBoard-(date)
      const a = document.createElement('a');
      const todayDate = new Date().toISOString().slice(0, 10);
      a.href = dataUrl;
      a.download = `QulBoard-${todayDate}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      return dataUrl;
    }

    // Fallback if target element not found: capture standard canvas
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1b1c1f';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 18px Tajawal, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('منصة قُل للغة العربية', exportCanvas.width - 24, exportCanvas.height - 24);

        const dataUrl = exportCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        const todayDate = new Date().toISOString().slice(0, 10);
        a.href = dataUrl;
        a.download = `QulBoard-${todayDate}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        return dataUrl;
      }
    }
    return null;
  } catch (err) {
    console.error("Error capturing screenshot:", err);
    return null;
  }
};
