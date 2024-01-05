const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const keyBy = require('lodash.keyby');

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
          const companyNames = JSON.parse(companies);
          const companyNamesKeyed = keyBy(companyNames, 'id');

          const formattedData = investmentsList.map(({userId, firstName, lastName, investmentTotal, date, holdings}) => {
            const userHoldingsFormatted = holdings.map(({id: holdingId, investmentPercentage}) => {
              const value = investmentTotal * investmentPercentage;
              const holdingsName = companyNamesKeyed[holdingId].name

              return [userId, firstName, lastName, date, holdingsName, value].join(',');
            }).join('\n')

            return userHoldingsFormatted;
          }).join('\n');

          const csvString = `User, First Name, Last Name, Date, Holding, Value\n${formattedData}`

          request({ 'url': `${config.investmentsServiceUrl}/investments/export`, 'method': 'POST', 'application/json': {'csv': csvString}})
          
          res.set('Content-Type', 'text/csv')
          res.send(formattedData);
          
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
