import inquirer from "inquirer";
import { writeFile } from "fs";

//! -------------- vamos a hacer un packaghe.json custom con lo que el usuario nos responda por la terminal

let customJSON = {
  name: "",
  private: true,
  version: "",
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
  },
  dependencies: {
    react: "^18.2.0",
    "react-dom": "^18.2.0",
  },
  devDependencies: {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@vitejs/plugin-react": "^3.1.0",
    vite: "^4.1.0",
  },
};

// creamos las preguntas para que el usuario las responda y se customice el customJSON

inquirer
  .prompt([
    {
      name: "name",
      message: "Cuál es el nombre del proyecto?",
      default: "react-proyect",
    },
    {
      name: "version",
      message: "Cuál ees la versión de tu proyecto?",
      default: "0.0.1",
    },
    {
      type: "confirm",
      name: "router",
      message: "Quiere intalar react-router-dom",
    },
    {
      type: "confirm",
      name: "eslint_prettier",
      message: "Quiere intalar eslint-prettier",
    },
  ])
  .then((answer) => {
    customJSON = {
      ...customJSON,
      name: answer.name,
      version: answer.version,
      dependencies: answer.router
        ? { ...customJSON.dependencies, "react-router-dom": "^6.8.1" }
        : { ...customJSON.dependencies },

      devDependencies: answer.eslint_prettier
        ? {
            ...customJSON.devDependencies,
            eslint: "^8.34.0",
            "eslint-config-prettier": "^8.6.0",
            "eslint-plugin-import": "^2.27.5",
            "eslint-plugin-jsx-a11y": "^6.7.1",
            "eslint-plugin-prettier": "^4.2.1",
            "eslint-plugin-react": "^7.32.2",
            "eslint-plugin-simple-import-sort": "^10.0.0",
            "pre-commit": "^1.2.2",
            prettier: "^2.8.4",
          }
        : { ...customJSON.devDependencies },
      "pre-commit": answer.eslint_prettier ? "lint" : "",
    };

    console.log(customJSON);
    writeFilePackaje(customJSON);
  });

const writeFilePackaje = (data) => {
  // Pasar los datos a string

  const dataString = JSON.stringify(data);
  writeFile("custom-package.json", dataString, () => {
    console.log("Archivo escrito correctamente");
  });
};
