import webPush from "web-push"
/** @type {import('./$types').RequestHandler} */
export async function GET() {

    var vapidKeys = {
        "publicKey": "BN6BYQfzTUFuBbikGflyhvlwSaoGryoxZBnsSmzO8vxI2JEkz6xx54HdYuVSDtAD_GuxAbSkgk611rxL0X6fmhQ",
        "privateKey": "S7oWtm7nPCyCoOl49gcRSJLEEgr7JXqIv-OYcEQN-JE"
    }


    webPush.setVapidDetails("mailto:https://my-site.com/contact", vapidKeys.publicKey, vapidKeys.privateKey)


    var demoSubcription = {
        "endpoint": "https://fcm.googleapis.com/fcm/send/fmf1mSTZMaQ:APA91bEd4UdXQh6Q8CEw9XIzxg6Dp_ZiDqp8nZO8B56BO4tAIO3lRYSBucnwc1f8aKVD1QKGaXDVuRbqg5VHioilZZeN2Rsomxck7B6kvgOG5oaABNN3wcf9735JYbwkVSR2Jmpr6WQl",
        "expirationTime": null,
        "keys": {
            "p256dh": "BPuRUn6GfTr38M5WAZjR5eTib-0u1fYYKjlAEJdxRhdeSAVLBWCRzV4lwkKF0nx58Xfg3BxqObw7J771xJsUtiU",
            "auth": "vUbixD17qaZjFev6sejllg"
        }
    }

    webPush.sendNotification(demoSubcription, JSON.stringify({ title: "this is title", body: "this is body" }))


    return new Response(JSON.stringify(vapidKeys), { status: 200, statusText: "Ok" });
}