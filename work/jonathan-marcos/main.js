// Function to apply typewriter effect
function typewriterEffect(element, text, speed) {
    element.textContent = ''; // Clear the content
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  }
  
  // Create an intersection observer to trigger the typewriter effect when an element is in view
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetElement = entry.target;
        const text = targetElement.getAttribute('data-typewriter');
        const speed = 50; // Change speed as needed
        
        typewriterEffect(targetElement, text, speed);
        observer.unobserve(targetElement); // Unobserve after applying effect
      }
    });
  });
  
  // Observe all elements with the "typewriter" class
  const typewriterElements = document.querySelectorAll('.typewriter');
  typewriterElements.forEach(element => {
    observer.observe(element);
  });
  