const redis=require("redis");
require("dotenv").config();
const redisclient=redis.createClient({
    username: 'default',
    password: process.env.REDIS_KEY,
    socket: {
        host: 'redis-10735.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 10735
    }
})
module.exports=redisclient;