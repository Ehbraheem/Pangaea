const express = require('express')
const httpRedis = require('http-redis').default
const app = express()
const port = 3000

console.log(httpRedis);

app.use(express.json())

const PREFIX = 'publisher';

const redis = httpRedis({ mode: 'regular', options: { port: 6379, host: 'localhost' } })

app.use(async (req, _, next) => {
  try {
    req.redis = await redis
    next()
  } catch (error) {
    next(error)
  }
})

app.post(/\/subscribe\/([a-zA-Z0-9-_]*)/, async (req, res, next) => {
  try {
    const { body: { url } = { url: undefined }, redis } = req;
    const { 0: topic } = req.params;

    if (!topic) {
      res.status(400)
      res.end('{"error": "Cannot subscribe to empty topic."}')
      return;
    }

    const urlCondition = !url || !/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi.test(url);

    if (urlCondition) {
      res.status(400)
      res.end('{"error": "a valid URL must be provided."}')
      return;
    }
    
    const key = `${PREFIX}:${topic}`;
    
    let previousValuesForTopic = JSON.parse(await redis.get(key) || '[]');

    console.log(previousValuesForTopic)

    await redis.set(key, JSON.stringify([...previousValuesForTopic, url]));

    res.status(201)
    res.end(`{"success": "Subscription to topic ${topic} is successful"}`)
  } catch (error) {
    next(error)
  }
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
