var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error',
  requestTimeout: 60000
});

esClient.indices.create({ 
  index: 'call_index',
  body : {
    mappings: {
      call: {
        properties : {
          location : { type: 'geo_point' }
        }
      }
    }
  }
  }, (err, resp) => {
  if (err) console.trace(err.message);
});

let calls = [];
fs.createReadStream('../911.csv')
    .pipe(csv())
    .on('data', data => {
      // TODO extract one line from CSV
      calls.push({
        "lat": data.lat,
        "lon": data.lng,
        "desc": data.desc,
        "zip": data.zip,
        "title": data.title,
        "timeStamp": data.timeStamp,
        "twp": data.twp,
        "addr": data.addr,
        "e": data.e,
      })
    })
    .on('end', () => {
      // TODO insert data to ES
      esClient.bulk(createBulkInsertQuery(calls), (err, resp) => {
        if (err) console.trace(err.message);
        else console.log(`Inserted ${resp.items.length} calls`);
        esClient.close();
      });
    });

    function createBulkInsertQuery(calls) {
      const body = calls.reduce((acc, call) => {
        const { lat, lon,  desc, zip, title, timeStamp, twp, addr } = call;
        acc.push({ index: { _index: 'call_index', _type: 'call' } })
        acc.push({ 
          location: {
            lat, 
            lon
          },  
          desc, 
          zip, 
          title,
          timeStamp,
          twp, 
          addr 
        })
        return acc
      }, []);
    
      return { body };
    }
