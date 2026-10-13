(() => {
  const bookingModal = document.querySelector("#booking-modal");
  const bookingDialog = bookingModal.querySelector(".booking-dialog");
  const serviceModal = document.querySelector("#service-modal");
  const serviceDialog = serviceModal.querySelector(".service-dialog");
  const bookingForm = document.querySelector("#booking-form");
  const bookingFeedback = document.querySelector("#booking-feedback");
  const contactForm = document.querySelector("#contact-form");
  const contactFeedback = document.querySelector("#contact-feedback");
  const dateField = bookingForm.elements.date;
  const phonePattern = /^[0-9+() .-]{7,20}$/;
  let lastFocusedElement = null;
  let closeBookingTimer = 0;

  const serviceDetails = {
    blood: {
      title: "Blood tests",
      copy: "Ask our team about the blood tests available through Kriti Diagnostics. We can help you check preparation guidance, home collection availability and the next steps for your selected test."
    },
    packages: {
      title: "Health packages",
      copy: "Explore health package options with our support team. The right tests can depend on your needs, so please discuss test selection with a qualified healthcare professional."
    },
    diabetes: {
      title: "Diabetes testing",
      copy: "Ask us about available tests related to blood glucose monitoring, including the Diabetes Profile. Your clinician can advise which tests are appropriate for you."
    },
    thyroid: {
      title: "Thyroid testing",
      copy: "We offer a Thyroid Profile option. Contact our team to check collection availability and any preparation instructions for your appointment."
    },
    vitamin: {
      title: "Vitamin testing",
      copy: "Ask our team about Vitamin Profile testing and home sample collection availability. A healthcare professional can help determine which tests are right for you."
    },
    "liver-kidney": {
      title: "Liver & kidney tests",
      copy: "Liver Function and Kidney Function tests are available to request. Our team can discuss scheduling and collection details; test selection should be guided by your clinician."
    },
    lipid: {
      title: "Lipid profile",
      copy: "Get in touch to ask about a Lipid Profile test and home collection. Our team can confirm current availability and any preparation instructions."
    }
  };

  const setFeedback = (element, message, isError = false) => {
    element.textContent = message;
    element.classList.toggle("is-error", isError);
  };

  const clearFeedback = (form, feedback) => {
    form.addEventListener("input", () => {
      if (feedback.textContent) setFeedback(feedback, "");
    });
    form.addEventListener("change", () => {
      if (feedback.textContent) setFeedback(feedback, "");
    });
  };

  const packageModal = document.querySelector("#package-details-modal");
  const packageDialog = packageModal ? packageModal.querySelector("[role='dialog']") : null;
  if (packageModal && packageDialog) {
    const openPackageModal = (button) => {
      const name = button.dataset.packageName || "Health package";
      const description = button.dataset.packageDescription || "";
      const price = button.dataset.packagePrice || "₹[PRICE]";
      const prep = button.dataset.packagePreparation || "Follow any preparation guidance for your selected tests and discuss suitability with a qualified healthcare professional.";
      const features = (button.dataset.packageFeatures || "").split("|").filter(Boolean);

      const title = packageModal.querySelector("[data-package-name]");
      const copy = packageModal.querySelector("[data-package-description]");
      const priceNode = packageModal.querySelector("[data-package-price]");
      const prepNode = packageModal.querySelector("[data-package-preparation]");
      const list = packageModal.querySelector("[data-package-feature-list]");
      const trigger = packageModal.querySelector("[data-book-package]");

      title.textContent = name;
      copy.textContent = description;
      priceNode.textContent = price;
      prepNode.textContent = prep;
      list.innerHTML = features.map((item) => `<li>${item}</li>`).join("");
      if (trigger) trigger.dataset.service = name;

      openModal(packageModal, packageDialog);
    };

    const closePackageModal = () => closeModal(packageModal, packageDialog);

    document.querySelectorAll("[data-package-details]").forEach((button) => {
      button.addEventListener("click", () => openPackageModal(button));
    });

    packageModal.querySelectorAll("[data-close-package-modal]").forEach((button) => {
      button.addEventListener("click", closePackageModal);
    });

    packageModal.addEventListener("click", (event) => {
      if (event.target === packageModal) closePackageModal();
    });
  }

  const openModal = (modal, dialog) => {
    lastFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.setTimeout(() => dialog.focus(), 0);
  };

  const closeModal = (modal, dialog) => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (!bookingModal.classList.contains("is-open") && !serviceModal.classList.contains("is-open")) {
      document.body.classList.remove("modal-open");
    }
    if (lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) {
      lastFocusedElement.focus();
    } else {
      dialog.blur();
    }
  };

  const openBooking = (selectedTest = "") => {
    window.clearTimeout(closeBookingTimer);
    setFeedback(bookingFeedback, "");
    if (selectedTest && bookingForm.elements.test) bookingForm.elements.test.value = selectedTest;
    openModal(bookingModal, bookingDialog);
  };

  document.querySelectorAll("[data-open-booking]").forEach((button) => {
    button.addEventListener("click", () => {
      if (serviceModal.classList.contains("is-open")) {
        serviceModal.classList.remove("is-open");
        serviceModal.setAttribute("aria-hidden", "true");
      }
      openBooking(button.dataset.service || "");
    });
  });

  bookingModal.querySelector(".modal-close").addEventListener("click", () => closeModal(bookingModal, bookingDialog));
  serviceModal.querySelector(".service-close").addEventListener("click", () => closeModal(serviceModal, serviceDialog));

  [bookingModal, serviceModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal, modal.querySelector('[role="dialog"]'));
    });
  });

  document.addEventListener("keydown", (event) => {
    const activeModal = bookingModal.classList.contains("is-open") ? bookingModal :
      serviceModal.classList.contains("is-open") ? serviceModal : null;
    if (!activeModal) return;

    if (event.key === "Escape") {
      closeModal(activeModal, activeModal.querySelector('[role="dialog"]'));
      return;
    }

    if (event.key !== "Tab") return;
    const dialog = activeModal.querySelector('[role="dialog"]');
    const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  dateField.min = localToday;

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      setFeedback(bookingFeedback, "Please complete each required field with valid information.", true);
      return;
    }
    if (!phonePattern.test(bookingForm.elements.phone.value.trim())) {
      bookingForm.elements.phone.focus();
      setFeedback(bookingFeedback, "Please enter a valid phone number.", true);
      return;
    }
    if (bookingForm.elements.date.value < localToday) {
      dateField.focus();
      setFeedback(bookingFeedback, "Choose today or a future date for your visit.", true);
      return;
    }

    setFeedback(bookingFeedback, "Your details are valid. Online booking delivery is not connected on this static demo, so no request has been sent.");
    closeBookingTimer = window.setTimeout(() => {
      bookingForm.reset();
      setFeedback(bookingFeedback, "");
      closeModal(bookingModal, bookingDialog);
    }, 3000);
  });

  clearFeedback(bookingForm, bookingFeedback);

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      setFeedback(contactFeedback, "Please complete all fields with valid information.", true);
      return;
    }
    if (!phonePattern.test(contactForm.elements.phone.value.trim())) {
      contactForm.elements.phone.focus();
      setFeedback(contactFeedback, "Please enter a valid phone number.", true);
      return;
    }

    const subject = encodeURIComponent(`Website enquiry from ${contactForm.elements.name.value.trim()}`);
    const body = encodeURIComponent([
      `Name: ${contactForm.elements.name.value.trim()}`,
      `Phone: ${contactForm.elements.phone.value.trim()}`,
      `Email: ${contactForm.elements.email.value.trim()}`,
      "",
      contactForm.elements.message.value.trim()
    ].join("\n"));
    setFeedback(contactFeedback, "Opening your email app with your message. If it does not open, email support@kritidiagnostics.com.");
    window.location.href = `mailto:support@kritidiagnostics.com?subject=${subject}&body=${body}`;
  });

  clearFeedback(contactForm, contactFeedback);

  document.querySelectorAll("a[href^='tel:']").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "tel:+919702106443";
    });
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      const detail = serviceDetails[button.dataset.service];
      if (!detail) return;
      document.querySelector("#service-modal-title").textContent = detail.title;
      document.querySelector("#service-modal-copy").textContent = detail.copy;
      const serviceNames = { blood: "Blood Test", packages: "Health Package", diabetes: "Diabetes Profile", thyroid: "Thyroid Profile", vitamin: "Vitamin Profile", "liver-kidney": "Liver Function Test", lipid: "Lipid Profile" };
      document.querySelector(".service-book").dataset.service = serviceNames[button.dataset.service] || "Other";
      openModal(serviceModal, serviceDialog);
    });
  });

  const navigationLinks = [...document.querySelectorAll(".mobile-nav-link, .desktop-nav .nav-link")];
  const setActiveSection = (sectionId) => {
    navigationLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-active", active);
      if (link.classList.contains("mobile-nav-link")) {
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    });
  };

  navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const section = document.querySelector(link.getAttribute("href"));
      if (!section) return;
      event.preventDefault();
      section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      setActiveSection(section.id);
      history.replaceState(null, "", `#${section.id}`);
    });
  });

  const observedSections = ["home", "about", "services", "contact"].map((id) => document.getElementById(id));
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-22% 0px -60% 0px", threshold: [0, .15, .35, .6] });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: "0px 0px -28px 0px" });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  }

  const reviewCarousel = document.querySelector("[data-carousel]");
  if (reviewCarousel) {
    const reviewTrack = reviewCarousel.querySelector(".review-track");
    const reviewCards = [...reviewCarousel.querySelectorAll(".review-card")];
    const prevButton = reviewCarousel.querySelector(".carousel-button[aria-label='Previous review']");
    const nextButton = reviewCarousel.querySelector(".carousel-button.next[aria-label='Next review']");
    const dots = [...reviewCarousel.querySelectorAll(".carousel-dot")];
    let currentIndex = 0;
    let autoSlideTimer = null;

    const getVisibleCount = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) return 3;
      if (window.matchMedia("(min-width: 768px)").matches) return 2;
      return 1;
    };

    const updateCarousel = () => {
      const visibleCount = getVisibleCount();
      const maxIndex = Math.max(0, reviewCards.length - visibleCount);
      currentIndex = Math.min(currentIndex, maxIndex);
      const firstCard = reviewCards[0];
      const gap = parseFloat(getComputedStyle(reviewTrack).gap || getComputedStyle(reviewTrack).columnGap || 0);
      const cardWidth = firstCard.getBoundingClientRect().width + gap;
      reviewTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

      dots.forEach((dot, index) => {
        const active = index === currentIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", String(active));
      });
    };

    const resetAutoSlide = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      window.clearInterval(autoSlideTimer);
      autoSlideTimer = window.setInterval(() => {
        currentIndex = (currentIndex + 1) % Math.max(1, reviewCards.length - getVisibleCount() + 1);
        updateCarousel();
      }, 5600);
    };

    prevButton.addEventListener("click", () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateCarousel();
      resetAutoSlide();
    });

    nextButton.addEventListener("click", () => {
      const maxIndex = Math.max(0, reviewCards.length - getVisibleCount());
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      updateCarousel();
      resetAutoSlide();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentIndex = index;
        updateCarousel();
        resetAutoSlide();
      });
    });

    reviewCarousel.addEventListener("pointerenter", () => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) window.clearInterval(autoSlideTimer);
    });
    reviewCarousel.addEventListener("focusin", () => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) window.clearInterval(autoSlideTimer);
    });
    reviewCarousel.addEventListener("pointerleave", resetAutoSlide);
    reviewCarousel.addEventListener("focusout", () => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) resetAutoSlide();
    });

    reviewCarousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevButton.click();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextButton.click();
      }
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
    resetAutoSlide();
  }

  document.querySelector(".banner-close").addEventListener("click", () => {
    const banner = document.querySelector("#visit-banner");
    banner.classList.add("is-dismissed");
    window.setTimeout(() => banner.setAttribute("hidden", ""), 260);
  });

  const backToTop = document.querySelector(".back-to-top");
  const updateBackToTop = () => backToTop.classList.toggle("is-visible", window.scrollY > 480);
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));

  document.querySelectorAll(".quick-card[data-quick='collection'], .quick-card[data-quick='reports']").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (link.dataset.quick === "collection") openBooking();
      else document.querySelector("#contact").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();