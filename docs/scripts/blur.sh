./ffmpeg.exe -i Disjoint.mp4 -filter_complex "[0:v]crop=72:680:0:0,avgblur=18[fg];[0:v][fg]overlay=0:0[v]" -map "[v]" -map 0:a? -c:v libx264 -c:a copy -movflags +faststart Disjoint_blur.mp4
./ffmpeg.exe -i Independent.mp4 -filter_complex "[0:v]crop=72:680:0:0,avgblur=18[fg];[0:v][fg]overlay=0:0[v]" -map "[v]" -map 0:a? -c:v libx264 -c:a copy -movflags +faststart Independent_blur.mp4
