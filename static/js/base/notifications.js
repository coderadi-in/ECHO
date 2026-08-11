export function showNotification(title, message, tag, url) {
    const options = {
        body: message,
        icon: "/static/assets/icons/icon-192.png",
        // badge: "/static/assets/icons/badge-72x72.png",
        tag: tag,
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200]
    };

    const notification = new Notification(title, options);

    notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        if (url) { window.location.href = url; }
    };

    notification.onerror = (err) => {
        console.error("Notification error:", err);
    };
}