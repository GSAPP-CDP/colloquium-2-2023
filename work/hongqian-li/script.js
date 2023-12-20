document.getElementById('myVideo').addEventListener('mouseover', function() {
    this.style.transform = "scale(1.95)";
    this.parentNode.style.marginBottom = this.offsetHeight * 0.98 + 'px'; 
});

document.getElementById('myVideo').addEventListener('mouseout', function() {
    this.style.transform = "scale(1)";
    this.parentNode.style.marginBottom = '0px'; 
});
