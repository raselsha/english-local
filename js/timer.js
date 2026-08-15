let timerRemaining = 60;
let timerTotal = 60;
let timerIntervalId = null;
let onTimerComplete = null;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function playTone(frequency, duration, volume) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

function playTimerBeep() {
  playTone(880, 0.6, 0.2);
}

function playTimerTick() {
  playTone(660, 0.15, 0.12);
}

function setTitleTimerActive(active) {
  document.body.classList.toggle("timer-active", active);
}

const TIMER_WARNING_SECONDS = 10;

function updateTimerDisplay(lang) {
  const isUp = timerRemaining <= 0;
  const isWarning = !isUp && timerRemaining <= TIMER_WARNING_SECONDS;
  const text = isUp ? t("timerUp", lang) : formatTime(timerRemaining);
  const percent = Math.max(0, Math.min(100, (timerRemaining / timerTotal) * 100));

  const sidebarDisplay = document.getElementById("timerDisplay");
  sidebarDisplay.textContent = text;
  sidebarDisplay.classList.toggle("timer-up", isUp);
  sidebarDisplay.classList.toggle("timer-warning", isWarning);

  document.querySelectorAll(".title-timer").forEach((el) => {
    el.classList.toggle("timer-up", isUp);
    el.classList.toggle("timer-warning", isWarning);
    el.querySelector(".title-timer-text").textContent = text;
    const barFill = el.querySelector(".timer-bar-fill");
    barFill.style.width = percent + "%";
    barFill.classList.toggle("timer-up", isUp);
    barFill.classList.toggle("timer-warning", isWarning);
  });
}

function stopTimerInterval() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

function startTimer(lang) {
  if (timerIntervalId) return;
  if (timerRemaining <= 0) timerRemaining = timerTotal;
  timerIntervalId = setInterval(() => {
    timerRemaining -= 1;
    updateTimerDisplay(lang);
    if (timerRemaining <= 0) {
      stopTimerInterval();
      playTimerBeep();
      if (onTimerComplete) onTimerComplete();
    } else if (timerRemaining <= TIMER_WARNING_SECONDS) {
      playTimerTick();
    }
  }, 1000);
}

function pauseTimer() {
  stopTimerInterval();
}

function resetTimer(minutes, lang) {
  stopTimerInterval();
  timerTotal = Math.max(1, minutes) * 60;
  timerRemaining = timerTotal;
  updateTimerDisplay(lang);
}
