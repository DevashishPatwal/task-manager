const express = require('express')
const User = require('../models/users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const router = new express.Router()

router.get('/users/me', auth, async (req, res) => {

    res.send(req.user)

})
router.get('/users/:id/avatar', async (req, res) => {

    const id = req.params.id
    try {
        const user = await User.findById(id)
        if (!user || !user.avatar) {
            throw (new Error('Error'))
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})
router.post('/users', async (req, res) => {

    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Upload image having jpg/jpeg/png format'))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send('Avatar Uploaded Successfully')

}, (error, req, res, next) => {
    res.status(400).send(error.message)
})
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Avatar Deleted Successfully')

})
router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens.filter((token) => {
            token.token !== req.token
        })
        await req.user.save()
        res.status(201).send('logout successfull')
    } catch (error) {
        res.status(500).send(error)
    }
})
router.post('/users/logoutall', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.status(201).send('logout successfull')
    } catch (error) {
        res.status(500).send(error)
    }
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.user)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({ error: 'Invalid Update' })
    }
    try {
        update.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(201).send(req.user)
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.status(201).send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})


router.post('/users/login', async (req, res) => {
    try {
        const user = await User.verifyCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })

    }
    catch (e) {
        res.status(400).send()
    }

})
module.exports = router