const bufferContainers = document.querySelectorAll('.buffer-container');

const observerOptions = {
  root: null, // Use the viewport as the root
  threshold: 0.2, // Trigger when 20% of the container is visible
};

const observer2 = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, observerOptions);

bufferContainers.forEach(container => {
  observer2.observe(container);
});
