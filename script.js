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
    var subRowsWrapper = panel ? panel.querySelector("[data-subrows]") : null;
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
      activateMajor("");
    }

    function activateMajor(key) {
      var hasActiveSubRow = false;

      Array.prototype.forEach.call(majorItems, function (item) {
        item.classList.toggle("is-current", item.getAttribute("data-major") === key);
      });

      Array.prototype.forEach.call(subRows, function (row) {
        var shouldShow = row.getAttribute("data-subrow") === key;
        row.classList.toggle("is-active", shouldShow);

        if (shouldShow) {
          hasActiveSubRow = true;
        }
      });

      if (subRowsWrapper) {
        subRowsWrapper.classList.toggle("has-subrow", hasActiveSubRow);
      }
    }

    Array.prototype.forEach.call(majorItems, function (item) {
      var key = item.getAttribute("data-major");
      var hasSubRow = panel.querySelector('[data-subrow="' + key + '"]');

      item.addEventListener("mouseenter", function () {
        if (opened && hasSubRow) {
          activateMajor(key);
        }
      });

      item.addEventListener("click", function (event) {
        if (!opened) {
          openMenu();
        }

        if (hasSubRow) {
          event.preventDefault();
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

    document.addEventListener("click", function (event) {
      if (!opened) {
        return;
      }

      if (!panel.contains(event.target) && !toggle.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && opened) {
        closeMenu();
      }
    });

    activateMajor("");
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

  function createLinkButton(label, href, kind, external) {
    var link = document.createElement("a");

    link.className = "work-link work-link--" + kind;
    link.href = href;
    link.textContent = label;
    link.setAttribute("data-card-action", "true");

    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    return link;
  }

  function isActionTarget(target) {
    return target instanceof Element && Boolean(target.closest("[data-card-action='true']"));
  }

  function makeCardNavigable(card, detailUrl, title) {
    if (!detailUrl || detailUrl === "#") {
      return;
    }

    card.classList.add("work-card--clickable");
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", title + " の作品詳細へ移動");

    card.addEventListener("click", function (event) {
      if (isActionTarget(event.target)) {
        return;
      }

      window.location.href = detailUrl;
    });

    card.addEventListener("keydown", function (event) {
      if (isActionTarget(event.target)) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = detailUrl;
      }
    });
  }

  function initWorksPage() {
    var root = document.querySelector("[data-works-root]");

    if (!root) {
      return;
    }

    var filterContainer = root.querySelector("[data-works-filter]");
    var grid = root.querySelector("[data-works-grid]");
    var source = root.getAttribute("data-source") || "./data/works.json";

    if (!filterContainer || !grid) {
      return;
    }

    fetch(source)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("作品データを読み込めませんでした。");
        }

        return response.json();
      })
      .then(function (data) {
        var categoryOrder = Array.isArray(data.categories) ? data.categories : ["すべて"];
        var works = Array.isArray(data.works) ? data.works : [];
        var activeCategory = "すべて";

        function renderFilter() {
          filterContainer.innerHTML = "";

          categoryOrder.forEach(function (category) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "works-filter__button";
            button.textContent = category;
            button.setAttribute("role", "tab");
            button.setAttribute("aria-selected", category === activeCategory ? "true" : "false");

            if (category === activeCategory) {
              button.classList.add("is-active");
            }

            button.addEventListener("click", function () {
              activeCategory = category;
              renderFilter();
              renderCards();
            });

            filterContainer.appendChild(button);
          });
        }

        function renderCards() {
          var visibleWorks = works.filter(function (item) {
            return activeCategory === "すべて" || item.category === activeCategory;
          });

          grid.innerHTML = "";

          visibleWorks.forEach(function (item) {
            var card = document.createElement("article");
            var media = document.createElement("div");
            var body = document.createElement("div");
            var labels = document.createElement("div");
            var category = document.createElement("span");
            var availability = document.createElement("span");
            var title = document.createElement("h3");
            var description = document.createElement("p");
            var tags = document.createElement("ul");
            var cardHint = document.createElement("p");
            var actions = document.createElement("div");
            var detailUrl = item.links && item.links.detail ? item.links.detail : "#";

            card.className = "work-card";
            media.className = "work-card__media";
            body.className = "work-card__body";
            labels.className = "work-card__labels";
            category.className = "work-badge work-badge--category";
            availability.className = "work-badge work-badge--availability";
            tags.className = "work-tags";
            cardHint.className = "work-card__hint";
            actions.className = "work-actions";

            if (item.thumbnail) {
              var img = document.createElement("img");
              img.src = item.thumbnail;
              img.alt = item.title + " のサムネイル";
              img.loading = "lazy";
              media.appendChild(img);
            } else {
              var fallback = document.createElement("div");
              fallback.className = "work-card__placeholder";
              fallback.innerHTML = '<span>Sky Shelf</span><strong>' + item.title + "</strong>";
              media.appendChild(fallback);
            }

            category.textContent = item.category;
            availability.textContent = item.availability;
            labels.appendChild(category);
            labels.appendChild(availability);

            title.textContent = item.title;
            description.textContent = item.description;
            cardHint.textContent = "カード全体を押すと作品詳細を開きます";

            (item.tags || []).forEach(function (tag) {
              var tagItem = document.createElement("li");
              tagItem.textContent = tag;
              tags.appendChild(tagItem);
            });

            if (item.links && item.links.vrchat) {
              actions.appendChild(createLinkButton("VRChatで開く", item.links.vrchat, "vrchat", true));
            }

            if (item.links && item.links.booth) {
              actions.appendChild(createLinkButton("BOOTHで見る", item.links.booth, "booth", true));
            }

            if (item.links && item.links.download) {
              actions.appendChild(createLinkButton("ダウンロード", item.links.download, "download", false));
            }

            body.appendChild(labels);
            body.appendChild(title);
            body.appendChild(description);
            body.appendChild(tags);
            body.appendChild(cardHint);

            if (actions.children.length > 0) {
              body.appendChild(actions);
            }

            card.appendChild(media);
            card.appendChild(body);
            makeCardNavigable(card, detailUrl, item.title);
            grid.appendChild(card);
          });
        }

        renderFilter();
        renderCards();
      })
      .catch(function () {
        grid.innerHTML = '<p class="works-error">作品データの読み込みに失敗しました。時間をおいて再読み込みしてください。</p>';
      });
  }

  setCurrentYear();
  initTopFlowMenu();
  initSmoothAnchorScroll();
  initWorksPage();
})();
