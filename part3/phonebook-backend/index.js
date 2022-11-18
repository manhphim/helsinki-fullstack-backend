const express = require('express');
const app = express();
const morgan = require('morgan');
require('dotenv').config();
const Person = require('./models/person');

const cors = require('cors');
// const corsOptions = {
// 	origin: 'http://localhost:3000',
// 	credentials: true, //access-control-allow-credentials:true
// 	optionSuccessStatus: 200,
// };

const morganFormat = (tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    JSON.stringify(req.body),
    tokens.date(req, res),
  ].join(' ');
};

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(express.json());

app.use(cors());

app.use(morgan(morganFormat));

app.use(express.static('build'));

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  const id = Number(request.params.id);
  Person.findById(id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => {
      next(error);
    });
});

app.get('/info', (request, response) => {
  const date = new Date();
  Person.find({}).then((persons) => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`
    );
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  Person.find({ name: body.name })
    .then((result) => {
      if (result.length > 0) {
        return response.status(400).json({
          error: 'name must be unique',
        });
      } else {
        const person = new Person({
          name: body.name,
          number: body.number,
        });

        person
          .save()
          .then((savedPerson) => {
            response.json(savedPerson);
          })
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  if (!Person.findById(request.params.id)) {
    return response.status(404).json({
      error: 'person not found',
    });
  }

  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.use(errorHandler);

app.use(unknownEndpoint);

const PORT = process.env.PORT || '3001';
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
