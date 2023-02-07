const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

const responseMovieObject = (movieObject) => {
  return {
    movieId: movieObject.movie_id,
    directorId: movieObject.director_id,
    movieName: movieObject.movie_name,
    leadActor: movieObject.lead_actor,
  };
};

const responseDirectorObject = (directorObject) => {
  return {
    directorId: directorObject.director_id,
    directorName: directorObject.director_name,
  };
};

//Getting all movie names

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT movie_name FROM movie;
    `;
  const movieArray = await db.all(getMovieNamesQuery);
  response.send(
    movieArray.map((eachPlayer) => responseMovieObject(eachPlayer))
  );
});

//Add a movie to the table

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const movieDetails = `
INSERT INTO movie (director_id,movie_name,lead_actor) VALUES
(${directorId},'${movieName}','${leadActor}');`;
  await db.run(movieDetails);
  response.send("Movie Successfully Added");
});

//Get a movie based on movieId

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetailsQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};
    `;
  const movieDetails = await db.get(movieDetailsQuery);
  response.send(responseMovieObject(movieDetails));
});

//Update movie details based on movie_id

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetailsQuery = `UPDATE movie SET director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
  WHERE movie_id = ${movieId};
    `;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//Delete a movie

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};
  `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get All Directors

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => responseDirectorObject(eachDirector))
  );
});

//Getting movies of specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovies = `SELECT movie_name FROM movie  
    WHERE director_id = ${directorId}`;
  const movies = await db.all(getMovies);
  response.send(
    movies.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

module.exports = app;
