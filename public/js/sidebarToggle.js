function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var mainContainer = document.querySelector('.main-container');
  var toggleIcon = document.getElementById('sidebarToggleIcon');
  var backdrop = document.getElementById('sidebar-backdrop'); // Get the new backdrop

  if (!sidebar || !mainContainer || !toggleIcon || !backdrop) return;

  var isMobile = window.innerWidth <= 900;
  
  // Helper function to hide the sidebar
  function hideSidebar() {
    if (isMobile) {
      sidebar.classList.add('is-hidden');
      backdrop.style.opacity = 0;
      // Use a timeout to fully hide it AFTER the transition
      setTimeout(() => backdrop.style.display = 'none', 300);
      toggleIcon.className = 'bi bi-box-arrow-right';
    } else {
      sidebar.style.display = 'none';
      mainContainer.style.marginLeft = '0';
      toggleIcon.className = 'bi bi-box-arrow-right';
    }
  }

  // Helper function to show the sidebar
  function showSidebar() {
    if (isMobile) {
      sidebar.classList.remove('is-hidden');
      backdrop.style.display = 'block'; // Show it immediately
      // Use a timeout to apply opacity AFTER it's displayed (for transition)
      setTimeout(() => backdrop.style.opacity = 1, 10); 
      toggleIcon.className = 'bi bi-box-arrow-left';
    } else {
      sidebar.style.display = '';
      mainContainer.style.marginLeft = '300px';
      toggleIcon.className = 'bi bi-box-arrow-left';
    }
  }
  
  // Main toggle logic
  if (isMobile) {
    if (sidebar.classList.contains('is-hidden')) {
      showSidebar();
    } else {
      hideSidebar();
    }
  } else {
    // Desktop logic remains the same
    if (sidebar.style.display !== 'none') {
      hideSidebar();
    } else {
      showSidebar();
    }
  }
}

// Event Listeners for Page Load and Backdrop Click
document.addEventListener('DOMContentLoaded', function() {
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('sidebar-backdrop');
  var toggleIcon = document.getElementById('sidebarToggleIcon');

  // 1. Initial mobile state: Hide sidebar by default
  if (window.innerWidth <= 900 && sidebar) {
    sidebar.classList.add('is-hidden');
    if (toggleIcon) {
      toggleIcon.className = 'bi bi-box-arrow-right';
    }
    // Backdrop is already set to display: none in CSS, so nothing needed here.
  }

  // 2. Add click listener to the backdrop to close the sidebar
  if (backdrop) {
    backdrop.addEventListener('click', toggleSidebar);
  }
});