const capVideoButton = document.querySelector('.capture-button');
const scButton = document.querySelector('#screenshot-button');
const img = document.querySelector('#screenshot img');
const video = document.querySelector('#screenshot video');
const canvas = document.createElement('canvas');

capVideoButton.onclick = function () {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => {
      console.log(err);
    });
};
scButton.onclick = function () {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  canvas.getContext('2d').drawImage(video, 0, 0);

  let dataUrl = canvas.toDataURL('image/png');
  img.src = dataUrl;

  var hrefElement = document.createElement('a');
  hrefElement.href = dataUrl;
  document.body.append(hrefElement);
  hrefElement.download = 'ScreenShot$.png';
  hrefElement.click();
  hrefElement.remove();
};
