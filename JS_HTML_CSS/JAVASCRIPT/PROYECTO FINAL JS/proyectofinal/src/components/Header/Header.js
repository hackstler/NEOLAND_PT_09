import { changeColorRGB } from "../../utils";
import "./Header.css";

const template = () => `
  <img
    src="https://res.cloudinary.com/dq186ej4c/image/upload/v1682679162/header_giqdug.jpg"
    alt="title hub game website (app)"
    class="logo"
  />
  <nav>
    <img
      src="https://res.cloudinary.com/dq186ej4c/image/upload/v1682684561/changeColor_tat29q.png"
      alt=" change to style mode page"
      id="changeColor"
    />
    <img
      src="https://res.cloudinary.com/dq186ej4c/image/upload/v1682685633/home_nekvs0.png"
      alt=" navigate to home app"
      id="buttonDashboard"
    />
    <img
      src="https://res.cloudinary.com/dq186ej4c/image/upload/v1682679055/logout_arz0gw.png"
      alt="logout"
      id="buttonLogout"
    />
  </nav>
`;

const listeners = () => {
  // evento del boton del cambio de color del fondo
  const changeColor = document.getElementById("changeColor");
  changeColor.addEventListener("click", () => {
    const colorRGB = changeColorRGB();
    document.body.style.background = colorRGB;
  });
};

//! ------------------------------ 3) La funcion que se exporta y que pinta
export const PrintTemplateHeader = () => {
  document.querySelector("header").innerHTML = template();
  listeners();
};
