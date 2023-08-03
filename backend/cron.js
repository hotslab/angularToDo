let shell = require('shelljs')
let cron = require('node-cron')

// cron runs every 2 minutes
cron.schedule("*/10 * * * *", async () => {
    console.log('---------------------');
    console.log('Running Cron Job');
    if (shell.exec('node ace notifications').code !== 0) {
        shell.exit(1);
    }
    else {
        shell.echo('Notification service completed');
    }
})
