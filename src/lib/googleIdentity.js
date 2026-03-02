const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let scriptPromise;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google script')));
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export async function getGoogleIdToken(clientId) {
  if (!clientId) {
    throw new Error('Missing Google client ID');
  }

  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    let settled = false;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response?.credential) {
          if (!settled) {
            settled = true;
            reject(new Error('Google did not return an ID token'));
          }
          return;
        }

        if (!settled) {
          settled = true;
          resolve(response.credential);
        }
      }
    });

    window.google.accounts.id.prompt((notification) => {
      if (settled) {
        return;
      }

      const skipped = notification.isSkippedMoment?.();
      const dismissed = notification.isDismissedMoment?.();
      if (skipped || dismissed) {
        settled = true;
        reject(new Error('Google sign-in was cancelled'));
      }
    });
  });
}
