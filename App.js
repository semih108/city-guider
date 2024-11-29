let map;
let userMarker;
let videoStream = null;

document.addEventListener("DOMContentLoaded", () => {
    const openCamBtn = document.getElementById("openCamBtn");
    const captureBtn = document.getElementById("captureBtn");
    const video = document.getElementById("vid");
    const gallery = document.getElementById("gallery");
    const mediaDevices = navigator.mediaDevices;

    // Google Maps initialisieren und auf aktuellen Standort zentrieren
    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 48.2082, lng: 16.3738 }, // Beispiel: Wien
            zoom: 14
        });

        // Ermitteln und Anzeigen des Benutzerstandorts
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setCenter(userLocation);
                    userMarker = new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        title: "Ihr Standort"
                    });
                },
                () => {
                    alert("Standort konnte nicht ermittelt werden.");
                }
            );
        }
    }

    // Init Map aufrufen, wenn Google Maps geladen ist
    window.initMap = initMap;

    openCamBtn.addEventListener("click", () => {
        mediaDevices
            .getUserMedia({
                video: true,
                audio: false
            })
            .then((stream) => {
                videoStream = stream;
                video.srcObject = stream;
                video.play();
            })
            .catch((error) => alert("Fehler beim Zugriff auf die Kamera: " + error));
    });

    captureBtn.addEventListener("click", () => {
        if (videoStream) {
            // Bild aus dem Videostream aufnehmen
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const photoSrc = canvas.toDataURL("image/png");

            // Aktuellen Standort abrufen
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const photoLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // Foto mit Standortinformationen anzeigen
                    displayPhoto(photoSrc, photoLocation);
                });
            } else {
                alert("Geolocation wird von Ihrem Browser nicht unterstützt.");
            }
        } else {
            alert("Die Kamera ist nicht aktiv. Bitte starten Sie zuerst die Kamera.");
        }
    });

    function displayPhoto(photoSrc, location) {
        const photoElement = document.createElement("div");
        photoElement.classList.add("gallery-item");
        photoElement.innerHTML = `
            <img src="${photoSrc}" alt="Aufgenommenes Foto">
            <p>Standort: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}</p>
        `;
        gallery.appendChild(photoElement);
    }
});
