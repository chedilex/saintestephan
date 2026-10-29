// header.js
document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  headerContainer.classList.add("navbar");

  headerContainer.innerHTML = `
    <div class="container nav-inner">
      <a class="brand" href="#home" aria-label="رعية مار اسطفان - البترون">
        <img
          src="images/parish-logo.webp"
          alt="شعار رعية مار اسطفان"
          onerror="this.style.display = 'none'"
        />
      </a>
      <nav class="nav-links" id="navLinks" aria-label="القائمة الرئيسية">
        <a href="index.html">رئيسية</a>
        <a href="history.html">تاريخنا</a>
        <a href="news.html">أخبار الرعية</a>
        <a href="religious_groups.html">الجماعات</a>
        <a href="message.html">رسالة الأحد</a>
      </nav>
      <button
        class="nav-toggle"
        id="navToggle"
        aria-label="فتح القائمة"
        aria-expanded="false"
      >
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>
  `;
});

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
