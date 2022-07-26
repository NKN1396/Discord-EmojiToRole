#!/bin/sh
./ffmpeg.exe -i Disjoint_blur.mp4 -f gif Disjoint.gif
./ffmpeg.exe -i Independent_blur.mp4 -f gif Independent.gif