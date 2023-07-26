const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const { parse } = require('csv-parse');
const keyBy = require('lodash.keyby');
const { fs } = require('fs');

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

app.get("/generate-report", (req, res) => {
  request.get(`${config.investmentsServiceUrl}/investments`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      const investmentsList = JSON.parse(investments)
      
      request.get(`${config.financialCompaniesServiceUrl}/companies`, (e, r, companies) => {
        if (e) {
          console.error(e)
          res.send(500)
        } else {
          const holdingsList = JSON.parse(companies);
          const holdingsListKeyed = keyBy(holdingsList, 'id');

          const formattedData = investmentsList.reduce((investmentsAcc, {id, firstName, lastName, investmentTotal, date, holdings}, currentInvestmentsIndex) => {
            const userHoldingsFormatted = holdings.reduce((holdingsAcc, {id, investmentPercentage}, currentHoldingsIndex) => {
              const isCommaHoldingsElement = !!(holdings.length > 1 && currentHoldingsIndex !== 0);

              const value = investmentTotal * investmentPercentage;
              const holdingsName = holdingsListKeyed[id].name

              const userHolding = [id, firstName, lastName, date, holdingsName, value].join('|');
              const allUserHoldings = isCommaHoldingsElement ? holdingsAcc.concat(',', userHolding) : holdingsAcc.concat(userHolding);

              return allUserHoldings;
            }, '')

            const isCommaInvestmentElement = !!(investmentsList.length > 1 && currentInvestmentsIndex !== 0);
            return isCommaInvestmentElement ? investmentsAcc.concat(',', userHoldingsFormatted) : investmentsAcc.concat(userHoldingsFormatted);

          }, '');

          request(`${config.investmentsServiceUrl}/investments/export`).pipe({'csv': formattedData})

          res.set('Content-Type', 'text/csv')
          res.send(formattedData)
        }
      })
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
