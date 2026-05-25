const API    = "http://localhost:5000/check";
const COLORS = { Weak: "#e03c3c", Medium: "#e8a231", Strong: "#b06ef3" };
let vis = false, timer;

async function checkServer() {
  try {
    const r = await fetch("http://localhost:5000/health");
    const d = await r.json();
    if (d.status === "ok") {
      document.getElementById("dot").className        = "dot online";
      document.getElementById("serverMsg").textContent = "Analysis engine online";
      return true;
    }
  } catch {}
  document.getElementById("dot").className        = "dot offline";
  document.getElementById("serverMsg").textContent = "Engine offline — run app.py first";
  return false;
}

function toggleEye() {
  vis = !vis;
  document.getElementById("pw").type = vis ? "text" : "password";
}

function reset() {
  document.getElementById("bar").style.width      = "0%";
  document.getElementById("lbl").textContent      = "Awaiting input";
  document.getElementById("lbl").style.color      = "";
  document.getElementById("badge").textContent    = "—";
  document.getElementById("badge").style.cssText  = "";
  document.getElementById("score").textContent    = "0 / 7";
  document.getElementById("tip").textContent      = "";
  ["len", "up", "num", "sym", "com", "rep"].forEach(k => {
    document.getElementById("i-" + k).textContent = "✗";
    document.getElementById("i-" + k).style.color = "";
  });
}

async function run(pw) {
  if (!pw) { reset(); return; }
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      const res  = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw })
      });
      const data = await res.json();
      const c    = COLORS[data.strength];
      const pct  = data.strength === "Weak" ? 25 : data.strength === "Medium" ? 60 : 100;

      document.getElementById("bar").style.width      = pct + "%";
      document.getElementById("bar").style.background = c;

      document.getElementById("lbl").textContent =
        data.strength === "Weak"   ? "Compromised — too weak" :
        data.strength === "Medium" ? "Passable — could be stronger" :
                                     "Unbreakable";
      document.getElementById("lbl").style.color = c;
      document.getElementById("score").textContent = data.score + " / " + data.max_score;

      const b = document.getElementById("badge");
      b.textContent      = data.strength.toUpperCase();
      b.style.background = c + "22";
      b.style.color      = c;
      b.style.borderColor = c + "55";

      const map = {
        len: "has_length", up: "has_upper", num: "has_digit",
        sym: "has_symbol", com: "not_common", rep: "no_repeat"
      };
      Object.entries(map).forEach(([k, chk]) => {
        const el       = document.getElementById("i-" + k);
        el.textContent = data.checks[chk] ? "✓" : "✗";
        el.style.color = data.checks[chk] ? "#3ecf8e" : "#55506a";
      });

      document.getElementById("tip").textContent =
        data.tips.length ? "→ " + data.tips[0] : "No weaknesses detected.";

    } catch {
      document.getElementById("tip").textContent = "Cannot reach engine — is app.py running?";
    }
  }, 250);
}

document.getElementById("pw").addEventListener("input", e => run(e.target.value));
document.getElementById("eyeBtn").addEventListener("click", toggleEye);

checkServer();