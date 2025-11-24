
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove "data:*/*;base64," prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
};

const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;
  
    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
  
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
  
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length
  
    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));
  
    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }
  
    return new Blob([view], { type: "audio/wav" });
  
    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
  
    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
};

export const convertFileToWav = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const reader = new FileReader();

        reader.onload = (e) => {
            if (!e.target?.result) {
                return reject(new Error("Failed to read file"));
            }
            audioContext.decodeAudioData(e.target.result as ArrayBuffer, 
                (buffer) => {
                    const wavBlob = audioBufferToWav(buffer);
                    resolve(wavBlob);
                },
                (error) => {
                    reject(new Error(`Failed to decode audio data: ${error.message}`));
                }
            );
        };

        reader.onerror = (error) => {
            reject(error);
        };
        
        reader.readAsArrayBuffer(file);
    });
};