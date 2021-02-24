const express = require('express')
const { default: httpRedis } = require('http-redis');
const pino = require('pino-http')();

const { notFound, serverError } = require('../../util')


const app = express()
const APP_PORT = process.env.SERVICE_PORT || 8000
const { REDIS_HOST, REDIS_PORT } = process.env || { REDIS_HOST: 'localhost', REDIS_PORT: 6379 }

app.use(express.json())

app.use(pino);

const PREFIX = 'subscriber';

const redis = httpRedis({ mode: 'regular', options: { host: REDIS_HOST, port: REDIS_PORT } })


app.use(async (req, _, next) => {
  try {
    req.redis = await redis
    next()
  } catch (error) {
    next(error)
  }
})

app.use(serverError)

app.post('/event', async (req, res, next) => {
  try {
    const { body: { data, topic }, redis } = req;

    const key = `${PREFIX}:${topic}`;

    // Not sure if this is needed
    let allPreviousMessages = JSON.parse(await redis.get(key) || '[]');

    await redis.set(key, JSON.stringify([...allPreviousMessages, { data, topic }]));

    res.status(201)
    res.end(`{"success": "Message successfully received for topic ${topic}."}`)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

app.all('*', notFound)

const server = app.listen(APP_PORT, () => {
  console.log(`Example app listening at http://localhost:${APP_PORT}`)
})

const cleanUp = server => () => {
  server.close(() => {
    process.exit(1);
  })
}

['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM', 'unhandledRejection'].forEach((event) => {
  process.on(event, cleanUp(server));
})
