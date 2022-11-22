import app from './app'

app.listen(5000, function() {
    console.log('SERVER UP on 5000!!');
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});