let map;
let userMarker;
let videoStream = null;

document.addEventListener("DOMContentLoaded", () => {
    // Google Maps API script einfügen
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBaxk6h2WzEGf-zD6bGYgoRomki4mTJw5U&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);

    const openCamBtn = document.getElementById("openCamBtn");
    const captureBtn = document.getElementById("captureBtn");
    const video = document.getElementById("vid");
    const gallery = document.getElementById("gallery");
    const mediaDevices = navigator.mediaDevices;
    var userLocation;

    // Google Maps initialisieren und auf aktuellen Standort zentrieren
    function initMap() {
        // Ermitteln und Anzeigen des Benutzerstandorts
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
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

        map = new google.maps.Map(document.getElementById("map"), {
            center: userLocation,
            zoom: 14
        });
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
                    displayPhoto(photoSrc, userLocation);
                });
            } else {
                alert("Geolocation wird von Ihrem Browser nicht unterstützt.");
            }
        } else {
            alert("Die Kamera ist nicht aktiv. Bitte starten Sie zuerst die Kamera.");
        }
    });

    //Vorabgespeicherte Standortinformationen
    const locationInfo = [
        { lat: 47.4061, lng: 9.7442, text: "Fachhochschule Vorarlberg: Ein führendes Zentrum für angewandte Wissenschaften in Dornbirn." },
        // Weitere Standorte und Informationen...
    ];

    function displayPhoto(photoSrc, location) {
        const photoElement = document.createElement("div");
        photoElement.classList.add("gallery-item");
    
        // Suche nach der gespeicherten Info für diesen Standort
        const info = locationInfo.find(
            (loc) =>
                Math.abs(loc.lat - location.lat) < 0.01 &&
                Math.abs(loc.lng - location.lng) < 0.01
        );
    
        // Zeige die Information oder eine Standardnachricht an
        const infoText = info ? info.text : "Keine Informationen für diesen Standort.";
    
        photoElement.innerHTML = `
            <img src="${photoSrc}" alt="Aufgenommenes Foto">
            <p>Standort: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}</p>
            <p>${infoText}</p>
        `;
        gallery.appendChild(photoElement);
    }
});
