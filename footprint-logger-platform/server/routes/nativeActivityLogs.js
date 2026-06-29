// Express gives us a router so the native activity log examples can live in their own module.
const express = require('express')

// ObjectId is the MongoDB type used for the _id field in most collections.
const { ObjectId } = require('mongodb')

// getDatabase() returns the cached database instance from the shared MongoClient helper.
const { getDatabase } = require('../database/mongoClient')

// This router will be mounted under /api/native/activity-logs.
const router = express.Router()

/*
  GET /
  This endpoint returns every document in the activity-logs collection.
*/
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/native/activity-logs was called.')

    // A collection stores documents that belong to the same logical data set.
    const database = await getDatabase()
    const activityLogsCollection = database.collection('activity-logs')

    // find({}) returns a cursor, which is why we convert it to an array before sending it to the client.
    const activityLogs = await activityLogsCollection.find({}).toArray()

    console.log(`GET /api/native/activity-logs returned ${activityLogs.length} documents.`)
    return res.json(activityLogs)
  } catch (error) {
    console.error('Failed to load native activity logs:', error.message)
    return res.status(500).json({ message: 'Unable to load activity logs with MongoClient', error: error.message })
  }
})

/*
  GET /:id
  This endpoint reads one document by _id from the activity-logs collection.
*/
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /api/native/activity-logs/:id was called.')

    const { id } = req.params

    // MongoDB stores the default _id value as an ObjectId, so we convert the string route parameter before querying.
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'The activity log id is not a valid ObjectId.' })
    }

    const database = await getDatabase()
    const activityLogsCollection = database.collection('activity-logs')
    const objectId = new ObjectId(id)

    // findOne() returns a single document or null when no match exists.
    const activityLog = await activityLogsCollection.findOne({ _id: objectId })

    if (!activityLog) {
      return res.status(404).json({ message: 'Activity log not found.' })
    }

    return res.json(activityLog)
  } catch (error) {
    console.error('Failed to load a native activity log by id:', error.message)
    return res.status(500).json({ message: 'Unable to load the activity log with MongoClient', error: error.message })
  }
})

/*
  POST /
  This endpoint inserts a new document directly into the activity-logs collection.
*/
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/native/activity-logs was called.')

    // req.body contains the data sent by the client in the HTTP request.
    const { userId, name, category, co2Value, amount, emission, date } = req.body

    // MongoDB stores the document exactly as provided, unless the code transforms it first.
    const activityLogDocument = {
      userId,
      name,
      category,
      co2Value,
      amount,
      emission,
      date,
    }

    const database = await getDatabase()
    const activityLogsCollection = database.collection('activity-logs')

    // insertOne() writes one document to the collection and returns metadata about the insert operation.
    const insertResult = await activityLogsCollection.insertOne(activityLogDocument)

    console.log(`Inserted activity log document with _id: ${insertResult.insertedId}`)

    // insertedId is the _id value MongoDB generated for the new document.
    const insertedDocument = await activityLogsCollection.findOne({ _id: insertResult.insertedId })

    // This makes the response easy to inspect in a learning demo because it shows both the id and the stored document.
    return res.status(201).json({
      insertedId: insertResult.insertedId,
      document: insertedDocument,
    })
  } catch (error) {
    console.error('Failed to insert a native activity log:', error.message)
    return res.status(500).json({ message: 'Unable to create the activity log with MongoClient', error: error.message })
  }
})

// Export the router so the main server file can mount it.
module.exports = router
