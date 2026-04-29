(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const WHATSAPP_NUMBER = "916304731856";
  const WHATSAPP_TEMPLATE = `Hi 8 Momo's! I'd like to order.

Order (edit this):
1) Item: ________  Qty: __
2) Item: ________  Qty: __

Options:
- Veg/Non-Veg:
- Steam/Fried/Kurkura/Chilli:
- Spice: Mild / Medium / Spicy

Pickup or delivery:
- Pickup or Delivery:
- Delivery address + landmark (if delivery):
- Google Maps link (optional):

Payment:
- Cash or UPI:

Your details:
- Name:
- Phone:
- Preferred time (optional):
- Special instructions (optional):

Please confirm total and ETA. Thanks!`;

  const waLinks = document.querySelectorAll("a[data-whatsapp]");
  waLinks.forEach((a) => {
    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEMPLATE)}`;
    a.setAttribute("href", href);
  });

  // Ensure all in-page links scroll nicely and land correctly.
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a[href^='#']") : null;
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", href);
  });
})();

