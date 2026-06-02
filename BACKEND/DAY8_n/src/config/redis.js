const redis=require("redis");
require("dotenv").config();
const redisclient=redis.createClient({
    username: 'default',
    password: process.env.REDIS_KEY,
    socket: {
        host: 'redis-16279.crce276.ap-south-1-3.ec2.cloud.redislabs.com',
        port: 16279
    }
})
module.exports=redisclient;