// Variables 
let timerDuration = 50 * 60; // default in seconds
let timerRemaining = timerDuration;
let timerInterval = null;

// Page Elements
const timerDisplay = document.getElementById('timerDisplay');
const startPauseBtn = document.getElementById('startPauseBtn');
const timerLengthInput = document.getElementById('timerLength');
const beepSound = document.getElementById('beepSound');

// On Reset/Save Click, do function 
document.getElementById('resetBtn').addEventListener('click', resetTimer);
document.getElementById('saveSettingsBtn').addEventListener('click', applyTimerSettings);

// Get LocalStorage Time on Page Load
localTimerGrab();

timerRemaining = timerDuration;
updateTimerDisplay();

// ----- Functions

    function updateTimerDisplay() {
        const minutes = Math.floor(timerRemaining / 60).toString().padStart(2, '0');
        const seconds = (timerRemaining % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    // Start Timer from saved time settings
    function startTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            if (timerRemaining > 0) {
            timerRemaining--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                startPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i> Start';
                triggerEndEffects();
            }
        }, 1000);
        }

    // Pause timer
    function pauseTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Reset back to saved time settings
    function resetTimer() {
        pauseTimer();
        timerRemaining = timerDuration;
        updateTimerDisplay();
        startPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i> Start';
    }

    // Apply Saved Timer
    function applyTimerSettings() {
        const minutes = parseInt(timerLengthInput.value, 10);
        localStorage.setItem('defaultTimerMinutes', minutes);
        timerDuration = minutes * 60;
        resetTimer();
    }

    function localTimerGrab() {
        const minutes = parseInt(timerLengthInput.value, 10);
        localStorage.setItem('defaultTimerMinutes', minutes);
        timerDuration = minutes * 60;
        resetTimer();
    }

    // Beep Sound & Flash CSS
    function triggerEndEffects() {
        // Play sound
        beepSound.currentTime = 0;
        beepSound.play();
        // Flash effect
        const modalContent = document.querySelector('#timerModal .modal-content');
        modalContent.classList.add('flash');
        setTimeout(() => modalContent.classList.remove('flash'), 3000);
    }

    // On Start Click
    startPauseBtn.addEventListener('click', () => {
        if (timerInterval) {
            pauseTimer();
            startPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i> Start';
        } else {
            startTimer();
            startPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i> Pause';
        }
    });

    // Initialise from localStorage
    const savedMinutes = localStorage.getItem('defaultTimerMinutes');
        if (savedMinutes) {
        timerLengthInput.value = savedMinutes;
        timerDuration = savedMinutes * 60;
    }