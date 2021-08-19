/* eslint-disable @typescript-eslint/no-var-requires */
const isPortReachable = require('is-port-reachable');
const path = require('path');
const dockerCompose = require('docker-compose');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function dbMigrateTest() {
  try {
    await exec('yarn db:migrate:test');
  } catch (error) {
    console.log('prisma migration failed', error);
    process.exit(1);
  }
}

module.exports = async () => {
  console.time('global-setup');
  // ️️️✅ Best Practice: Speed up during development, if already live then do nothing
  const isDBReachable = await isPortReachable(54320);
  if (!isDBReachable) {
    // ️️️✅ Best Practice: Start the infrastructure within a test hook - No failures occur because the DB is down
    await dockerCompose.upAll({
      cwd: path.join(__dirname),
      log: true,
    });

    await dockerCompose.exec(
      'database',
      ['sh', '-c', 'until pg_isready ; do sleep 1; done'],
      {
        cwd: path.join(__dirname),
      },
    );
    await dbMigrateTest();
  }

  // 👍🏼 We're ready
  console.timeEnd('global-setup');
};
