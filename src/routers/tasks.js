const express = require('express')
const router = new express.Router()

const Task = require('../models/tasks')
const auth = require('../middleware/auth')

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed == 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        console.log(parts[0])
        console.log(parts[1])
    }


    console.log(sort)

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }
    catch (error) {
        res.status(500).send(error)
    }
})

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
        }
        res.status(201).send(task)
    }
    catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every((update) => allowedUpdates.includes(update))
    if (!isValid) {
        return res.status(400).send({ error: 'Invalid Update' })
    }
    const _id = req.params.id
    try {
        //const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(400).send({ error: 'No task matches the provided id' })
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        res.status(201).send(task)
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
        if (!task) {
            return res.status(400).send({ error: 'No task matches the provided id' })
        }
        res.status(201).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router