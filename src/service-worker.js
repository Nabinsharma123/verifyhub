


self.addEventListener('push', async (e) => {
    var res = await e.data.json()
    console.log(res);
    self.registration.showNotification('Hello world!');

})