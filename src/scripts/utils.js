/**
 * Utilities for data loading and DOM helpers.
 * No global state; all functions are pure or take explicit inputs.
 */

(function () {
  "use strict";

  window.SiteUtils = {
    /**
     * Fetch JSON from a URL. Returns a Promise that resolves to the parsed object.
     * @param {string} url - Relative or absolute URL to the JSON file
     * @returns {Promise<object>}
     */
    fetchJSON: function (url) {
      return fetch(url).then(function (res) {
        if (!res.ok) throw new Error("Fetch failed: " + res.status);
        return res.json();
      });
    },

    /**
     * Escape HTML special characters for safe text insertion.
     * @param {string} text
     * @returns {string}
     */
    escapeHtml: function (text) {
      if (text == null) return "";
      var div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

  };
})();
