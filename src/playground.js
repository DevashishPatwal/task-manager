require('./db/mongoose')
const Task = require('./models/tasks')

const deleteTaskAndCount = async (id) => {
    const del = await Task.deleteOne({ id })
    const count = await Task.countDocuments({ completed: false })
    return count
}
deleteTaskAndCount('5f00589039bb091d340955ea').then((count) => {
    console.log(count)

}).catch((error) => {
    console.log(error)
})