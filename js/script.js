(() => {
  // Update test rates here; values are in Indian rupees.
  const testPrices = {
    cbc: 200,
    diabetes: 200,
    thyroid: 200,
    lipid: 200,
    liver: 200,
    kidney: 200,
    vitamin: 200,
    allergy: 200
  };
  document.querySelectorAll("[data-price-key]").forEach((priceElement) => {
    const price = testPrices[priceElement.dataset.priceKey];
    if (price !== undefined) priceElement.textContent = `₹${price}`;
  });

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".desktop-nav");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    }));
  }

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const shouldOpen = button.getAttribute("aria-expanded") !== "true";
      document.querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });
      if (shouldOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  const modal = document.querySelector("#booking-modal");
  const form = document.querySelector("#booking-form");
  if (modal && form) {
    const dialog = modal.querySelector('[role="dialog"]');
    const feedback = modal.querySelector("[data-form-feedback]");
    const test = form.elements.service;
    const phonePattern = /^(?:\+91)?[6-9]\d{9}$/;
    let returnFocus = null;
    const open = (selectedService) => {
      returnFocus = document.activeElement;
      if (selectedService && test) test.value = selectedService;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      window.setTimeout(() => dialog.focus(), 0);
    };
    const close = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (returnFocus instanceof HTMLElement) returnFocus.focus();
    };
    document.querySelectorAll("[data-open-booking]").forEach((button) => button.addEventListener("click", () => {
      if (button.hasAttribute("data-call-now")) {
        window.location.href = "tel:+919702106443";
        return;
      }
      open(button.dataset.service || "");
    }));
    modal.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", close));
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    document.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const focusable = [...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); feedback.textContent = "Please complete all required fields with valid information."; feedback.classList.add("is-error"); return; }
      const phoneValue = form.elements.phone.value.replace(/[()\s-]/g, "");
      if (!phonePattern.test(phoneValue)) { form.elements.phone.focus(); feedback.textContent = "Enter a valid 10-digit Indian mobile number, optionally starting with +91."; feedback.classList.add("is-error"); return; }
      const date = form.elements.date.value;
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      if (date < localToday) { form.elements.date.focus(); feedback.textContent = "Choose today or a future date."; feedback.classList.add("is-error"); return; }
      feedback.textContent = "Thank you. Your details are valid, but this static website is not connected to a booking system, so no request has been sent. Please call us to confirm your appointment.";
      feedback.classList.remove("is-error");
      window.setTimeout(() => { form.reset(); close(); feedback.textContent = ""; }, 4500);
    });
    const date = form.elements.date;
    if (date) {
      const now = new Date();
      date.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }
  }

  const packageModal = document.querySelector("#package-details-modal");
  if (packageModal) {
    const packageDialog = packageModal.querySelector('[role="dialog"]');
    const packageName = packageModal.querySelector("[data-package-name]");
    const packageDescription = packageModal.querySelector("[data-package-description]");
    const packagePrice = packageModal.querySelector("[data-package-price]");
    const packageFeatures = packageModal.querySelector("[data-package-feature-list]");
    const packagePreparation = packageModal.querySelector("[data-package-preparation]");
    const bookPackageButton = packageModal.querySelector("[data-book-package]");

    const closePackageModal = () => {
      packageModal.classList.remove("is-open");
      packageModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    const openPackageModal = (button) => {
      if (!button) return;
      if (packageName) packageName.textContent = button.dataset.packageName || "Package";
      if (packageDescription) packageDescription.textContent = button.dataset.packageDescription || "";
      if (packagePrice) packagePrice.textContent = button.dataset.packagePrice || "₹[PRICE]";
      if (packagePreparation) packagePreparation.textContent = button.dataset.packagePreparation || "Follow the preparation guidance for the selected tests and speak with a qualified healthcare professional if needed.";
      if (packageFeatures) {
        const features = (button.dataset.packageFeatures || "").split("|").filter(Boolean);
        packageFeatures.innerHTML = features.map((feature) => `<li>${feature}</li>`).join("");
      }
      if (bookPackageButton) {
        bookPackageButton.dataset.service = button.dataset.packageName || "Health Package";
      }
      packageModal.classList.add("is-open");
      packageModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      window.setTimeout(() => packageDialog?.focus(), 0);
    };

    document.querySelectorAll("[data-package-details]").forEach((button) => {
      button.addEventListener("click", () => openPackageModal(button));
    });
    packageModal.querySelectorAll("[data-close-package-modal]").forEach((button) => button.addEventListener("click", closePackageModal));
    packageModal.addEventListener("click", (event) => { if (event.target === packageModal) closePackageModal(); });
    document.addEventListener("keydown", (event) => {
      if (!packageModal.classList.contains("is-open")) return;
      if (event.key === "Escape") closePackageModal();
      if (event.key === "Tab" && packageDialog) {
        const focusable = [...packageDialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  const contactForm = document.querySelector("#page-contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const feedback = contactForm.querySelector("[data-contact-feedback]");
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
      const phone = contactForm.elements.phone.value.replace(/[()\s-]/g, "");
      if (!/^(?:\+91)?[6-9]\d{9}$/.test(phone)) {
        contactForm.elements.phone.focus();
        feedback.textContent = "Enter a valid 10-digit Indian mobile number, optionally starting with +91.";
        return;
      }
      const values = new FormData(contactForm);
      const subject = encodeURIComponent(`Website enquiry from ${values.get("name")}`);
      const body = encodeURIComponent(`Name: ${values.get("name")}\nPhone: ${values.get("phone")}\nEmail: ${values.get("email")}\n\n${values.get("message")}`);
      feedback.textContent = "Opening your email app to send your message. The website itself does not store or transmit your details.";
      window.location.href = `mailto:support@kritidiagnostics.com?subject=${subject}&body=${body}`;
    });
  }

  if (document.body.classList.contains("page-body")) {
    const actions = document.createElement("aside");
    actions.className = "floating-contact-actions";
    actions.setAttribute("aria-label", "Contact Kriti Diagnostics");
    actions.innerHTML = '<a class="floating-call" href="tel:+919702106443" aria-label="Call Kriti Diagnostics">Call</a><a class="floating-whatsapp" href="https://wa.me/919702106443" target="_blank" rel="noopener noreferrer" aria-label="Contact Kriti Diagnostics on WhatsApp">WhatsApp</a>';
    document.body.append(actions);
  }

  const revealItems = document.querySelectorAll(".page-reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, current) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); current.unobserve(entry.target); }
    }), { threshold: .12 });
    revealItems.forEach((item) => observer.observe(item));
  } else revealItems.forEach((item) => item.classList.add("is-visible"));
})();
