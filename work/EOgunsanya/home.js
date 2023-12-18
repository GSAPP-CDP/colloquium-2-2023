// This line waits for the entire HTML document to be fully loaded and parsed before running the JavaScript inside it.
document.addEventListener('DOMContentLoaded', (event) => {

    // Selects the container element (with the class 'containerhome') and stores it in the variable 'container'.
    const container = document.querySelector(".containerhome");

    // Selects the imageBelow element (with the ID 'imageBelow') and stores it in the variable 'imageBelow'.
    const imageBelow = document.getElementById("imageBelow");

    // Adds an event listener to the 'container' for the 'mousemove' event. This event is triggered whenever the mouse moves over the container.
    container.addEventListener("mousemove", (event) => {
        // Checks if the imageBelow element exists to avoid errors.
        if (imageBelow) {
            // Calculates the mouse's X and Y coordinates relative to the container.
            // 'clientX' and 'clientY' give the mouse's position within the viewport.
            // 'getBoundingClientRect()' provides the position and size of 'container'.
            const x = event.clientX - container.getBoundingClientRect().left;
            const y = event.clientY - container.getBoundingClientRect().top;

            // Applies the 'clip-path' CSS property to 'imageBelow'.
            // The clip-path here is a circle with a radius of 80px.
            // The circle is positioned at the mouse's (x, y) coordinates.
            imageBelow.style.clipPath = `circle(80px at ${x}px ${y}px)`;
        }
    });

    // Adds another event listener to 'container' for the 'mouseleave' event.
    // This event is triggered when the mouse pointer leaves the container.
    container.addEventListener("mouseleave", () => {
        // Again checks if 'imageBelow' exists.
        if (imageBelow) {
            // Resets the 'clip-path' property, effectively hiding 'imageBelow' again.
            // The circle radius is set to 0, so nothing is visible (it's like having no clip-path).
            imageBelow.style.clipPath = "circle(0 at 50% 50%)";
        }
    });
});

// Function to navigate to the next page
function navigateToNextPage(nextPageURL) {
    window.location.href = nextPageURL;
}

// OFF-CANVAS MENU //
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

  /* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

