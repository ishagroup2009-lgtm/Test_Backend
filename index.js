
const express = require('express')
const cors = require('cors')
const app = express()
const admin = require("firebase-admin")
require("dotenv").config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const axios = require("axios")

const uploadDir = path.join(__dirname, "uploads")

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
}

app.use("/uploads", express.static(uploadDir))


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }))
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://glittery-fairy-c919e6.netlify.app"
    ],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const http = require('http')
const { Server } = require('socket.io')

require('./db')
const User = require('./models/User')
const Product = require('./models/Product')
const Message = require('./models/Message')
const Group = require('./models/Group')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname

        cb(null, uniqueName)
    }

})

const upload = multer({ storage })


/* =======================
   REFERRAL DEEP LINK ROUTE
======================= */

const PACKAGE_NAME = "com.ishagroup"; // ⚠️ apna exact package name daalo

app.get("/ref/:sponsorId", (req, res) => {
    const sponsorId = req.params.sponsorId;

    const playStoreUrl =
        `https://play.google.com/store/apps/details?id=${PACKAGE_NAME}` +
        `&referrer=sid%3D${sponsorId}`;

    res.redirect(playStoreUrl);
});

/* =======================
   ANDROID APP LINKS VERIFY
======================= */

app.get("/.well-known/assetlinks.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify([
        {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
                namespace: "android_app",
                package_name: "com.ishagroup",
                sha256_cert_fingerprints: [
                    "26:00:72:59:95:2A:8B:2D:4C:1D:1B:24:35:D1:D8:F7:6C:34:D0:5E:65:8A:40:B3:D1:62:FA:89:05:7A:AD:E2"
                ]
            }
        }
    ]));
});

/* =======================
   NORMAL EXPRESS ROUTES
======================= */

app.get('/', (req, res) => {
    res.send('Backend + Socket running 🚀')
})



app.post("/api/ai-chat", async (req, res) => {

    const { message } = req.body

    try {

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.Groq_API_kEY}`,
                    "Content-Type": "application/json"
                }
            }
        )

        res.json({
            reply: response.data.choices[0].message.content
        })

    } catch (error) {

        console.log("AI Error:", error.response?.data || error.message)

        res.status(500).json({
            message: "AI error"
        })

    }

})


// app.post("/api/ai-image", async (req, res) => {

//     const { prompt } = req.body

//     try {

//         const response = await axios.post(
//             "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
//             {
//                 inputs: prompt,
//                 options: { wait_for_model: true }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.HF_TOKEN}`,
//                     "Content-Type": "application/json",
//                     Accept: "image/png"   // 🔥 IMPORTANT
//                 },
//                 responseType: "arraybuffer"
//             }
//         )

//         const imageBase64 = Buffer.from(response.data).toString("base64")

//         res.json({
//             image: `data:image/png;base64,${imageBase64}`
//         })

//     } catch (error) {

//         console.log("Image AI error:", error.response?.data?.toString() || error.message)

//         res.status(500).json({
//             message: "Image generation failed"
//         })

//     }

// })


// app.post("/api/ai-image", async (req, res) => {

//     const { prompt } = req.body

//     try {

//         const response = await axios.post(
//             "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
//             {
//                 inputs: prompt,
//                 options: { wait_for_model: true }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.HF_TOKEN}`,
//                     "Content-Type": "application/json",
//                     Accept: "image/png"
//                 },
//                 responseType: "arraybuffer"
//             }
//         )

//         res.set("Content-Type", "image/png")
//         res.send(response.data)

//     } catch (error) {

//         console.log("Image AI error:", error.response?.data?.toString() || error.message)

//         res.status(500).json({
//             message: "Image generation failed"
//         })

//     }

// })


app.post("/api/ai-image", async (req, res) => {

    const { prompt } = req.body;

    try {

        const response = await axios.post(
            "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                inputs: prompt,
                options: { wait_for_model: true }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json",
                    Accept: "image/png"
                },
                responseType: "arraybuffer"
            }
        );

        // 🔥 Convert image to base64
        const base64Image = Buffer.from(response.data).toString("base64");

        // 🔥 Send JSON response
        res.json({
            success: true,
            image: `data:image/png;base64,${base64Image}`
        });

    } catch (error) {

        console.log(
            "Image AI error:",
            error.response?.data?.toString() || error.message
        );

        res.status(500).json({
            success: false,
            message: "Image generation failed"
        });

    }

});



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
//             password: hashedPassword,
//         })

//         res.json({ message: 'User registered successfully ✅' })
//     } catch (error) {
//         res.status(500).json({ message: error.message })
//     }
// })

app.post('/api/register', upload.single("photo"), async (req, res) => {
    try {

        const { name, email, password, phone, bio } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields required' })
        }

        const userExists = await User.findOne({ email })

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const photo = req.file
            ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
            : null

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            bio,
            photo
        })

        res.json({
            message: 'User registered successfully ✅',
            user
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


// app.post('/api/login', async (req, res) => {
//     try {
//         const { email, password } = req.body

//         const user = await User.findOne({ email })
//         if (!user) return res.status(400).json({ message: 'Invalid credentials' })

//         const isMatch = await bcrypt.compare(password, user.password)
//         if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

//         const token = jwt.sign({ userId: user._id }, 'SECRET_KEY_123')

//         res.json({
//             message: 'Login successful ✅',
//             token,
//             userId: user._id,
//         })
//     } catch (error) {
//         res.status(500).json({ message: error.message })
//     }
// })

app.post('/api/login', async (req, res) => {
    try {

        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign({ userId: user._id }, 'SECRET_KEY_123')

        res.json({
            message: 'Login successful ✅',
            token,
            userId: user._id,

            name: user.name,
            email: user.email,
            phone: user.phone,
            bio: user.bio,
            photo: user.photo
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// app.post('/api/all-users', async (req, res) => {
//     const { userId } = req.body

//     const users = await User.find(
//         { _id: { $ne: userId } },
//         { password: 0 }
//     )

//     res.json({
//         total: users.length,
//         users,
//     })
// })
app.post('/api/all-users', async (req, res) => {
    try {

        const { userId } = req.body

        const users = await User.find(
            { _id: { $ne: userId } }, // current user ko remove karega
            { password: 0 } // password hide
        )

        res.json({
            success: true,
            total: users.length,
            users
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
})

app.post("/api/save-token", async (req, res) => {
    try {
        const { userId, token } = req.body

        await User.findByIdAndUpdate(userId, {
            fcmToken: token,
        })

        res.json({ message: "Token saved successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post("/api/test-notification", async (req, res) => {
    try {
        const { userId, title, body } = req.body

        if (!userId) {
            return res.status(400).json({ message: "UserId required" })
        }

        const user = await User.findById(userId)

        if (!user || !user.fcmToken) {
            return res.status(404).json({
                message: "User not found or FCM token missing"
            })
        }

        await admin.messaging().send({
            token: user.fcmToken,
            notification: {
                title: title || "Test Notification 🚀",
                body: body || "Push notification working successfully!",
            },
        })

        res.json({
            success: true,
            message: "Notification sent successfully ✅"
        })

    } catch (error) {
        console.log("Test notification error ❌", error)
        res.status(500).json({ message: error.message })
    }
})

app.post("/api/upload", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded"
        })
    }

    const fileUrl =
        `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

    res.json({
        fileUrl
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

    socket.onAny((event, ...args) => {
        console.log("📡 Event:", event, args)
    })

    // user apni id batata hai
    socket.on('join', (userId) => {
        socket.join(userId)
        console.log('User joined room:', userId)
    })

    // message bhejna

    // socket.on('sendMessage', async ({ senderId, receiverId, message, file, fileType }) => {

    //     try {

    //         const newMessage = await Message.create({
    //             senderId,
    //             receiverId,
    //             message,
    //             file,
    //             fileType
    //         })

    //         io.to(receiverId).emit('receiveMessage', {
    //             _id: newMessage._id,
    //             senderId,
    //             receiverId,
    //             message,
    //             file,
    //             fileType,
    //             createdAt: newMessage.createdAt,
    //         })

    //     } catch (error) {
    //         console.log('Message save error ❌', error.message)
    //     }

    // })
    // socket.on('sendMessage', async ({ senderId, receiverId, message, file, fileType }) => {

    //     try {

    //         // message save
    //         const newMessage = await Message.create({
    //             senderId,
    //             receiverId,
    //             message,
    //             file,
    //             fileType
    //         })

    //         // realtime socket message
    //         io.to(receiverId).emit('receiveMessage', {
    //             _id: newMessage._id,
    //             senderId,
    //             receiverId,
    //             message,
    //             file,
    //             fileType,
    //             createdAt: newMessage.createdAt,
    //         })

    //         // 🔥 GET SENDER & RECEIVER
    //         const sender = await User.findById(senderId)
    //         const receiver = await User.findById(receiverId)

    //         if (!receiver?.fcmToken) return

    //         // 🔥 SEND PUSH NOTIFICATION
    //         await admin.messaging().send({
    //             token: receiver.fcmToken,
    //             android: {
    //                 priority: "high"
    //             },
    //             notification: {
    //                 title: sender.name,      // sender name
    //                 body: message || "Sent you a file"
    //             },
    //             data: {
    //                 type: "chat_message",
    //                 senderId: senderId.toString(),
    //             }
    //         })

    //         console.log("📩 Message notification sent")

    //     } catch (error) {
    //         console.log('Message save error ❌', error.message)
    //     }

    // })
    socket.on('sendMessage', async ({ senderId, receiverId, message, file, fileType }) => {

        try {

            const newMessage = await Message.create({
                senderId,
                receiverId,
                message,
                file,
                fileType
            })

            io.to(receiverId).emit('receiveMessage', {
                _id: newMessage._id,
                senderId,
                receiverId,
                message,
                file,
                fileType,
                createdAt: newMessage.createdAt,
            })

            const sender = await User.findById(senderId)
            const receiver = await User.findById(receiverId)

            if (!receiver?.fcmToken) return

            await admin.messaging().send({
                token: receiver.fcmToken,
                android: {
                    priority: "high"
                },
                data: {
                    type: "chat_message",
                    senderId: String(senderId),
                    title: String(sender.name),
                    body: String(message || "Sent you a file")
                }
            })

            console.log("📩 Message notification sent")

        } catch (error) {
            console.log('Message save error ❌', error.message)
        }

    })

    // 🔥 JOIN GROUP ROOM
    // socket.on('joinGroup', (groupId) => {
    //     socket.join(groupId)
    //     console.log('User joined group:', groupId)
    // })


    socket.on("sendVideoCallNotification", async ({ callerId, receiverId }) => {
        try {

            const caller = await User.findById(callerId)
            const receiver = await User.findById(receiverId)

            if (!receiver?.fcmToken) return

            await admin.messaging().send({
                token: receiver.fcmToken,
                android: {
                    priority: "high"   // 🔥 IMPORTANT → fast delivery
                },
                notification: {
                    title: "📞 Incoming Video Call",
                    body: `${caller.name} is calling you`,
                },
                data: {
                    type: "video_call",
                    callerId: callerId.toString(),
                }
            })

            console.log("⚡ Video call notification sent via socket")

        } catch (err) {
            console.log("❌ Error:", err.message)
        }
    })



    // socket.on("acceptVideoCall", async ({ callerId }) => {

    //     const caller = await User.findById(callerId)

    //     if (!caller?.fcmToken) return

    //     await admin.messaging().send({
    //         token: caller.fcmToken,
    //         android: { priority: "high" },
    //         notification: {
    //             title: "📞 Call Accepted",
    //             body: "Your call was accepted"
    //         },
    //         data: {
    //             type: "call_accepted"
    //         }
    //     })

    // })

    socket.on("acceptVideoCall", async ({ callerId }) => {

        const caller = await User.findById(callerId);

        if (!caller?.fcmToken) return;

        await admin.messaging().send({
            token: caller.fcmToken,
            android: { priority: "high" },
            data: {
                type: "call_accepted",
                title: "📞 Call Accepted",
                body: "Your call was accepted",
                callerId: callerId.toString(),
            }
        });

    });

    socket.on("rejectVideoCall", async ({ callerId }) => {

        try {

            const caller = await User.findById(callerId);

            if (!caller?.fcmToken) return;

            await admin.messaging().send({
                token: caller.fcmToken,
                android: { priority: "high" },
                data: {
                    type: "call_rejected",
                    title: "📞 Call Rejected",
                    body: "Your call was rejected"
                }
            });

            console.log("❌ Call rejected notification sent");

        } catch (error) {

            console.log("❌ Reject call error:", error.message);

        }

    });


    socket.on("endVideoCall", async ({ callerId, receiverId }) => {
        try {

            const caller = await User.findById(callerId)
            const receiver = await User.findById(receiverId)

            if (!receiver?.fcmToken) return

            await admin.messaging().send({
                token: receiver.fcmToken,
                android: { priority: "high" },
                data: {
                    type: "call_ended",
                    title: "📞 Call Ended",
                    body: `${caller.name} ended the call`
                }
            })

            console.log("📴 Call end notification sent")

        } catch (error) {
            console.log("❌ End call error:", error.message)
        }
    })


    socket.on("userLiveStarted", async ({ userId }) => {

        try {

            const user = await User.findById(userId)

            if (!user) return

            const users = await User.find({
                _id: { $ne: userId },
                fcmToken: { $ne: null }
            })

            for (let u of users) {

                await admin.messaging().send({
                    token: u.fcmToken,
                    android: { priority: "high" },
                    notification: {
                        title: "🔴 Live Started",
                        body: `${user.name} is Live now`,
                    },
                    data: {
                        type: "user_live",
                        userId: userId.toString(),
                        userName: user.name
                    }
                })

            }

            console.log("🔴 Live notification sent to all users")

        } catch (error) {
            console.log("❌ Live notification error:", error.message)
        }

    })


    socket.on("toggleCamera", ({ senderId, receiverId, cameraOn }) => {

        io.to(receiverId).emit("cameraStatusChanged", {
            userId: senderId,
            cameraOn: cameraOn
        })

        console.log("📷 Camera status changed:", senderId, cameraOn)
    })


    socket.on('joinGroup', (groupId) => {

        const roomId = groupId.toString()

        socket.join(roomId)

        console.log("✅ User joined group room:", roomId)
    })
    // 🔥 SEND GROUP MESSAGE
    // socket.on('sendGroupMessage', async ({ senderId, groupId, message }) => {
    //     try {

    //         const newMessage = await Message.create({
    //             senderId,
    //             groupId,
    //             message,
    //         })

    //         // emit to all group members
    //         io.to(groupId).emit('receiveGroupMessage', {
    //             _id: newMessage._id,
    //             senderId,
    //             groupId,
    //             message,
    //             createdAt: newMessage.createdAt,
    //         })

    //     } catch (error) {
    //         console.log('Group message error ❌', error.message)
    //     }
    // })
    socket.on('sendGroupMessage', async ({ senderId, groupId, message }) => {
        try {

            console.log("🔥 Message received on backend:", senderId, groupId, message)

            if (!senderId || !groupId || !message) {
                return
            }

            // Save message
            const newMessage = await Message.create({
                senderId,
                groupId,
                message,
            })

            // Populate sender name
            const populatedMessage = await Message.findById(newMessage._id)
                .populate("senderId", "name")

            // VERY IMPORTANT → always use string room
            io.to(groupId.toString()).emit(
                'receiveGroupMessage',
                populatedMessage
            )

            console.log("✅ Message emitted to room:", groupId)

        } catch (error) {
            console.log('❌ Group message error:', error.message)
        }
    })



    socket.on('disconnect', () => {
        console.log('Socket disconnected ❌', socket.id)
    })
})
// app.post('/api/messages', async (req, res) => {
//     try {
//         const { senderId, receiverId } = req.body

//         const messages = await Message.find({
//             $or: [
//                 { senderId, receiverId },
//                 { senderId: receiverId, receiverId: senderId },
//             ],
//         }).sort({ createdAt: 1 })

//         res.json(messages)
//     } catch (error) {
//         res.status(500).json({ message: error.message })
//     }
// })


app.post('/api/messages', async (req, res) => {
    try {
        const { senderId, receiverId, page = 1, limit = 20 } = req.body

        const skip = (page - 1) * limit

        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        })
            .sort({ createdAt: -1 }) // ✅ latest → oldest
            .skip(skip)
            .limit(limit)

        res.json({
            page,
            limit,
            messages   // ✅ reverse BILKUL NAHI
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


// Group Api s
app.post('/api/create-group', async (req, res) => {
    try {
        const { name, adminId, memberIds } = req.body

        if (!name || !adminId) {
            return res.status(400).json({ message: 'Name and admin required' })
        }

        // Admin entry
        const members = [
            { user: adminId, role: 'admin' }
        ]

        // Selected members add karo
        if (memberIds && memberIds.length > 0) {
            memberIds.forEach(id => {
                members.push({ user: id, role: 'member' })
            })
        }

        const group = await Group.create({
            name,
            members
        })

        res.json({
            message: 'Group created successfully ✅',
            group
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/api/add-member', async (req, res) => {
    try {
        const { groupId, adminId, userId } = req.body

        const group = await Group.findById(groupId)

        // check admin
        const isAdmin = group.members.find(
            m => m.user.toString() === adminId && m.role === 'admin'
        )

        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admin can add members' })
        }

        group.members.push({ user: userId, role: 'member' })
        await group.save()

        res.json(group)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/api/remove-member', async (req, res) => {
    try {
        const { groupId, adminId, userId } = req.body

        const group = await Group.findById(groupId)

        const isAdmin = group.members.find(
            m => m.user.toString() === adminId && m.role === 'admin'
        )

        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admin can remove members' })
        }

        group.members = group.members.filter(
            m => m.user.toString() !== userId
        )

        await group.save()

        res.json(group)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/api/leave-group', async (req, res) => {
    try {
        const { groupId, userId } = req.body

        const group = await Group.findById(groupId)

        group.members = group.members.filter(
            m => m.user.toString() !== userId
        )

        await group.save()

        res.json({ message: 'Left group successfully' })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/api/my-groups', async (req, res) => {
    try {
        const { userId } = req.body

        const groups = await Group.find({
            "members.user": userId
        })
            .populate("members.user", "name email")
            .sort({ createdAt: -1 })

        res.json({
            total: groups.length,
            groups
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})
app.post('/api/group-details', async (req, res) => {
    try {
        const { groupId } = req.body

        const group = await Group.findById(groupId)
            .populate("members.user", "name email")

        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        res.json(group)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/api/group-messages', async (req, res) => {
    try {
        const { groupId, page = 1, limit = 20 } = req.body

        if (!groupId) {
            return res.status(400).json({ message: "GroupId required" })
        }

        const skip = (page - 1) * limit

        const messages = await Message.find({
            groupId: groupId
        })
            .populate("senderId", "name") // 🔥 sender name mil jayega
            .sort({ createdAt: -1 })      // latest first
            .skip(skip)
            .limit(Number(limit))

        const total = await Message.countDocuments({ groupId })

        res.json({
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            messages
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})
/* =======================
   SERVER START
======================= */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('Server + Socket running on port', PORT)
})
