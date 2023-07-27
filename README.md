
## New Routes:

1. /generate-report 

  

## Additional Scripts:



  

## Questions:

#### How might you make this service more secure?

1. Use SSL to encrypt the returned data

1. Make sure packages are up-to-date

  

#### How would you make this solution scale to millions of records?

1. Impliment cacheing

1. Either use chunking to gather the data and return it in batches or paginate results or implement long polling

1. Add option to generate csv by id

  

#### What else would you have liked to improve given more time?

1. Fix error preventing display of json on /investments/export route

1. Add unit testing

1. Use Ramda

1. Fix issue with duplicate variable names ('id')

1. Implement async-await and move the queries onto the same level, as opposed to being nested

1. Add more sophisticated error handling

1. Refactor duplicate/like code and move similar functionality into reusable functions

1. Handle unused variables either by using them or using lodash to replace them

1. Find a cleaner way of concatenating strings without trailing commas

1. Separate the data formatting functionality into a utils file to clean up the main function
