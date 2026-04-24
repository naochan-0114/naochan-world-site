(function () {
  "use strict";

  function setCurrentYear() {
    var yearEl = document.getElementById("js-year");

    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initTopFlowMenu() {
    var body = document.body;
    var panel = document.querySelector("[data-menu-panel]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var closeButton = document.querySelector("[data-menu-close]");
    var majorItems = panel ? panel.querySelectorAll("[data-major]") : [];
    var subRows = panel ? panel.querySelectorAll("[data-subrow]") : [];
    var subRowsWrap = panel ? panel.querySelector("[data-subrows]") : null;
    var menuLinks = panel ? panel.querySelectorAll("[data-menu-link]") : [];
    var opened = false;

    if (!panel || !toggle || !closeButton || !subRowsWrap) {
      return;
    }

    function clearSubmenu() {
      Array.prototype.forEach.call(majorItems, function (item) {
        if (item.tagName === "BUTTON") {
          item.classList.remove("is-current");
          item.setAttribute("aria-expanded", "false");
        }
      });

      Array.prototype.forEach.call(subRows, function (row) {
        row.classList.remove("is-active");
      });

      subRowsWrap.classList.remove("is-visible");
    }

    function openMenu() {
      opened = true;
      body.classList.add("menu-open");
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "メニューを閉じる");
    }

    function closeMenu() {
      opened = false;
      body.classList.remove("menu-open");
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "メニューを開く");
      clearSubmenu();
    }

    function activateMajor(key) {
      var hasSubRow = false;

      Array.prototype.forEach.call(majorItems, function (item) {
        if (item.tagName === "BUTTON") {
          var isCurrent = item.getAttribute("data-major") === key;
          item.classList.toggle("is-current", isCurrent);
          item.setAttribute("aria-expanded", isCurrent ? "true" : "false");
        }
      });

      Array.prototype.forEach.call(subRows, function (row) {
        var active = row.getAttribute("data-subrow") === key;
        row.classList.toggle("is-active", active);
        hasSubRow = hasSubRow || active;
      });

      subRowsWrap.classList.toggle("is-visible", hasSubRow);
    }

    Array.prototype.forEach.call(majorItems, function (item) {
      var key = item.getAttribute("data-major");
      var hasSubRow = panel.querySelector('[data-subrow="' + key + '"]');

      if (item.tagName === "BUTTON") {
        item.addEventListener("mouseenter", function () {
          if (opened && hasSubRow) {
            activateMajor(key);
          }
        });

        item.addEventListener("click", function () {
          if (!opened) {
            openMenu();
          }

          if (hasSubRow) {
            activateMajor(key);
          }
        });
      } else {
        item.addEventListener("click", function () {
          closeMenu();
        });
      }
    });

    toggle.addEventListener("click", function () {
      if (opened) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    closeButton.addEventListener("click", function () {
      closeMenu();
    });

    Array.prototype.forEach.call(menuLinks, function (link) {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && opened) {
        closeMenu();
      }
    });
  }

  function initSmoothAnchorScroll() {
    var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    document.addEventListener("click", function (event) {
      var target = event.target;
      var link;
      var href;
      var section;
      var header;
      var offset;
      var top;

      if (!(target instanceof Element)) {
        return;
      }

      link = target.closest('a[href^="#"]');

      if (!link) {
        return;
      }

      href = link.getAttribute("href") || "";

      if (href.length < 2) {
        return;
      }

      section = document.querySelector(href);

      if (!(section instanceof HTMLElement)) {
        return;
      }

      event.preventDefault();

      header = document.querySelector(".site-header");
      offset = header instanceof HTMLElement ? header.offsetHeight + 20 : 20;
      top = section.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: reduceMotionQuery.matches ? "auto" : "smooth"
      });
    });
  }

  setCurrentYear();
  initTopFlowMenu();
  initSmoothAnchorScroll();
})();
