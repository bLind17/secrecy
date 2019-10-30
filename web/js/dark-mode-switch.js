(function() {
  var darkSwitch = document.getElementById("darkSwitch");
  if (darkSwitch) {
    initTheme();
    darkSwitch.addEventListener("change", function(event) {
      resetTheme();
    });
    function initTheme() {
      var darkThemeSelected =
        localStorage.getItem("darkSwitch") !== null &&
        localStorage.getItem("darkSwitch") === "dark";
      darkSwitch.checked = darkThemeSelected;
      if(darkThemeSelected)
      {
        $('#theme-sheet').attr({ href: css_folder + "bootstrap_dark.css" });
      }
      else
      {
        $('#theme-sheet').attr({ href: css_folder + "bootstrap.css" });
      }
    }
    function resetTheme() {
      if (darkSwitch.checked) {
        $('#theme-sheet').attr({ href: css_folder + "bootstrap_dark.css" });
        localStorage.setItem("darkSwitch", "dark");
      } else {
        $('#theme-sheet').attr({ href: css_folder + "bootstrap.css" });
        localStorage.removeItem("darkSwitch");
      }
    }
  }
})();
