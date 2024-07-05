const express = require('express');
const { Op } = require('sequelize');
const db = require('./database');
const Airport = require('./models/Airport');
const City = require('./models/City');
const Country = require('./models/Country');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Sync the database
db.sync()
  .then(() => {
    console.log('Database synchronized');
  })
  .catch(error => {
    console.error('Error synchronizing database:', error);
  });

// Define GET endpoint for /airport
app.get('/airport', async (req, res) => {
  const { iata_code } = req.query;

  try {
    const airport = await Airport.findOne({
      where: { iata_code },
      include: {
        model: City,
        include: Country
      }
    });

    if (!airport) {
      return res.status(404).json({ error: 'Airport not found' });
    }

    // Format response
    const response = {
      airport: {
        id: airport.id,
        icao_code: airport.icao_code,
        iata_code: airport.iata_code,
        name: airport.name,
        type: airport.type,
        latitude_deg: airport.latitude_deg,
        longitude_deg: airport.longitude_deg,
        elevation_ft: airport.elevation_ft,
        address: {
          city: {
            id: airport.City.id,
            name: airport.City.name,
            country_id: airport.City.country_id,
            is_active: airport.City.is_active,
            lat: airport.City.lat,
            long: airport.City.long
          },
          country: airport.City.Country ? {
            id: airport.City.Country.id,
            name: airport.City.Country.name,
            country_code_two: airport.City.Country.country_code_two,
            country_code_three: airport.City.Country.country_code_three,
            mobile_code: airport.City.Country.mobile_code,
            continent_id: airport.City.Country.continent_id
          } : null
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error retrieving airport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
db.authenticate()
  .then(() => {
    console.log('Database connection established');
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  });
