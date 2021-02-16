const express = require('express')
const { default: httpRedis } = require('http-redis')


const app = express()
const port = 8000

app.use(express.json())

const PREFIX = 'subscriber';

const redis = httpRedis({ mode: 'regular', options: { port: 6379, host: 'localhost' } })


app.use(async (req, _, next) => {
  try {
    req.redis = await redis
    next()
  } catch (error) {
    next(error)
  }
})

app.get('/events', async (req, res, next) => {
  try {
    const { body = { data: undefined, topic: undefined }, redis } = req;
    
    const key = `${PREFIX}:${topic}`;
    
    // Not sure if this is needes
    let allPreviousMessages = JSON.parse(await redis.get(key) || '[]');

    await redis.set(key, JSON.stringify([...allPreviousMessages, body]));

    res.status(201)
    res.end(`{"success": "message ${body} successfully received."}`)
  } catch (error) {
    next(error)
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
