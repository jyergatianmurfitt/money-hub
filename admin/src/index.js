const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const fs = require('fs')
const { parse } = require('csv-parse');
const keyBy = require('lodash.keyby')

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.sendStatus(500)
    } else {
      res.send(investments)
    }
  })
})

// generate csv as text with content type text/csv (and output?) AND write application/json file to investments/export
app.get("/generate-report", (req, res) => {
  request.get(`${config.investmentsServiceUrl}/investments`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      // const holdingsData = request.get(`${config.financialCompaniesServiceUrl}/companies`);
      const holdingsData = request.get(`${config.financialCompaniesServiceUrl}/companies`, (e, r, companies) => {
          return companies
      })
      // const holdingsDataKeyed = keyby(holdingsData, 'id');

      const formattedData = investments.reduce((acc, {id, firstName, lastName}) => {
        // const holdingsName = holdingsDataKeyed[]
        const userData = `${id}|${firstName}|${lastName}|`;

        return acc.join(userData, ',');
      }, '');

      res.send(investments)
      // res.send(formattedData)
    }
  })
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
