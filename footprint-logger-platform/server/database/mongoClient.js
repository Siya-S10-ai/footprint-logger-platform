/*
Mongoose vs MongoClient:
  Mongoose is an Object Data Modeling library that sits on top of MongoDB.
  It adds schemas, models, validation, and helper methods so application code can stay expressive.
  MongoClient is the official native MongoDB driver.
  It exposes the database, collections, cursors, and CRUD methods directly, which is useful when you want to see how MongoDB works without extra abstraction.
  In production, teams often choose Mongoose when they want schema enforcement and faster application development.
  Teams often choose MongoClient when they want full control, a smaller abstraction layer, or a closer match to MongoDB's native API.
*/

// MongoClient is the official driver that lets Node.js talk directly to MongoDB.
const { MongoClient } = require('mongodb')

// The connection string comes from the environment so the code can run in different environments without changes.
//const mongoUri = process.env.MONGODB_URI

// The native MongoClient example uses its own connection string so it can stay separate from the Mongoose app.
const mongoUri = process.env.MONGODB_NATIVE_URI

// This is the MongoDB database name that this learning example will open explicitly.
const databaseName = 'user-account'

// Only one MongoClient instance should exist in this module so the app does not create a new network client for every request.
let mongoClient

// This variable stores the connected database instance so later calls can reuse it.
let databaseInstance

// This promise lets multiple callers wait on the same connection attempt instead of starting duplicate connections.
let connectionPromise

/*
  getDatabase() returns the connected database instance.
  A database instance represents one specific database inside a MongoDB server.
  Async/await is used because connecting to MongoDB is an asynchronous network operation.
  Try/catch is important because the connection can fail and the app should receive a clear error message.
*/
async function getDatabase() {
  if (databaseInstance) {
    console.log('Reusing the existing MongoClient database connection.')
    return databaseInstance
  }

  /*
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in the environment.')
  }
*/
  if (!mongoUri) {
    throw new Error('MONGODB_NATIVE_URI is not defined in the environment.')
  }

  if (!mongoClient) {
    console.log('Creating the single MongoClient instance.')
    mongoClient = new MongoClient(mongoUri)
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        console.log('Connecting MongoClient to MongoDB...')
        await mongoClient.connect()
        console.log(`MongoClient connected successfully. Opening database "${databaseName}".`)
        databaseInstance = mongoClient.db(databaseName)
        return databaseInstance
      } catch (error) {
        connectionPromise = null
        console.error('MongoClient connection failed:', error.message)
        throw error
      }
    })()
  } else {
    console.log('Reusing the existing MongoClient connection attempt.')
  }

  return connectionPromise
}

// Export the helper so route files can get the same cached database instance.
module.exports = { getDatabase }
