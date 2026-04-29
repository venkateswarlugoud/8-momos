(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const WHATSAPP_NUMBER = "916304731856";

  function whatsappHref(text) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  // ----- Order drawer state + UI -----
  const drawer = document.getElementById("orderDrawer");
  const itemsEl = document.getElementById("orderItems");
  const clearBtn = document.getElementById("orderClearBtn");
  const waBtn = document.getElementById("orderWhatsAppBtn");

  const el = {
    fulfillment: () => document.querySelector("input[name='fulfillment']:checked")?.value || "Pickup",
    deliveryFields: document.getElementById("deliveryFields"),
    address: document.getElementById("orderAddress"),
    maps: document.getElementById("orderMaps"),
    spice: document.getElementById("orderSpice"),
    payment: document.getElementById("orderPayment"),
    notes: document.getElementById("orderNotes"),
    name: document.getElementById("orderName"),
    phone: document.getElementById("orderPhone"),
    time: document.getElementById("orderTime"),
  };

  const state = {
    items: /** @type {Array<{id:string,name:string,qty:number,vegType:string}>} */ ([]),
  };

  const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    updateDeliveryVisibility();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function updateDeliveryVisibility() {
    const isDelivery = el.fulfillment() === "Delivery";
    if (el.deliveryFields) el.deliveryFields.style.display = isDelivery ? "grid" : "none";
  }

  function addItem(name) {
    const safeName = String(name || "").trim();
    if (!safeName) return;

    const existing = state.items.find((it) => it.name === safeName && (it.vegType || "") === "");
    if (existing) {
      existing.qty += 1;
    } else {
      state.items.push({ id: uid(), name: safeName, qty: 1, vegType: "" });
    }
    renderItems();
    openDrawer();
  }

  function removeItem(id) {
    state.items = state.items.filter((it) => it.id !== id);
    renderItems();
  }

  function setQty(id, qty) {
    const it = state.items.find((x) => x.id === id);
    if (!it) return;
    it.qty = Math.max(1, Math.min(99, qty));
    renderItems();
  }

  function setVegType(id, vegType) {
    const it = state.items.find((x) => x.id === id);
    if (!it) return;
    it.vegType = vegType;
  }

  function clearAll() {
    state.items = [];
    renderItems();
  }

  function renderItems() {
    if (!itemsEl) return;

    if (state.items.length === 0) {
      itemsEl.innerHTML = `
        <div class="order-empty">
          <p class="order-empty-title">No items yet</p>
          <p class="order-empty-text">Tap any menu item to add it.</p>
        </div>
      `;
      return;
    }

    itemsEl.innerHTML = state.items
      .map((it, idx) => {
        const number = idx + 1;
        return `
          <div class="order-item" data-id="${it.id}">
            <div class="order-item-main">
              <p class="order-item-name">${escapeHtml(it.name)}</p>
              <div class="order-item-meta">
                <label class="mini-field">
                  <span class="mini-label">Veg / Non-Veg</span>
                  <select class="mini-input" data-veg>
                    <option value="" ${it.vegType === "" ? "selected" : ""}>Select</option>
                    <option value="Veg" ${it.vegType === "Veg" ? "selected" : ""}>Veg</option>
                    <option value="Non-Veg" ${it.vegType === "Non-Veg" ? "selected" : ""}>Non-Veg</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="order-item-side">
              <div class="qty" aria-label="Quantity">
                <button class="qty-btn" type="button" data-dec aria-label="Decrease quantity">−</button>
                <span class="qty-val" aria-label="Quantity value">${it.qty}</span>
                <button class="qty-btn" type="button" data-inc aria-label="Increase quantity">+</button>
              </div>
              <button class="mini-remove" type="button" data-remove aria-label="Remove item">Remove</button>
            </div>
          </div>
        `;
      })
      .join("");

    itemsEl.querySelectorAll(".order-item").forEach((row) => {
      const id = row.getAttribute("data-id") || "";

      row.querySelector("[data-dec]")?.addEventListener("click", () => {
        const it = state.items.find((x) => x.id === id);
        if (it) setQty(id, it.qty - 1);
      });

      row.querySelector("[data-inc]")?.addEventListener("click", () => {
        const it = state.items.find((x) => x.id === id);
        if (it) setQty(id, it.qty + 1);
      });

      row.querySelector("[data-remove]")?.addEventListener("click", () => removeItem(id));

      const vegSel = row.querySelector("[data-veg]");
      vegSel?.addEventListener("change", () => setVegType(id, /** @type {HTMLSelectElement} */ (vegSel).value));
    });
  }

  function buildWhatsAppText() {
    const lines = [];
    lines.push("Hi 8 Momo's! I'd like to order.");
    lines.push("");

    if (state.items.length === 0) {
      lines.push("My order:");
      lines.push("- (please help me choose) ");
    } else {
      lines.push("My order:");
      state.items.forEach((it, i) => {
        const veg = it.vegType ? ` (${it.vegType})` : "";
        lines.push(`${i + 1}) ${it.name}${veg} x${it.qty}`);
      });
    }

    const spice = (el.spice?.value || "").trim();
    const fulfillment = el.fulfillment();
    const payment = (el.payment?.value || "").trim();
    const notes = (el.notes?.value || "").trim();
    const name = (el.name?.value || "").trim();
    const phone = (el.phone?.value || "").trim();
    const time = (el.time?.value || "").trim();
    const address = (el.address?.value || "").trim();
    const maps = (el.maps?.value || "").trim();

    lines.push("");
    lines.push("Details:");
    if (spice) lines.push(`- Spice: ${spice}`);
    lines.push(`- Pickup/Delivery: ${fulfillment}`);
    if (fulfillment === "Delivery") {
      if (address) lines.push(`- Address: ${address}`);
      if (maps) lines.push(`- Maps: ${maps}`);
    }
    if (payment) lines.push(`- Payment: ${payment}`);
    if (name) lines.push(`- Name: ${name}`);
    if (phone) lines.push(`- Phone: ${phone}`);
    if (time) lines.push(`- Preferred time: ${time}`);
    if (notes) lines.push(`- Notes: ${notes}`);

    lines.push("");
    lines.push("Please confirm total and ETA. Thanks!");

    return lines.join("\n");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function wireDrawer() {
    if (!drawer) return;

    drawer.querySelectorAll("[data-order-close]").forEach((btn) => {
      btn.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
    });

    document.querySelectorAll("input[name='fulfillment']").forEach((r) => {
      r.addEventListener("change", updateDeliveryVisibility);
    });

    clearBtn?.addEventListener("click", clearAll);

    waBtn?.addEventListener("click", () => {
      const text = buildWhatsAppText();
      window.open(whatsappHref(text), "_blank", "noopener,noreferrer");
    });

    // WhatsApp buttons open the drawer instead of jumping immediately.
    document.querySelectorAll("a[data-whatsapp]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openDrawer();
      });
      a.setAttribute("href", `https://wa.me/${WHATSAPP_NUMBER}`);
    });

    renderItems();
    updateDeliveryVisibility();
  }

  // Make menu rows clickable → add to drawer.
  function enableMenuQuickOrder() {
    const clickables = [];

    document.querySelectorAll(".menu-item").forEach((x) => clickables.push(x));
    document
      .querySelectorAll(".menu-matrix-row:not(.menu-matrix-head)")
      .forEach((x) => clickables.push(x));

    const getItemName = (node) => {
      if (node.classList.contains("menu-item")) {
        return (node.querySelector(".mi-name")?.textContent || "").trim();
      }
      return (node.querySelector("[role='cell']")?.textContent || "").trim();
    };

    const attach = (node) => {
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("data-quick-order", "true");

      const handler = () => {
        const name = getItemName(node);
        if (!name) return;
        addItem(name);
      };

      node.addEventListener("click", handler);
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handler();
        }
      });
    };

    clickables.forEach(attach);
  }

  wireDrawer();
  enableMenuQuickOrder();

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

