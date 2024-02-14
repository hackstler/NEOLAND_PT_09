const Character = require("../models/Character.model");
const Comment = require("../models/Comment.model");
const Movie = require("../models/Movie.model");
const User = require("../models/User.model");

//? -------------------------------------------------------
//!--------------------- POST - CREATE --------------------
//? -------------------------------------------------------

const createMovie = async (req, res, next) => {
  console.log(req.body);
  try {
    await Movie.syncIndexes();

    // Creamos nueva instancia de Movie
    const newMovie = new Movie(req.body);

    // Guardamos ese registro en la db
    const saveMovie = await newMovie.save();

    // Si existe es que ha guardado de forma correcta --> 200
    if (saveMovie) {
      return res.status(200).json(saveMovie);
    } else {
      // Sino existe es que no se ha guardado --> 409
      return res.status(409).json("No se ha podido crear la Movie");
    }
  } catch (error) {
    return res.status(409).json({
      error: "Error en la creación de nueva Movie",
      message: error.message,
    });
  }
};

//? -------------------------------------------------------
//!--------------------- PATCH - TOGGLE --------------------
//? -------------------------------------------------------

const toggleCharacters = async (req, res, next) => {
  try {
    // cogemos el id de los params
    const { id } = req.params;

    // Recogemos los characters del body
    const { characters } = req.body; // --> esto devuelve un array de id "12343432,72369469367"
    console.log("characters", characters);

    // Buscamos la pelicula a actualizar por el id

    const movieById = await Movie.findById(id);

    // Comprobamos si esta movie existe en la db y sino lanzamos un 404
    if (movieById) {
      // Cogemos lo traido por req.body y lo convertimos en array .split(",") --> js
      // Separando las posiciones del string

      // Separamos por comas y convertimos en array
      const arrayCharacters = characters.split(","); // -> ["12343432","72369469367"]

      console.log("array characters", arrayCharacters);

      // Recorremos el array de characters que son Id para comprobar si estan en la movie (sacarlos) o sino estan (meterlos)

      // Lo metemos en una promesa debido al mapeo que es asincrono y asi no tenemos problemas
      Promise.all(
        arrayCharacters.map(async (character) => {
          console.log("character", character);
          if (movieById.characters.includes(character)) {
            // Si lo incluye hay que quitarlo ( character al array de characters de movie)
            //** LO QUITAMOS PORQUE LO INCLUYE */
            try {
              // buscamos la movie que queremos actualizar
              await Movie.findByIdAndUpdate(id, {
                // quitamos el character del array de characters
                $pull: { characters: character },
              });

              try {
                // Buscamos el character y le quitamos la pelicula
                await Character.findByIdAndUpdate(character, {
                  $pull: { movies: id },
                });
              } catch (error) {
                return res.status(409).json({
                  error: "Error al actualizar el character, quitarle la movie",
                  message: error.message,
                });
              }
            } catch (error) {
              return res.status(409).json({
                error: "Error al actualizar la movie, quitarle el character",
                message: error.message,
              });
            }
          } else {
            // Sino lo incluye lo añadimos ( character al array de characters de movie)
            //** LO AÑADIMOS */
            try {
              // actualizamos la movie añadiendole el character
              await Movie.findByIdAndUpdate(id, {
                $push: { characters: character },
              });

              try {
                // Actualizamos nuestro character metiendo en el campo de movies la movie

                await Character.findByIdAndUpdate(character, {
                  $push: { movies: id },
                });
              } catch (error) {
                return res.status(409).json({
                  error: "Error al actualizar el character, añadirle la movie",
                  message: error.message,
                });
              }
            } catch (error) {
              return res.status(409).json({
                error: "Error al actualizar la movie, al añadirle el character",
                message: error.message,
              });
            }
          }
        })
      ).then(async () => {
        return res
          .status(200)
          .json(await Movie.findById(id).populate("characters"));
      });
    } else {
      // Lanzamos un 404 porque no existe la pelicula a actualizar
      return res.status(404).json("Movie no encontrada, prueba con otro id");
    }
  } catch (error) {
    return res
      .status(409)
      .json({ error: "Error al actualizar la movie", message: error.message });
  }
};

//? -------------------------------------------------------
//!------------------------ DELETE ------------------------
//? -------------------------------------------------------

const deleteMovie = async (req, res, next) => {
  try {
    // traemos el id de la movie a borrar mediante destructuring de req.params
    const { id } = req.params;

    // Buscamos la movie por id para ver si existe
    const movieId = await Movie.findById(id);

    if (movieId) {
      // Procedemos a borrarla

      await Movie.findByIdAndDelete(id);

      // Volvemos a buscar la movie para ver si se ha borrado de forma correcta

      const existMovie = await Movie.findById(id);

      //Si esta existMovie no existe es correcto el borrado y procedemos a actualizar registros de datos

      if (!existMovie) {
        // Hacemos actualizaciones
        try {
          // actualizamos Users los que tengan en su campo de moviesFav el id de esta movie borrada
          await User.updateMany(
            { moviesFav: id },
            { $pull: { moviesFav: id } }
          );

          // Actualizamos characters que tengan en su array de movies el id de esta pelicula borrada
          await Character.updateMany({ movies: id }, { $pull: { movies: id } });

          try {
            // Borramos los comentarios que tengan en el campo de recipientMovie este id
            await Comment.deleteMany({ recipientMovie: id });

            // Debemos recorrer el array de comentarios de la movie y por cada uno actualizar a su user creador
            // actualizando borrando de su array de postedComments el id de este comentario

            Promise.all(
              movieId.comments.map(async (comment) => {
                // Por cada comentario tengo que actualizar al dueño de este comentario
                // borrando de su campo de postedComments este id del comentario

                await User.updateOne(
                  { postedComments: comment },
                  { $pull: { postedComments: comment } }
                );
              })
            ).then(async () => {
              return res.status(200).json("Movie y comentarios borrados");
            });
          } catch (error) {
            // Error en el borrado de comentarios
            return res.status(409).json({
              error: "Error al borrar los comentario de la movie",
              message: error.message,
            });
          }
        } catch (error) {
          // Error en la actualizacion de registros
          return res.status(409).json({
            error: "Error al actualizar los registros",
            message: error.message,
          });
        }
      } else {
        // Error al borrarse la movie
        return res.status(409).json({
          error: "Error al borrarse la movie",
          message: "Intentelo de nuevo",
        });
      }
    } else {
      // Error la movie no existe
      return res.status(404).json({
        error: "Error al buscar la movie",
        message: "La movie no existe",
      });
    }
  } catch (error) {
    // Error general al borrar la movie
    return res.status(409).json({
      error: "Error general al borral la movie",
      message: error.message,
    });
  }
};

module.exports = { createMovie, toggleCharacters, deleteMovie };
