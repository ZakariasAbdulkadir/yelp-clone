require("dotenv").config()
const express = require("express")
const cors = require("cors")
const  db = require('./db')

const morgan = require('morgan')

const app = express()

app.use(cors())
app.use(express.json())

// Get all Restaurants
app.get("/api/v1/restaurants", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id")

        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                restaurants: results.rows
            }
        })    
    } catch (err) {
        console.log(err)
    }
    
})

// Get Individual Restaurants
app.get("/api/v1/restaurants/:id", async(req, res) => {

    try {
        const restaurant = await db.query("SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id WHERE id = $1", [req.params.id])
        
        const reviews = await db.query("select * from reviews where restaurant_id = $1", [req.params.id])

        res.status(200).json({
            status: "success",
            data: {
                restaurant: restaurant.rows[0],
                reviews: reviews.rows
            }
        })    
    } catch (err) {
        console.log(err)
    }
})

// Create a Restaurant
app.post("/api/v1/restaurants", async (req, res) => {
    try {
        const { name, location, price_range } = req.body
        const results = await db.query("INSERT INTO restaurants (name, location, price_range) VALUES ($1, $2, $3) returning *", [name, location, price_range])
        
        res.status(201).json({
            status: "success",
            data: {
                restaurant: results.rows[0]
            }
        })    
    } catch (err) {
        console.log(err)
    }
})

// Update an Individual Restaurant
app.put('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const { name, location, price_range } = req.body
        const results = await db.query("UPDATE restaurants SET name = $1, location = $2, price_range = $3 WHERE id = $4 returning *", 
        [name, location, price_range, req.params.id])
        
        res.status(200).json({
            status: "success",
            data: {
                restaurants: results.rows[0]
            }
        })    
    } catch (err) {
        console.log(err)
    }
})

// Delete a Restaurant
app.delete('/api/v1/restaurants/:id', async (req, res) => {
    try {
        db.query("delete from reviews where restaurant_id = $1", [req.params.id])
        const results = await db.query("delete from restaurants where id = $1", [req.params.id])
        
        res.status(204).json({
            status: "success",
        })    
    } catch (err) {
        console.log(err)
    }
})

// Add a Review
app.post("/api/v1/restaurants/:id/addReview", async (req, res) => {
    try {
        const { name, review, rating } = req.body
        const newReview = await db.query("INSERT INTO reviews (restaurant_id, name, review, rating) values ($1, $2, $3, $4) returning *", [req.params.id, name, review, rating])
        
        res.status(201).json({
            status: "success",
            data: {
                review: newReview.rows[0]
            }
        })    
    } catch (err) {
        console.log(err)
    }
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server on port ${port}`)
})