# derp-db

This project will pull the on-chain metadata from derp birds and derp eggs into a local mongo database.

## Getting started

Pull down the repo and `npm install` the dependencies. Make sure you have a local instance of mongodb running. You can start one in docker using the command:

```
npm run mongodb
```

Load derp bird data with this command:

```
PROJECT_ID=<your blockfrost project id> npm run getAllDerpData
```

Load derp egg data with this command:

```
PROJECT_ID=<your blockfrost project id> npm run getAllEggData
```

Generate a csv file of all the eggs with this command:

```
npm run generateEggCsv
```
