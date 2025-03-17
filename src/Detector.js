import { useEffect, useState } from "react";
import axios from "axios";
import arrow from "./images/arrow.png"
import "./style.css"


export function VoiceDetector() {

    const [borderColor, setBorderColor] = useState("yellow");

    const [lastrecoringTimestamp, setLastrecordingTimestamp] = useState(0)

    function changeBorderColor(volume) {
        if (volume <= 25){
            setBorderColor("green")
        }
        else if (volume <= 50){
            setBorderColor("orange")
        }
        else if (volume <= 75){
            setBorderColor("yellow")
        }
        else{
            setBorderColor("red")
        }
        // console.log(volume, borderColor)
        }


    function saveVolume(volume){
        // Save Volume to the database using post request
        // records are saved every 5 seconds

        let now = Date.now()
        console.log(now , "-", lastrecoringTimestamp, "=>> ",parseInt((now - lastrecoringTimestamp), 10), (parseInt((now - lastrecoringTimestamp), 10) > 30000) )
        if (parseInt((now - lastrecoringTimestamp), 10) > 30000){
            axios.post('http://127.0.0.1:8080', { volume: volume })
            .then(response => {
                console.log('Volume data sent successfully:', response.data);
            })
            .catch(error => {
                console.error('Error sending volume data:', error);
            });
            setLastrecordingTimestamp(now)
        }
    }

    useEffect(() => {


    navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audio = new AudioContext();
                const analyzer = audio.createAnalyser();
                const microphone = audio.createMediaStreamSource(stream);

                analyzer.fftSize = 256; // Adjust FFT size (larger size = more frequency data)

                const audioData = new Uint8Array(analyzer.frequencyBinCount);


                microphone.connect(analyzer);

                function noiseDetector() {
                    analyzer.getByteFrequencyData(audioData);

                    let volume = (audioData.reduce((x, z) => x + z) / audioData.length) * 2;

                    let per = Math.min(((volume * 100) / 255).toFixed(0), 100) 
                    let deg = ((per / 100) * 180)

                    volume = volume.toFixed(0);
                    volume = Math.min(volume, 100)

                    let volumePerHundred = (volume * 180 / 150) + "deg";
                    let sound = (volume / 15 * 10).toFixed(0);

                    document.getElementById("volume").innerHTML = per + "%";

                    document.documentElement.style.setProperty("--noise", deg+"deg");

                    changeBorderColor(per);

                    requestAnimationFrame(noiseDetector);
                    saveVolume(volume)

                }

                noiseDetector();

            })
            .catch(err => console.log("microphone access denied: ", err));


    }
    )


    return (
    <div className="container">
    <div className="halfCircle" style={{
        // border: var(--border_width) solid var(--border_color); 
        borderColor: borderColor

}}>


        <img src={arrow} alt="arrow image"/>
    </div>
    <div className="bottomHalf">
        <p>0%</p>
        <p id="volume"></p>
        <p>100%</p>
    </div>
    <p id="note">This is a live noise detector w/c will display the amount of noise that is coming from the surrounding</p>
</div>
    )




}
