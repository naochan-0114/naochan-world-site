(function () {
  "use strict";

  function setCurrentYear() {
    var yearEl = document.getElementById("js-year");

    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initMenuSheet() {
    var body = document.body;
    var toggle = document.querySelector("[data-menu-toggle]");
    var closeButton = document.querySelector("[data-menu-close]");
    var panel = document.querySelector("[data-menu-panel]");
    var overlay = document.querySelector("[data-menu-overlay]");
    var menuLinks = document.querySelectorAll("[data-menu-link]");
    var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var previousActiveElement = null;
    var overlayTimer = 0;
    var isOpen = false;
    var scrollY = 0;

    if (!toggle || !closeButton || !panel || !overlay) {
      return;
    }

    function getTransitionDelay() {
      return reduceMotionQuery.matches ? 0 : 320;
    }

    function getFocusableElements() {
      return Array.prototype.filter.call(
        panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        function (element) {
          return !element.hasAttribute("disabled");
        }
      );
    }

    function lockScroll() {
      var scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      scrollY = window.pageYOffset || window.scrollY || 0;
      body.style.top = "-" + scrollY + "px";
      body.style.paddingRight = scrollBarWidth > 0 ? scrollBarWidth + "px" : "";
      body.classList.add("menu-open");
    }

    function unlockScroll() {
      body.classList.remove("menu-open");
      body.style.top = "";
      body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    }

    function focusFirstElement() {
      var focusable = getFocusableElements();
      var target = focusable.length ? focusable[0] : panel;

      window.requestAnimationFrame(function () {
        target.focus();
      });
    }

    function syncUi(open) {
      window.clearTimeout(overlayTimer);

      isOpen = open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      panel.setAttribute("aria-hidden", String(!open));
      overlay.setAttribute("aria-hidden", String(!open));
      panel.classList.toggle("is-open", open);

      if (open) {
        overlay.hidden = false;
        lockScroll();

        window.requestAnimationFrame(function () {
          overlay.classList.add("is-active");
        });
      } else {
        overlay.classList.remove("is-active");
        unlockScroll();

        overlayTimer = window.setTimeout(function () {
          if (!isOpen) {
            overlay.hidden = true;
          }
        }, getTransitionDelay());
      }
    }

    function openMenu() {
      if (isOpen) {
        return;
      }

      previousActiveElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : toggle;

      syncUi(true);
      focusFirstElement();
    }

    function closeMenu(options) {
      var shouldRestoreFocus = !options || options.restoreFocus !== false;

      if (!isOpen) {
        return;
      }

      syncUi(false);

      if (shouldRestoreFocus && previousActiveElement && typeof previousActiveElement.focus === "function") {
        previousActiveElement.focus();
      }
    }

    function onDocumentKeydown(event) {
      var focusable;
      var first;
      var last;

      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      focusable = getFocusableElements();

      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }

      first = focusable[0];
      last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    overlay.classList.remove("is-active");
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");

    toggle.addEventListener("click", function () {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    closeButton.addEventListener("click", function () {
      closeMenu();
    });

    overlay.addEventListener("click", function () {
      closeMenu();
    });

    Array.prototype.forEach.call(menuLinks, function (link) {
      link.addEventListener("click", function () {
        closeMenu({ restoreFocus: false });
      });
    });

    document.addEventListener("keydown", onDocumentKeydown);
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
  initMenuSheet();
  initSmoothAnchorScroll();
})();
