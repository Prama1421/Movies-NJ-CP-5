const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
const convertMovieDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
app.get('/movies/', async (request, response) => {
  const a = `
 SELECT
  movie_name
 FROM
  movie;`
  const b = await db.all(a)
  response.send(b.map(i => ({movieName: i.movie_name})))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const api2 = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        ${directorId},
         '${movieName}',
         '${leadActor}'
         );`

  await db.run(api2)

  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const api3 = `
    SELECT
     *
    FROM
     movie
    WHERE
      movie_id = ${movieId};`
  const db2 = await db.get(api3)
  response.send(convertMovieDbObjectToResponseObject(db2))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params

  const api4 = `
    UPDATE
      movie
    SET
      director_id=${directorId},
      movie_name ='${movieName}',
      lead_actor='${leadActor}'
      
    WHERE
      movie_id = ${movieId};`
  await db.run(api4)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const api5 = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`
  await db.run(api5)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const a = `
      SELECT
       *
      FROM
       director;`
  const b = await db.all(a)
  response.send(b.map(i => convertDirectorDbObjectToResponseObject(i)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const api3 = `
       SELECT
         movie_name
       FROM
        movie
       WHERE
         director_id = ${directorId};`
  const db2 = await db.all(api3)
  response.send(db2.map(i => ({movieName: i.movie_name})))
})

module.exports = app
