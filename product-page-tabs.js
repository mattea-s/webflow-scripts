document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".af-lt-var-op");
  console.log(toggleButtons);
  const contentWraps = document.querySelectorAll(".shop-content-wrap");
  console.log(contentWraps);
  const imgWraps = document.querySelectorAll(".af-lt-img-wrap");
  console.log(imgWraps);
  const infoWraps = document.querySelectorAll(".af-lt-info-wrap");
  console.log(infoWraps);
  const addOns = document.querySelectorAll(".af-lt-addon-wrap");
  console.log(addOns);

  contentWraps.forEach((wrap) => {
    const wrapTitle = wrap.querySelector(".wrap-title");
    console.log(wrapTitle);
    const titleText = wrapTitle.textContent.trim().replace(/\s+/g, "-");
    console.log(titleText);

    wrap.setAttribute("id", titleText + "-wrap");
  });

  addOns.forEach((addOn) => {
    const addOnTitle = addOn.querySelector(".af-lt-txt.bold");
    console.log(addOnTitle);
    const titleText = addOnTitle.textContent.trim().replace(/\s+/g, "-");
    console.log(titleText);

    addOn.setAttribute("id", titleText + "-addon");
  });

  toggleButtons.forEach((button) => {
    const buttonTitle = button.querySelector(".af-lt-sml-b");
    console.log(buttonTitle);
    const titleText = buttonTitle.textContent.trim().replace(/\s+/g, "-");
    console.log(titleText);

    button.setAttribute("id", titleText + "-button");

    const contentWrap = Array.from(contentWraps).find((item) => item.id === `${titleText}-wrap`);
    console.log(contentWrap);
    const inactiveWraps = Array.from(contentWraps).filter((item) => item.id !== `${titleText}-wrap`);
    console.log(inactiveWraps);
    const contentImgWrap = Array.from(imgWraps).find((item) => item.id === `${titleText}-img`);
    console.log(contentImgWrap);
    const inactiveImgWraps = Array.from(imgWraps).filter((item) => item.id !== `${titleText}-img`);
    console.log(inactiveImgWraps);
    const contentInfoWrap = Array.from(infoWraps).find((item) => item.id === `${titleText}-info`);
    console.log(contentInfoWrap);
    const inactiveInfoWraps = Array.from(infoWraps).filter((item) => item.id !== `${titleText}-info`);
    console.log(inactiveInfoWraps);
    const inactiveButtons = Array.from(toggleButtons).filter((item) => item.id !== `${titleText}-button`);
    console.log(inactiveButtons);
  
    button.addEventListener("click", () => {
      console.log("Button clicked");
      if (!contentWrap.classList.contains("active")) {
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
        inactiveInfoWraps.forEach((wrap) => {
          if (wrap.classList.contains("active")) {
            wrap.classList.remove("active");
          }
        });
        contentWrap.classList.add("active");
        contentImgWrap.classList.add("active");
        contentInfoWrap.classList.add("active");
      }
    
      if (!button.classList.contains("selected")) {
        button.classList.add("selected");
        const buttonTextEl = button.querySelector(".af-lt-sml-b");
        const buttonText = buttonTextEl.textContent;
        if (buttonText.includes("AE")) {
          const aeAddOn = document.getElementById("Auto-Ejection-Kit-addon");
          console.log(aeAddOn);
          aeAddOn.classList.add("hide");
        } else {
          const aeAddOn = document.getElementById("Auto-Ejection-Kit-addon");
          console.log(aeAddOn);
          aeAddOn.classList.remove("hide");
        }
        inactiveButtons.forEach((inactiveButton) => {
          if (inactiveButton.classList.contains("selected")) {
            inactiveButton.classList.remove("selected");
          }
        });
      }
    });
  });
});
