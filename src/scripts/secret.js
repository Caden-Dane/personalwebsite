/**
 * Secret page: load JSON, CRUD for experiences/skills/books/contact, validate, download updated files.
 * No server: "Save" updates in-memory data; "Download" triggers file download for user to replace src/data/*.json.
 */

(function () {
  "use strict";

  var DATA_BASE = "../src/data/";
  var skillsData = null;
  var experiencesData = null;
  var booksData = null;
  var contactData = null;
  var imagesData = null;
  var aboutData = null;

  function getEl(id) {
    return document.getElementById(id);
  }

  function showFeedback(message, type) {
    var el = getEl("feedback");
    if (!el) return;
    el.textContent = message;
    el.className = "feedback " + (type === "error" ? "error" : "success");
    el.hidden = false;
    window.clearTimeout(el._feedbackTimeout);
    el._feedbackTimeout = window.setTimeout(function () {
      el.hidden = true;
    }, 5000);
  }

  function enableDownloadButtons() {
    var btns = document.querySelectorAll(".btn-download");
    btns.forEach(function (btn) {
      btn.disabled = false;
    });
  }

  function downloadFile(filename, data) {
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function loadAllData() {
    return Promise.all([
      fetch(DATA_BASE + "skills.json").then(function (r) {
        if (!r.ok) throw new Error("skills.json: " + r.status);
        return r.json();
      }),
      fetch(DATA_BASE + "experiences.json").then(function (r) {
        if (!r.ok) throw new Error("experiences.json: " + r.status);
        return r.json();
      }),
      fetch(DATA_BASE + "books.json").then(function (r) {
        if (!r.ok) throw new Error("books.json: " + r.status);
        return r.json();
      }),
      fetch(DATA_BASE + "contact.json").then(function (r) {
        if (!r.ok) throw new Error("contact.json: " + r.status);
        return r.json();
      }),
      fetch(DATA_BASE + "images.json").then(function (r) {
        if (!r.ok) throw new Error("images.json: " + r.status);
        return r.json();
      }),
      fetch(DATA_BASE + "about.json").then(function (r) {
        if (!r.ok) throw new Error("about.json: " + r.status);
        return r.json();
      })
    ]).then(function (results) {
      skillsData = results[0];
      experiencesData = results[1];
      booksData = results[2];
      contactData = results[3];
      imagesData = results[4];
      aboutData = results[5];
      enableDownloadButtons();
      renderAll();
    });
  }

  function renderAll() {
    renderImages();
    renderExperienceList();
    renderCategoriesAndSkills();
    renderBookList();
    renderAboutForm();
    renderContactForm();
  }

  // ——— Images ———

  function renderImages() {
    var container = getEl("images-container");
    if (!container || !imagesData) return;
    var images = imagesData.images || [];
    container.innerHTML = "";
    images.forEach(function (imgSlot) {
      var card = document.createElement("div");
      card.className = "image-slot";
      card.setAttribute("data-image-id", imgSlot.id);

      var label = document.createElement("h4");
      label.className = "image-slot-label";
      label.textContent = "Main page: " + (imgSlot.label || imgSlot.id);
      card.appendChild(label);

      var previewWrap = document.createElement("div");
      previewWrap.className = "image-preview-wrap";
      if (imgSlot.url) {
        var preview = document.createElement("img");
        preview.className = "image-preview";
        preview.src = imgSlot.url;
        preview.alt = "";
        previewWrap.appendChild(preview);
      } else {
        var noImg = document.createElement("span");
        noImg.className = "image-no-preview";
        noImg.textContent = "No image";
        previewWrap.appendChild(noImg);
      }
      card.appendChild(previewWrap);

      var dropZone = document.createElement("div");
      dropZone.className = "image-drop-zone";
      dropZone.setAttribute("data-image-id", imgSlot.id);
      dropZone.textContent = "Drag and drop image here";
      dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("image-drop-zone--over");
      });
      dropZone.addEventListener("dragleave", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("image-drop-zone--over");
      });
      dropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("image-drop-zone--over");
        var files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;
        var file = files[0];
        if (!file.type.match(/^image\//)) {
          showFeedback("Please drop an image file (e.g. JPEG, PNG).", "error");
          return;
        }
        var reader = new FileReader();
        reader.onload = function (ev) {
          var dataUrl = ev.target && ev.target.result;
          if (!dataUrl) return;
          var id = dropZone.getAttribute("data-image-id");
          var slot = (imagesData.images || []).find(function (img) { return img.id === id; });
          if (slot) {
            slot.url = dataUrl;
            renderImages();
            showFeedback("Image updated. Download images.json to apply.", "success");
          }
        };
        reader.readAsDataURL(file);
      });
      card.appendChild(dropZone);

      var actions = document.createElement("div");
      actions.className = "image-slot-actions";
      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-danger btn-small";
      deleteBtn.textContent = "Delete image";
      deleteBtn.addEventListener("click", function () {
        var slot = (imagesData.images || []).find(function (img) { return img.id === imgSlot.id; });
        if (slot) {
          slot.url = "";
          renderImages();
          showFeedback("Image removed. Download images.json to apply.", "success");
        }
      });
      actions.appendChild(deleteBtn);
      card.appendChild(actions);

      container.appendChild(card);
    });
  }

  // ——— Experiences ———

  function getSkillIds() {
    return (skillsData && skillsData.skills) ? skillsData.skills.map(function (s) { return s.id; }) : [];
  }

  function getCategoryIds() {
    return (skillsData && skillsData.categories) ? skillsData.categories.map(function (c) { return c.id; }) : [];
  }

  function renderExperienceSkillsCheckboxes(selectedIds) {
    var container = getEl("experience-skills-checkboxes");
    if (!container || !skillsData) return;
    selectedIds = selectedIds || [];
    container.innerHTML = "";
    var categories = (skillsData.categories || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    categories.forEach(function (cat) {
      var skills = (skillsData.skills || []).filter(function (s) { return s.categoryId === cat.id; });
      if (skills.length === 0) return;
      skills.forEach(function (s) {
        var label = document.createElement("label");
        var input = document.createElement("input");
        input.type = "checkbox";
        input.name = "skill-" + s.id;
        input.value = s.id;
        input.checked = selectedIds.indexOf(s.id) !== -1;
        label.appendChild(input);
        label.appendChild(document.createTextNode(s.label));
        container.appendChild(label);
      });
    });
  }

  function getExperienceFormSkillIds() {
    var container = getEl("experience-skills-checkboxes");
    if (!container) return [];
    var checked = container.querySelectorAll("input[type=checkbox]:checked");
    return Array.prototype.map.call(checked, function (el) { return el.value; });
  }

  function renderExperienceLinksForm(links) {
    var container = getEl("experience-links-container");
    if (!container) return;
    links = links || [];
    container.innerHTML = "";
    links.forEach(function (link) {
      addExperienceLinkRow(link.label || "", link.href || "", link.type || "website");
    });
  }

  function addExperienceLinkRow(label, href, type) {
    var container = getEl("experience-links-container");
    if (!container) return;
    var row = document.createElement("div");
    row.className = "link-row";
    var labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.placeholder = "Label";
    labelInput.value = label;
    var hrefInput = document.createElement("input");
    hrefInput.type = "url";
    hrefInput.placeholder = "URL";
    hrefInput.value = href;
    var typeSelect = document.createElement("select");
    typeSelect.innerHTML = "<option value=\"website\">Website</option><option value=\"document\">Document</option>";
    typeSelect.value = type;
    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-small btn-danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function () {
      row.remove();
    });
    row.appendChild(labelInput);
    row.appendChild(hrefInput);
    row.appendChild(typeSelect);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }

  function getExperienceFormLinks() {
    var container = getEl("experience-links-container");
    if (!container) return [];
    var rows = container.querySelectorAll(".link-row");
    var links = [];
    rows.forEach(function (row) {
      var inputs = row.querySelectorAll("input, select");
      var label = inputs[0] ? inputs[0].value.trim() : "";
      var href = inputs[1] ? inputs[1].value.trim() : "";
      var type = inputs[2] ? inputs[2].value : "website";
      if (label || href) {
        links.push({ label: label || "Link", href: href || "#", type: type });
      }
    });
    return links;
  }

  function validateExperience(formData) {
    if (!formData.period || !formData.period.trim()) return { valid: false, message: "Period is required." };
    if (!formData.title || !formData.title.trim()) return { valid: false, message: "Title is required." };
    if (!formData.organization || !formData.organization.trim()) return { valid: false, message: "Organization is required." };
    var skillIds = getSkillIds();
    for (var i = 0; i < formData.skillIds.length; i++) {
      if (skillIds.indexOf(formData.skillIds[i]) === -1) {
        return { valid: false, message: "Invalid skill ID: " + formData.skillIds[i] + "." };
      }
    }
    return { valid: true };
  }

  function showExperienceForm(exp) {
    var container = getEl("experience-form-container");
    var titleEl = getEl("experience-form-title");
    if (!container) return;
    getEl("experience-edit-id").value = exp ? exp.id : "";
    getEl("experience-period").value = exp ? (exp.period || "") : "";
    getEl("experience-title").value = exp ? (exp.title || "") : "";
    getEl("experience-organization").value = exp ? (exp.organization || "") : "";
    getEl("experience-description").value = exp ? (exp.description || "") : "";
    renderExperienceSkillsCheckboxes(exp ? (exp.skillIds || []) : []);
    renderExperienceLinksForm(exp ? (exp.links || []) : []);
    titleEl.textContent = exp ? "Edit experience" : "New experience";
    container.hidden = false;
  }

  function hideExperienceForm() {
    var container = getEl("experience-form-container");
    if (container) container.hidden = true;
  }

  function saveExperience(e) {
    e.preventDefault();
    var editId = getEl("experience-edit-id").value.trim();
    var period = getEl("experience-period").value.trim();
    var title = getEl("experience-title").value.trim();
    var organization = getEl("experience-organization").value.trim();
    var description = getEl("experience-description").value.trim();
    var skillIds = getExperienceFormSkillIds();
    var links = getExperienceFormLinks();
    var result = validateExperience({
      period: period,
      title: title,
      organization: organization,
      skillIds: skillIds
    });
    if (!result.valid) {
      showFeedback(result.message, "error");
      return;
    }
    var experiences = experiencesData.experiences || [];
    if (editId) {
      var idx = experiences.findIndex(function (x) { return x.id === editId; });
      if (idx !== -1) {
        experiences[idx] = {
          id: editId,
          period: period,
          title: title,
          organization: organization,
          description: description,
          skillIds: skillIds,
          links: links
        };
      }
    } else {
      var newId = "exp-" + (experiences.length + 1);
      experiences.push({
        id: newId,
        period: period,
        title: title,
        organization: organization,
        description: description,
        skillIds: skillIds,
        links: links
      });
    }
    experiencesData.experiences = experiences;
    renderExperienceList();
    hideExperienceForm();
    showFeedback("Experience saved. Download experiences.json to apply.", "success");
  }

  function deleteExperience(id) {
    if (!window.confirm("Delete this experience?")) return;
    experiencesData.experiences = (experiencesData.experiences || []).filter(function (x) { return x.id !== id; });
    renderExperienceList();
    showFeedback("Experience deleted. Download experiences.json to apply.", "success");
  }

  function renderExperienceList() {
    var list = getEl("experience-list");
    if (!list || !experiencesData) return;
    var experiences = experiencesData.experiences || [];
    list.innerHTML = "";
    experiences.forEach(function (exp) {
      var li = document.createElement("li");
      li.innerHTML = "<span class=\"item-summary\"><strong>" + escapeHtml(exp.title) + "</strong> — " + escapeHtml(exp.organization) + " (" + escapeHtml(exp.period) + ")</span>";
      var actions = document.createElement("div");
      actions.className = "item-actions";
      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-secondary btn-small";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", function () { showExperienceForm(exp); });
      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-danger btn-small";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", function () { deleteExperience(exp.id); });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  function escapeHtml(text) {
    if (text == null) return "";
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ——— Skills (categories + skills) ———

  function validateCategory(data) {
    var id = (data.id || "").trim().toLowerCase().replace(/\s+/g, "-");
    if (!id) return { valid: false, message: "Category ID is required." };
    if (!/^[a-z0-9-]+$/.test(id)) return { valid: false, message: "Category ID must be lowercase letters, numbers, hyphens only." };
    var categories = skillsData.categories || [];
    var existing = categories.find(function (c) { return c.id === id; });
    if (existing && data.editId !== id) return { valid: false, message: "Category ID already exists." };
    return { valid: true, id: id };
  }

  function validateSkill(data) {
    var id = (data.id || "").trim().toLowerCase().replace(/\s+/g, "-");
    if (!id) return { valid: false, message: "Skill ID is required." };
    if (!/^[a-z0-9-]+$/.test(id)) return { valid: false, message: "Skill ID must be lowercase letters, numbers, hyphens only." };
    var skills = skillsData.skills || [];
    var existing = skills.find(function (s) { return s.id === id; });
    if (existing && data.editId !== id) return { valid: false, message: "Skill ID already exists." };
    var catIds = getCategoryIds();
    if (catIds.indexOf(data.categoryId) === -1) return { valid: false, message: "Select a valid category." };
    return { valid: true, id: id };
  }

  function showCategoryForm(cat) {
    var container = getEl("category-form-container");
    if (!container) return;
    getEl("category-edit-id").value = cat ? cat.id : "";
    getEl("category-id").value = cat ? cat.id : "";
    getEl("category-id").readOnly = !!cat;
    getEl("category-label").value = cat ? (cat.label || "") : "";
    getEl("category-order").value = cat ? (cat.order !== undefined ? cat.order : 0) : (skillsData.categories ? skillsData.categories.length : 0);
    container.hidden = false;
  }

  function hideCategoryForm() {
    var container = getEl("category-form-container");
    if (container) container.hidden = true;
    getEl("category-id").readOnly = false;
  }

  function showSkillForm(skill) {
    var container = getEl("skill-form-container");
    if (!container) return;
    var select = getEl("skill-category");
    select.innerHTML = "";
    (skillsData.categories || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }).forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.label || c.id;
      select.appendChild(opt);
    });
    getEl("skill-edit-id").value = skill ? skill.id : "";
    getEl("skill-id").value = skill ? skill.id : "";
    getEl("skill-id").readOnly = !!skill;
    getEl("skill-label").value = skill ? (skill.label || "") : "";
    getEl("skill-category").value = skill ? (skill.categoryId || "") : (select.options[0] ? select.options[0].value : "");
    container.hidden = false;
  }

  function hideSkillForm() {
    var container = getEl("skill-form-container");
    if (container) container.hidden = true;
    getEl("skill-id").readOnly = false;
  }

  function saveCategory(e) {
    e.preventDefault();
    var editId = getEl("category-edit-id").value.trim();
    var id = getEl("category-id").value.trim().toLowerCase().replace(/\s+/g, "-");
    var label = getEl("category-label").value.trim();
    var order = parseInt(getEl("category-order").value, 10) || 0;
    var result = validateCategory({ id: id, label: label, editId: editId });
    if (!result.valid) {
      showFeedback(result.message, "error");
      return;
    }
    id = result.id;
    var categories = skillsData.categories || [];
    var idx = categories.findIndex(function (c) { return c.id === (editId || id); });
    if (idx !== -1) {
      categories[idx] = { id: id, label: label, order: order };
    } else {
      categories.push({ id: id, label: label, order: order });
      categories.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    }
    skillsData.categories = categories;
    renderCategoriesAndSkills();
    hideCategoryForm();
    showFeedback("Category saved. Download skills.json to apply.", "success");
  }

  function saveSkill(e) {
    e.preventDefault();
    var editId = getEl("skill-edit-id").value.trim();
    var id = getEl("skill-id").value.trim().toLowerCase().replace(/\s+/g, "-");
    var label = getEl("skill-label").value.trim();
    var categoryId = getEl("skill-category").value;
    var result = validateSkill({ id: id, label: label, categoryId: categoryId, editId: editId });
    if (!result.valid) {
      showFeedback(result.message, "error");
      return;
    }
    id = result.id;
    var skills = skillsData.skills || [];
    var idx = skills.findIndex(function (s) { return s.id === (editId || id); });
    if (idx !== -1) {
      skills[idx] = { id: id, label: label, categoryId: categoryId };
    } else {
      skills.push({ id: id, label: label, categoryId: categoryId });
    }
    skillsData.skills = skills;
    renderCategoriesAndSkills();
    hideSkillForm();
    showFeedback("Skill saved. Download skills.json to apply.", "success");
  }

  function deleteCategory(id) {
    var used = (skillsData.skills || []).some(function (s) { return s.categoryId === id; });
    if (used) {
      showFeedback("Cannot delete category: skills still use it. Reassign or delete those skills first.", "error");
      return;
    }
    if (!window.confirm("Delete category \"" + id + "\"?")) return;
    skillsData.categories = (skillsData.categories || []).filter(function (c) { return c.id !== id; });
    renderCategoriesAndSkills();
    showFeedback("Category deleted. Download skills.json to apply.", "success");
  }

  function deleteSkill(id) {
    if (!window.confirm("Delete skill \"" + id + "\"? Experiences referencing it will have an invalid skill ID until you fix them.")) return;
    skillsData.skills = (skillsData.skills || []).filter(function (s) { return s.id !== id; });
    renderCategoriesAndSkills();
    showFeedback("Skill deleted. Download skills.json to apply.", "success");
  }

  function renderCategoriesAndSkills() {
    var container = getEl("categories-list");
    if (!container || !skillsData) return;
    var categories = (skillsData.categories || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    container.innerHTML = "";
    categories.forEach(function (cat) {
      var block = document.createElement("div");
      block.className = "category-block";
      var h4 = document.createElement("h4");
      h4.textContent = (cat.label || cat.id) + " (id: " + cat.id + ", order: " + (cat.order !== undefined ? cat.order : 0) + ")";
      block.appendChild(h4);
      var skills = (skillsData.skills || []).filter(function (s) { return s.categoryId === cat.id; });
      var ul = document.createElement("ul");
      ul.className = "skills-in-category";
      skills.forEach(function (s) {
        var li = document.createElement("li");
        li.innerHTML = "<span class=\"item-summary\">" + escapeHtml(s.label) + " <code>" + escapeHtml(s.id) + "</code></span>";
        var actions = document.createElement("div");
        actions.className = "item-actions";
        var editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "btn btn-secondary btn-small";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", function () { showSkillForm(s); });
        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn btn-danger btn-small";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", function () { deleteSkill(s.id); });
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        li.appendChild(actions);
        ul.appendChild(li);
      });
      block.appendChild(ul);
      var catActions = document.createElement("div");
      catActions.className = "item-actions";
      catActions.style.marginTop = "0.5rem";
      var editCatBtn = document.createElement("button");
      editCatBtn.type = "button";
      editCatBtn.className = "btn btn-secondary btn-small";
      editCatBtn.textContent = "Edit category";
      editCatBtn.addEventListener("click", function () { showCategoryForm(cat); });
      var delCatBtn = document.createElement("button");
      delCatBtn.type = "button";
      delCatBtn.className = "btn btn-danger btn-small";
      delCatBtn.textContent = "Delete category";
      delCatBtn.addEventListener("click", function () { deleteCategory(cat.id); });
      catActions.appendChild(editCatBtn);
      catActions.appendChild(delCatBtn);
      block.appendChild(catActions);
      container.appendChild(block);
    });
  }

  // ——— Books ———

  function validateBook(data) {
    var id = (data.id || "").trim();
    if (!id) return { valid: false, message: "Book ID is required." };
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) return { valid: false, message: "Book ID: letters, numbers, underscore, hyphen only." };
    var books = booksData.books || [];
    var existing = books.find(function (b) { return b.id === id; });
    if (existing && data.editId !== id) return { valid: false, message: "Book ID already exists." };
    if (!data.title || !data.title.trim()) return { valid: false, message: "Title is required." };
    if (!data.author || !data.author.trim()) return { valid: false, message: "Author is required." };
    return { valid: true };
  }

  function showBookForm(book) {
    var container = getEl("book-form-container");
    if (!container) return;
    getEl("book-edit-id").value = book ? book.id : "";
    getEl("book-id").value = book ? book.id : "";
    getEl("book-id").readOnly = !!book;
    getEl("book-title").value = book ? (book.title || "") : "";
    getEl("book-author").value = book ? (book.author || "") : "";
    getEl("book-url").value = book ? (book.url || "") : "";
    getEl("book-status").value = book ? (book.status || "") : "";
    getEl("book-note").value = book ? (book.note || "") : "";
    container.hidden = false;
  }

  function hideBookForm() {
    var container = getEl("book-form-container");
    if (container) container.hidden = true;
    getEl("book-id").readOnly = false;
  }

  function saveBook(e) {
    e.preventDefault();
    var editId = getEl("book-edit-id").value.trim();
    var id = getEl("book-id").value.trim();
    var title = getEl("book-title").value.trim();
    var author = getEl("book-author").value.trim();
    var url = getEl("book-url").value.trim();
    var status = getEl("book-status").value.trim();
    var note = getEl("book-note").value.trim();
    var result = validateBook({ id: id, title: title, author: author, editId: editId });
    if (!result.valid) {
      showFeedback(result.message, "error");
      return;
    }
    var books = booksData.books || [];
    var idx = books.findIndex(function (b) { return b.id === (editId || id); });
    var entry = { id: id, title: title, author: author, url: url || "", status: status || "", note: note || "" };
    if (idx !== -1) {
      books[idx] = entry;
    } else {
      books.push(entry);
    }
    booksData.books = books;
    renderBookList();
    hideBookForm();
    showFeedback("Book saved. Download books.json to apply.", "success");
  }

  function deleteBook(id) {
    if (!window.confirm("Delete this book?")) return;
    booksData.books = (booksData.books || []).filter(function (b) { return b.id !== id; });
    renderBookList();
    showFeedback("Book deleted. Download books.json to apply.", "success");
  }

  function renderBookList() {
    var list = getEl("book-list");
    if (!list || !booksData) return;
    var books = booksData.books || [];
    list.innerHTML = "";
    books.forEach(function (book) {
      var li = document.createElement("li");
      li.innerHTML = "<span class=\"item-summary\">" + escapeHtml(book.title) + " — " + escapeHtml(book.author) + " <code>" + escapeHtml(book.id) + "</code></span>";
      var actions = document.createElement("div");
      actions.className = "item-actions";
      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-secondary btn-small";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", function () { showBookForm(book); });
      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-danger btn-small";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", function () { deleteBook(book.id); });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  // ——— About ———

  function renderAboutForm() {
    if (!aboutData) return;
    var t1 = getEl("about-text-1");
    var t2 = getEl("about-text-2");
    var videoInput = getEl("about-video-url");
    if (t1) t1.value = aboutData.text1 != null ? aboutData.text1 : "";
    if (t2) t2.value = aboutData.text2 != null ? aboutData.text2 : "";
    if (videoInput) videoInput.value = aboutData.videoUrl != null ? aboutData.videoUrl : "";
  }

  function saveAbout(e) {
    e.preventDefault();
    aboutData.text1 = (getEl("about-text-1") && getEl("about-text-1").value) || "";
    aboutData.text2 = (getEl("about-text-2") && getEl("about-text-2").value) || "";
    aboutData.videoUrl = (getEl("about-video-url") && getEl("about-video-url").value.trim()) || "";
    showFeedback("About saved. Download about.json to apply.", "success");
  }

  // ——— Contact ———

  function renderContactForm() {
    if (!contactData) return;
    getEl("contact-resume-url").value = contactData.resumeUrl || "";
    getEl("contact-invitation").value = contactData.invitation || "";
    var container = getEl("contact-entries-container");
    if (!container) return;
    container.innerHTML = "";
    var entries = (contactData.entries || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    entries.forEach(function (entry) {
      addContactEntryRow(entry.id, entry.label, entry.value, entry.href || "", entry.order !== undefined ? entry.order : 0);
    });
  }

  function addContactEntryRow(id, label, value, href, order) {
    var container = getEl("contact-entries-container");
    if (!container) return;
    var row = document.createElement("div");
    row.className = "contact-entry-row";
    var idInput = document.createElement("input");
    idInput.type = "text";
    idInput.placeholder = "id (e.g. email)";
    idInput.value = id || "";
    var labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.placeholder = "Label";
    labelInput.value = label || "";
    var valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.placeholder = "Value";
    valueInput.value = value || "";
    var hrefInput = document.createElement("input");
    hrefInput.type = "url";
    hrefInput.placeholder = "href (optional)";
    hrefInput.value = href || "";
    var orderInput = document.createElement("input");
    orderInput.type = "number";
    orderInput.min = "0";
    orderInput.placeholder = "Order";
    orderInput.value = order;
    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-small btn-danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function () {
      row.remove();
    });
    row.appendChild(idInput);
    row.appendChild(labelInput);
    row.appendChild(valueInput);
    row.appendChild(hrefInput);
    row.appendChild(orderInput);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }

  function getContactFormData() {
    var resumeUrl = getEl("contact-resume-url").value.trim();
    var invitation = getEl("contact-invitation").value.trim();
    var container = getEl("contact-entries-container");
    var rows = container ? container.querySelectorAll(".contact-entry-row") : [];
    var entries = [];
    rows.forEach(function (row, i) {
      var inputs = row.querySelectorAll("input");
      var id = inputs[0] ? inputs[0].value.trim() : "";
      var label = inputs[1] ? inputs[1].value.trim() : "";
      var value = inputs[2] ? inputs[2].value.trim() : "";
      var href = inputs[3] ? inputs[3].value.trim() : "";
      var order = inputs[4] ? (parseInt(inputs[4].value, 10) || i) : i;
      if (id && label) {
        entries.push({ id: id, label: label, value: value, href: href || undefined, order: order });
      }
    });
    entries.sort(function (a, b) { return a.order - b.order; });
    return { resumeUrl: resumeUrl, invitation: invitation, entries: entries };
  }

  function saveContact(e) {
    e.preventDefault();
    var data = getContactFormData();
    contactData.resumeUrl = data.resumeUrl;
    contactData.invitation = data.invitation;
    contactData.entries = data.entries;
    showFeedback("Contact saved. Download contact.json to apply.", "success");
  }

  // ——— Download buttons ———

  function setupDownloadButtons() {
    var btnExp = getEl("btn-download-experiences");
    var btnSkills = getEl("btn-download-skills");
    var btnBooks = getEl("btn-download-books");
    var btnContact = getEl("btn-download-contact");
    var btnImages = getEl("btn-download-images");
    if (btnExp) btnExp.addEventListener("click", function () {
      downloadFile("experiences.json", experiencesData);
      showFeedback("experiences.json downloaded. Replace src/data/experiences.json and reload the main page.", "success");
    });
    if (btnSkills) btnSkills.addEventListener("click", function () {
      downloadFile("skills.json", skillsData);
      showFeedback("skills.json downloaded. Replace src/data/skills.json and reload the main page.", "success");
    });
    if (btnBooks) btnBooks.addEventListener("click", function () {
      downloadFile("books.json", booksData);
      showFeedback("books.json downloaded. Replace src/data/books.json and reload the main page.", "success");
    });
    if (btnContact) btnContact.addEventListener("click", function () {
      downloadFile("contact.json", contactData);
      showFeedback("contact.json downloaded. Replace src/data/contact.json and reload the main page.", "success");
    });
    var btnAbout = getEl("btn-download-about");
    if (btnAbout) btnAbout.addEventListener("click", function () {
      downloadFile("about.json", aboutData);
      showFeedback("about.json downloaded. Replace src/data/about.json and reload the main page.", "success");
    });
    if (btnImages) btnImages.addEventListener("click", function () {
      downloadFile("images.json", imagesData);
      showFeedback("images.json downloaded. Replace src/data/images.json and reload the main page.", "success");
    });
  }

  // ——— Event bindings ———

  function bindEvents() {
    getEl("btn-add-experience").addEventListener("click", function () { showExperienceForm(null); });
    getEl("btn-cancel-experience").addEventListener("click", hideExperienceForm);
    getEl("form-experience").addEventListener("submit", saveExperience);
    getEl("btn-add-experience-link").addEventListener("click", function () { addExperienceLinkRow("", "", "website"); });

    getEl("btn-add-category").addEventListener("click", function () { showCategoryForm(null); });
    getEl("btn-cancel-category").addEventListener("click", hideCategoryForm);
    getEl("form-category").addEventListener("submit", saveCategory);

    getEl("btn-add-skill").addEventListener("click", function () { showSkillForm(null); });
    getEl("btn-cancel-skill").addEventListener("click", hideSkillForm);
    getEl("form-skill").addEventListener("submit", saveSkill);

    getEl("btn-add-book").addEventListener("click", function () { showBookForm(null); });
    getEl("btn-cancel-book").addEventListener("click", hideBookForm);
    getEl("form-book").addEventListener("submit", saveBook);

    getEl("form-about").addEventListener("submit", saveAbout);
    getEl("form-contact").addEventListener("submit", saveContact);
    getEl("btn-add-contact-entry").addEventListener("click", function () {
      var n = (contactData.entries || []).length;
      addContactEntryRow("", "", "", "", n);
    });

    setupDownloadButtons();
  }

  function init() {
    bindEvents();
    loadAllData().catch(function (err) {
      showFeedback("Failed to load data: " + err.message + ". Serve the site from a local server (e.g. from project root) so fetch can load src/data/*.json.", "error");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
