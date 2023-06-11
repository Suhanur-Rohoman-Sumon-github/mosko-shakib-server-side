const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const stripe = require('stripe')('sk_test_51NECFwIaZAuMRrsmPGQtyskxVAYn4YGeXwtnXMWNEgyHVg7fsPeez8rsTf8iLoUGApMquKrSwUezfVtZJKnoUyuB00ZhnCIIM6')
const port = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(cors())


// TODO:add env file
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
        const instactors = client.db('mosko-shakib').collection('our-instactor')
        const carts = client.db('mosko-shakib').collection('carts')
        // carts post start here
        app.post('/carts',async(req,res)=>{
            const body = req.body
            const result = await carts.insertOne(body)
            res.send(result)
        })
        // carts get oparetion here
        app.get('/carts',async(req,res)=>{
            const email = req.query.email
            const quirey = {email:email}
            const result = await carts.find(quirey).toArray()
            res.send(result)
        })
        // get specific card data 
        app.get('/carts/:id',async(req,res)=>{
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await carts.findOne(query)
            res.send(result)
        })
        // carts deleted action start here :specifc card delete
        app.delete('/carts/:id',async(req,res)=>{
            const id = req.params.id
            const query = {_id:new ObjectId(id)}
            const result = await carts.deleteOne(query)
            res.send(result)
        })
        // payment method intrigation start here 
        app.post('/creat-payment-intrigation',async(req,res)=>{
            const {price} = req.body
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount:amount,
                currency: "usd",
                payment_method_types :[
                    'card'
                ]
            })
            res.send({
                clientSecret : paymentIntent.client_secret 
            })
        })

        // all classes data here
        app.get('/classes',async(req,res)=>{
            const result = await classes.find().toArray()
            res.send(result)
            
        })
        // popular classes data here
        app.get('/popular-classes',async(req,res)=>{
            const result = await classes.find().sort({ totalStudents: -1 }).limit(6).toArray()
            res.send(result)
            
        })
        app.get('/instactors',async(req,res)=>{
            const result = await instactors.find().toArray()
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