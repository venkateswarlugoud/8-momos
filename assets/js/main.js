(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNavDrawer = document.getElementById("mobileNavDrawer");
  const navCloseEls = document.querySelectorAll("[data-nav-close]");

  function closeMobileNav() {
    if (!menuToggle) return;
    document.body.classList.remove("mobile-nav-open");
    if (mobileNavDrawer) mobileNavDrawer.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("mobile-nav-open");
    if (mobileNavDrawer) mobileNavDrawer.setAttribute("aria-hidden", isOpen ? "false" : "true");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navCloseEls.forEach((el) => {
    el.addEventListener("click", closeMobileNav);
  });

  mobileNavDrawer?.querySelectorAll(".mobile-nav-link").forEach((a) => {
    a.addEventListener("click", closeMobileNav);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 720) closeMobileNav();
  });

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
    items: /** @type {Array<{id:string,name:string,qty:number,vegType:string,allowedVegTypes:string[]}>} */ ([]),
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

  function addItem(name, allowedVegTypes = ["Veg", "Non-Veg"]) {
    const safeName = String(name || "").trim();
    if (!safeName) return;
    const normalizedAllowed = Array.from(new Set(allowedVegTypes));
    const signature = normalizedAllowed.join("|");
    const defaultVegType = normalizedAllowed.length === 1 ? normalizedAllowed[0] : "";

    const existing = state.items.find(
      (it) => it.name === safeName && it.allowedVegTypes.join("|") === signature,
    );
    if (existing) {
      existing.qty += 1;
    } else {
      state.items.push({
        id: uid(),
        name: safeName,
        qty: 1,
        vegType: defaultVegType,
        allowedVegTypes: normalizedAllowed,
      });
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
    if (vegType === "" && it.allowedVegTypes.length > 1) {
      it.vegType = "";
      return;
    }
    if (!it.allowedVegTypes.includes(vegType)) return;
    it.vegType = vegType;
  }

  function clearAll() {
    state.items = [];
    renderItems();
  }

  function vegClass(vegType) {
    if (vegType === "Veg") return "veg-select veg-select--veg";
    if (vegType === "Non-Veg") return "veg-select veg-select--nonveg";
    return "veg-select";
  }

  function vegOptionsHtml(it) {
    const options = [];
    if (it.allowedVegTypes.length > 1) {
      options.push(`<option value="" ${it.vegType === "" ? "selected" : ""}>Select</option>`);
    }
    options.push(
      ...it.allowedVegTypes.map(
        (type) => `<option value="${type}" ${it.vegType === type ? "selected" : ""}>${type}</option>`,
      ),
    );
    return options.join("");
  }

  function vegLegendHtml(it) {
    const pills = [];
    if (it.allowedVegTypes.includes("Veg")) {
      pills.push(`<span class="veg-pill veg-pill--veg"><span class="veg-pill-dot"></span>Veg</span>`);
    }
    if (it.allowedVegTypes.includes("Non-Veg")) {
      pills.push(`<span class="veg-pill veg-pill--nonveg"><span class="veg-pill-dot"></span>Non-Veg</span>`);
    }
    return pills.join("");
  }

  function fixedTypeHtml(it) {
    if (it.allowedVegTypes.length !== 1) return "";
    const type = it.allowedVegTypes[0];
    const klass = type === "Veg" ? "veg-fixed veg-fixed--veg" : "veg-fixed veg-fixed--nonveg";
    return `<span class="${klass}" aria-label="Food type">${type}</span>`;
  }

  function renderItems() {
    if (!itemsEl) return;

    if (state.items.length === 0) {
      itemsEl.innerHTML = `
        <div class="order-empty" id="orderItemsEmpty">
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
                  <span class="mini-label">Food Type</span>
                  <div class="veg-legend" aria-hidden="true">${vegLegendHtml(it)}</div>
                  ${
                    it.allowedVegTypes.length === 1
                      ? fixedTypeHtml(it)
                      : `<select class="mini-input ${vegClass(it.vegType)}" data-veg>${vegOptionsHtml(it)}</select>`
                  }
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
      if (vegSel) {
        vegSel.addEventListener("change", () => {
          const value = /** @type {HTMLSelectElement} */ (vegSel).value;
          setVegType(id, value);
          vegSel.classList.remove("veg-select--veg", "veg-select--nonveg");
          if (value === "Veg") vegSel.classList.add("veg-select--veg");
          if (value === "Non-Veg") vegSel.classList.add("veg-select--nonveg");
        });
      }
    });
  }

  function buildWhatsAppText() {
    const lines = [];
    lines.push("Hi 8 Momo's! I'd like to order.");
    lines.push("");

    if (state.items.length === 0) {
      lines.push("Order items:");
      lines.push("- (please help me choose) ");
    } else {
      lines.push("Order items:");
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
    const address = (el.address?.value || "").trim().replace(/\s*\n+\s*/g, ", ");
    const maps = (el.maps?.value || "").trim();

    if (spice) {
      lines.push("");
      lines.push("Food preferences:");
      lines.push(`- Spice level: ${spice}`);
    }

    lines.push("");
    lines.push("Delivery / Pickup:");
    lines.push(`- Mode: ${fulfillment}`);
    if (fulfillment === "Delivery") {
      if (address) lines.push(`- Address: ${address}`);
      if (maps) lines.push(`- Google Maps link: ${maps}`);
    }

    if (payment) {
      lines.push("");
      lines.push("Payment:");
      lines.push(`- Method: ${payment}`);
    }

    if (name || phone || time) {
      lines.push("");
      lines.push("Customer details:");
      if (name) lines.push(`- Name: ${name}`);
      if (phone) lines.push(`- Phone: ${phone}`);
      if (time) lines.push(`- Preferred time: ${time}`);
    }

    if (notes) {
      lines.push("");
      lines.push("Extra instructions:");
      lines.push(`- ${notes}`);
    }

    lines.push("");
    lines.push("Please confirm total and ETA. Thanks!");

    return lines.join("\n");
  }

  function ensureErrorNode(inputEl) {
    if (!inputEl || !inputEl.parentElement) return null;
    let node = inputEl.parentElement.querySelector(".field-error");
    if (node) return node;
    node = document.createElement("p");
    node.className = "field-error";
    node.setAttribute("aria-live", "polite");
    inputEl.parentElement.appendChild(node);
    return node;
  }

  function setFieldError(inputEl, message) {
    if (!inputEl) return;
    const errNode = ensureErrorNode(inputEl);
    inputEl.classList.add("is-invalid");
    if (errNode) errNode.textContent = message;
  }

  function clearFieldError(inputEl) {
    if (!inputEl || !inputEl.parentElement) return;
    inputEl.classList.remove("is-invalid");
    const errNode = inputEl.parentElement.querySelector(".field-error");
    if (errNode) errNode.textContent = "";
  }

  function validateOrderForm() {
    let valid = true;
    const name = (el.name?.value || "").trim();
    const phone = (el.phone?.value || "").trim();
    const fulfillment = el.fulfillment();
    const address = (el.address?.value || "").trim();

    [el.name, el.phone, el.address].forEach(clearFieldError);

    if (state.items.length === 0) {
      valid = false;
      const emptyBox = document.getElementById("orderItemsEmpty");
      if (emptyBox) emptyBox.classList.add("order-empty--error");
    } else {
      const emptyBox = document.getElementById("orderItemsEmpty");
      if (emptyBox) emptyBox.classList.remove("order-empty--error");
    }

    if (!name) {
      valid = false;
      setFieldError(el.name, "Please enter your name");
    }

    if (!phone) {
      valid = false;
      setFieldError(el.phone, "Please enter your phone number");
    } else if (!/^\d{10}$/.test(phone.replace(/\s+/g, ""))) {
      valid = false;
      setFieldError(el.phone, "Enter a valid 10-digit phone number");
    }

    if (fulfillment === "Delivery" && !address) {
      valid = false;
      setFieldError(el.address, "Please enter delivery address");
    }

    return valid;
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
      if (!validateOrderForm()) return;
      const text = buildWhatsAppText();
      window.open(whatsappHref(text), "_blank", "noopener,noreferrer");
    });

    [el.name, el.phone, el.address].forEach((input) => {
      input?.addEventListener("input", () => clearFieldError(input));
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

    const getAllowedFromName = (name) => {
      const n = String(name).toLowerCase();
      const nonVegWords = ["chicken", "wings", "lollipop", "egg", "mutton", "fish", "prawn"];
      const vegWords = ["paneer", "gobi", "tomato", "veg ", "veggie", "vegetable", "corn"];

      if (nonVegWords.some((w) => n.includes(w))) return ["Non-Veg"];
      if (vegWords.some((w) => n.includes(w))) return ["Veg"];
      return ["Veg", "Non-Veg"];
    };

    const parseMatrixAllowed = (node) => {
      const cells = node.querySelectorAll("[role='cell']");
      const vegPrice = (cells[1]?.textContent || "").trim();
      const nonVegPrice = (cells[2]?.textContent || "").trim();
      const vegAvailable = vegPrice !== "" && vegPrice !== "—" && vegPrice !== "-";
      const nonVegAvailable = nonVegPrice !== "" && nonVegPrice !== "—" && nonVegPrice !== "-";

      if (vegAvailable && nonVegAvailable) return ["Veg", "Non-Veg"];
      if (vegAvailable) return ["Veg"];
      if (nonVegAvailable) return ["Non-Veg"];
      return ["Veg", "Non-Veg"];
    };

    const getItemMeta = (node) => {
      if (node.classList.contains("menu-item")) {
        const name = (node.querySelector(".mi-name")?.textContent || "").trim();
        const sectionId = node.closest("section")?.id || "";
        if (sectionId === "paneer-momos") return { name, allowed: ["Veg"] };
        return { name, allowed: getAllowedFromName(name) };
      }
      const name = (node.querySelector("[role='cell']")?.textContent || "").trim();
      const fromName = getAllowedFromName(name);
      if (fromName.length === 1) return { name, allowed: fromName };
      return { name, allowed: parseMatrixAllowed(node) };
    };

    const attach = (node) => {
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("data-quick-order", "true");

      const handler = () => {
        const { name, allowed } = getItemMeta(node);
        if (!name) return;
        addItem(name, allowed);
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

