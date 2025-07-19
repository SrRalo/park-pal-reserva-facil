// Declare global augmentations for window
declare global {
  interface Window {
    Pusher: typeof import('pusher-js');
  }
}

export {};
