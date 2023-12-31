const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(`${process.env.STRIPE_SECRETE}`)
const port = process.env.PORT || 5000
const app = express()
app.use(express.json())
app.use(cors())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eepi0pq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



const verifyjwt = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'Unauthorized user' });
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.JSON_WEBTOKEN, (error, decoded) => {
        if (error) {
            res.status(403).send({ error: true, message: 'Unauthorized' });
        }
        req.decoded = decoded;
        next();
    });
};


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const classes = client.db('mosko-shakib').collection('popular-corses')
        const instactors = client.db('mosko-shakib').collection('our-instactor')
        const carts = client.db('mosko-shakib').collection('carts')
        const instractorClass = client.db('mosko-shakib').collection('instractorClass')
        const userses = client.db('mosko-shakib').collection('users')
        const paymentses = client.db('mosko-shakib').collection('payment')
        // get jwt token here
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JSON_WEBTOKEN, { expiresIn: '2h' });
            res.send({ token });
        });
        // verifu admin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email
            // if (req.decoded.email !== email) {
            //     res.send({ admin: false })
            // }
            const query = { email: email }
            const user = await userses.findOne(query)
            const result = { admin: user?.rules === 'admin' }
            res.send(result)
        })
        // verify instractor
        app.get('/users/instructor/:email', async (req, res) => {
            const email = req.params.email;
            // if (req.decoded.email !== email) {
            //     res.send({ admin: false })
            // }
            const query = { email: email };
            const user = await userses.findOne(query);
            const result = { instructor: user?.rules === 'instractor' }; // Fix typo here
            res.send(result);
        });
        //   verufy user
        app.get('/users/user/:email', async (req, res) => {
            const email = req.params.email
            // if (req.decoded.email !== email) {
            //     res.send({ admin: false })
            // }
            const query = { email: email }
            const user = await userses.findOne(query)
            const result = { admin: user?.rules === 'user' }
            res.send(result)
        })

        //   set data after sucssesfully erroled a class
        app.post('/payments', async (req, res) => {
            const payment = req.body
            const result = await paymentses.insertOne(payment)
            res.send(result)
        })
        //   get the secssesfuly payments data 
        app.get('/payments', async (req, res) => {
            try {
                const email = req.query.email;
                const query = { email: email };
                const result = await paymentses.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        // user start here
        app.post('/users', async (req, res) => {
            const users = req.body;
            const query = { email: users.email };
            const existingUser = await userses.findOne(query);
            if (existingUser) {
                return res.send({ message: 'vai already added' });
            }
            const result = await userses.insertOne(users);
            res.send(result);
        });

        // user information get there
        app.get('/users', async (req, res) => {
            const result = await userses.find().toArray()
            res.send(result)
        })
        // update user to admin
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    rules: 'admin'
                }
            };
            try {
                const result = await userses.updateOne(filter, updatedDoc);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });
        // update user to instector
        app.patch('/users/instractors/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    rules: 'instractor'
                }

            }
            try {
                const result = userses.updateOne(filter, updatedDoc)
                res.send(result)
            }
            catch (error) {
                console.error(error)
                res.status(500).send('internal server error')
            }
        })

        // instractor class start there
        app.post('/instractor-class', async (req, res) => {
            const classes = req.body
            const result = await instractorClass.insertOne(classes)
            res.send(result)
        })

        // instractor classes get method there
        app.get('/instractor-class', verifyjwt, async (req, res) => {
            try {
                const result = await instractorClass.find().toArray()
                res.send(result)
            }
            catch (error) {
                console.error(error)
                res.status(401).send({ massage: 'this is error' })
            }
        })
        // get specific user cards
        app.get('/singleInstractor', async (req, res) => {
            try {
                const email = req.query.email;
                const query = { instractotEmail: email };
                const result = await instractorClass.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });




        // instractor aprove method there
        app.patch('/instractor-class/aprove/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: 'aprove'
                }
            }
            const result = await instractorClass.updateOne(filter, updatedDoc)
            res.send(result)
        })
        // instractor deney method there
        app.patch('/instractor-class/deney/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: 'deney'
                }
            }
            const result = await instractorClass.updateOne(filter, updatedDoc)
            res.send(result)
        })
        app.patch('/instractor-class/available/:price', async (req, res) => {
            const classPrice = req.params.price;
            const filter = { Price: classPrice };

            // Retrieve the current document to get the AvailableSeats value
            const currentDoc = await instractorClass.findOne(filter);
            const currentAvailableSeats = currentDoc.AvailableSeats;

            // Calculate the updated value
            const updatedAvailableSeats = currentAvailableSeats - 1;

            const updatedDoc = {
                $set: {
                    AvailableSeats: updatedAvailableSeats,
                },
            };

            try {
                const result = await instractorClass.updateOne(filter, updatedDoc);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });
        app.patch('/instractor-class/total/:price', async (req, res) => {
            const classPrice = req.params.price;
            const filter = { Price: classPrice };

            // Retrieve the current document to get the AvailableSeats value
            const currentDoc = await instractorClass.findOne(filter);
            const currentAvailableSeats = currentDoc.erroledStudent;

            // Calculate the updated value
            const updatedAvailableSeats = currentAvailableSeats + 1;

            const updatedDoc = {
                $set: {
                    erroledStudent: updatedAvailableSeats,
                },
            };

            try {
                const result = await instractorClass.updateOne(filter, updatedDoc);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        // instractor feedback method there
        app.post('/feedback/:id', async (req, res) => {
            const id = req.params.id
            const feedbackData = req.body.feedbackData

            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $push: {
                    feedbackData: feedbackData
                }
            }
            const result = await instractorClass.updateOne(filter, updatedDoc)
            res.send(result)
        })
        // carts post start here
        app.post('/carts', async (req, res) => {
            const body = req.body
            const result = await carts.insertOne(body)
            res.send(result)
        })
        // carts get specific carts data oparetion here
        app.get('/carts', async (req, res) => {
            try {
                const email = req.query.email;
                const query = { email: email };
                const result = await carts.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        // get specific card data 
        app.get('/carts/:id', async (req, res) => {
            const id = req.params.id

            const query = { _id: new ObjectId(id) }
            const result = await carts.findOne(query)
            res.send(result)
        })
        // carts deleted action start here :specifc card delete
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await carts.deleteOne(query)
            res.send(result)
        })
        // delete carts a data after payment
        app.delete('/carts/pyment/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await carts.deleteOne(query)
            res.send(result)
        })
        // payment method intrigation start here 
        app.post('/creat-payment-intrigation', async (req, res) => {
            const { payment } = req.body
            const amount = parseFloat(payment) * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: [
                    'card'
                ]
            })
            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })

        // all classes data here
        app.get('/classes', async (req, res) => {
            const result = await classes.find().toArray()
            res.send(result)

        })
        // popular classes data here
        app.get('/popular-classes', async (req, res) => {
            const result = await instractorClass.find().sort({ erroledStudent: -1 }).limit(6).toArray()
            res.send(result)

        })
        app.get('/instactors', async (req, res) => {
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


app.get('/', (req, res) => {
    res.send('vai coltesi')
})
app.listen(port, () => {
    console.log(`the mosko shakib is running in ${port}`)
})