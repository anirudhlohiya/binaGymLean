window.MOVES = [{"name":"Squat","easy":"Sit down on a real chair and stand up again.","w":"A"},{"name":"Push-up","easy":"Hands on a wall. Then on a bed or table. Then knees on the floor.","w":"A"},{"name":"Reverse lunge","easy":"Hold a wall or a chair. Take smaller steps.","w":"A"},{"name":"Glute bridge","easy":"Smaller lift.","w":"A"},{"name":"Plank","easy":"Knees on the floor.","w":"A"},{"name":"Jumping jacks","easy":"Step jacks: step one foot out at a time, no jump. Good for knees and flats.","w":"B"},{"name":"Mountain climbers","easy":"Hands on a bed or sofa, and go slowly.","w":"B"},{"name":"High knees","easy":"March on the spot, knees high.","w":"B"},{"name":"Crunch","easy":"Smaller lift, hands sliding up your thighs.","w":"B"},{"name":"Superman","easy":"Lift only your arms, then only your legs.","w":"B"}];
// bina.gym.lean landing page: scroll engine, the move-following character, the free plan form.
ScrollCraft.mount(document.body);

// Buttons that point down the page jump straight there. The smooth glide would race through the 10-moves scene.
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"]');
  const target = link && document.getElementById(link.getAttribute("href").slice(1));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ block: "start", behavior: "instant" });
  history.pushState(null, "", link.getAttribute("href"));
});

// Signature: as the "10 moves" act scrolls, the character switches to the next move.
(() => {
  const act = document.getElementById("moves");
  if (!act || !window.MOVES) return;
  const poses = act.querySelectorAll(".pose");
  const dots = act.querySelectorAll(".move-dots li");
  const name = document.getElementById("mv-name"), easy = document.getElementById("mv-easy"), tag = document.getElementById("mv-tag");
  let shown = 0;
  const show = (i) => {
    if (i === shown) return;
    poses[shown].classList.remove("on"); dots[shown].classList.remove("on");
    poses[i].classList.add("on"); dots[i].classList.add("on");
    const m = MOVES[i];
    name.textContent = m.name;
    easy.textContent = "Too hard? " + m.easy;
    tag.textContent = "Workout " + m.w;
    tag.className = "tag " + (m.w === "A" ? "a" : "b");
    shown = i;
  };
  const tick = () => {
    const p = parseFloat(act.style.getPropertyValue("--sc-p")) || 0;
    show(Math.min(MOVES.length - 1, Math.floor(p * MOVES.length)));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

// Free plan form: save the lead in n8n, then download the PDF the webhook hands back.
(() => {
  const form = document.getElementById("lead-form");
  if (!form) return;
  const msg = document.getElementById("lead-msg");
  const say = (t, bad) => { msg.textContent = t; msg.classList.toggle("bad", !!bad); };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.name.value.trim(), email = form.email.value.trim();
    const phone = form.phone.value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
    if (name.length < 2) return say("Please write your name.", true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say("Please check your email.", true);
    if (!/^[6-9]\d{9}$/.test(phone)) return say("Please write a 10-digit Indian mobile number.", true);
    const btn = form.querySelector("button");
    btn.disabled = true; say("Getting your plan...");
    try {
      const r = await fetch(form.dataset.url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, consent: form.consent.checked, page: location.href }),
      });
      const data = await r.json();
      if (!data.ok || !data.file) throw new Error(data.error || "failed");
      const a = document.createElement("a");
      a.href = data.file;
      document.body.appendChild(a); a.click(); a.remove();
      form.reset();
      msg.innerHTML = `Done! Your download has started. <a href="${data.file}">Didn't start? Tap here.</a> The link works for 24 hours.`;
      msg.classList.remove("bad");
    } catch (err) {
      say(`Something went wrong. Please try again, or email ${"gyaansharma22@gmail.com"}.`, true);
    } finally {
      btn.disabled = false;
    }
  });
})();
