let map;
let userMarker;
let videoStream = null;
let model; // TensorFlow.js-Modell

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
    var detectedObjectText;

    // TensorFlow.js-Modell laden
    loadModel();

    // Google Maps initialisieren
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
                console.log("Video-Stream gestartet");
                detectObjects(); // Starte Objekterkennung
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
            <p>Erkanntes Objekt: ${detectedObjectText}</p>
        `;
        gallery.appendChild(photoElement);
    }

    async function loadModel() {
        try {
            model = await cocoSsd.load();
            console.log("TensorFlow-Modell erfolgreich geladen!");
        } catch (error) {
            console.error("Fehler beim Laden des Modells:", error);
        }
    }

    function detectObjects() {
        // Überprüfen, ob das Modell und der Video-Stream bereit sind
        if (model && video.readyState >= video.HAVE_ENOUGH_DATA) {
            model.detect(video).then((predictions) => {
                if (predictions.length > 0) {
                    console.log("Erkannte Objekte:", predictions);
                    const detectedObject = document.getElementById("detectedObject");
                    detectedObject.innerHTML = `
                    <p>Erkanntes Objekt: ${predictions[0].class}</p>
                    <p>Punkte: ${predictions.length}</p>
                    `;
                    detectedObjectText = predictions[predictions.length -1].class;
                } else {
                    detectedObjectText = "Keine Objekte erkannt";
                    console.log("Keine Objekte erkannt.");
                }
                drawPredictions(predictions);
            }).catch((error) => console.error("Fehler bei der Objekterkennung:", error));
    
            requestAnimationFrame(detectObjects);
        } else {
            console.log("Video-Stream noch nicht bereit.");
            // Überprüfe den Video-Stream erneut nach einer kurzen Verzögerung
            setTimeout(detectObjects, 100);
        }
    }
});
