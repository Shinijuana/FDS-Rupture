const modelViewer = document.getElementById('sens');
const animateButton = document.getElementById('animate-button');

let animationState = 'initial';
const pauseAtFrame1 = 27, pauseAtFrame2 = 50, fps = 24;
const pauseTime1 = pauseAtFrame1 / fps, pauseTime2 = pauseAtFrame2 / fps;
let isAnimating = false;
let isInAR = false;

function updateCameraControl() {
  modelViewer.cameraControls = !isAnimating;
}

function updateButtonLabel() {
  if (animationState === 'initial' || animationState === 'pausedAt239') {
    animateButton.querySelector('.btn-subtitle').textContent = 'Open Info';
  } else if (animationState === 'pausedAt120') {
    animateButton.querySelector('.btn-subtitle').textContent = 'Close Info';
  }
}

// reset automatico ogni volta che viene caricato un modello
modelViewer.addEventListener('load', () => {
  animationState = 'initial';
  isAnimating = false;

  modelViewer.pause();
  modelViewer.currentTime = 0;
  modelViewer.animationLoop = false;
  modelViewer.animationName = modelViewer.availableAnimations?.[0] || null;

  updateCameraControl();
  updateButtonLabel(); // bottone torna "Open Info"
});

const handleClick = () => {
  if (animationState === 'initial' || animationState === 'pausedAt239') {
    // setta la camera orbit al click su "Open Info"
    modelViewer.setAttribute('camera-orbit', '0deg 75deg 0.9155m');

    modelViewer.currentTime = 0;
    modelViewer.play({ repetitions: 0 });
    isAnimating = true;
    updateCameraControl();
    animationState = 'playingTo120';

    const checkFrame = () => {
      if (animationState === 'playingTo120' && modelViewer.currentTime >= pauseTime1) {
        modelViewer.pause();
        animationState = 'pausedAt120';
        isAnimating = false;
        updateCameraControl();
        updateButtonLabel();
      } else if (animationState === 'playingTo120') {
        requestAnimationFrame(checkFrame);
      }
    };
    requestAnimationFrame(checkFrame);

  } else if (animationState === 'pausedAt120') {
    // qui NON tocchiamo la camera, resta quella già settata
    modelViewer.currentTime = pauseTime1;
    modelViewer.play({ repetitions: 0 });
    isAnimating = true;
    updateCameraControl();

    const checkEnd = () => {
      if (modelViewer.currentTime >= pauseTime2) {
        modelViewer.pause();
        animationState = 'pausedAt239';
        isAnimating = false;
        updateCameraControl();
        updateButtonLabel();
      } else {
        requestAnimationFrame(checkEnd);
      }
    };
    requestAnimationFrame(checkEnd);
  }
};


animateButton.addEventListener('click', () => {
  if (!isAnimating) handleClick();
});

const modelView = document.querySelector('model-viewer');
modelView.addEventListener('ar-button-press', () => {
  const iosSrc = modelView.getAttribute('ios-src');
  if (iosSrc && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    window.location.href = iosSrc;
  }
});

modelViewer.addEventListener('ar-status', (event) => {
  if (event.detail.status === 'session-started') {
    isInAR = true;
    modelViewer.pause();
    isAnimating = false;
    updateCameraControl();
  } else if (event.detail.status === 'not-presenting') {
    isInAR = false;
    updateCameraControl();
  }
});

modelViewer.addEventListener('finished', () => {
  modelViewer.pause();
  animationState = 'pausedAt239';
  isAnimating = false;
  updateCameraControl();
  updateButtonLabel();
});
