const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(cors())



const uri = "mongodb+srv://mosko-shakib:S4MTB4k4zLQrSCrz@cluster0.eepi0pq.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const classes = client.db('mosko-shakib').collection('popular-corses')

        app.get('/classes',async(req,res)=>{
            const result = await classes.find().toArray()
            res.send(result)
            
        })
        app.get('/popular-classes',async(req,res)=>{
            const result = await classes.find().sort({ totalStudents: -1 }).limit(6).toArray()
            res.send(result)
            
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/',  (req, res) => {
    res.send('vai coltesi')
})
app.listen(port, () => {
    console.log(`the mosko shakib is running in ${port}`)
})