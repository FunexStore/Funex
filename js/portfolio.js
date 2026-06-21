// Portfolio specific logic: filtering, advanced lightbox, etc.
(function(){
  "use strict";

  // If we want to add filtering in the future, it would go here.
  console.log("Portfolio module loaded");

  // Project filtering logic (placeholder)
  const filters = document.querySelectorAll('.portfolio-filter');
  const items = document.querySelectorAll('.portfolio-item');

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      const category = filter.getAttribute('data-category');
      items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

})();
