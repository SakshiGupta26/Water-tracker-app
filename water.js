(function(){
  const addGlassBtn = document.getElementById('addGlass');
  const addCustomBtn = document.getElementById('addCustom');
  const undoBtn = document.getElementById('undo');
  const resetBtn = document.getElementById('reset');
  const waterEl = document.getElementById('water');
  const currentText = document.getElementById('currentText');
  const percentText = document.getElementById('percent');
  const remainingText = document.getElementById('remaining');
  const logEl = document.getElementById('log');
  const goalInput = document.getElementById('goalInput');
  const goalLabel = document.getElementById('goalLabel');
  const goalText = document.getElementById('goalText');
  const customAmount = document.getElementById('customAmount');
  const autosave = document.getElementById('autosave');
  const dateEl = document.getElementById('date');
  const waterSound = document.getElementById('waterSound');
  const ageGroupSelect = document.getElementById('ageGroup'); 

  const STORAGE_KEY = 'water-tracker-v1';
  let goalReached = false;

  
  const ageGoals = {
    infant: 700,          
    child4to8: 1200,      
    child9to13: 1800,     
    teen: 2200,           
    adultM: 3100,   
    adultF: 2200          
  };

  let state = {
    date: new Date().toISOString().slice(0,10),
    goal: parseInt(goalInput.value,10) || 2000,
    drank: 0,
    log: []
  };

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const parsed = JSON.parse(raw);
      if(parsed && parsed.date === state.date){
        state = parsed;
        goalInput.value = state.goal;
      }
    }catch(e){console.warn('load error',e)}
  }

  function save(){
    if(!autosave.checked) return;
    try{localStorage.setItem(STORAGE_KEY, JSON.stringify(state));}catch(e){console.warn('save error',e)}
  }

  function formatTime(ts){
    const d = new Date(ts);
    return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }

  function render(){
    const percent = Math.min(100, Math.round((state.drank / state.goal) * 100));
    percentText.textContent = percent + '%';
    remainingText.textContent = Math.max(0, state.goal - state.drank) + ' ml';
    currentText.textContent = state.drank + ' ml';
    goalText.textContent = 'Goal: ' + state.goal + ' ml';
    waterEl.style.height = percent + '%';
    logEl.innerHTML = '';
    state.log.slice().reverse().forEach(entry => {
      const item = document.createElement('div');
      item.className = 'log-item';
      item.innerHTML = `<div>${entry.amount} ml</div><div>${formatTime(entry.time)}</div>`;
      logEl.appendChild(item);
    });
    if (!goalReached && state.drank >= state.goal) {
      goalReached = true;

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 }
        });
      }, 500);

      setTimeout(() => {
        alert("🎉 Congratulations! You've completed your daily water goal! 💧");
      }, 800);
    }
  }

  function add(amount){
    amount = Number(amount) || 0;
    if(amount <= 0) return;
    state.drank += amount;
    state.log.push({amount:amount, time: Date.now()});
    state.drank = Math.min(state.drank, Math.round(state.goal * 1.5));

    if (waterSound) {
      waterSound.currentTime = 0;
      waterSound.play().catch(e => console.log("Sound play blocked:", e));
    }
    render();
    save();
    announce(`${amount} milliliters added. You've had ${state.drank} ml today.`);
  }

  function undo(){
    const last = state.log.pop();
    if(!last) return;
    state.drank = Math.max(0, state.drank - last.amount);
    goalReached = false;
    render();
    save();
    announce(`Removed last entry of ${last.amount} ml.`);
  }

  function reset(){
    if(!confirm("Reset today's data?")) return;
    state.drank = 0;
    state.log = [];
    goalReached = false;
    render();
    save();
    announce('Data reset for today.');
  }

  function announce(text){
    let live = document.getElementById('sr-live');
    if(!live){
      live = document.createElement('div');
      live.id = 'sr-live';
      live.setAttribute('aria-live','polite');
      live.setAttribute('style','position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden');
      document.body.appendChild(live);
    }
    live.textContent = text;
  }

  addGlassBtn.addEventListener('click', ()=> add(250));
  addCustomBtn.addEventListener('click', ()=> {
    const val = parseInt(customAmount.value,10);
    if(!val || val <= 0){customAmount.focus();return}
    add(val);
    customAmount.value = '';
  });
  undoBtn.addEventListener('click', undo);
  resetBtn.addEventListener('click', reset);

  goalInput.addEventListener('change', ()=>{
    const g = parseInt(goalInput.value,10);
    if(g && g>0) {
      state.goal = g;
      goalReached = false;
    }
    render();
    save();
  });

  ageGroupSelect.addEventListener('change', () => {
    const selected = ageGroupSelect.value;
    if (ageGoals[selected]) {
      state.goal = ageGoals[selected];
      goalInput.value = state.goal;
      goalLabel.style.display = "none";  
      goalReached = false;
      render();
      save();
    } else {
      goalLabel.style.display = "block"; 
    }
  });

 
  window.addEventListener('keydown', function(e){
    if(e.key === '+') { add(250); }
    if(e.key.toLowerCase() === 'z') { undo(); }
    if(e.key.toLowerCase() === 'r') { reset(); }
  });

  dateEl.textContent = new Date().toLocaleDateString();
  load();
  render();
  const today = new Date().toISOString().slice(0,10);
  if(state.date !== today){ state.date = today; state.drank = 0; state.log = []; save(); }
})();
