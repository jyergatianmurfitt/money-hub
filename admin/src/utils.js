const keyBy = require('lodash.keyby');

const formatInvestments = (investments, companies) => {
  const companyNamesKeyed = keyBy(companies, 'id');

  const formattedData = investments.map(({userId, firstName, lastName, investmentTotal, date, holdings}) => {
    const userHoldingsFormatted = holdings.map(({id: holdingId, investmentPercentage}) => {
      const value = investmentTotal * investmentPercentage;
      const holdingsName = companyNamesKeyed[holdingId].name

      return [userId, firstName, lastName, date, holdingsName, value].join('|');
      }).join(',')

      return userHoldingsFormatted;
    }).join(',');

  return formattedData;
};

module.exports = { formatInvestments };