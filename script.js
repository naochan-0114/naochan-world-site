/**
 * なおちゃんの世界 — 最小のインタラクション
 * 外部ライブラリなし。詳細ページ追加時もこのファイルに肥大化させず、
 * 機能ごとに分割するなら ./js/xxx.js を増やして index で読み込む形がよい。
 */
(function () {
  "use strict";

  /** フッターの年表示（静的 HTML でもよいが、メンテを1箇所に） */
  function setCurrentYear() {
    var el = document.getElementById("js-year");
    if (el) {
      el.textContent = String(new Date().getFullYear());
    }
  }

  /**
   * 同一ページ内アンカーのスムーズスクロール
   * CSS の scroll-behavior と併用可。古い環境向けにフォールバック的に残す場合は
   * prefers-reduced-motion を見てスキップする。
   */
  function initSmoothNavScroll() {
    var nav = document.querySelector(".site-nav");
    if (!nav) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    nav.addEventListener("click", function (e) {
      var target = e.target;
      if (target.tagName !== "A") return;

      var href = target.getAttribute("href") || "";
      if (href.charAt(0) !== "#" || href.length < 2) return;

      var id = href.slice(1);
      var section = document.getElementById(id);
      if (!section) return;

      e.preventDefault();

      if (reduceMotion) {
        section.scrollIntoView();
      } else {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  setCurrentYear();
  initSmoothNavScroll();
})();
