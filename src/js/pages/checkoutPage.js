import { getSession } from "../api/stripe.js";

// CHECKOUT
const checkoutButton = document.getElementById("book-tour");

if (checkoutButton) {
  checkoutButton.addEventListener("click", async (e) => {
    const button = e.currentTarget;
    const tourId = button.dataset.tourId;
    button.textContent = "Processing...";
    await getSession(tourId);
    button.textContent = "BOOK TOUR NOW!";
  });
}
