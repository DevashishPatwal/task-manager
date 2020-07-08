const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const connectionString = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'
MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database');
    }
    const db = client.db(databaseName)
    db.collection('users').find({ age: 22 }).count((error, userCount) => {
        console.log(userCount);
    })


})
