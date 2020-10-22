import {choose} from "./utils.js";

const scales = {
        major:[0,2,3,5,7,8,10],
        minor:[0,2,4,5,7,9,11]
    };
const chordTypes = {
    triad: [0,2,4],
    single: [0]
};

function modulate(key: Key, scale: Scale): [Key, Scale] {
    choose([
        () => {
            // Move to relative major or minor
            if (scale === scales.minor) {
                scale = scales.major;
                key = (key + 3) % 12 as Key;
            } else if (scale === scales.major) {
                scale = scales.minor;
                key = (key + 9) % 12 as Key;
            }
        },
        () => {
            // Move around the cycle of fifths
            if (Math.random() < 0.5) {
                key = (key + 7) % 12 as Key;
            } else {
                key = (key + 5) % 12 as Key;
            }
        }
    ])();
    return [key, scale]
}

export {scales, chordTypes, modulate}