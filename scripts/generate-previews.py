"""Synthesise the short course preview clips in public/audio.

The clips are generated rather than downloaded so the repo carries no licensed
audio. Each style is a few lines of additive / Karplus-Strong synthesis.

    python3 scripts/generate-previews.py   # needs numpy and ffmpeg
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 22050
LEN = 15.0
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"
rng = np.random.default_rng(7)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def buf():
    return np.zeros(int(SR * LEN) + SR)


def place(track, sig, t, gain=1.0):
    i = int(t * SR)
    end = min(len(track), i + len(sig))
    if i < end:
        track[i:end] += sig[: end - i] * gain


def env(n, attack=0.005, decay=1.0):
    t = np.arange(n) / SR
    a = np.minimum(1, t / attack)
    return a * np.exp(-t / decay)


def pluck(f, dur=1.5, bright=0.996):
    n = int(SR * dur)
    p = max(2, int(SR / f))
    line = rng.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        out[i] = line[i % p]
        line[i % p] = bright * 0.5 * (line[i % p] + line[(i + 1) % p])
    return out * env(n, 0.002, dur / 2)


def piano(f, dur=1.6):
    n = int(SR * dur)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * k * t) / k**1.5 * np.exp(-t * k * 0.9) for k in range(1, 7))
    return s * env(n, 0.003, dur / 2.2)


def tone(f, dur, shape="sine", vib=0.0, attack=0.02, decay=10.0):
    n = int(SR * dur)
    t = np.arange(n) / SR
    ph = 2 * np.pi * f * t + vib * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.4)
    if shape == "saw":
        s = sum(np.sin(k * ph) / k for k in range(1, 12))
    elif shape == "voice":
        s = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph) + 0.12 * np.sin(5 * ph)
    else:
        s = np.sin(ph)
    release = np.minimum(1, (dur - t) / 0.08)
    return s * env(n, attack, decay) * np.clip(release, 0, 1)


def kick():
    n = int(SR * 0.4)
    t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def snare():
    n = int(SR * 0.25)
    t = np.arange(n) / SR
    return (rng.uniform(-1, 1, n) * 0.7 + np.sin(2 * np.pi * 190 * t) * 0.4) * np.exp(-t * 18)


def hat(open_=False):
    n = int(SR * (0.25 if open_ else 0.06))
    noise = rng.uniform(-1, 1, n)
    noise = np.diff(noise, prepend=0)
    return noise * np.exp(-np.arange(n) / SR * (12 if open_ else 60)) * 0.5


def drums(track, bpm, bars, pattern="rock", start=0.0, swing=0.0):
    beat = 60 / bpm
    for b in range(bars):
        for s in range(8):
            t = start + (b * 4 + s / 2) * beat + (swing * beat / 2 if s % 2 else 0)
            if pattern == "four":
                if s % 2 == 0:
                    place(track, kick(), t, 0.9)
                if s % 2 == 1:
                    place(track, hat(True), t, 0.35)
                if s in (2, 6):
                    place(track, snare(), t, 0.45)
            else:
                place(track, hat(), t, 0.4)
                if s in (0, 5 if pattern == "rock" else 3):
                    place(track, kick(), t, 0.9)
                if s in (2, 6):
                    place(track, snare(), t, 0.6)
                if pattern == "funk" and s in (1, 7):
                    place(track, snare(), t, 0.12)


CHORDS = {
    "C": [48, 52, 55, 60, 64], "G": [43, 47, 50, 55, 59], "Am": [45, 52, 57, 60, 64],
    "F": [41, 48, 53, 57, 60], "Em": [40, 47, 52, 55, 59], "D": [50, 57, 62, 66],
    "Dm7": [50, 57, 60, 65], "G7": [43, 53, 59, 62], "Cmaj7": [48, 55, 59, 64],
    "A7": [45, 52, 55, 61], "D7": [50, 57, 60, 66], "E7": [40, 47, 50, 56],
}


def strum(track, chord, t, down=True, dur=1.8, gain=0.25):
    notes = CHORDS[chord] if down else CHORDS[chord][::-1]
    for i, m in enumerate(notes):
        place(track, pluck(hz(m), dur), t + i * 0.012, gain)


def guitar_fundamentals():
    tr = buf()
    beat = 60 / 96
    for bar, ch in enumerate(["G", "Em", "C", "D"] * 2):
        for i, (off, d) in enumerate([(0, 1), (1, 1), (1.5, 0), (2.5, 0), (3, 1), (3.5, 0)]):
            strum(tr, ch, (bar * 4 + off) * beat, bool(d), gain=0.22 if d else 0.15)
    return tr


def blues_guitar():
    tr = buf()
    beat = 60 / 110
    prog = ["E7", "A7", "E7", "E7", "A7", "A7", "E7", "E7"]
    root = {"E7": 40, "A7": 45}
    for bar, ch in enumerate(prog):
        r = root[ch]
        for b in range(4):
            for k, iv in enumerate((7, 9) if b % 2 else (7, 7)):
                t = (bar * 4 + b + (0.66 if k else 0)) * beat
                place(tr, pluck(hz(r), 0.4, 0.99), t, 0.3)
                place(tr, pluck(hz(r + iv), 0.4, 0.99), t, 0.25)
    lick = [(64, 0), (67, 0.66), (69, 1), (67, 1.66), (64, 2), (62, 3), (64, 3.5)]
    for rep in (8, 20):
        for m, off in lick:
            place(tr, pluck(hz(m + 12), 0.9), (rep + off) * beat, 0.35)
    return tr


def piano_beginners():
    tr = buf()
    beat = 60 / 84
    melody = [60, 62, 64, 65, 67, 67, 69, 67, 65, 64, 62, 60, 64, 62, 60, 60]
    for i, m in enumerate(melody):
        place(tr, piano(hz(m + 12)), i * beat, 0.35)
    for i, ch in enumerate(["C", "G", "F", "C"]):
        for k in range(2):
            place(tr, piano(hz(CHORDS[ch][0]), 2.5), (i * 4 + k * 2) * beat, 0.3)
    return tr


def classical():
    tr = buf()
    step = 60 / 72 / 4
    figures = [[60, 64, 67, 72, 76, 67, 72, 76], [60, 62, 69, 74, 77, 69, 74, 77],
               [59, 62, 67, 74, 77, 67, 74, 77], [60, 64, 67, 72, 76, 67, 72, 76]]
    i = 0
    for fig in figures * 2:
        for _ in range(2):
            for m in fig:
                place(tr, piano(hz(m), 1.0), i * step, 0.22)
                i += 1
    return tr


def vocal():
    tr = buf()
    beat = 60 / 72
    line = [(64, 1), (67, 1), (69, 2), (67, 1), (64, 1), (62, 2), (64, 1), (67, 1), (72, 2), (71, 1), (69, 1), (67, 3)]
    t = 0
    for m, d in line:
        place(tr, tone(hz(m), d * beat + 0.1, "voice", vib=0.015, attack=0.08), t, 0.25)
        t += d * beat
    for i, ch in enumerate(["C", "Am", "F", "G"] * 2):
        for m in CHORDS[ch][:3]:
            place(tr, tone(hz(m), 4 * beat, "sine", attack=0.3, decay=4), i * 4 * beat, 0.08)
    return tr


def songwriting():
    tr = buf()
    beat = 60 / 100
    for bar, ch in enumerate(["C", "G", "Am", "F"] * 2):
        for off, d in [(0, 1), (1, 1), (2, 1), (2.5, 0), (3, 1)]:
            strum(tr, ch, (bar * 4 + off) * beat, bool(d), dur=1.2, gain=0.2)
    hook = [(72, 0), (71, 1), (72, 1.5), (74, 2), (76, 3), (74, 4), (72, 5), (71, 6)]
    for start in (8, 24):
        for m, off in hook:
            place(tr, tone(hz(m), 0.9 * beat, "voice", vib=0.01, attack=0.05), (start + off) * beat, 0.18)
    return tr


def drumming():
    tr = buf()
    drums(tr, 104, 6, "funk")
    beat = 60 / 104
    for i in range(16):  # closing fill
        place(tr, snare() if i % 4 != 3 else kick(), (24 + i / 4) * beat, 0.55)
    drums(tr, 104, 1, "rock", start=28 * beat)
    return tr


def jazz():
    tr = buf()
    beat = 60 / 120
    prog = ["Dm7", "G7", "Cmaj7", "Cmaj7"] * 2
    walk = [50, 53, 57, 60, 43, 47, 50, 53, 48, 52, 55, 59, 48, 47, 45, 43]
    for bar, ch in enumerate(prog):
        for b in range(4):
            place(tr, pluck(hz(walk[(bar % 4) * 4 + b] - 12), 0.6, 0.995), (bar * 4 + b) * beat, 0.45)
            place(tr, hat(), (bar * 4 + b + (0.66 if b % 2 else 0)) * beat, 0.2)
        for m in CHORDS[ch]:
            place(tr, piano(hz(m), 1.2), (bar * 4 + 1.66) * beat, 0.12)
    solo = [74, 72, 71, 69, 67, 65, 64, 62, 71, 72, 74, 77, 76, 74, 72]
    for i, m in enumerate(solo):
        place(tr, tone(hz(m), 0.3, "saw", attack=0.01, decay=0.4), (16 + i * 0.66) * beat, 0.08)
    return tr


def production():
    tr = buf()
    beat = 60 / 90
    drums(tr, 90, 6, "rock", swing=0.15)
    for bar, ch in enumerate(["Am", "F", "C", "G"] * 2):
        for m in CHORDS[ch][1:4]:
            place(tr, tone(hz(m), 4 * beat, "saw", attack=0.5, decay=6), bar * 4 * beat, 0.035)
        place(tr, tone(hz(CHORDS[ch][0] - 12), 4 * beat, "sine", attack=0.01, decay=3), bar * 4 * beat, 0.3)
    return tr


def electronic():
    tr = buf()
    beat = 60 / 124
    drums(tr, 124, 8, "four")
    arp = [57, 60, 64, 69, 64, 60]
    for i in range(int(LEN / (beat / 4))):
        root = [0, -4, 3, -2][(i // 16) % 4]
        f = hz(arp[i % len(arp)] + root + 12)
        duck = 0.4 if i % 4 == 0 else 1.0  # crude sidechain
        place(tr, tone(f, beat / 4, "saw", attack=0.003, decay=0.12), i * beat / 4, 0.06 * duck)
    return tr


STYLES = {
    "guitar-fundamentals": guitar_fundamentals,
    "piano-for-beginners": piano_beginners,
    "advanced-vocal-techniques": vocal,
    "drumming-mastery": drumming,
    "jazz-improvisation": jazz,
    "music-production-fundamentals": production,
    "songwriting-essentials": songwriting,
    "electronic-music-production": electronic,
    "classical-music-history": classical,
    "blues-guitar-techniques": blues_guitar,
}


def write(slug, sig):
    sig = sig[: int(SR * LEN)]
    fade = int(SR * 1.0)
    sig[-fade:] *= np.linspace(1, 0, fade)
    sig = sig / (np.max(np.abs(sig)) + 1e-9) * 0.85
    pcm = (sig * 32767).astype("<i2").tobytes()
    OUT.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-codec:a", "libmp3lame", "-b:a", "64k", str(OUT / f"{slug}.mp3")],
        input=pcm, check=True,
    )


if __name__ == "__main__":
    slugs = [c["slug"] for c in json.loads((ROOT / "src/data/courses.json").read_text())["courses"]]
    for slug in slugs:
        write(slug, STYLES[slug]())
        print("wrote", slug, file=sys.stderr)
