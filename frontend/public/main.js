/**
 * Intelligence Designed To Evolve — Main Interactive Scripts
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 1) Animated Numerical Count-Up for Stats Footer
  // ==========================================================================
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

  const animateCountUp = (element, index) => {
    const target = parseFloat(element.getAttribute("data-target")) || 0;
    const suffix = element.getAttribute("data-suffix") || "";
    const decimals = parseInt(element.getAttribute("data-decimals"), 10) || 0;

    const duration = 1500 + index * 80;
    const startDelay = 480 + index * 90;

    setTimeout(() => {
      let startTimestamp = null;

      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = easedProgress * target;

        element.textContent = currentValue.toFixed(decimals) + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          element.textContent = target.toFixed(decimals) + suffix;
        }
      };

      window.requestAnimationFrame(step);
    }, startDelay);
  };

  const statValues = document.querySelectorAll(".stat-value");
  let animated = false;

  if ("IntersectionObserver" in window) {
    const statsFooter = document.querySelector(".stats");
    if (statsFooter) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !animated) {
              animated = true;
              statValues.forEach((el, i) => animateCountUp(el, i));
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      observer.observe(statsFooter);
    } else {
      statValues.forEach((el, i) => animateCountUp(el, i));
    }
  } else {
    // Fallback if IntersectionObserver is not supported
    statValues.forEach((el, i) => animateCountUp(el, i));
  }

  // ==========================================================================
  // 2) Mobile Navigation & Drawer Toggle
  // ==========================================================================
  const burgerBtn = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileOverlay = document.getElementById("mobileOverlay");

  const openMobileMenu = () => {
    if (!burgerBtn || !mobileMenu || !mobileOverlay) return;
    burgerBtn.setAttribute("aria-expanded", "true");
    burgerBtn.classList.add("is-open");

    mobileOverlay.removeAttribute("hidden");
    mobileMenu.removeAttribute("hidden");

    // Force reflow for smooth CSS transitions
    void mobileOverlay.offsetWidth;
    void mobileMenu.offsetWidth;

    mobileOverlay.classList.add("is-open");
    mobileMenu.classList.add("is-open");
    document.body.classList.add("menu-open");
  };

  const closeMobileMenu = () => {
    if (!burgerBtn || !mobileMenu || !mobileOverlay) return;
    burgerBtn.setAttribute("aria-expanded", "false");
    burgerBtn.classList.remove("is-open");

    mobileOverlay.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");

    setTimeout(() => {
      if (!mobileMenu.classList.contains("is-open")) {
        mobileOverlay.setAttribute("hidden", "");
        mobileMenu.setAttribute("hidden", "");
      }
    }, 380);
  };

  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      const isOpen = burgerBtn.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMobileMenu);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
    }
  });

  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link, .mobile-sign-in");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      closeMobileMenu();
    }
  });
});
