var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

let calls = [];
fs.createReadStream('../911.csv')
    .pipe(csv())
    .on('data', data => {
      // TODO extract one line from CSV
      calls.push({
        "lat": data.lat,
        "lng": data.lng,
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
        const { lat, lng,  desc, zip, title, timeStamp, twp, addr } = call;
        acc.push({ index: { _index: 'call_index', _type: 'call' } })
        acc.push({ 
          location: {
            lat, 
            lng
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
