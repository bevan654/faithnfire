document.addEventListener('DOMContentLoaded', function() {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function() {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? 'Close' : 'Menu';
    });
  }

  // Dropdown click toggle
  document.querySelectorAll('.nav-dropdown > a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var dropdown = link.closest('.nav-dropdown');
      var isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) dropdown.classList.add('open');
    });
  });

  // Close on outside tap/click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) closeAllDropdowns();
  });

  // Close when a sub-link is tapped (navigation will follow href)
  document.querySelectorAll('.nav-sub a').forEach(function(link) {
    link.addEventListener('click', function() {
      closeAllDropdowns();
    });
  });

  function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown.open').forEach(function(d) {
      d.classList.remove('open');
    });
  }
});
