(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileQuery = window.matchMedia("(max-width: 720px)");

  /* Mobile menu */
  var burger = document.querySelector(".burger");
  var overlay = document.querySelector(".menu-overlay");
  var sheet = document.getElementById("mobile-menu");

  function setMenu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    overlay.hidden = !open;
    sheet.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  }

  function isOpen() {
    return burger.getAttribute("aria-expanded") === "true";
  }

  burger.addEventListener("click", function () {
    setMenu(!isOpen());
  });

  overlay.addEventListener("click", function () {
    setMenu(false);
  });

  sheet.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) {
      setMenu(false);
      burger.focus();
    }
  });

  function onViewportChange(event) {
    if (!event.matches && isOpen()) {
      setMenu(false);
    }
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", onViewportChange);
  } else {
    mobileQuery.addListener(onViewportChange);
  }

  setMenu(false);

  /* Stat count-up, runs once when the stats enter view */
  var stats = document.querySelectorAll(".stat-value");

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function formatValue(value, decimals, suffix) {
    return value.toFixed(decimals) + suffix;
  }

  function countUp(el, index) {
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1500 + index * 80;
    var delay = 480 + index * 90;

    if (reduceMotion) {
      el.textContent = formatValue(target, decimals, suffix);
      return;
    }

    el.textContent = formatValue(0, decimals, suffix);

    setTimeout(function () {
      var start = null;
      function frame(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var value = target * easeOutCubic(progress);
        el.textContent = formatValue(value, decimals, suffix);
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = formatValue(target, decimals, suffix);
        }
      }
      requestAnimationFrame(frame);
    }, delay);
  }

  var statsContainer = document.querySelector(".stats");

  if ("IntersectionObserver" in window && statsContainer) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        stats.forEach(function (el, i) {
          countUp(el, i);
        });
        obs.disconnect();
      });
    }, { threshold: 0.25 });

    observer.observe(statsContainer);
  } else {
    stats.forEach(function (el, i) {
      countUp(el, i);
    });
  }
})();
