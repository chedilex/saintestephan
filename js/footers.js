// footer.js
document.addEventListener("DOMContentLoaded", function () {
  const footerContainer = document.getElementById("footer");
  if (!footerContainer) return;

  // Which variant? data-footer="white" (default) or data-footer="paper"
  const variant = footerContainer.dataset.footer || "white";

  const copyrightBlock = `
    <div class="copyright">
      <div class="container">
        <span>&copy; ${new Date().getFullYear()} Copyright St.Estephan.ORG | All Right Reserved</span>
        <div class="chedilex-footer-container"></div>
      </div>
    </div>
  `;

  const whiteFooter = `
    <div class="container footer-main">
      <section class="footer-brand">
        <img
          src="images/parish-logo.webp"
          alt="شعار الرعية"
          onerror="this.style.display = 'none'"
        />
        <div>
          <h3>رعية مار اسطفان - البترون</h3>
          <p>
            تاريخ عريق من الإيمان والخدمة في قلب البترون. نسعى معًا لنعيش
            رسالة المحبة والرجاء.
          </p>
          <div class="socials">
            <a href="#" aria-label="فيسبوك"
              ><i class="fa-brands fa-facebook"></i
            ></a>
            <a href="#" aria-label="إنستغرام"
              ><i class="fa-brands fa-instagram"></i
            ></a>
          </div>
        </div>
      </section>
      <section class="footer-col">
        <h3>كهنة الرعية</h3>
        <a href="tel:+9613805024">بيار صعب: 03805024</a>
        <br />
        <a href="tel:+96171616414">فرنسوا حرب: 71616414</a>
      </section>
      <section class="footer-col">
        <h3>دوائر الرعية</h3>
        <a href="tel:+9616642259">هاتف: 06642259</a>
        <br />
        <a href="tel:+96176642259">هاتف: 76642259</a>
      </section>
    </div>
    ${copyrightBlock}
  `;

  const paperFooter = `
    <div class="container footer-main">
      <section class="footer-brand">
        <img
          src="images/parish-logo.webp"
          alt="شعار الرعية"
          onerror="this.style.display = 'none'"
        />
        <div>
          <h3>رعية مار اسطفان - البترون</h3>
          <p>
            تاريخ عريق من الإيمان والخدمة في قلب البترون. نسعى معًا لنعيش
            رسالة المحبة والرجاء.
          </p>
          <div class="socials">
            <a href="#" aria-label="فيسبوك"
              ><i class="fa-brands fa-facebook-f"></i
            ></a>
            <a href="#" aria-label="إنستغرام"
              ><i class="fa-brands fa-instagram"></i
            ></a>
          </div>
        </div>
      </section>
      <section class="footer-col">
        <h3>كهنة الرعية</h3>
        <a href="tel:+9613805024">بيار صعب: 03805024</a>
        <br />
        <a href="tel:+96171616414">فرنسوا حرب: 71616414</a>
      </section>
      <section class="footer-col">
        <h3>دوائر الرعية</h3>
        <a href="tel:+9616642259">هاتف: 06642259</a>
        <br />
        <a href="tel:+96176642259">هاتف: 76642259</a>
      </section>
    </div>
    ${copyrightBlock}
  `;

  // Inject the correct variant
  if (variant === "paper") {
    footerContainer.classList.add("paperbackground", "footer-paper");
    footerContainer.innerHTML = paperFooter;
  } else {
    footerContainer.classList.add("footer-white");
    footerContainer.innerHTML = whiteFooter;
  }

  // Load the chedilex footer script AFTER the container exists
  loadChedilexFooter();
});

function loadChedilexFooter() {
  // Prevent loading twice if the script is already on the page
  if (document.getElementById("chedilex-footer-script")) return;

  const script = document.createElement("script");
  script.id = "chedilex-footer-script";
  script.src =
    "https://cdn.jsdelivr.net/gh/chedilex/chedilex-assets-footer@main/footer.js?v=1.0.2";
  script.async = true;
  document.body.appendChild(script);
}
