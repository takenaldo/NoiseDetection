import { useEffect, useState } from "react";
import arrow from "./images/arrow.png"
import "./style.css"



export function VoiceDetector() {

    const [borderColor, setBorderColor] = useState("yellow");

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
    



    useEffect(() => {

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audio = new AudioContext();
                const analyzer = audio.createAnalyser();
                const microphone = audio.createMediaStreamSource(stream);

                analyzer.fftSize = 256; // Adjust FFT size (larger size = more frequency data)

                const audioData = new Uint8Array(analyzer.frequencyBinCount);


                microphone.connect(analyzer);

                function noiseDettector() {
                    analyzer.getByteFrequencyData(audioData);
                    // console.log("length: "+audioData.length)
                    let volume = (audioData.reduce((x, z) => x + z) / audioData.length) * 2;

                    // volume = 64 + 90 + 90
                    let per = Math.min(((volume * 100) / 255).toFixed(0), 100) 
                    // per = 100
                    let deg = ((per / 100) * 180)

                    // console.log("vol: ", volume)
                    volume = volume.toFixed(0);
                    volume = Math.min(volume, 100)
                    // console.log("TO vol: ", volume)

                    let volumePerHundred = (volume * 180 / 150) + "deg";
                    let sound = (volume / 15 * 10).toFixed(0);

                    // document.getElementById("volume").innerHTML = sound + "%";
                    document.getElementById("volume").innerHTML = per + "%";

                    document.documentElement.style.setProperty("--noise", deg+"deg");
                    // document.documentElement.style.setProperty("--noise", "90deg");


                    changeBorderColor(per);
                    console.log("volume: ", volume, "per: ", per, "deg: ", deg, "vol hund: ", volumePerHundred );

                    setTimeout(() => {
                        requestAnimationFrame(noiseDettector);
                    }, 2000); // 500ms delay
                }

                noiseDettector();
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
