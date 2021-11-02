# derp-db

This project will pull the on-chain metadata from derp birds and derp eggs into a local mongo database.

## Getting started

Pull down the repo and `npm install` the dependencies. You'll need docker to run the mongo database and you'll need a blockfrost project id if you want to update the latest egg data.

### Start the database

The following command will start the mongo database and map the data to data/db. If that directory is empty, the image will initialize the database with all the Derp Birds metadata and all of the current Derp Egg data. If the directory is not empty, it will just use whatever is there and will not overwrite anything.

```
npm run mongodb
```

### Get the latest egg data

Eggs are still being incubated, so the db only contains eggs up to the last snapshot. To load all the latest eggs since the last snapshot, run the following command (it won't pull down all the eggs again, just the new ones):

```
PROJECT_ID=<your blockfrost project id> npm run getAllEggData
```

### Generate a csv file

Generate a csv file of all the eggs with this command:

```
npm run generateEggCsv
```

### Load derp bird data

This has already been done for you, but if you need to reload the Derp Bird data for some reason, you can use this command:

```
PROJECT_ID=<your blockfrost project id> npm run getAllDerpData
```
