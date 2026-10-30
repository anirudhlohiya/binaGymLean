// Thank-you page: ask n8n whether the order is paid, then show the download button.
(() => {
  const box = document.getElementById("thanks");
  const q = new URLSearchParams(location.search);
  const order = (q.get("razorpay_payment_link_reference_id") || q.get("o") || "").replace(/[^A-Z0-9]/gi, "");
  const title = document.getElementById("t-title"), text = document.getElementById("t-text");
  const btn = document.getElementById("t-download"), note = document.getElementById("t-note");
  const show = (t, p) => { title.textContent = t; text.textContent = p; };

  if (!order) return show("Thank you!", "We could not find your order number on this page. If you paid, your ebook link is on its way to your email.");
  if (q.get("razorpay_payment_link_status") === "cancelled") return show("Payment not completed", "Nothing was charged. You can go back and try again.");

  let tries = 0;
  const ask = async () => {
    tries++;
    try {
      const r = await fetch(`${box.dataset.url}?o=${encodeURIComponent(order)}`);
      const d = await r.json();
      if (d.status === "paid" && d.file) {
        show("Thank you! Your plan is ready.", "Tap the button to download your 30-Day Home Fat-Loss Plan. We have also emailed you the link.");
        btn.href = d.file;
        btn.hidden = false;
        note.textContent = `Order ${order}. The link works for 30 days. Save the PDF on your phone.`;
        return;
      }
    } catch (e) { /* try again below */ }
    if (tries < 20) return setTimeout(ask, 3000);
    show("Your payment is being confirmed", "This can take a few minutes. As soon as it is confirmed, we email you the download link. No need to pay again.");
    note.textContent = `Order ${order}. Questions? Email gyaansharma22@gmail.com.`;
  };
  ask();
})();
