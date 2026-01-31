/**
 * Main page behavior: load data, render sections, modals, skill interactions.
 * No global variables; runs on DOMContentLoaded.
 */

(function () {
  "use strict";

  var script = document.currentScript;
  var DATA_BASE = (function () {
    if (script && script.src) {
      return script.src.replace(/\/scripts\/[^/]*\.js$/i, "/data/");
    }
    return "../data/";
  })();
  var BASE_PATH = (function () {
    if (!script || !script.src) return "";
    try {
      var pathname = new URL(script.src).pathname;
      var idx = pathname.indexOf("/src/");
      return idx !== -1 ? pathname.slice(0, idx) : "";
    } catch (e) {
      return "";
    }
  })();
  var skillsData = null;
  var experiencesData = null;
  var booksData = null;
  var contactData = null;
  var imagesData = null;
  var aboutData = null;

  function getEl(id) {
    return document.getElementById(id);
  }

  function resolveUrl(url) {
    if (!url || typeof url !== "string") return url;
    if (url.indexOf("http") === 0 || url.indexOf("data:") === 0) return url;
    var path = url.indexOf("/") === 0 ? url : "/" + url;
    return BASE_PATH + path;
  }

  function setFooterYear() {
    var el = getEl("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function loadAllData() {
    var Utils = window.SiteUtils;
    var cacheBust = "?t=" + (typeof Date.now === "function" ? Date.now() : "");
    return Promise.all([
      Utils.fetchJSON(DATA_BASE + "skills.json" + cacheBust),
      Utils.fetchJSON(DATA_BASE + "experiences.json" + cacheBust),
      Utils.fetchJSON(DATA_BASE + "books.json" + cacheBust),
      Utils.fetchJSON(DATA_BASE + "contact.json" + cacheBust),
      Utils.fetchJSON(DATA_BASE + "images.json" + cacheBust),
      Utils.fetchJSON(DATA_BASE + "about.json" + cacheBust)
    ]).then(function (results) {
      skillsData = results[0];
      experiencesData = results[1];
      booksData = results[2];
      contactData = results[3];
      imagesData = results[4];
      aboutData = results[5];
    });
  }

  function renderSkills() {
    var container = getEl("skills-container");
    if (!container || !skillsData) return;

    var categories = (skillsData.categories || []).slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });
    var categoryIds = categories.map(function (c) { return c.id; });
    var allSkills = skillsData.skills || [];

    container.innerHTML = "";
    categories.forEach(function (cat) {
      var categorySkills = allSkills.filter(function (s) {
        return s.categoryId === cat.id;
      });
      if (categorySkills.length === 0) return;

      var section = document.createElement("div");
      section.className = "skills-category";
      section.setAttribute("role", "list");
      var title = document.createElement("h3");
      title.className = "skills-category-title";
      title.textContent = cat.label || cat.id;
      section.appendChild(title);

      var list = document.createElement("ul");
      list.className = "skills-category-list";
      list.setAttribute("role", "list");
      categorySkills.forEach(function (s) {
        var li = document.createElement("li");
        li.setAttribute("role", "listitem");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "skill-tag";
        btn.textContent = s.label;
        btn.setAttribute("data-skill-id", s.id);
        btn.setAttribute("aria-label", s.label + ". View where I learned this skill.");
        li.appendChild(btn);
        list.appendChild(li);
      });
      section.appendChild(list);
      container.appendChild(section);
    });

    var uncategorized = allSkills.filter(function (s) {
      return !s.categoryId || categoryIds.indexOf(s.categoryId) === -1;
    });
    if (uncategorized.length > 0) {
      var section = document.createElement("div");
      section.className = "skills-category";
      section.setAttribute("role", "list");
      var title = document.createElement("h3");
      title.className = "skills-category-title";
      title.textContent = "Other";
      section.appendChild(title);
      var list = document.createElement("ul");
      list.className = "skills-category-list";
      list.setAttribute("role", "list");
      uncategorized.forEach(function (s) {
        var li = document.createElement("li");
        li.setAttribute("role", "listitem");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "skill-tag";
        btn.textContent = s.label;
        btn.setAttribute("data-skill-id", s.id);
        btn.setAttribute("aria-label", s.label + ". View where I learned this skill.");
        li.appendChild(btn);
        list.appendChild(li);
      });
      section.appendChild(list);
      container.appendChild(section);
    }
  }

  function getSkillLabel(id) {
    if (!skillsData || !skillsData.skills) return id;
    var s = skillsData.skills.find(function (x) { return x.id === id; });
    return s ? s.label : id;
  }

  /**
   * Parse description text: lines starting with • or - become list items; others become paragraphs.
   * Returns a document fragment (safe for insertion).
   */
  function parseDescriptionToNodes(text) {
    var fragment = document.createDocumentFragment();
    if (!text || typeof text !== "string") return fragment;
    var lines = text.split(/\n/).map(function (line) { return line.trim(); }).filter(Boolean);
    var ul = null;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var bulletMatch = line.match(/^[\u2022\-]\s*(.*)$/);
      if (bulletMatch) {
        if (!ul) {
          ul = document.createElement("ul");
          ul.className = "timeline-description-list";
        }
        var li = document.createElement("li");
        li.textContent = bulletMatch[1].trim();
        ul.appendChild(li);
      } else {
        if (ul) {
          fragment.appendChild(ul);
          ul = null;
        }
        var p = document.createElement("p");
        p.className = "timeline-description-paragraph";
        p.textContent = line;
        fragment.appendChild(p);
      }
    }
    if (ul) fragment.appendChild(ul);
    return fragment;
  }

  /**
   * Parse period string for sort key: extract years and return max (most recent).
   * E.g. "2024–2025" -> 2025, "Summer 2024" -> 2024. Descending = most recent first.
   */
  function getPeriodSortKey(period) {
    if (!period || typeof period !== "string") return 0;
    var matches = period.match(/\b(19|20)\d{2}\b/g);
    if (!matches || matches.length === 0) return 0;
    return Math.max.apply(null, matches.map(Number));
  }

  function renderExperience() {
    var timeline = getEl("experience-timeline");
    if (!timeline || !experiencesData) return;

    var experiences = (experiencesData.experiences || []).slice();
    experiences.sort(function (a, b) {
      var keyA = getPeriodSortKey(a.period);
      var keyB = getPeriodSortKey(b.period);
      return keyB - keyA;
    });

    timeline.innerHTML = "";

    experiences.forEach(function (exp, index) {
      var item = document.createElement("article");
      item.className = "timeline-item";
      item.setAttribute("role", "listitem");
      item.id = exp.id || "exp-" + Math.random().toString(36).slice(2);
      item.setAttribute("data-skill-ids", (exp.skillIds || []).join(","));
      item.setAttribute("data-side", index % 2 === 0 ? "left" : "right");
      item.style.gridRow = index + 1;

      var content = document.createElement("div");
      content.className = "timeline-item-content";

      var period = document.createElement("div");
      period.className = "timeline-period";
      period.textContent = exp.period || "";
      content.appendChild(period);

      var title = document.createElement("h3");
      title.className = "timeline-title";
      title.textContent = exp.title || "";
      content.appendChild(title);

      var org = document.createElement("div");
      org.className = "timeline-organization";
      org.textContent = exp.organization || "";
      content.appendChild(org);

      var descWrap = document.createElement("div");
      descWrap.className = "timeline-description";
      descWrap.appendChild(parseDescriptionToNodes(exp.description || ""));
      content.appendChild(descWrap);

      if (exp.skillIds && exp.skillIds.length > 0) {
        var skillsWrap = document.createElement("div");
        skillsWrap.className = "timeline-skills";
        exp.skillIds.forEach(function (sid) {
          var tag = document.createElement("span");
          tag.className = "skill-tag";
          tag.textContent = getSkillLabel(sid);
          tag.setAttribute("aria-hidden", "true");
          skillsWrap.appendChild(tag);
        });
        content.appendChild(skillsWrap);
      }

      var links = exp.links || [];
      if (links.length > 0) {
        var linksWrap = document.createElement("div");
        linksWrap.className = "timeline-links";
        links.forEach(function (link) {
          var a = document.createElement("a");
          a.href = link.href || "#";
          a.textContent = link.label || "Link";
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.setAttribute("data-type", link.type || "website");
          if (link.type === "document") {
            a.setAttribute("data-document-href", link.href || "#");
            a.addEventListener("click", handleDocumentLinkClick);
          }
          linksWrap.appendChild(a);
        });
        content.appendChild(linksWrap);
      }

      item.appendChild(content);
      timeline.appendChild(item);
    });
  }

  function handleDocumentLinkClick(e) {
    e.preventDefault();
    var href = e.currentTarget.getAttribute("data-document-href") || e.currentTarget.getAttribute("href");
    var label = e.currentTarget.textContent;
    showDocumentModal(href, label);
  }

  function applyHeroBackground() {
    var heroEl = document.querySelector(".hero-background");
    if (!heroEl || !imagesData) return;
    var heroImg = (imagesData.images || []).find(function (img) { return img.id === "hero"; });
    if (heroImg && heroImg.url) {
      heroEl.style.backgroundImage = "url(" + resolveUrl(heroImg.url) + ")";
      heroEl.style.backgroundSize = "cover";
      heroEl.style.backgroundPosition = "center";
    } else {
      heroEl.style.backgroundImage = "";
    }
  }

  function renderAbout() {
    var aboutText1 = (aboutData && aboutData.text1 != null) ? aboutData.text1 : "";
    var aboutText2 = (aboutData && aboutData.text2 != null) ? aboutData.text2 : "";
    var videoUrl = (aboutData && aboutData.videoUrl) ? aboutData.videoUrl.trim() : "";
    var images = imagesData && imagesData.images ? imagesData.images : [];
    var ids = ["about-1", "about-2"];
    ids.forEach(function (id, index) {
      var imageEl = getEl("about-image-" + (index + 1));
      if (!imageEl) return;
      imageEl.innerHTML = "";
      if (index === 1 && videoUrl) {
        var video = document.createElement("video");
        video.className = "about-video";
        video.src = resolveUrl(videoUrl);
        video.controls = true;
        video.loop = true;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = "auto";
        video.setAttribute("aria-label", "About section video");
        imageEl.appendChild(video);
      } else {
        var imgSlot = images.find(function (img) { return img.id === id; });
        var url = imgSlot && imgSlot.url ? imgSlot.url : "";
        if (url) {
          var img = document.createElement("img");
          img.src = resolveUrl(url);
          img.alt = "";
          img.className = "about-photo";
          imageEl.appendChild(img);
        } else {
          var div = document.createElement("div");
          div.className = "about-photo-placeholder";
          div.setAttribute("aria-hidden", "true");
          imageEl.appendChild(div);
        }
      }
    });
    var text1 = getEl("about-text-1");
    var text2 = getEl("about-text-2");
    if (text1) text1.textContent = aboutText1;
    if (text2) text2.textContent = aboutText2;
  }

  function renderBooks() {
    var container = getEl("books-container");
    if (!container || !booksData) return;

    var books = booksData.books || [];
    container.innerHTML = "";

    books.forEach(function (book) {
      var item = document.createElement("div");
      item.className = "book-card";
      item.setAttribute("role", "listitem");

      var title = document.createElement("div");
      title.className = "book-title";
      if (book.url) {
        var a = document.createElement("a");
        a.href = book.url;
        a.textContent = book.title;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        title.appendChild(a);
      } else {
        title.textContent = book.title;
      }
      item.appendChild(title);

      var author = document.createElement("div");
      author.className = "book-author";
      author.textContent = book.author || "";
      item.appendChild(author);

      if (book.status) {
        var status = document.createElement("span");
        status.className = "book-status";
        status.textContent = book.status;
        status.setAttribute("aria-label", "Status: " + book.status);
        item.appendChild(status);
      }
      if (book.note) {
        var note = document.createElement("div");
        note.className = "book-note";
        note.textContent = book.note;
        note.style.fontSize = "0.75rem";
        note.style.marginTop = "0.25rem";
        item.appendChild(note);
      }

      container.appendChild(item);
    });
  }

  function renderContact() {
    var container = getEl("contact-container");
    var invitationEl = getEl("contact-invitation");
    if (!contactData) return;

    var entries = (contactData.entries || []).slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });

    if (container) {
      container.innerHTML = "";
      entries.forEach(function (entry) {
        var div = document.createElement("div");
        div.className = "contact-entry";
        div.setAttribute("role", "listitem");
        var label = document.createElement("div");
        label.className = "contact-label";
        label.textContent = entry.label || "";
        div.appendChild(label);
        var value = document.createElement("div");
        value.className = "contact-value";
        if (entry.href) {
          var a = document.createElement("a");
          a.href = entry.href.indexOf("http") === 0 ? entry.href : resolveUrl(entry.href);
          a.textContent = entry.value || entry.label;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          value.appendChild(a);
        } else {
          value.textContent = entry.value || "";
        }
        div.appendChild(value);
        container.appendChild(div);
      });
    }

    if (invitationEl && contactData.invitation) {
      invitationEl.textContent = contactData.invitation;
    }
  }

  function setupResumeModal() {
    var btn = getEl("resume-download-btn");
    var modal = getEl("resume-modal");
    var downloadBtn = getEl("resume-modal-download");
    var cancelBtn = getEl("resume-modal-cancel");
    var backdrop = getEl("resume-modal-backdrop");

    function open() {
      if (modal) {
        modal.hidden = false;
        cancelBtn && cancelBtn.focus();
      }
    }

    function close() {
      if (modal) modal.hidden = true;
    }

    function doDownload() {
      var url = (contactData && contactData.resumeUrl) ? contactData.resumeUrl : "#";
      if (url && url !== "#") {
        var a = document.createElement("a");
        a.href = resolveUrl(url);
        a.download = "";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      close();
    }

    if (btn) btn.addEventListener("click", open);
    if (downloadBtn) downloadBtn.addEventListener("click", doDownload);
    if (cancelBtn) cancelBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);
  }

  var documentModalHref = null;

  function showDocumentModal(href, label) {
    documentModalHref = href;
    var modal = getEl("document-modal");
    var titleEl = document.getElementById("document-modal-title");
    var downloadLink = getEl("document-modal-download");
    if (titleEl) titleEl.textContent = "Download \"" + (label || "document") + "\"?";
    if (downloadLink) {
      downloadLink.href = href ? resolveUrl(href) : "#";
      downloadLink.download = "";
      downloadLink.target = "_blank";
      downloadLink.rel = "noopener noreferrer";
    }
    if (modal) modal.hidden = false;
    if (downloadLink) downloadLink.focus();
  }

  function setupDocumentModal() {
    var modal = getEl("document-modal");
    var cancelBtn = getEl("document-modal-cancel");
    var backdrop = getEl("document-modal-backdrop");
    var downloadLink = getEl("document-modal-download");

    function close() {
      if (modal) modal.hidden = true;
      documentModalHref = null;
    }

    if (downloadLink) {
      downloadLink.addEventListener("click", function () {
        close();
      });
    }
    if (cancelBtn) cancelBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);
  }

  /**
   * Skill → Experience: scroll to the first matching experience and highlight all that reference this skill.
   * Uses data-skill-id on the clicked skill and data-skill-ids on each timeline item (from JSON).
   */
  var HIGHLIGHT_DURATION_MS = 1500;

  function scrollToExperienceAndHighlightSkill(skillId) {
    var items = document.querySelectorAll(".timeline-item");
    var matching = [];
    items.forEach(function (item) {
      var ids = (item.getAttribute("data-skill-ids") || "").split(",").map(function (s) { return s.trim(); });
      if (ids.indexOf(skillId) !== -1) {
        matching.push(item);
        item.classList.add("highlight");
        item.setAttribute("aria-current", "true");
      } else {
        item.classList.remove("highlight");
        item.removeAttribute("aria-current");
      }
    });

    if (matching.length > 0) {
      matching[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(function () {
      items.forEach(function (item) {
        item.classList.remove("highlight");
        item.removeAttribute("aria-current");
      });
    }, HIGHLIGHT_DURATION_MS);
  }

  function setupSkillTooltipAndClick() {
    var tooltip = getEl("skill-tooltip");
    if (!tooltip) return;

    function showTooltip(e) {
      var btn = e.target.closest(".skill-tag[data-skill-id]");
      if (!btn) return;
      tooltip.textContent = "View where I learned this skill";
      tooltip.hidden = false;
      tooltip.style.left = (e.clientX + 12) + "px";
      tooltip.style.top = (e.clientY + 12) + "px";
    }

    function hideTooltip() {
      tooltip.hidden = true;
    }

    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(".skill-tag[data-skill-id]")) showTooltip(e);
      else hideTooltip();
    });
    document.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget || !e.relatedTarget.closest(".skill-tag[data-skill-id]")) hideTooltip();
    });
    document.addEventListener("mousemove", function (e) {
      if (e.target.closest(".skill-tag[data-skill-id]")) {
        tooltip.style.left = (e.clientX + 12) + "px";
        tooltip.style.top = (e.clientY + 12) + "px";
      }
    });

    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".skill-tag[data-skill-id]");
      if (!btn) return;
      e.preventDefault();
      var skillId = btn.getAttribute("data-skill-id");
      scrollToExperienceAndHighlightSkill(skillId);
    });
  }

  function init() {
    setFooterYear();
    loadAllData()
      .then(function () {
        renderSkills();
        renderExperience();
        renderAbout();
        renderBooks();
        renderContact();
        applyHeroBackground();
        setupResumeModal();
        setupDocumentModal();
        setupSkillTooltipAndClick();
      })
      .catch(function (err) {
        console.error("Failed to load data:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
