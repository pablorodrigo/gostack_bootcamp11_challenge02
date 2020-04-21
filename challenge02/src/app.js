const express = require("express");
const cors = require("cors");

const {uuid, isUuid} = require('uuidv4')

const app = express();

app.use(express.json());
app.use(cors());


const repositories = [];

// middlewares
function logRequests(request, response, next){
    const {method, url} = request;

    const logLabel = `[${method.toUpperCase()}] ${url}`

    console.time(logLabel);

    next();

    console.timeEnd(logLabel);
}

function validateRepositoryId(request, response, next){
    const {id} = request.params;

    if (!isUuid(id)){
        return response.status(400).json({error: 'Invalid ID'})
    }

    return next();

}

function checkRepositoryLike(request, response, next){
    const {likes} = request.body;

    if (likes){
        return response.status(400).json({likes: 0})
    }

    return next();

}

app.use(logRequests);
app.use('/repositories/:id', validateRepositoryId);

// list of repositories
app.get("/repositories", (request, response) => {
    return response.json(repositories);
});

// create new repository
app.post("/repositories", (request, response) => {
    const {title, url, techs} = request.body

    const repository = {id: uuid(), title, url, techs, likes: 0};

    repositories.push(repository);

    return response.json(repository);
});

// update a repository
app.put("/repositories/:id", checkRepositoryLike, (request, response) => {
    const {id} = request.params;
    const {title, url, techs} = request.body

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);

    if (repositoryIndex < 0) {
        return response.status(400).json({error: 'Repository not found'})
    }

    const repository = {
        id,
        title,
        url,
        techs,
    };

    repositories[repositoryIndex] = repository

    return response.json(repository)
});

// delete a repository
app.delete("/repositories/:id", (request, response) => {
    const {id} = request.params;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);

    if (repositoryIndex < 0) {
        return response.status(400).json({error: 'Repository not found'})
    }

    repositories.splice(repositoryIndex, 1)

    return response.status(204).send();
});

// update likes in a repository
app.post("/repositories/:id/like", (request, response) => {
    const {id} = request.params;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);

    if (repositoryIndex < 0) {
        return response.status(400).json({error: 'Repository not found'})
    }

    const repository = repositories[repositoryIndex];

    // increment likes
    repository.likes++;

    return response.json(repository)
});

module.exports = app;
