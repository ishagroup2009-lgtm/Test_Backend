// const express = require('express')
// const app = express()
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// require('./db')
// const User = require('./models/User')
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')
// const Product = require('./models/Product')

// const authMiddleware = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization

//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return res.status(401).json({ message: 'Token required ❌' })
//         }

//         const token = authHeader.split(' ')[1]

//         const decoded = jwt.verify(token, 'SECRET_KEY_123')
//         req.userId = decoded.userId

//         next()
//     } catch (error) {
//         return res.status(401).json({
//             message: 'Invalid or expired token ❌'
//         })
//     }
// }



// // body read karne ke liye

// app.get('/', (req, res) => {
//     res.send('Backend start ho gaya 🚀')
// })

// app.get('/api/hello', (req, res) => {
//     res.json({
//         message: "Hello Backend Developer 😎 anuj"
//     })
// })

// app.post('/api/register', async (req, res) => {
//     try {
//         const { name, email, password } = req.body

//         if (!name || !email || !password) {
//             return res.status(400).json({ message: 'All fields required' })
//         }

//         const userExists = await User.findOne({ email })
//         if (userExists) {
//             return res.status(400).json({ message: 'User already exists' })
//         }

//         const hashedPassword = await bcrypt.hash(password, 10)

//         await User.create({
//             name,
//             email,
//             password: hashedPassword
//         })

//         res.status(201).json({
//             message: 'User registered successfully ✅'
//         })

//     } catch (error) {
//         res.status(500).json({
//             message: 'Register error ❌',
//             error: error.message
//         })
//     }
// })

// app.post('/api/login', async (req, res) => {
//     try {
//         const { email, password } = req.body

//         if (!email || !password) {
//             return res.status(400).json({ message: 'All fields required' })
//         }

//         const user = await User.findOne({ email })
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid credentials' })
//         }

//         const isMatch = await bcrypt.compare(password, user.password)
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials' })
//         }

//         const token = jwt.sign(
//             { userId: user._id },
//             'SECRET_KEY_123',
//             { expiresIn: '1d' }
//         )

//         res.json({
//             message: 'Login successful ✅',
//             token,
//             userId: user._id,      // 👈 yahi chahiye tha
//             email: user.email
//         })

//     } catch (error) {
//         res.status(500).json({
//             message: 'Login error ❌',
//             error: error.message
//         })
//     }
// })

// app.post('/api/all-users', async (req, res) => {
//     try {
//         const { userId } = req.body

//         if (!userId) {
//             return res.status(400).json({
//                 message: 'userId required ❌'
//             })
//         }

//         const users = await User.find(
//             { _id: { $ne: userId } }, // 👈 apni id exclude
//             { password: 0 }           // 👈 password hide
//         )

//         res.status(200).json({
//             message: 'All users fetched ✅',
//             total: users.length,
//             users
//         })

//     } catch (error) {
//         res.status(500).json({
//             message: 'Failed to fetch users ❌',
//             error: error.message
//         })
//     }
// })
// app.post('/api/product', async (req, res) => {
//     try {
//         console.log('REQ BODY 👉', req.body) // 🔍 debug

//         const { name, price, category, description } = req.body

//         if (!name || !price) {
//             return res.status(400).json({
//                 message: 'Name and price required ❌',
//             })
//         }

//         const product = await Product.create({
//             name,
//             price,
//             category,
//             description,
//         })

//         res.status(201).json({
//             message: 'Product added successfully ✅',
//             product,
//         })
//     } catch (error) {
//         console.log('PRODUCT ERROR 👉', error.message)
//         res.status(500).json({
//             message: 'Product add failed ❌',
//             error: error.message,
//         })
//     }
// })

// app.get('/api/products', async (req, res) => {
//     try {
//         const products = await Product.find({})

//         res.json({
//             message: 'All products fetched ✅',
//             total: products.length,
//             products,
//         })
//     } catch (error) {
//         res.status(500).json({
//             message: 'Failed to fetch products ❌',
//             error: error.message,
//         })
//     }
// })


// app.post('/api/user', async (req, res) => {
//     try {
//         const user = new User(req.body)
//         await user.save()

//         res.status(201).json({
//             message: "User saved in MongoDB ✅",
//             data: user
//         })
//     } catch (error) {
//         res.status(500).json({
//             message: "Error saving user ❌",
//             error: error.message
//         })
//     }
// })


// app.listen(5000, () => {
//     console.log('Server running on port 5000')
// })
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const http = require('http')
const { Server } = require('socket.io')

require('./db')
const User = require('./models/User')
const Product = require('./models/Product')
const Message = require('./models/Message')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/* =======================
   NORMAL EXPRESS ROUTES
======================= */

app.get('/', (req, res) => {
    res.send('Backend + Socket running 🚀')
})

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields required' })
        }

        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await User.create({
            name,
            email,
            password: hashedPassword,
        })

        res.json({ message: 'User registered successfully ✅' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: 'Invalid credentials' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

        const token = jwt.sign({ userId: user._id }, 'SECRET_KEY_123')

        res.json({
            message: 'Login successful ✅',
            token,
            userId: user._id,
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/api/all-users', async (req, res) => {
    const { userId } = req.body

    const users = await User.find(
        { _id: { $ne: userId } },
        { password: 0 }
    )

    res.json({
        total: users.length,
        users,
    })
})

/* =======================
   SOCKET.IO SETUP
======================= */

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*', // abhi testing ke liye
    },
})

io.on('connection', (socket) => {
    console.log('Socket user connected 🔥', socket.id)

    // user apni id batata hai
    socket.on('join', (userId) => {
        socket.join(userId)
        console.log('User joined room:', userId)
    })

    // message bhejna
    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
        try {
            // 🔹 Save message in MongoDB
            const newMessage = await Message.create({
                senderId,
                receiverId,
                message,
            })

            // 🔹 Receiver ko real-time message
            io.to(receiverId).emit('receiveMessage', {
                _id: newMessage._id,
                senderId,
                receiverId,
                message,
                createdAt: newMessage.createdAt,
            })

        } catch (error) {
            console.log('Message save error ❌', error.message)
        }
    })

    socket.on('disconnect', () => {
        console.log('Socket disconnected ❌', socket.id)
    })
})
app.post('/api/messages', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body

        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        }).sort({ createdAt: 1 })

        res.json(messages)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

/* =======================
   SERVER START
======================= */

const PORT = 5000
server.listen(PORT, () => {
    console.log('Server + Socket running on port', PORT)
})
