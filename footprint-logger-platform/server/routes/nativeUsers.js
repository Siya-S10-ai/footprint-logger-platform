// Express creates a router so this native MongoDB example can be mounted under its own base path.
const express = require('express')

// getDatabase() gives this route access to the cached MongoClient database instance.
const { getDatabase } = require('../database/mongoClient')

// This router will handle /api/native/users once it is mounted in the server entry point.
const router = express.Router()

/*
  GET /
  This endpoint reads every document from the users collection using the native MongoDB driver.
*/
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/native/users was called.')

    // A collection is a group of documents inside a MongoDB database.
    const database = await getDatabase()

    // This route reads from the users collection directly instead of using a Mongoose model.
    const usersCollection = database.collection('users')

    // find({}) returns a cursor, which is a streaming pointer to the matching documents.
    const usersCursor = usersCollection.find({})

    // toArray() is necessary when we want to turn the cursor into a normal JavaScript array for the response.
    const users = await usersCursor.toArray()

    console.log(`GET /api/native/users returned ${users.length} documents.`)

    // res.json() sends JSON back to the client and sets the response content type correctly.
    return res.json(users)
  } catch (error) {
    console.error('Failed to load native users:', error.message)
    return res.status(500).json({ message: 'Unable to load users with MongoClient', error: error.message })
  }
})

// Export the router so the main server file can mount it.
module.exports = router
