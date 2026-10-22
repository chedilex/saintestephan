/* ==========================================================
   Parish website – shared scripts
   All page behaviour lives here (no inline JS in the HTML).
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  initImageSkeleton();
  initNavToggle();
  initMoreNews();
  initScrollToTop();
  initPageSkeleton();
});

/* ---------- image skeleton (shimmer until the image loads) ---------- */
function initImageSkeleton() {
  const images = document.querySelectorAll(
    "main img, .brand img, .footer-brand img, .priest-img-wrap img, .gallery-item img",
  );

  images.forEach((img) => {
    const el = img.parentElement;
    if (el && el !== document.body && !el.classList.contains("skel-box")) {
      el.classList.add("skel-box");
    }

    const done = () => {
      img.classList.add("is-loaded");
      if (el) el.classList.add("is-loaded");
    };

    img.classList.add("is-loading");

    if (img.complete) {
      // already in cache → let the browser paint the loaded state
      requestAnimationFrame(done);
    } else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  });
}

/* ---------- mobile navigation ---------- */
function initNavToggle() {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (!navToggle || !navLinks) return;

  const closeMenu = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

/* ---------- "read more" news button ---------- */
function initMoreNews() {
  const moreNews = document.getElementById("moreNews");
  const list = document.getElementById("newsList");
  if (!moreNews || !list) return;

  moreNews.addEventListener("click", function () {
    const extra = [
      ["إعلانات الرعية ومواعيد النشاطات القادمة", "إعلانات · أخبار الرعية"],
      ["معًا في الصلاة وخدمة أبناء المجتمع", "الحياة الرعوية · نشاطات"],
    ];

    extra.forEach(([title, category]) => {
      const card = document.createElement("a");
      card.className = "news-card";
      card.href = "#services";
      card.innerHTML =
        '<img class="news-thumb" src="images/church-news.webp" alt="">' +
        '<div class="news-copy"><h3></h3><p></p></div>' +
        '<i class="fa-solid fa-chevron-left news-arrow"></i>';
      card.querySelector("h3").textContent = title;
      card.querySelector("p").textContent = category;
      list.appendChild(card);
    });

    this.disabled = true;
    this.textContent = "تم عرض الأخبار الإضافية";
    this.style.opacity = ".7";
  });
}

/* ---------- back to top button ---------- */
function initScrollToTop() {
  const toTop = document.getElementById("toTop");
  if (!toTop) return;

  const toggle = () => {
    toTop.classList.toggle("visible", window.scrollY > 400);
  };

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

/* ---------- page skeleton (shown while the page loads / while navigating) ---------- */
function initPageSkeleton() {
  const body = document.body;
  const skeleton = document.getElementById("pageSkeleton");

  const hideSkeleton = () => {
    body.classList.add("page-ready");
    if (skeleton) {
      setTimeout(() => skeleton.remove(), 450);
    }
  };

  if (document.readyState === "complete") {
    hideSkeleton();
  } else {
    window.addEventListener("load", hideSkeleton, { once: true });
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion) return;

  // show the skeleton again when the user navigates to another page
  document.querySelectorAll('a[href$=".html"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0 ||
        link.target === "_blank"
      ) {
        return;
      }

      const url = new URL(link.href, window.location.href);
      if (url.href === window.location.href) return;

      body.classList.remove("page-ready");

      // the skeleton is removed once the page is ready → put it back for the
      // next page (built fresh so the fade-in animation restarts)
      if (!document.getElementById("pageSkeleton") && skeleton) {
        const fresh = skeleton.cloneNode(true);
        fresh.id = "pageSkeleton";
        fresh.style.display = "";
        body.prepend(fresh);
      }
    });
  });
}
