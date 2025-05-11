// Made By RealDream
class Timer {
  constructor() {
    this.initializeDOM();
    this.setupEventListeners();
    this.state = {
      running: false,
      paused: false,
      mode: this.loadSetting('mode', 'up'),
      targetTime: this.loadSetting('targetTime', 0),
      startTime: 0,
      elapsed: this.loadSetting('elapsed', 0),
      laps: this.loadSetting('laps', []),
      soundEnabled: this.loadSetting('soundEnabled', true)
    };
    
    this.initAudioContext();
    this.updateSoundUI();
    this.updateDisplay();
    this.renderLaps();
  }

  initializeDOM() {
    this.dom = {
      display: document.getElementById('display'),
      hours: document.getElementById('hours'),
      minutes: document.getElementById('minutes'),
      seconds: document.getElementById('seconds'),
      milliseconds: document.getElementById('milliseconds'),
      settingsPanel: document.querySelector('.settings-panel'),
      lapsList: document.querySelector('.laps-list'),
      soundBtn: document.getElementById('soundBtn'),
      setHours: document.getElementById('setHours'),
      setMinutes: document.getElementById('setMinutes'),
      setSeconds: document.getElementById('setSeconds'),
      modeSelect: document.getElementById('modeSelect')
    };
  }

  setupEventListeners() {
    const { setHours, setMinutes, setSeconds } = this.dom;
    
    // 控制按钮
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('lapBtn').addEventListener('click', () => this.recordLap());
    document.getElementById('settingsBtn').addEventListener('click', () => this.toggleSettings());
    document.getElementById('soundBtn').addEventListener('click', () => this.toggleSound());
    document.getElementById('confirmSettings').addEventListener('click', () => this.applySettings());
    document.getElementById('cancelSettings').addEventListener('click', () => this.toggleSettings(false));

    // 输入验证
    [setHours, setMinutes, setSeconds].forEach(input => {
      input.addEventListener('input', (e) => this.validateTimeInput(e.target));
    });

    // 快捷键
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && !e.repeat) this.handleSpace();
      if (e.code === 'Escape') this.reset();
      if (e.code === 'KeyL') this.recordLap();
    });
  }

  // 核心计时逻辑
  start() {
    if (this.state.running) return;
    
    if (this.state.mode === 'down' && this.state.elapsed >= this.state.targetTime) {
      this.handleCountdownEnd();
      return;
    }

    this.state = {
      ...this.state,
      running: true,
      paused: false,
      startTime: performance.now() - this.state.elapsed
    };

    this.dom.display.classList.add('running');
    this.saveState();
    this.animateValueChange();
    this.playSound('start');
  }

  pause() {
    this.state.running = false;
    this.state.paused = true;
    cancelAnimationFrame(this.raf);
    this.dom.display.classList.remove('running');
    this.saveState();
    this.playSound('pause');
  }

  reset() {
    cancelAnimationFrame(this.raf);
    this.state = {
      ...this.state,
      running: false,
      paused: false,
      elapsed: 0,
      laps: []
    };
    this.updateDisplay();
    this.clearLaps();
    this.dom.display.classList.remove('running');
    this.saveState();
    this.playSound('reset');
  }

  // 时间计算与显示
  calculateTime() {
    const elapsed = this.state.running ? 
      performance.now() - this.state.startTime : 
      this.state.elapsed;

    return {
      hours: Math.floor(elapsed / 3600000),
      minutes: Math.floor((elapsed % 3600000) / 60000),
      seconds: Math.floor((elapsed % 60000) / 1000),
      milliseconds: Math.floor(elapsed % 1000)
    };
  }

  updateDisplay() {
    const format = (num, length = 2) => String(num).padStart(length, '0');
    let time = this.state.mode === 'up' ? 
      this.calculateTime() : 
      this.calculateRemainingTime();

    this.dom.hours.textContent = format(time.hours);
    this.dom.minutes.textContent = format(time.minutes);
    this.dom.seconds.textContent = format(time.seconds);
    this.dom.milliseconds.textContent = format(time.milliseconds, 3).slice(0,2);
  }

  // 倒计时时间计算
  calculateRemainingTime() {
    const remaining = this.state.targetTime - this.state.elapsed;
    return {
      hours: Math.max(0, Math.floor(remaining / 3600000)),
      minutes: Math.max(0, Math.floor((remaining % 3600000) / 60000)),
      seconds: Math.max(0, Math.floor((remaining % 60000) / 1000)),
      milliseconds: Math.max(0, Math.floor(remaining % 1000))
    };
  }

  // 设置面板控制
  toggleSettings(show = true) {
    this.dom.settingsPanel.classList.toggle('active', show);
    if (show) {
      const time = this.state.mode === 'up' ? 
        this.calculateTime() : 
        this.calculateRemainingTime();
        
      this.dom.setHours.value = time.hours;
      this.dom.setMinutes.value = time.minutes;
      this.dom.setSeconds.value = time.seconds;
      this.dom.modeSelect.value = this.state.mode;
    }
  }

  applySettings() {
    const hours = parseInt(this.dom.setHours.value) || 0;
    const minutes = parseInt(this.dom.setMinutes.value) || 0;
    const seconds = parseInt(this.dom.setSeconds.value) || 0;
    
    const totalMs = this.validateAndConvertTime(hours, minutes, seconds);
    if (totalMs <= 0 && this.state.mode === 'down') {
      this.showError('倒计时时间不能为0');
      return;
    }

    this.state.mode = this.dom.modeSelect.value;
    this.state.targetTime = totalMs;
    this.state.elapsed = this.state.mode === 'up' ? 0 : totalMs;
    
    this.toggleSettings(false);
    this.updateDisplay();
    this.saveState();
  }

  // 输入验证与转换
  validateTimeInput(input) {
    let value = parseInt(input.value) || 0;
    const maxValues = { hours: 23, minutes: 59, seconds: 59 };
    const type = input.id.replace('set', '').toLowerCase();
    
    value = Math.min(Math.max(value, 0), maxValues[type]);
    input.value = value > 0 ? value : '';
  }

  validateAndConvertTime(h, m, s) {
    m += Math.floor(s / 60);
    s = s % 60;
    h += Math.floor(m / 60);
    m = m % 60;
    
    return (h * 3600 + m * 60 + s) * 1000;
  }

  // 分段记录功能
  recordLap() {
    if (!this.state.running) return;
    
    const lapTime = this.state.mode === 'up' ? 
      this.state.elapsed : 
      this.state.targetTime - this.state.elapsed;
      
    this.state.laps.push({
      timestamp: Date.now(),
      duration: lapTime,
      total: this.state.elapsed
    });
    
    this.renderLaps();
    this.saveState();
    this.playSound('lap');
  }

  renderLaps() {
    this.dom.lapsList.innerHTML = this.state.laps
      .map((lap, index) => `
        <li class="lap-item">
          <span>#${index + 1}</span>
          <span>${this.formatDuration(lap.duration)}</span>
          <span>${this.formatDuration(lap.total)}</span>
        </li>
      `).join('');
  }

  formatDuration(ms) {
    const date = new Date(ms);
    return ms >= 3600000 ? 
      date.toISOString().substr(11, 8) + '.' + date.getUTCMilliseconds().toString().padStart(3, '0').substr(0,2) :
      date.toISOString().substr(14, 5) + '.' + date.getUTCMilliseconds().toString().padStart(3, '0').substr(0,2);
  }

  // 音效控制
  initAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.updateSoundUI();
    this.saveSetting('soundEnabled', this.state.soundEnabled);
  }

  updateSoundUI() {
    this.dom.soundBtn.classList.toggle('sound-off', !this.state.soundEnabled);
    this.gainNode.gain.value = this.state.soundEnabled ? 1 : 0;
  }

  playSound(type) {
    if (!this.state.soundEnabled) return;
    
    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(this.gainNode);
    
    const frequencies = {
      start: 784,   // G5
      pause: 523,   // C5
      reset: 262,   // C4
      lap: 1046     // C6
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], this.audioContext.currentTime);
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // 本地存储
  saveState() {
    this.saveSetting('mode', this.state.mode);
    this.saveSetting('targetTime', this.state.targetTime);
    this.saveSetting('elapsed', this.state.elapsed);
    this.saveSetting('laps', this.state.laps);
  }

  saveSetting(key, value) {
    localStorage.setItem(`timer.${key}`, JSON.stringify(value));
  }

  loadSetting(key, defaultValue) {
    const value = localStorage.getItem(`timer.${key}`);
    return value ? JSON.parse(value) : defaultValue;
  }

  // 辅助方法
  animateValueChange() {
    this.raf = requestAnimationFrame(() => {
      this.state.elapsed = this.state.running ? 
        performance.now() - this.state.startTime : 
        this.state.elapsed;
      
      if (this.state.mode === 'down' && this.state.elapsed >= this.state.targetTime) {
        this.handleCountdownEnd();
        return;
      }
      
      this.updateDisplay();
      if (this.state.running) this.animateValueChange();
    });
  }

  handleCountdownEnd() {
    this.reset();
    this.playSound('end');
    if (Notification.permission === 'granted') {
      new Notification('倒计时结束');
    }
  }

  handleSpace() {
    this.state.running ? this.pause() : this.start();
  }

  showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    document.body.appendChild(error);
    
    setTimeout(() => {
      error.remove();
    }, 2000);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 请求通知权限
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
  new Timer();
});
// Made By RealDream
