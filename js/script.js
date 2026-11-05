/* ==========================================================
   Parish website – shared scripts
   Adapted to match the Assia website's observer and loading patterns.
   ========================================================== */

document.documentElement.classList.add("js-enabled");

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Elements
  const preloader = document.getElementById("pageSkeleton"); // Reusing the skeleton as the preloader
  const menuToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navLinks");
  const siteHeader = document.getElementById("header");

  const readMoreBtn = document.getElementById("moreNews");
  const newsList = document.getElementById("newsList");

  let backToTop = document.getElementById("toTop"); // Existing back to top button

  // ===== Page Loader (Adapted from Assia) =====
  if (preloader) {
    body.classList.add("loading");

    let pageLoaded = document.readyState === "complete";
    let loaderFinished = false;

    const finishLoading = () => {
      if (loaderFinished) return;

      pageLoaded = true;
      loaderFinished = true;

      // Hide the skeleton/preloader
      preloader.classList.add("hidden");
      body.classList.remove("loading", "page-ready");

      // Remove from DOM after transition
      setTimeout(() => {
        preloader.style.display = "none";
        preloader.remove();
      }, 700);
    };

    if (pageLoaded) {
      finishLoading();
    } else {
      window.addEventListener("load", finishLoading, { once: true });
    }

    window.addEventListener("pageshow", (event) => {
      if (event.persisted && !loaderFinished) {
        finishLoading();
      }
    });
  }

  // ===== Mobile Menu (Adapted from Assia) =====
  const closeMenu = () => {
    if (!menuToggle || !navMenu) return;

    navMenu.classList.remove("open");
    body.classList.remove("menu-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "فتح القائمة");

    const icon = menuToggle.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
    }
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      body.classList.toggle("menu-open", isOpen);

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "إغلاق القائمة" : "فتح القائمة",
      );

      const icon = menuToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars", !isOpen);
        icon.classList.toggle("fa-xmark", isOpen);
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (
        navMenu.classList.contains("open") &&
        siteHeader &&
        !siteHeader.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  // ===== Smooth Scrolling (Adapted from Assia) =====
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      closeMenu(); // Close mobile menu on click

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  // ===== Scroll Reveal (Adapted from Assia) =====
  // Now only looks for the .reveal class.
  const animatedElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      },
    );

    animatedElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    // Fallback for older browsers
    animatedElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  // ===== Read More News (Kept from original) =====
  if (readMoreBtn && newsList) {
    readMoreBtn.addEventListener("click", function () {
      const extra = [
        ["إعلانات الرعية ومواعيد النشاطات القادمة", "إعلانات · أخبار الرعية"],
        ["معًا في الصلاة وخدمة أبناء المجتمع", "الحياة الرعوية · نشاطات"],
      ];

      extra.forEach(([title, category]) => {
        const card = document.createElement("a");
        card.className = "news-card reveal"; // Added .reveal here so new cards animate too
        card.href = "#services";
        card.innerHTML =
          '<img class="news-thumb" src="images/church-news.webp" alt="">' +
          '<div class="news-copy"><h3></h3><p></p></div>' +
          '<i class="fa-solid fa-chevron-left news-arrow"></i>';
        card.querySelector("h3").textContent = title;
        card.querySelector("p").textContent = category;
        newsList.appendChild(card);

        // Observe the newly created card
        if ("IntersectionObserver" in window) {
          // Note: this requires revealObserver to be in scope.
          // Since it is, it works perfectly here.
          revealObserver.observe(card);
        } else {
          card.classList.add("is-visible");
        }
      });

      this.disabled = true;
      this.textContent = "تم عرض الأخبار الإضافية";
      this.style.opacity = ".7";
    });
  }

  // ===== Header + Back to Top on Scroll (Adapted from Assia) =====
  const handleScroll = () => {
    const scrollPosition = window.scrollY;

    if (backToTop) {
      backToTop.classList.toggle("visible", scrollPosition > 400);
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // Run once on load

  // Ensure back to top button works
  if (backToTop) {
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  }
});
