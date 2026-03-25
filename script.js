document.addEventListener('DOMContentLoaded', () => {
    // Cursor simulation
    const cursor = document.querySelector('.cursor');
    const tooltip = document.querySelector('.inspector-tooltip');
    const simWindow = document.getElementById('demo-window');
    
    if (cursor && tooltip && simWindow) {
        let isHovered = false;
        
        setInterval(() => {
            if (isHovered) {
                cursor.style.top = '70%';
                cursor.style.left = '30%';
                tooltip.style.opacity = '0';
            } else {
                cursor.style.top = '40%';
                cursor.style.left = '60%';
                setTimeout(() => {
                    tooltip.style.opacity = '1';
                }, 500);
            }
            isHovered = !isHovered;
        }, 2000);
    }
});
