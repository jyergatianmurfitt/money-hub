const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const axios = require('axios');
const {formatInvestments} = require('./utils');

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

app.get("/generate-report", async (_, res) => {
  try {
    const [{data: investments}, {data: companies}] = await Promise.all([
      axios.get(`${config.investmentsServiceUrl}/investments`),
      axios.get(`${config.financialCompaniesServiceUrl}/companies`),
    ]);
  
    const formattedInvestments = formatInvestments(investments, companies);
    
    await axios.post(`${config.investmentsServiceUrl}/investments/export`, {csv: formattedInvestments}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  
    res.set('Content-Type', 'text/csv');
    res.send(formattedInvestments);
  }
  catch(e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
