const cache_name = 'land_cache';
const cache_res_list=[
    '200.html',
    'styles/200.min.css',
    'fonts/roboto-v20-latin_cyrillic-regular.woff2',
    'fonts/roboto-v20-latin_cyrillic-700.woff2',
    'img/favicon/apple-touch-icon.png',
    'img/favicon/favicon-16x16.png',
    'img/favicon/favicon-32x32.png',
    'img/favicon/safari-pinned-tab.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(cache_name)
            .then((cache) => cache.addAll(cache_res_list))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(networkOrCache(event.request)
        .catch(() =>fromCache(new Request('200.html')) ));
});

function networkOrCache(request) {
    return fetch(request)
        .then((response) => response.ok ? response : fromCache(request))
        .catch(() => fromCache(request));
}

function fromCache(request) {
    return caches.open(cache_name).then((cache) =>
        cache.match(request).then((matching) =>
            matching || Promise.reject('no-match')
        ));
}