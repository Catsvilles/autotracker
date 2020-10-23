/*
  Copyright 2020 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/
import {choose, fill, rndInt} from './utils.js';
import * as music from './theory.js';
const PatternSize = 64;

function flip(trueChance: number = 0.5) {
    return Math.random() < trueChance;
}

function getChord(progression: Progression, key: Key, scale: Scale, rowIndex: number): number[] {
    const progIndex = Math.floor(rowIndex / 4);
    const chordNumber = progression[progIndex];
    return music.chordTypes.triad.map(noteIndex => key + scale[(chordNumber - 1 + noteIndex) % scale.length]);
}

function arp(progression: Progression, key: Key, scale: Scale): Pattern<Note> {
    const octave = choose([0,12,24]);
    const offset = choose([0,1,2]);
    const pwOffset = rndInt(8) * 2;
    const pwCycle = choose([4,5,6,8,12,16]);
    return fill(PatternSize, i => {
        const chord = getChord(progression, key, scale, i);
        return {
            note: chord[(i + offset + choose([0, 0, 0, 1, 2])) % chord.length] + octave + choose([0,12]),
            fx: {
                pulseWidth: ((pwOffset + i) % pwCycle) / (pwCycle + 1)
            }
        } as Note;
    })
}
function bass(progression: Progression, key: Key, scale: Scale): Pattern<Note> {
    return fill(PatternSize, i => {
        const chord = getChord(progression, key, scale, i);
        return {note: i % 2 === 1 ? 'cont' : chord[0] + (Math.floor(i / 2) % 2) * 12 - 12, fx: {pulseWidth: 0}} as Note;
    })
}
function bass2(progression: Progression, key: Key, scale: Scale): Pattern<Note> { return fill(PatternSize, i => {
    const chord = getChord(progression, key, scale, i);
    return {note: i % 8 === 0 ? chord[0] - 12: 'cont', vel: 2, fx: {pulseWidth: Math.random()}} as Note;
})}
function melody1(progression: Progression, key: Key, scale: Scale): Pattern<Note> {
    const slow = flip();
    const pwmMod = flip();
    let pwmAmount = Math.random() * 0.5;

    const pattern: Note[] = [];
    let current = (choose(music.chordTypes.triad) - 1) + scale.length * choose([2, 3, 4]);
    for (let i = 0; i < PatternSize; i++) {
        pwmAmount += flip() ? 0.05 : -0.05;
        pwmAmount += pwmAmount > 0.7 ? -0.05 : pwmAmount < 0.1 ? 0.05 : 0;

        if (slow && i % 2 === 1 || flip(0.1 + 0.4 * (1 - i % 2))) {
            pattern.push({note: "cont", fx: {pulseWidth: pwmMod ? pwmAmount : 0}});
        } else {
            if (current > 10 && flip()) {
                current--;
            } else if (current < 32 && flip()) {
                current++;
            } else if (current > 15 && flip(0.2)) {
                current -= choose([2, 4, 7]);
            } else if (current < 25 && flip(0.2)) {
                current += choose([2, 4, 7]);
            }
            const chord = getChord(progression, key, scale, i);

            if (flip() && !chord.includes(current % scale.length)) {
                current += flip() ? -1 : 1;
            }

            pattern.push({
                note: key + scale[current % scale.length] + Math.floor(current / scale.length) * 12,
                fx: {
                    glide: flip(0.2) ? choose([0.1, 0.2, 0.5, 0.7]) : 0,
                    pulseWidth: pwmMod ? pwmAmount : 0
                }
            });
        }

    }
    return pattern;
}
function emptyNote(): Pattern<Note> { return fill(PatternSize, _ => ({note: '---'} as Note))}
function emptyDrum(): Pattern<Drum> { return fill(PatternSize, _ => ({drum: '---'} as Drum))}
function drum(): Pattern<Drum> { return fill(PatternSize, i => ({
    drum: i % 8 === 0 ? 'KCK' :
            i % 8 === 4 ? 'SNR' :
              (i % 2 === 0 && flip(0.2)) ? 'KCK' :
                flip(0.05) ? choose(['KCK', 'SNR']) : 'NSS',
    vel: 0.6 + 0.2 * (1-(i % 2))
}))}

export {arp, bass, bass2, melody1, drum, emptyNote, emptyDrum}