(function () {
  "use strict";

  function setCurrentYear() {
    var yearEl = document.getElementById("js-year");

    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initThemeToggle() {
    var storageKey = "naochan-world-theme";
    var root = document.documentElement;
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    var currentTheme = "";

    if (!toggles.length) {
      return;
    }

    function getPreferredTheme() {
      var savedTheme = "";

      try {
        savedTheme = window.localStorage.getItem(storageKey) || "";
      } catch (error) {
        savedTheme = "";
      }

      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }

      return mediaQuery.matches ? "dark" : "light";
    }

    function setTheme(theme, persist) {
      var nextTheme = theme === "dark" ? "dark" : "light";

      currentTheme = nextTheme;
      root.setAttribute("data-theme", nextTheme);

      Array.prototype.forEach.call(toggles, function (toggle) {
        var isDark = nextTheme === "dark";

        if (toggle instanceof HTMLInputElement && toggle.type === "checkbox") {
          toggle.checked = isDark;
          toggle.setAttribute("aria-checked", isDark ? "true" : "false");
        } else {
          toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
        }

        toggle.setAttribute("aria-label", isDark ? "ライトモードに切り替える" : "ダークモードに切り替える");
        toggle.setAttribute("title", isDark ? "ライトモードに切り替える" : "ダークモードに切り替える");
      });

      if (persist) {
        try {
          window.localStorage.setItem(storageKey, nextTheme);
        } catch (error) {
          /* noop */
        }
      }
    }

    Array.prototype.forEach.call(toggles, function (toggle) {
      if (toggle instanceof HTMLInputElement && toggle.type === "checkbox") {
        toggle.addEventListener("change", function () {
          setTheme(toggle.checked ? "dark" : "light", true);
        });
      } else {
        toggle.addEventListener("click", function () {
          setTheme(currentTheme === "dark" ? "light" : "dark", true);
        });
      }
    });

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", function (event) {
        var savedTheme = "";

        try {
          savedTheme = window.localStorage.getItem(storageKey) || "";
        } catch (error) {
          savedTheme = "";
        }

        if (savedTheme === "dark" || savedTheme === "light") {
          return;
        }

        setTheme(event.matches ? "dark" : "light", false);
      });
    }

    setTheme(getPreferredTheme(), false);
  }

  function initTopFlowMenu() {
    var body = document.body;
    var panel = document.querySelector("[data-menu-panel]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var closeButton = document.querySelector("[data-menu-close]");
    var majorItems = panel ? panel.querySelectorAll("[data-major]") : [];
    var topLevelItems = panel ? panel.querySelectorAll(".top-flow-menu__major") : [];
    var subRows = panel ? panel.querySelectorAll("[data-subrow]") : [];
    var subRowsWrapper = panel ? panel.querySelector("[data-subrows]") : null;
    var menuLinks = panel ? panel.querySelectorAll("[data-menu-link]") : [];
    var opened = false;
    var subrowCloseTimer = 0;

    if (!panel || !toggle || !closeButton) {
      return;
    }

    function openMenu() {
      clearSubrowCloseTimer();
      opened = true;
      body.classList.add("menu-open");
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "メニューを閉じる");
    }

    function closeMenu() {
      clearSubrowCloseTimer();
      opened = false;
      body.classList.remove("menu-open");
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "メニューを開く");
      activateMajor("");
    }

    function clearSubrowCloseTimer() {
      window.clearTimeout(subrowCloseTimer);
      subrowCloseTimer = 0;
    }

    function scheduleDeactivateMajor() {
      clearSubrowCloseTimer();

      subrowCloseTimer = window.setTimeout(function () {
        activateMajor("");
      }, 180);
    }

    function activateMajor(key) {
      var hasActiveSubRow = false;

      clearSubrowCloseTimer();

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

    function isInsideSubMenuTarget(target, key) {
      if (!(target instanceof Element) || !key) {
        return false;
      }

      return Boolean(
        target.closest('[data-major="' + key + '"]') ||
        target.closest('[data-subrow="' + key + '"]') ||
        (subRowsWrapper && subRowsWrapper.contains(target))
      );
    }

    Array.prototype.forEach.call(topLevelItems, function (item) {
      var key = item.getAttribute("data-major");
      var hasSubRow = key ? panel.querySelector('[data-subrow="' + key + '"]') : null;

      item.addEventListener("mouseenter", function () {
        if (!opened) {
          return;
        }

        clearSubrowCloseTimer();
        activateMajor(hasSubRow ? key : "");
      });

      item.addEventListener("focus", function () {
        if (!opened) {
          return;
        }

        clearSubrowCloseTimer();
        activateMajor(hasSubRow ? key : "");
      });

      item.addEventListener("mouseleave", function (event) {
        if (opened && hasSubRow && !isInsideSubMenuTarget(event.relatedTarget, key)) {
          scheduleDeactivateMajor();
        }
      });

      item.addEventListener("click", function (event) {
        if (!opened) {
          openMenu();
        }

        if (hasSubRow) {
          event.preventDefault();
          clearSubrowCloseTimer();
          activateMajor(key);
        }
      });
    });

    Array.prototype.forEach.call(subRows, function (row) {
      var key = row.getAttribute("data-subrow");

      row.addEventListener("mouseleave", function (event) {
        if (opened && !isInsideSubMenuTarget(event.relatedTarget, key)) {
          scheduleDeactivateMajor();
        }
      });
    });

    if (subRowsWrapper) {
      subRowsWrapper.addEventListener("mouseenter", function () {
        clearSubrowCloseTimer();
      });

      subRowsWrapper.addEventListener("mouseleave", function (event) {
        if (opened && !(event.relatedTarget instanceof Element && event.relatedTarget.closest("[data-major]"))) {
          scheduleDeactivateMajor();
        }
      });
    }

    panel.addEventListener("mouseleave", function () {
      if (opened) {
        clearSubrowCloseTimer();
        activateMajor("");
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

  function initDirectLinks() {
    var links = document.querySelectorAll("[data-direct-link]");

    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener("click", function (event) {
        var href = link.getAttribute("href");

        if (!href) {
          return;
        }

        event.preventDefault();
        window.location.assign(link.href);
      });
    });
  }

  function createLinkButton(label, href, kind, external) {
    var link = document.createElement("a");

    link.className = "work-link work-link--" + kind;
    link.href = href;
    link.textContent = label;

    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    return link;
  }

  function initWorkGallerySwitch() {
    var galleries = document.querySelectorAll("[data-gallery]");

    Array.prototype.forEach.call(galleries, function (gallery) {
      var mainImage = gallery.querySelector("[data-gallery-main]");
      var thumbs = gallery.querySelectorAll("[data-gallery-thumb]");
      var thumbsContainer = gallery.querySelector("[data-gallery-thumbs]");
      var mainFrame = mainImage ? mainImage.closest(".work-gallery-switch__main") : null;
      var activeIndex = 0;

      if (!(mainImage instanceof HTMLImageElement) || thumbs.length === 0) {
        return;
      }

      function createGalleryArrow(direction, label) {
        var button = document.createElement("button");

        button.type = "button";
        button.className = "work-gallery-switch__arrow work-gallery-switch__arrow--" + direction;
        button.setAttribute("aria-label", label);
        button.textContent = direction === "prev" ? "‹" : "›";

        return button;
      }

      function activateThumb(index, focusThumb) {
        if (index < 0 || index >= thumbs.length) {
          return;
        }

        activeIndex = index;

        Array.prototype.forEach.call(thumbs, function (thumb, thumbIndex) {
          var isActive = thumbIndex === activeIndex;
          var fullSrc = thumb.getAttribute("data-full-src") || "";
          var fullAlt = thumb.getAttribute("data-full-alt") || "作品画像";

          thumb.classList.toggle("is-active", isActive);
          thumb.setAttribute("aria-selected", isActive ? "true" : "false");

          if (isActive && fullSrc) {
            mainImage.src = fullSrc;
            mainImage.alt = fullAlt;
          }
        });

        if (focusThumb) {
          thumbs[activeIndex].focus();
        }
      }

      function activateRelativeThumb(step) {
        activateThumb((activeIndex + step + thumbs.length) % thumbs.length, false);
      }

      if (mainFrame && thumbs.length > 1) {
        var prevButton = createGalleryArrow("prev", "前の画像を表示");
        var nextButton = createGalleryArrow("next", "次の画像を表示");

        prevButton.addEventListener("click", function () {
          activateRelativeThumb(-1);
        });

        nextButton.addEventListener("click", function () {
          activateRelativeThumb(1);
        });

        mainFrame.appendChild(prevButton);
        mainFrame.appendChild(nextButton);
      }

      Array.prototype.forEach.call(thumbs, function (thumb, thumbIndex) {
        thumb.addEventListener("click", function () {
          activateThumb(thumbIndex, false);
        });
      });

      if (thumbsContainer) {
        thumbsContainer.addEventListener("keydown", function (event) {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            activateThumb((activeIndex + 1) % thumbs.length, true);
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            activateThumb((activeIndex - 1 + thumbs.length) % thumbs.length, true);
          }

          if (event.key === "Home") {
            event.preventDefault();
            activateThumb(0, true);
          }

          if (event.key === "End") {
            event.preventDefault();
            activateThumb(thumbs.length - 1, true);
          }
        });
      }

      activateThumb(0, false);
    });
  }

  function initWorksPage() {
    var root = document.querySelector("[data-works-root]");

    if (!root) {
      return;
    }

    var filterContainer = root.querySelector("[data-works-filter]");
    var tagToggle = root.querySelector("[data-works-tag-toggle]");
    var tagPanel = root.querySelector("[data-works-tag-panel]");
    var tagGroupsContainer = root.querySelector("[data-works-tag-groups]");
    var tagClearButton = root.querySelector("[data-works-tag-clear]");
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
        var tagGroups = Array.isArray(data.tagGroups) ? data.tagGroups : [];
        var works = Array.isArray(data.works) ? data.works : [];
        var activeCategory = "すべて";
        var activeTags = [];

        function setTagPanelOpen(open) {
          if (!tagToggle || !tagPanel) {
            return;
          }

          tagToggle.setAttribute("aria-expanded", open ? "true" : "false");
          tagToggle.classList.toggle("is-open", open);
          tagPanel.hidden = !open;
          tagPanel.setAttribute("aria-hidden", open ? "false" : "true");
        }

        function getDefaultTagGroups() {
          var seen = {};
          var tags = [];

          works.forEach(function (item) {
            (item.tags || []).concat(item.filterTags || []).forEach(function (tag) {
              if (tag && !seen[tag]) {
                seen[tag] = true;
                tags.push(tag);
              }
            });
          });

          return tags.length ? [{ label: "タグ", tags: tags }] : [];
        }

        function getSearchableTags(item) {
          var values = [];

          if (item.category) {
            values.push(item.category);
          }

          if (item.availability) {
            values = values.concat(String(item.availability).split(/[\/／、・]/));
          }

          return values.concat(item.tags || [], item.filterTags || []).map(function (tag) {
            return String(tag).trim();
          }).filter(Boolean);
        }

        function hasAllActiveTags(item) {
          var searchableTags = getSearchableTags(item);

          return activeTags.every(function (tag) {
            return searchableTags.indexOf(tag) !== -1;
          });
        }

        function getVisibleWorks() {
          return works.filter(function (item) {
            var matchesCategory = activeCategory === "すべて" || item.category === activeCategory;

            return matchesCategory && hasAllActiveTags(item);
          });
        }

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

        function renderTagFilters() {
          var groups = tagGroups.length ? tagGroups : getDefaultTagGroups();

          if (!tagToggle || !tagPanel || !tagGroupsContainer) {
            return;
          }

          tagGroupsContainer.innerHTML = "";
          tagToggle.classList.toggle("has-active-tags", activeTags.length > 0);
          tagToggle.setAttribute(
            "aria-label",
            activeTags.length ? "タグ絞り込みを開く。選択中のタグ " + activeTags.length + "件" : "タグ絞り込みを開く"
          );

          if (tagClearButton) {
            tagClearButton.disabled = activeTags.length === 0;
          }

          groups.forEach(function (group) {
            var groupElement = document.createElement("section");
            var heading = document.createElement("h3");
            var list = document.createElement("div");

            groupElement.className = "works-tag-group";
            heading.textContent = group.label;
            list.className = "works-tag-choices";

            (group.tags || []).forEach(function (tag) {
              var button = document.createElement("button");
              var isActive = activeTags.indexOf(tag) !== -1;

              button.type = "button";
              button.className = "works-tag-choice";
              button.textContent = tag;
              button.setAttribute("aria-pressed", isActive ? "true" : "false");

              if (isActive) {
                button.classList.add("is-active");
              }

              button.addEventListener("click", function () {
                if (isActive) {
                  activeTags = activeTags.filter(function (activeTag) {
                    return activeTag !== tag;
                  });
                } else {
                  activeTags.push(tag);
                }

                renderTagFilters();
                renderCards();
              });

              list.appendChild(button);
            });

            groupElement.appendChild(heading);
            groupElement.appendChild(list);
            tagGroupsContainer.appendChild(groupElement);
          });
        }

        function renderCards() {
          var visibleWorks = getVisibleWorks();

          grid.innerHTML = "";

          if (!visibleWorks.length) {
            grid.innerHTML = '<p class="works-empty">条件に合う作品がありません。カテゴリーやタグを少しゆるめてみてください。</p>';
            return;
          }

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
            var actions = document.createElement("div");
            var detailUrl = item.links && item.links.detail ? item.links.detail : "#";

            card.className = "work-card";
            media.className = "work-card__media";
            body.className = "work-card__body";
            labels.className = "work-card__labels";
            category.className = "work-badge work-badge--category";
            availability.className = "work-badge work-badge--availability";
            tags.className = "work-tags";
            actions.className = "work-actions";

            if (item.thumbnail) {
              var img = document.createElement("img");
              img.src = item.thumbnail;
              img.alt = item.title + " のサムネイル";
              img.loading = "lazy";
              if (item.thumbnailPosition) {
                img.style.objectPosition = item.thumbnailPosition;
              }
              media.appendChild(img);
            } else {
              var fallback = document.createElement("div");
              fallback.className = "work-card__placeholder";
              fallback.innerHTML = '<span>Sample</span><strong>' + item.title + "</strong>";
              media.appendChild(fallback);
            }

            category.textContent = item.category;
            availability.textContent = item.availability;
            labels.appendChild(category);
            labels.appendChild(availability);

            title.textContent = item.title;
            description.textContent = item.description;

            (item.tags || []).forEach(function (tag) {
              var tagItem = document.createElement("li");
              tagItem.textContent = tag;
              tags.appendChild(tagItem);
            });

            if (detailUrl && detailUrl !== "#") {
              card.classList.add("work-card--clickable");
              card.setAttribute("tabindex", "0");
              card.setAttribute("role", "link");
              card.setAttribute("aria-label", item.title + " の詳細ページへ");

              card.addEventListener("click", function (event) {
                if (event.target instanceof Element && event.target.closest(".work-link")) {
                  return;
                }

                window.location.href = detailUrl;
              });

              card.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  window.location.href = detailUrl;
                }
              });
            }

            actions.appendChild(createLinkButton("詳細を見る", detailUrl, "detail", false));

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
            body.appendChild(actions);

            card.appendChild(media);
            card.appendChild(body);
            grid.appendChild(card);
          });
        }

        if (tagToggle && tagPanel) {
          tagToggle.addEventListener("click", function () {
            setTagPanelOpen(tagToggle.getAttribute("aria-expanded") !== "true");
          });
        }

        if (tagClearButton) {
          tagClearButton.addEventListener("click", function () {
            activeTags = [];
            renderTagFilters();
            renderCards();
          });
        }

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape") {
            setTagPanelOpen(false);
          }
        });

        renderFilter();
        renderTagFilters();
        renderCards();
      })
      .catch(function () {
        grid.innerHTML = '<p class="works-error">作品データの読み込みに失敗しました。時間をおいて再読み込みしてください。</p>';
      });
  }

  function resolveDataUrl(path, source) {
    if (!path || path.charAt(0) === "#" || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.charAt(0) === "/") {
      return path;
    }

    try {
      return new URL(path, new URL(source, window.location.href)).toString();
    } catch (error) {
      return path;
    }
  }

  function parseDiaryDate(dateText) {
    var timestamp = Date.parse(String(dateText || "").replace(/\./g, "-"));

    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function toDateTimeValue(dateText) {
    return String(dateText || "").replace(/\./g, "-");
  }

  function initDiaryPage() {
    var root = document.querySelector("[data-diary-root]");

    if (!root) {
      return;
    }

    var filterContainer = root.querySelector("[data-diary-filter]");
    var list = root.querySelector("[data-diary-list]");
    var sortSelect = root.querySelector("[data-diary-sort]");
    var source = root.getAttribute("data-source") || "./data/diary.json";

    if (!filterContainer || !list) {
      return;
    }

    fetch(source)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("制作日記データを読み込めませんでした。");
        }

        return response.json();
      })
      .then(function (data) {
        var filters = Array.isArray(data.filters) ? data.filters : ["すべて"];
        var articles = Array.isArray(data.articles) ? data.articles : [];
        var activeFilter = "すべて";
        var sortOrder = sortSelect ? sortSelect.value : "newest";

        function renderFilters() {
          filterContainer.innerHTML = "";

          filters.forEach(function (filter) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "diary-filter__button";
            button.textContent = filter;
            button.setAttribute("role", "tab");
            button.setAttribute("aria-selected", filter === activeFilter ? "true" : "false");

            if (filter === activeFilter) {
              button.classList.add("is-active");
            }

            button.addEventListener("click", function () {
              activeFilter = filter;
              renderFilters();
              renderArticles();
            });

            filterContainer.appendChild(button);
          });
        }

        function getVisibleArticles() {
          return articles
            .filter(function (article) {
              return activeFilter === "すべて" || (Array.isArray(article.tags) && article.tags.indexOf(activeFilter) !== -1);
            })
            .slice()
            .sort(function (a, b) {
              var diff = parseDiaryDate(b.date) - parseDiaryDate(a.date);

              return sortOrder === "oldest" ? -diff : diff;
            });
        }

        function renderArticles() {
          var visibleArticles = getVisibleArticles();

          list.innerHTML = "";

          if (visibleArticles.length === 0) {
            list.innerHTML = '<p class="diary-error">このタグの記事はまだありません。</p>';
            return;
          }

          visibleArticles.forEach(function (article) {
            var card = document.createElement("article");
            var media = document.createElement("div");
            var body = document.createElement("div");
            var meta = document.createElement("p");
            var time = document.createElement("time");
            var title = document.createElement("h3");
            var summary = document.createElement("p");
            var tags = document.createElement("ul");
            var read = document.createElement(article.detail ? "a" : "span");
            var detailUrl = article.detail ? resolveDataUrl(article.detail, source) : "";

            card.className = "diary-card";
            card.id = article.id || "";
            media.className = "diary-card__media";
            body.className = "diary-card__body";
            meta.className = "diary-card__meta";
            summary.className = "diary-card__summary";
            tags.className = "diary-card__tags";
            read.className = "diary-card__read";

            if (article.thumbnail) {
              var img = document.createElement("img");
              img.src = resolveDataUrl(article.thumbnail, source);
              img.alt = article.title + " のサムネイル";
              img.loading = "lazy";
              media.appendChild(img);
            } else {
              var placeholder = document.createElement("div");
              placeholder.className = "diary-card__placeholder";
              placeholder.textContent = "Diary";
              media.appendChild(placeholder);
            }

            time.dateTime = toDateTimeValue(article.date);
            time.textContent = article.date;
            meta.appendChild(time);

            title.textContent = article.title;
            summary.textContent = article.summary;

            (article.tags || []).forEach(function (tag) {
              var tagItem = document.createElement("li");
              tagItem.textContent = tag;
              tags.appendChild(tagItem);
            });

            if (detailUrl) {
              card.classList.add("diary-card--clickable");
              card.setAttribute("tabindex", "0");
              card.setAttribute("role", "link");
              card.setAttribute("aria-label", article.title + " を読む");
              read.href = detailUrl;
              read.textContent = "読む";

              card.addEventListener("click", function (event) {
                if (event.target instanceof Element && event.target.closest("a")) {
                  return;
                }

                window.location.href = detailUrl;
              });

              card.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  window.location.href = detailUrl;
                }
              });
            } else {
              read = null;
            }

            body.appendChild(meta);
            body.appendChild(title);
            body.appendChild(summary);
            body.appendChild(tags);

            if (read) {
              body.appendChild(read);
            }

            card.appendChild(media);
            card.appendChild(body);
            list.appendChild(card);
          });
        }

        if (sortSelect) {
          sortSelect.addEventListener("change", function () {
            sortOrder = sortSelect.value;
            renderArticles();
          });
        }

        renderFilters();
        renderArticles();
      })
      .catch(function () {
        list.innerHTML = '<p class="diary-error">制作日記データの読み込みに失敗しました。時間をおいて再読み込みしてください。</p>';
      });
  }

  setCurrentYear();
  initThemeToggle();
  initTopFlowMenu();
  initSmoothAnchorScroll();
  initDirectLinks();
  initWorkGallerySwitch();
  initWorksPage();
  initDiaryPage();
})();
