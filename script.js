// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const minutesInput = document.getElementById('minutes-input');
const secondsInput = document.getElementById('seconds-input');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const messageDiv = document.getElementById('message');
const alarmSound = document.getElementById('alarm-sound');

// Timer Variables
let totalSeconds = 25 * 60;
let originalTime = totalSeconds;
let timerInterval = null;
let isRunning = false;
let isPaused = false;

// Sound enabled flag
let soundEnabled = false;

// Initialize the display
updateDisplay();

// ENABLE SOUND ON FIRST USER INTERACTION
document.addEventListener('click', enableSound);
document.addEventListener('keydown', enableSound);

function enableSound() {
    if (!soundEnabled) {
        // Create and play a silent audio to unlock audio context
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQ=';
        silentAudio.volume = 0.001;
        
        silentAudio.play().then(() => {
            soundEnabled = true;
            console.log('✅ Sound enabled!');
            showMessage('🔊 Sound enabled - alarm will work!', 'success');
            
            // Remove listeners
            document.removeEventListener('click', enableSound);
            document.removeEventListener('keydown', enableSound);
        }).catch(e => {
            console.log('⚠️ Could not enable sound automatically');
        });
    }
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

minutesInput.addEventListener('change', updateTimeFromInputs);
secondsInput.addEventListener('change', updateTimeFromInputs);

// TEST SOUND BUTTON - ADD THIS TO HTML TOO
// Add this HTML: <button onclick="testSound()" class="btn test">🔊 Test Sound</button>
function testSound() {
    if (!soundEnabled) {
        showMessage('Click anywhere on page first to enable sound', 'warning');
        return;
    }
    
    alarmSound.currentTime = 0;
    alarmSound.volume = 0.7;
    alarmSound.play().then(() => {
        showMessage('🔊 Test sound playing...', 'success');
    }).catch(error => {
        showMessage('❌ Could not play sound: ' + error.message, 'warning');
    });
}

// Functions
function updateTimeFromInputs() {
    let minutes = parseInt(minutesInput.value) || 0;
    let seconds = parseInt(secondsInput.value) || 0;
    
    if (seconds >= 60) {
        minutes += Math.floor(seconds / 60);
        seconds = seconds % 60;
        secondsInput.value = seconds;
    }
    
    if (minutes > 99) {
        minutes = 99;
        minutesInput.value = 99;
    }
    
    totalSeconds = (minutes * 60) + seconds;
    originalTime = totalSeconds;
    updateDisplay();
    showMessage('Timer set to ' + formatTime(totalSeconds), 'success');
}

function startTimer() {
    if (isRunning) return;
    
    if (totalSeconds <= 0) {
        showMessage('Please set a time first!', 'warning');
        return;
    }
    
    // Enable sound if not already enabled
    if (!soundEnabled) enableSound();
    
    isRunning = true;
    isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    minutesInput.disabled = true;
    secondsInput.disabled = true;
    
    showMessage('Timer started!', 'success');
    
    timerInterval = setInterval(() => {
        totalSeconds--;
        updateDisplay();
        
        if (totalSeconds <= 0) {
            timerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    if (isPaused) {
        isPaused = false;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        showMessage('Timer resumed', 'success');
    } else {
        isPaused = true;
        clearInterval(timerInterval);
        timerInterval = null;
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        showMessage('Timer paused', 'warning');
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = false;
    totalSeconds = originalTime;
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    minutesInput.disabled = false;
    secondsInput.disabled = false;
    messageDiv.textContent = '';
    messageDiv.className = 'message';
}

function timerComplete() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    minutesInput.disabled = false;
    secondsInput.disabled = false;
    
    // PLAY SOUND - with better error handling
    playAlarmSound();
    
    // Show completion
    showMessage('⏰ TIME\'S UP! Timer completed!', 'warning');
    blinkDisplay();
}

function playAlarmSound() {
    if (!soundEnabled) {
        showMessage('⏰ Time\'s up! Click to hear alarm', 'warning');
        // Make the whole page clickable to play sound
        document.body.style.cursor = 'pointer';
        document.body.onclick = function() {
            alarmSound.currentTime = 0;
            alarmSound.volume = 0.7;
            alarmSound.play();
            document.body.style.cursor = 'default';
            document.body.onclick = null;
            showMessage('🔊 Alarm sound playing!', 'success');
        };
        return;
    }
    
    try {
        alarmSound.currentTime = 0;
        alarmSound.volume = 0.7;
        alarmSound.play().then(() => {
            console.log('✅ Alarm played successfully');
        }).catch(error => {
            console.log('❌ Auto-play failed:', error);
            showMessage('⏰ Time\'s up! Click anywhere to hear alarm', 'warning');
            document.body.onclick = function() {
                alarmSound.play();
                document.body.onclick = null;
                showMessage('🔊 Alarm sound playing!', 'success');
            };
        });
    } catch (error) {
        console.log('❌ Error playing sound:', error);
        showMessage('❌ Sound error. Click Test Sound button first.', 'warning');
    }
}

function updateDisplay() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    if (type !== 'warning') {
        setTimeout(() => {
            if (messageDiv.textContent === text) {
                messageDiv.textContent = '';
                messageDiv.className = 'message';
            }
        }, 3000);
    }
}

function blinkDisplay() {
    let blinkCount = 0;
    const maxBlinks = 6;
    const timeElements = document.querySelectorAll('.time span');
    
    const blinkInterval = setInterval(() => {
        timeElements.forEach(el => {
            el.style.opacity = el.style.opacity === '0.3' ? '1' : '0.3';
        });
        blinkCount++;
        
        if (blinkCount >= maxBlinks * 2) {
            clearInterval(blinkInterval);
            timeElements.forEach(el => {
                el.style.opacity = '1';
            });
        }
    }, 500);
}

// Add test sound button to page dynamically
window.addEventListener('load', () => {
    // Create test button
    const testBtn = document.createElement('button');
    testBtn.innerHTML = '<i class="fas fa-volume-up"></i> Test Sound';
    testBtn.className = 'btn test';
    testBtn.onclick = testSound;
    testBtn.style.background = '#9C27B0';
    testBtn.style.color = 'white';
    testBtn.style.marginTop = '10px';
    
    // Add to controls
    document.querySelector('.controls').appendChild(testBtn);
    
    showMessage('🔊 Click anywhere to enable sound, then click Test Sound', 'success');
});