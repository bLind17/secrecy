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
        document.body.setAttribute("data-theme", "dark")
        $("#playerList").addClass("table-dark");
      }
      else
      {
        document.body.removeAttribute("data-theme");
        $("#playerList").removeClass("table-dark");
      }
    }
    function resetTheme() {
      if (darkSwitch.checked) {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("darkSwitch", "dark");
        $("#playerList").addClass("table-dark");
      } else {
        document.body.removeAttribute("data-theme");
        localStorage.removeItem("darkSwitch");
        $("#playerList").removeClass("table-dark");
      }
    }
  }
})();
