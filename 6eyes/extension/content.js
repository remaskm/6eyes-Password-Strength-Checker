(function () {
  if (window._sixEyesLoaded) return;
  window._sixEyesLoaded = true;

  const API = "http://localhost:5000/check";
  const COLORS = { Weak: "#e03c3c", Medium: "#e8a231", Strong: "#b06ef3" };
  let debounceTimer;

  const LOGO_SVG = `<svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="16" rx="13" ry="8" stroke="#b06ef3" stroke-width="1.6"/>
    <line x1="3" y1="16" x2="0" y2="16" stroke="#b06ef3" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="29" y1="16" x2="32" y2="16" stroke="#b06ef3" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="16" cy="16" r="4.5" stroke="#b06ef3" stroke-width="1.4"/>
    <circle cx="16" cy="16" r="1.8" fill="#b06ef3"/>
    <path d="M 14 3 C 14 -2, 23 -3, 23.5 6 C 24 13, 18 15, 14.5 15 C 11 15, 9 18, 9.5 22 C 10 25, 13 27, 16 27" stroke="#e8a231" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  </svg>`;

  async function fetchStrength(password) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      return await res.json();
    } catch { return null; }
  }

  function buildWidget(input) {
    if (input._sixEyesDone) return;
    input._sixEyesDone = true;

    const wrap = document.createElement("div");
    wrap.style.cssText = `
      position:absolute;z-index:2147483647;
      background:#0f0e11;
      border:1px solid #312d40;
      border-top:2px solid #7c3fbf;
      border-radius:6px;padding:11px 13px;
      width:255px;box-shadow:0 6px 24px rgba(0,0,0,0.5);
      font-family:'IBM Plex Mono',ui-monospace,monospace;
      font-size:11px;color:#e8e3f5;display:none;
    `;

    wrap.innerHTML = `
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:8px;">
        ${LOGO_SVG}
        <span style="font-size:12px;letter-spacing:2px;font-weight:600;text-transform:uppercase;">Six Eyes</span>
        <span id="se-badge" style="margin-left:auto;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;background:#2a2633;color:#55506a;border:1px solid #312d40;letter-spacing:0.5px;">—</span>
      </div>
      <div style="height:3px;background:#1c1a22;border-radius:100px;margin-bottom:9px;overflow:hidden;">
        <div id="se-bar" style="height:100%;width:0%;border-radius:100px;transition:width 0.35s,background 0.35s;"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;background:#19171f;border:1px solid #312d40;border-radius:4px;padding:8px 10px;margin-bottom:8px;">
        <div><span id="se-len" style="color:#55506a;">✗</span> Min 8 chars</div>
        <div><span id="se-up"  style="color:#55506a;">✗</span> Uppercase</div>
        <div><span id="se-num" style="color:#55506a;">✗</span> Number</div>
        <div><span id="se-sym" style="color:#55506a;">✗</span> Symbol</div>
        <div><span id="se-com" style="color:#55506a;">✗</span> Not common</div>
        <div><span id="se-rep" style="color:#55506a;">✗</span> No repeats</div>
      </div>
      <div id="se-tip" style="font-size:10px;color:#9d97b5;text-align:center;min-height:13px;"></div>
      <div style="margin-top:6px;font-size:9px;color:#312d40;text-align:right;letter-spacing:0.5px;text-transform:uppercase;">Flask · localhost:5000</div>
    `;

    document.body.appendChild(wrap);

    function reposition() {
      const r = input.getBoundingClientRect();
      wrap.style.left = (window.scrollX + r.left) + "px";
      wrap.style.top  = (window.scrollY + r.bottom + 6) + "px";
    }

    function updateWidget(data) {
      if (!data) {
        document.getElementById("se-tip").textContent = "Cannot connect to analysis engine";
        return;
      }
      const c   = COLORS[data.strength];
      const pct = data.strength === "Weak" ? 25 : data.strength === "Medium" ? 60 : 100;

      document.getElementById("se-bar").style.width      = pct + "%";
      document.getElementById("se-bar").style.background = c;

      const badge = document.getElementById("se-badge");
      badge.textContent       = data.strength.toUpperCase();
      badge.style.background  = c + "22";
      badge.style.color       = c;
      badge.style.borderColor = c + "55";

      const map = {
        "se-len": data.checks.has_length,
        "se-up":  data.checks.has_upper,
        "se-num": data.checks.has_digit,
        "se-sym": data.checks.has_symbol,
        "se-com": data.checks.not_common,
        "se-rep": data.checks.no_repeat
      };
      Object.entries(map).forEach(([id, ok]) => {
        const el = document.getElementById(id);
        el.textContent = ok ? "✓" : "✗";
        el.style.color = ok ? "#3ecf8e" : "#55506a";
      });

      document.getElementById("se-tip").textContent =
        data.tips.length ? "→ " + data.tips[0] : "No weaknesses detected.";
    }

    input.addEventListener("input", function () {
      const pw = input.value;
      clearTimeout(debounceTimer);
      if (!pw) { wrap.style.display = "none"; return; }
      wrap.style.display = "block";
      reposition();
      debounceTimer = setTimeout(async () => {
        const data = await fetchStrength(pw);
        updateWidget(data);
      }, 200);
    });

    input.addEventListener("focus",  () => { if (input.value) { wrap.style.display = "block"; reposition(); } });
    input.addEventListener("blur",   () => { setTimeout(() => { wrap.style.display = "none"; }, 200); });
    window.addEventListener("scroll", reposition);
    window.addEventListener("resize", reposition);
  }

  function scan() {
    document.querySelectorAll('input[type="password"]').forEach(buildWidget);
  }
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();