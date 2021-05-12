#!/bin/bash
env=${1:-'dev'}
name="node-meeluo"
logDir="/home/logs/pm2/node-meeluo/"
export NODE_ENV=${env};
export NODE_LOGGER_ENV=${env};
tyarn;
npm run build;
pm2 stop ${name};
pm2 start dist/main.js -i 2 -n ${name} --max-restarts 5  --output ${logDir}access.log --error ${logDir}error.log;
pm2 status;