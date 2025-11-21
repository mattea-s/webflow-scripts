document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".af-lt-var-op");
  console.log(toggleButtons);
  const contentWraps = document.querySelectorAll(".shop-content-wrap");
  console.log(contentWraps);
  const imgWraps = document.querySelectorAll(".af-lt-img-wrap");
  console.log(imgWraps);
  const priceEl = document.getElementById("price");
  const basePrice = parseFloat(priceEl.textContent.trim().match(/\d+(\.\d+)?/)?.[0] || 0);
  const compPriceEl = document.getElementById("compare-price");
  const compBasePrice = parseFloat(compPriceEl.textContent.trim().match(/\d+(\.\d+)?/)?.[0] || 0);

  contentWraps.forEach((wrap) => {
    const wrapTitle = wrap.querySelector(".af-lt-h1");
    console.log(wrapTitle);
    const titleText = wrapTitle.textContent.trim().replace(/\s+/g, "-");
    console.log("Title text 1:",titleText);

    wrap.removeAttribute("id");
    wrap.setAttribute("id", titleText + "-wrap");
    console.log(wrap.id);
  });

  toggleButtons.forEach((button) => {
    const buttonTitle = button.querySelector(".af-lt-sml-b");
    console.log(buttonTitle);
    const titleText = buttonTitle.textContent.trim().replace(/\s+/g, "-");
    console.log("Title text 2:", titleText);

    button.removeAttribute("id");
    button.setAttribute("id", titleText + "-button");
    console.log(button.id);

    const contentWrap = Array.from(contentWraps).find((item) => item.id === `${titleText}-wrap`);
    console.log(contentWrap);
    const inactiveWraps = Array.from(contentWraps).filter((item) => item.id !== `${titleText}-wrap`);
    console.log(inactiveWraps);
    const contentImgWrap = Array.from(imgWraps).find((item) => item.id === `${titleText}-img`);
    console.log(contentImgWrap);
    const inactiveImgWraps = Array.from(imgWraps).filter((item) => item.id !== `${titleText}-img`);
    console.log(inactiveImgWraps);
    const inactiveButtons = Array.from(toggleButtons).filter((item) => item.id !== `${titleText}-button`);
    console.log(inactiveButtons);
  
    button.addEventListener("click", () => {
      console.log("Button clicked");
      if (!contentWrap.classList.contains("active")) {
        contentWrap.classList.add("active");
        contentImgWrap.classList.add("active");
        inactiveWraps.forEach((wrap) => {
          if (wrap.classList.contains("active")) {
            wrap.classList.remove("active");
          }
        });
        inactiveImgWraps.forEach((wrap) => {
          if (wrap.classList.contains("active")) {
            wrap.classList.remove("active");
          }
        });
      }
    
      if (!button.classList.contains("selected")) {
        button.classList.add("selected");
        inactiveButtons.forEach((inactiveButton) => {
          if (inactiveButton.classList.contains("selected")) {
            inactiveButton.classList.remove("selected");
          }
        });
      }
    });
  });
});
</script>

<script>
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
