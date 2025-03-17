
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audio = new AudioContext();
        const analyzer = audio.createAnalyser();
        const microphone = audio.createMediaStreamSource(stream);
        const audioData = new Uint8Array(analyzer.frequencyBinCount);
        microphone.connect(analyzer);

        function noiseDettector() {
            analyzer.getByteFrequencyData(audioData);
            let volume = audioData.reduce((x, z) => x + z) / audioData.length;
            volume = volume.toFixed(0);
            volumePerHundred = (volume * 180 / 150) + "deg";
            let sound = (volume / 15 * 10).toFixed(0);
            document.getElementById("volume").innerHTML = sound + "%";  // can be handled by useState
            document.documentElement.style.setProperty("--noise", volumePerHundred);
            requestAnimationFrame(noiseDettector);
            borderColor(volume);
        }

        noiseDettector();
    })
    .catch(err => console.log("microphone access denied: ", err));


// can be handeled using use State    
function borderColor(volume) { // not so good function naming
    if (volume >= 30) // better to check using '<'
        // better not to use the --border_color var, atleast this way
        //the coloring can be easily handled by state
        document.documentElement.style.setProperty("--border_color", "green");
    else if (volume >= 50) // will never occur
        document.documentElement.style.setProperty("--border_color", "orange");
    else if (volume >= 80) // will never occur
        document.documentElement.style.setProperty("--border_color", "red");
    else
        document.documentElement.style.setProperty("--border_color", "greenyellow");
}