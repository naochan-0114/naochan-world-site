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
    var menuLinks = panel ? panel.querySelectorAll("[data-menu-link]") : [];
    var opened = false;

    if (!panel || !toggle || !closeButton) {
      return;
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
    }

    function activateMajor(key) {
      Array.prototype.forEach.call(majorItems, function (item) {
        if (item.tagName === "BUTTON") {
          item.classList.toggle("is-current", item.getAttribute("data-major") === key);
        }
      });

      Array.prototype.forEach.call(subRows, function (row) {
        row.classList.toggle("is-active", row.getAttribute("data-subrow") === key);
      });
    }

    Array.prototype.forEach.call(majorItems, function (item) {
      var key = item.getAttribute("data-major");
      var hasSubRow = panel.querySelector('[data-subrow="' + key + '"]');

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

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860 && opened) {
        var current = panel.querySelector(".top-flow-menu__major.is-current");
        if (current) {
          activateMajor(current.getAttribute("data-major"));
        }
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
