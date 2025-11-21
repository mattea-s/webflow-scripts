document.addEventListener("DOMContentLoaded", () => {
  const imgWraps = document.querySelectorAll(".af-lt-img-wrap");

  imgWraps.forEach((wrap) => {
    const optWrap = wrap.querySelector(".af-lt-img-opt-wrap");
    const imgIcons = wrap.querySelectorAll(".af-lt-img");

    imgIcons.forEach((icon) => {
      icon.addEventListener("click", () => {
        if (icon.classList.contains("active")) {
          return;
        }

        // Move currently active image (if any) back into optWrap
        const activeIcon = wrap.querySelector(".af-lt-img.active");
        if (activeIcon && optWrap && !optWrap.contains(activeIcon)) {
          optWrap.appendChild(activeIcon);
        }

        // Remove active class from all .af-lt-img elements
        wrap.querySelectorAll(".af-lt-img.active").forEach((img) => {
          img.classList.remove("active");
        });

        // Add active class to clicked image
        icon.classList.add("active");

        // Move clicked image out of optWrap (if it's inside)
        if (optWrap.contains(icon)) {
          wrap.insertBefore(icon, optWrap);
        }
      });
    });
  });
});
