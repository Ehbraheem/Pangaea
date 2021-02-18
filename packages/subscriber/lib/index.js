const express = require('express')
const { default: httpRedis } = require('http-redis')


const app = express()
const port = process.env.SERVICE_PORT || 8000

app.use(express.json())

const PREFIX = 'subscriber';

const redis = httpRedis({ mode: 'regular', options: { host: process.env.REDIS_HOST } })


app.use(async (req, _, next) => {
  try {
    req.redis = await redis
    next()
  } catch (error) {
    next(error)
  }
})

app.post('/event', async (req, res, next) => {
  try {
    const { body: { data, topic }, redis } = req;
    
    const key = `${PREFIX}:${topic}`;
    
    // Not sure if this is needed
    let allPreviousMessages = JSON.parse(await redis.get(key) || '[]');

    await redis.set(key, JSON.stringify([...allPreviousMessages, { data, topic}]));

    res.status(201)
    res.end(`{"success": "Message successfully received for topic ${topic}."}`)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
