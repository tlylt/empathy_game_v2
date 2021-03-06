self.addEventListener("install", e => {
    console.log("Install!");
    e.waitUntil(
        caches.open("static").then(cache => {
            // return cache.addAll(["./", "./style.css", "./game.js"]);
            return cache.addAll(["./assets/icons/favicon-32x32.png", "./assets/audio/bensound-jazzcomedy.mp3", "./assets/images/backgroundv4.png"]);
        })
    )
})

self.addEventListener("fetch", e => {
    // console.log(`Intercepting fetch request for: ${e.request.url}`);
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    )
})