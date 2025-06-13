document.addEventListener("DOMContentLoaded", () => {
  const prodWraps = document.querySelectorAll(".af-lt-prod-wrap");
  
   prodWraps.forEach((wrap) => {
     const titleEl = wrap.querySelector(".af-lt-h1.listing");
     const title = titleEl.textContent.trim().replace(/\s+/g, "-");

     wrap.id = title; 
   });

  const catOpt = document.querySelectorAll(".af-lt-ctg-opt");

  catOpt.forEach((opt) => {
    opt.addEventListener("click", () => {
      const catText = opt.textContent.trim().toLowerCase();

      const catPrinters = opt.getAttribute("printers")?.toLowerCase();
      const catPType = opt.getAttribute("p-type")?.toLowerCase();
      const catProduct = opt.getAttribute("product")?.toLowerCase();

      prodWraps.forEach((wrap) => {
        const wrapPrinters = wrap.getAttribute("printers")?.toLowerCase();
        const wrapPType = wrap.getAttribute("p-type")?.toLowerCase();
        const wrapProduct = wrap.getAttribute("product")?.toLowerCase();

        let shouldShow = false;

        if (catText === "all") {
          console.log("All");
          shouldShow = true;
        } else if (catText.includes("printers")) {
          console.log(catText, catPrinters);
          shouldShow = catPrinters && wrapPrinters === catPrinters;
        } else if (catText.includes("lite") || catText.includes("pro")) {
          console.log(catText, catProduct);
          shouldShow = catProduct && wrapProduct === catProduct;
        } else {
          console.log(catText, catPType);
          shouldShow = catPType && wrapPType === catPType;
        }

        wrap.classList.toggle("hide", !shouldShow);
      });
    });
  });
});
