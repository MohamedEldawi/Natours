import axios from "axios";
import { showAlert } from "./alert.js";
const stripe = Stripe(
  `pk_test_51SnhntE5SUNREJwQjcLNKi0iVXpeTxO3X7lfNJifxHI0T86FgjPtCMkdw0Df0oygNwqxCudwvJ63C7OcZngMIgZr00emFRCS28`
);

export const getSession = async (tourId) => {
  try {
    const session = await axios.post("/api/v1/booking/checkout-session", {
      tourId,
    });
    const checkoutId = session.data.session.id;
    await stripe.redirectToCheckout({
      sessionId: checkoutId,
    });
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
