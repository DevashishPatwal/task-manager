const validator = require('validator')
const mongoose = require('mongoose');
const connectionString = process.env.MongooseURL
mongoose.connect(connectionString, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }).then((result) => {

}).catch((error) => {
    console.log(error)
})


