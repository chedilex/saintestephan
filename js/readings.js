(function () {
  "use strict";

  const RSS_URL = "https://rss.evangelizo.org/rss/v2/evangelizo_rss-maa.xml";

  // Returns today's date in YYYY-MM-DD format
  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Extracts and parses the date from the RSS item title (e.g., "الثلاثاء، ٣ نوفمبر : ...")
  function extractDateFromTitle(title) {
    if (!title) return null;

    const match = title.match(/(\d+|٠|١|٢|٣|٤|٥|٦|٧|٨|٩)+\s+(\S+)/);
    if (!match) return null;

    const dayStr = match[1];
    const monthStr = match[2];

    // Convert Arabic numerals to English digits
    const arabicToEnglish = {
      "٠": "0",
      "١": "1",
      "٢": "2",
      "٣": "3",
      "٤": "4",
      "٥": "5",
      "٦": "6",
      "٧": "7",
      "٨": "8",
      "٩": "9",
    };

    const day = parseInt(dayStr.replace(/[٠-٩]/g, (d) => arabicToEnglish[d]));

    // Map Arabic month names to standard month numbers
    const months = {
      يناير: 1,
      "كانون الثاني": 1,
      فبراير: 2,
      شباط: 2,
      مارس: 3,
      آذار: 3,
      أبريل: 4,
      نيسان: 4,
      مايو: 5,
      أيار: 5,
      يونيو: 6,
      حزيران: 6,
      يوليو: 7,
      تموز: 7,
      أغسطس: 8,
      آب: 8,
      سبتمبر: 9,
      أيلول: 9,
      أكتوبر: 10,
      "تشرين الأول": 10,
      نوفمبر: 11,
      "تشرين الثاني": 11,
      ديسمبر: 12,
      "كانون الأول": 12,
    };

    const month = months[monthStr];

    if (!day || !month) return null;

    const year = new Date().getFullYear();
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // Fetches the RSS feed and filters down to today's readings only
  function fetchReadings() {
    const todayDate = getTodayDate();

    return fetch(RSS_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.text();
      })
      .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
      .then((data) => {
        const items = data.querySelectorAll("item");
        const readings = {
          gospel: null,
          epistle: null, // MEDITATIO or LECTIO
        };

        items.forEach((item) => {
          const category = item.querySelector("category")?.textContent?.trim();
          const title = item.querySelector("title")?.textContent?.trim();
          const description = item
            .querySelector("description")
            ?.textContent?.trim();

          const itemDate = extractDateFromTitle(title);

          // Skip anything that isn't for today
          if (itemDate !== todayDate) return;

          if (category === "EVANGELIUM" && !readings.gospel) {
            readings.gospel = { category, title, description };
          } else if (
            (category === "MEDITATIO" || category === "LECTIO") &&
            !readings.epistle
          ) {
            readings.epistle = { category, title, description };
          }
        });

        return readings;
      });
  }

  // Cleans up HTML tags and creates a truncated preview summary
  function buildSummary(description, maxLength) {
    if (!description) return "";
    const clean = description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return clean.length > maxLength
      ? clean.substring(0, maxLength) + "..."
      : clean;
  }

  // Returns the appropriate title for the epistle/meditation card
  function getEpistleTitle(category) {
    if (category === "MEDITATIO") return "تأمل اليوم";
    if (category === "LECTIO") return "قراءة اليوم";
    return "رسالة اليوم";
  }

  // Populates the daily readings preview cards on the index page
  function initIndexPage() {
    const epistleCard = document.getElementById("epistle-card");
    const epistleTitle = document.getElementById("epistle-title");
    const epistleSummary = document.getElementById("epistle-summary");
    const gospelSummary = document.getElementById("gospel-summary");

    if (!epistleCard && !gospelSummary) return; // Exit if we aren't on the index page

    fetchReadings()
      .then((readings) => {
        // Render Gospel preview
        if (readings.gospel && gospelSummary) {
          const short = buildSummary(readings.gospel.description, 130);
          gospelSummary.innerHTML = `<strong>${readings.gospel.title}</strong><br><br>${short}`;
        } else if (gospelSummary) {
          gospelSummary.textContent = "لا تتوفر قراءة للإنجيل اليوم.";
        }

        // Render Epistle/Meditation preview
        if (readings.epistle) {
          const short = buildSummary(readings.epistle.description, 130);
          if (epistleSummary) {
            epistleSummary.innerHTML = `<strong>${readings.epistle.title}</strong><br><br>${short}`;
          }
          if (epistleTitle) {
            epistleTitle.textContent = getEpistleTitle(
              readings.epistle.category,
            );
          }
        } else {
          // Hide the card if nothing is available today
          if (epistleCard) epistleCard.style.display = "none";
        }
      })
      .catch((err) => {
        console.error("Error fetching RSS:", err);
        const errorMsg = "حدث خطأ في تحميل القراءات.";
        if (epistleSummary) epistleSummary.textContent = errorMsg;
        if (gospelSummary) gospelSummary.textContent = errorMsg;
      });
  }

  // Handles tab switching and displays full readings content on the readings page
  function initReadingsPage() {
    const btnGospel = document.getElementById("btn-gospel");
    const btnMessage = document.getElementById("btn-message");
    const gospelTab = document.getElementById("gospel");
    const messageTab = document.getElementById("message");
    const gospelLoading = document.getElementById("gospel-loading");
    const messageLoading = document.getElementById("message-loading");
    const gospelFull = document.getElementById("gospel-full");
    const messageFull = document.getElementById("message-full");

    if (!btnGospel || !gospelTab) return; // Exit if we aren't on the readings page

    // Tab switching logic
    function openTab(tabName) {
      gospelTab.style.display = "none";
      messageTab.style.display = "none";
      btnGospel.style.opacity = "0.7";
      btnMessage.style.opacity = "0.7";

      const target = document.getElementById(tabName);
      if (target) target.style.display = "block";

      const activeBtn = tabName === "gospel" ? btnGospel : btnMessage;
      if (activeBtn) activeBtn.style.opacity = "1";
    }

    // Expose globally for inline onclick handlers
    window.openTab = function (evt, tabName) {
      openTab(tabName);
    };

    // Open the correct tab based on URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get("type");
    const initialTab = typeParam === "epistle" ? "message" : "gospel";
    openTab(initialTab);

    // Fetch and render the full text for both sections
    fetchReadings()
      .then((readings) => {
        if (readings.gospel) {
          if (gospelLoading) gospelLoading.style.display = "none";
          if (gospelFull) {
            gospelFull.innerHTML = `
              <h3 style="color: var(--red); margin-bottom: 20px;">${readings.gospel.title}</h3>
              <div style="line-height: 2;">${readings.gospel.description}</div>
            `;
          }
        } else if (gospelLoading) {
          gospelLoading.textContent = "لا تتوفر قراءة للإنجيل اليوم.";
        }

        if (readings.epistle) {
          if (messageLoading) messageLoading.style.display = "none";
          if (messageFull) {
            messageFull.innerHTML = `
              <h3 style="color: var(--red); margin-bottom: 20px;">${readings.epistle.title}</h3>
              <div style="line-height: 2;">${readings.epistle.description}</div>
            `;
          }
          if (btnMessage) {
            btnMessage.textContent = getEpistleTitle(readings.epistle.category);
          }
        } else {
          if (messageLoading) {
            messageLoading.textContent = "لا تتوفر رسالة أو تأمل اليوم.";
          }
          if (btnMessage) btnMessage.style.display = "none";
        }
      })
      .catch((err) => {
        console.error("Error fetching RSS:", err);
        const errorMsg = "حدث خطأ في تحميل القراءات. يرجى المحاولة لاحقًا.";
        if (gospelLoading) gospelLoading.textContent = errorMsg;
        if (messageLoading) messageLoading.textContent = errorMsg;
      });
  }

  // Initialize once the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", function () {
    initIndexPage();
    initReadingsPage();
  });
})();
