const water = document.getElementById("water");
const percent = document.getElementById("percent");
const currentText = document.getElementById("currentText");
const remaining = document.getElementById("remaining");
const goalText = document.getElementById("goalText");
const goalInput = document.getElementById("goalInput");
const ageGroupSelect = document.getElementById("ageGroup");
const logDiv = document.getElementById("log");
const waterSound = document.getElementById("waterSound");

let state = {
  goal: 2000,
  drank: 0,
  log: []
};

const ageGoals = {
  infant: 700,
  child4to8: 1200,
  child9to13: 1800,
  teen: 2300,
  adultM: 3100,
  adultF: 2200
};

function save() {
  if (document.getElementById("autosave").checked) {
    localStorage.setItem("waterState", JSON.stringify(state));
  }
}

function load() {
  const saved = localStorage.getItem("waterState");
  if (saved) state = JSON.parse(saved);
}

function render() {
  const progress = Math.min((state.drank / state.goal) * 100, 100);
  water.style.height = progress + "%";
  percent.textContent = Math.round(progress) + "%";
  currentText.textContent = state.drank + " ml";
  remaining.textContent = Math.max(state.goal - state.drank, 0) + " ml";
  goalText.textContent = "Goal: " + state.goal + " ml";

  logDiv.innerHTML = "";
  state.log.forEach(entry => {
    const item = document.createElement("div");
    item.className = "log-item";
    item.textContent = `+${entry.amount} ml at ${new Date(entry.time).toLocaleTimeString()}`;
    logDiv.appendChild(item);
  });

  if (progress >= 100) {
    confetti();
    setTimeout(() => alert("🎉 Congratulations! You've reached your daily water goal!"), 300);
  }
}

function add(amount) {
  // Block if no goal selected
  if (!ageGroupSelect.value && !goalInput.value) {
    alert("⚠️ Please select an age group or set a daily goal first!");
    return;
  }

  amount = Number(amount) || 0;
  if (amount <= 0) return;

  state.drank += amount;
  state.log.push({ amount: amount, time: Date.now() });
  state.drank = Math.min(state.drank, Math.round(state.goal * 1.5));



  render();
  save();
}

document.getElementById("addGlass").onclick = () => add(250);
document.getElementById("addCustom").onclick = () => {
  const val = document.getElementById("customAmount").value;
  add(Number(val));
};
document.getElementById("undo").onclick = () => {
  const last = state.log.pop();
  if (last) state.drank -= last.amount;
  render();
  save();
};
document.getElementById("reset").onclick = () => {
  if (confirm("Reset today's progress?")) {
    state.drank = 0;
    state.log = [];
    render();
    save();
  }
};

goalInput.onchange = () => {
  state.goal = Number(goalInput.value) || 2000;
  render();
  save();
};

ageGroupSelect.onchange = () => {
  const val = ageGroupSelect.value;
  if (ageGoals[val]) {
    state.goal = ageGoals[val];
    goalInput.value = ageGoals[val];
    render();
    save();
  }
};

document.getElementById("date").textContent = new Date().toDateString();

load();
render();

