const express = require('express')
const httpRedis = require('http-redis').default
const { request } = require('http');


const app = express()
const port = process.env.SERVICE_PORT || 3000

app.use(express.json())

const PREFIX = 'publisher';

const redis = httpRedis({ mode: 'regular', options: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT } })

const postToUrl = body => url => new Promise((resolve, reject) => {
  const req = request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, res => {
    const vals = [];
    res.on('data', vals.push)
    res.on('end', () => {
      resolve(JSON.parse(vals))
    })
  })
  req.on('error', reject);
  req.write(JSON.stringify(body));
  req.end();
})

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

    const urlCondition = !url || !/[-a-zA-Z0-9@:%._\+~#=]{1,256}[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)?/gi.test(url);

    if (urlCondition) {
      res.status(400)
      res.end('{"error": "a valid URL must be provided."}')
      return;
    }
    
    const key = `${PREFIX}:${topic}`;
    
    let previousValuesForTopic = JSON.parse(await redis.get(key) || '[]');

    await redis.set(key, JSON.stringify([...previousValuesForTopic, url]));

    res.status(201)
    res.end(`{"success": "Subscription to topic ${topic} is successful"}`)
  } catch (error) {
    next(error)
  }
})

app.post(/\/publish\/([a-zA-Z0-9-_]*)/, async (req, res, next) => {
  try {
    const { body, redis } = req;
    const { 0: topic } = req.params;

    if (!topic) {
      res.status(400)
      res.end('{"error": "Cannot subscribe to empty topic."}')
      return;
    }

    if (!body || !body.message) {
      res.status(400)
      res.end('{"error": "Message cannot be empty."}')
      return;
    }
    
    const key = `${PREFIX}:${topic}`;
    
    let allTopicSubscribers = JSON.parse(await redis.get(key) || '[]');

    const eventsResponse = await Promise.all(allTopicSubscribers.map(postToUrl({ data: body, topic })))

    console.log(eventsResponse);

    res.status(200)
    res.end('{"success": "Message successfully published to all subscribers"}')
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
