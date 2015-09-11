Sounds in ProtoWatch are handled using the [SoundJS library.](http://www.createjs.com/soundjs)
Most sounds are taken from [FlashKit,](http://www.flashkit.com/) which offers a large selection offers
a wide selection of freeware sound effects. 

Sounds are registered in `main.js` in the `soundList` array,
which provides a name (`id`) and a file (`src`) for each sound. The `soundList` array is then used in the ProtoWatch
interface to list and playback sounds accordingly through SoundJS.

Each sound file supplied to SoundJS should conform to the following guidelines:

 - An `ogg` and `mp3` version of each sound file should be supplied with the same filename.
 - Sounds should not exceed one second in length.
 - Sounds should aim to be less than 10 KB in size.
 - Sounds should avoid hard click or popping noises at the beginning and end of playback.