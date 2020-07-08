const express = new require('express')
require('./db/mongoose')

const port = process.env.PORT

const app = express()

const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server running in port ' + port);

})

