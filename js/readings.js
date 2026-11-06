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

  // Extracts and parses the date from the RSS item title
  function extractDateFromTitle(title) {
    if (!title) return null;
    const match = title.match(/(\d+|٠|١|٢|٣|٤|٥|٦|٧|٨|٩)+\s+(\S+)/);
    if (!match) return null;

    const dayStr = match[1];
    const monthStr = match[2];

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

  // Cleans the title to make it suitable for browser tab display
  // Removes the date part (e.g., "الأربعاء، ٤ نوفمبر : ") and verse numbers (e.g., ".33-25:14")
  function cleanTitleForBrowser(title) {
    if (!title) return "القراءات اليومية";

    let clean = title;

    // Remove the date part before the colon (e.g., "الأربعاء، ٤ نوفمبر : ")
    clean = clean.replace(/^[^:]+:\s*/, "");

    // Remove verse numbers at the end (e.g., ".33-25:14" or ".13-9:17")
    clean = clean.replace(/\s*[\.\s]\d+[\-\d:]*\s*$/, "");

    // Clean up any extra spaces
    clean = clean.trim();

    return clean || "القراءات اليومية";
  }

  // Fetches the RSS feed and filters down to today's Gospel and Meditation only
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
        const readings = { gospel: null, meditation: null };

        items.forEach((item) => {
          const category = item.querySelector("category")?.textContent?.trim();
          const title = item.querySelector("title")?.textContent?.trim();
          const description = item
            .querySelector("description")
            ?.textContent?.trim();

          const itemDate = extractDateFromTitle(title);
          if (itemDate !== todayDate) return;

          if (category === "EVANGELIUM" && !readings.gospel) {
            readings.gospel = { category, title, description };
          } else if (category === "MEDITATIO" && !readings.meditation) {
            readings.meditation = { category, title, description };
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

  // Updates Open Graph Meta Tags dynamically for better social sharing
  function updateMetaTags(gospelTitle, meditationTitle) {
    // Clean the titles for browser display
    const cleanGospelTitle = cleanTitleForBrowser(gospelTitle);
    const cleanMeditationTitle = cleanTitleForBrowser(meditationTitle);

    // Set page title - show the main reading (Gospel)
    // const pageTitle =
    //   cleanGospelTitle !== "القراءات اليومية"
    //     ? `${cleanGospelTitle} - رعية مار اسطفان`
    //     : "القراءات اليومية - رعية مار اسطفان";

    // document.title = pageTitle;

    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');

    if (ogTitle) ogTitle.setAttribute("content", pageTitle);

    if (ogDesc) {
      let descText = "";
      if (
        cleanGospelTitle !== "القراءات اليومية" &&
        cleanMeditationTitle !== "القراءات اليومية"
      ) {
        descText = `إنجيل: ${cleanGospelTitle} | تأمل: ${cleanMeditationTitle}`;
      } else if (cleanGospelTitle !== "القراءات اليومية") {
        descText = `قراءة إنجيل اليوم: ${cleanGospelTitle}`;
      } else {
        descText =
          "القراءات اليومية (الإنجيل والتأمل) من رعية مار اسطفان - البترون";
      }
      ogDesc.setAttribute("content", descText);
    }
  }

  // Populates the daily readings preview cards on the index page
  function initIndexPage() {
    const meditationCard = document.getElementById("meditation-card");
    const meditationTitle = document.getElementById("meditation-title");
    const meditationSummary = document.getElementById("meditation-summary");
    const gospelSummary = document.getElementById("gospel-summary");

    if (!meditationCard && !gospelSummary) return;

    fetchReadings()
      .then((readings) => {
        if (readings.gospel && gospelSummary) {
          const short = buildSummary(readings.gospel.description, 130);
          gospelSummary.innerHTML = `<strong>${readings.gospel.title}</strong><br><br>${short}`;
        } else if (gospelSummary) {
          gospelSummary.textContent = "لا تتوفر قراءة للإنجيل اليوم.";
        }

        if (readings.meditation) {
          const short = buildSummary(readings.meditation.description, 130);
          if (meditationSummary) {
            meditationSummary.innerHTML = `<strong>${readings.meditation.title}</strong><br><br>${short}`;
          }
          if (meditationTitle) meditationTitle.textContent = "تأمل اليوم";
        } else {
          if (meditationCard) meditationCard.style.display = "none";
        }
      })
      .catch((err) => {
        console.error("Error fetching RSS:", err);
        const errorMsg = "حدث خطأ في تحميل القراءات.";
        if (meditationSummary) meditationSummary.textContent = errorMsg;
        if (gospelSummary) gospelSummary.textContent = errorMsg;
      });
  }

  // Handles displaying full readings content on the readings page
  function initReadingsPage() {
    const gospelLoading = document.getElementById("gospel-loading");
    const meditationLoading = document.getElementById("meditation-loading");
    const gospelFull = document.getElementById("gospel-full");
    const meditationFull = document.getElementById("meditation-full");
    const shareBtn = document.getElementById("share-btn");

    if (!gospelLoading || !meditationLoading) return;

    fetchReadings()
      .then((readings) => {
        let gTitle = "",
          mTitle = "";

        // Render Gospel
        if (readings.gospel) {
          gTitle = readings.gospel.title;
          if (gospelLoading) gospelLoading.style.display = "none";
          if (gospelFull) {
            gospelFull.innerHTML = `
              <h3><i class="fa-solid fa-book-bible"></i> ${readings.gospel.title}</h3>
              <div style="line-height: 2;">${readings.gospel.description}</div>
            `;
          }
        } else if (gospelLoading) {
          gospelLoading.textContent = "لا تتوفر قراءة للإنجيل اليوم.";
        }

        // Render Meditation
        if (readings.meditation) {
          mTitle = readings.meditation.title;
          if (meditationLoading) meditationLoading.style.display = "none";
          if (meditationFull) {
            meditationFull.innerHTML = `
              <h3><i class="fa-solid fa-hands-praying"></i> ${readings.meditation.title}</h3>
              <div style="line-height: 2;">${readings.meditation.description}</div>
            `;
          }
        } else if (meditationLoading) {
          meditationLoading.textContent = "لا يتوفر تأمل اليوم.";
        }

        // Update Meta Tags for Social Sharing once data is loaded
        updateMetaTags(gTitle, mTitle);
      })
      .catch((err) => {
        console.error("Error fetching RSS:", err);
        const errorMsg = "حدث خطأ في تحميل القراءات. يرجى المحاولة لاحقًا.";
        if (gospelLoading) gospelLoading.textContent = errorMsg;
        if (meditationLoading) meditationLoading.textContent = errorMsg;
      });

    // Share Button Logic
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        const shareData = {
          title: document.title,
          text: "القراءات اليومية (الإنجيل والتأمل) من رعية مار اسطفان - البترون",
          url: window.location.href,
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            console.log("Share canceled or failed:", err);
          }
        } else {
          try {
            await navigator.clipboard.writeText(window.location.href);
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = `<i class="fa-solid fa-check" style="margin-left: 8px;"></i> تم نسخ الرابط!`;
            shareBtn.style.background = "#28a745";
            setTimeout(() => {
              shareBtn.innerHTML = originalText;
              shareBtn.style.background = "";
            }, 2000);
          } catch (err) {
            console.error("Failed to copy:", err);
            alert("تعذر نسخ الرابط، يرجى نسخه يدوياً من شريط العنوان.");
          }
        }
      });
    }
  }

  // Initialize once the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", function () {
    initIndexPage();
    initReadingsPage();
  });
})();
