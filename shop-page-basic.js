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
    console.log(titleText);

    wrap.setAttribute("id", titleText + "-wrap");
  });

  toggleButtons.forEach((button) => {
    const buttonTitle = button.querySelector(".af-lt-sml-b");
    console.log(buttonTitle);
    const titleText = buttonTitle.textContent.trim().replace(/\s+/g, "-");
    console.log(titleText);

    button.setAttribute("id", titleText + "-button");

    const contentWrap = Array.from(contentWraps).find((item) => item.id === `AF3D-${titleText}-wrap`);
    console.log(contentWrap);
    const inactiveWraps = Array.from(contentWraps).filter((item) => item.id !== `AF3D-${titleText}-wrap`);
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
