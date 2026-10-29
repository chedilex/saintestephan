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

  const hideSkeleton = () => {
    // hide first (so it is never visible on a restored/back-forward page)
    body.classList.add("page-ready");
    const skel = document.getElementById("pageSkeleton");
    if (skel) skel.remove();
  };

  if (document.readyState === "complete") {
    requestAnimationFrame(hideSkeleton);
  } else {
    window.addEventListener("load", hideSkeleton, { once: true });
  }

  // when the page is restored from the back/forward cache the DOM snapshot
  // can contain the skeleton again → force it hidden
  window.addEventListener("pageshow", hideSkeleton);

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
    });
  });
}
