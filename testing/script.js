// FAQ Accordion
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const button = item.querySelector("button");

  button.addEventListener("click", () => {
    faqItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.classList.remove("active");
        otherItem.querySelector("span").textContent = "+";
      }
    });

    item.classList.toggle("active");

    const icon = item.querySelector("span");
    icon.textContent = item.classList.contains("active") ? "−" : "+";
  });
});


// Add Product to Cart
const addButtons = document.querySelectorAll(".add-cart");

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const product =
      button.closest(".product-card").querySelector("h3").textContent;

    showToast(`${product} added to your basket!`);
  });
});


// Quote Form
const quoteForm = document.getElementById("quoteForm");

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  showToast("Thank you! Your quote request has been sent.");
  quoteForm.reset();
});


// Newsletter
const newsletterForm = document.getElementById("newsletterForm");

newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();

  showToast("Thanks for subscribing to GreenRoots!");
  newsletterForm.reset();
});


// Toast Notification
function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}


// Smooth navigation active effect
const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});