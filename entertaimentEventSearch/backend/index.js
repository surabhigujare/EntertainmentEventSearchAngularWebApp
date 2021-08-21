let express = require('express'),
  path = require('path');
  cors = require('cors');

const eventRoute = require('./routes/event.routes')
const port = process.env.PORT || 8080;

const app = express();
app.use(cors());

// API root
app.use('/api', eventRoute)
app.listen(port, () => {
  console.log('Listening on port ' + port)
})
app.use(express.static(path.join(__dirname,'/dist/entertainment-event-search')));
app.use('/*', (req, res) => {
	res.sendFile(path.join(__dirname+'/dist/entertainment-event-search/index.html'));
})

module.exports = app;
