
const mongoose = require('mongoose')

mongoose
    .connect('mongodb+srv://ishagroup2009_db_user:EBG5h3N0tWnbXYcg@cluster0.qtdsqei.mongodb.net/?appName=Cluster0')
    .then(() => console.log('MongoDB connected ✅'))
    .catch(err => console.log('MongoDB error ❌', err))
