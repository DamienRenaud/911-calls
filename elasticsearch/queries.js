var elasticsearch = require('elasticsearch');


var esClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

let lansdaleLocation = {
    lat: 40.241493,
    lon: -75.283783
};


esClient
    .count({
        index: 'call_index',
        type: 'call',
        body: {
            query: {
                bool: {
                    must: {
                        match_all: {}
                    },
                    filter: {
                        geo_distance: {
                            distance: "500m",
                            location: {
                                lat: lansdaleLocation.lat,
                                lon: lansdaleLocation.lon
                            }
                        }
                    }
                }

            }
        }
    })
    .then(resp => {
        console.log(resp.count);
    });


