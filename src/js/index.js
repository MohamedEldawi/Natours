import "./pages/authPage.js";
import "./pages/addTourPage.js";
import "./pages/updateUserPage.js";
import "./pages/manageToursPage.js";
import "./pages/checkoutPage.js";
import { displayMap } from "./mapBox.js";

const mapbox = document.getElementById("map");

if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}
