"""Original synthesized, loopable, low-volume toy-piano score; no sampled music."""
import numpy as np, wave
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'public/assets'
SR=22050; beat=60/78; duration=32*beat
x=np.zeros(round(duration*SR))
def add(note,start,length,amp=.07):
 f=440*2**((note-69)/12); t=np.arange(round(length*SR))/SR
 env=(1-np.exp(-t*70))*np.exp(-t*2.8/length)
 signal=(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2*t)+.08*np.sin(2*np.pi*f*3*t))*env*amp
 i=round(start*SR)
 for j in range(len(signal)):
  x[(i+j)%len(x)]+=signal[j]
chords=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,67]]
for bar in range(8):
 chord=chords[bar%4]
 for k in range(4):add(chord[k]+12,(bar*4+k)*beat,beat*1.65,.04)
 for k in [0,2]:add(chord[0]-12,(bar*4+k)*beat,beat*2,.035)
# A small original answering melody; repeated bars form a seamless loop.
melody=[76,79,76,74,72,76,74,71,69,72,76,72,71,74,79,74]
for i,n in enumerate(melody):add(n,(i*2+.5)*beat,beat*1.5,.045)
x=np.tanh(x)*.75
with wave.open(str(out/'cozy-loop.wav'),'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype('<i2').tobytes())
print('original loop',round(duration,2),'sec')
