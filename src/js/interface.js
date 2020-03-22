let config;
let layers;

function getConfig() {
  return fetch('config/config.json')
    .then(response => response.json())
}

function getLayers() {
  return fetch('config/layers.json')
    .then(response => response.json())
}

addEventListener('load', function() {
  Promise.all([getConfig(), getLayers()])
    .then(([jsonConfig, jsonLayers]) => {
      config = jsonConfig;
      layers = jsonLayers;
      return 1
    }).then(value => {
      generateElements();
    }).catch(error => {
      console.log(error);
    });
});

function generateElements() {
  // Create DOM structure
  console.log(config);
  var mainElement = document.getElementById(config.rootElementId);
  mainElement.innerHTML = "";
	
  let statusElement = document.createElement('p');
  statusElement.textContent = config.messages.status.startup;
  mainElement.appendChild(statusElement);

  let fileUploadElement = document.createElement('input');
  fileUploadElement.type = 'file';
  mainElement.appendChild(fileUploadElement);
  
  // create generator to make time to load the images
  const generator = new Generator(mainElement);
  generator.fromLayers(layers.layers);
	
  fileUploadElement.addEventListener('change', function() {
    if(this.files && this.files[0]) {
      statusElement.textContent = config.messages.uploading;
			
      let uploadedImage = document.createElement('img');
      uploadedImage.src = URL.createObjectURL(this.files[0]);
			
      uploadedImage.addEventListener('load', function() {
	statusElement.textContent = config.messages.status.processing;
	
	generator.addUserSelectedImage(uploadedImage.src);
				
	blob = generator.render();
				
	// set image url to blob
        let downloadImageElement = document.createElement('img');
      	downloadImageElement.src = blob;
        mainElement.appendChild(downloadImageElement);

      	statusElement.textContent = config.messages.status.done;

	// create downloadlink
        let downloadButtonElement = document.createElement('a');
        downloadButtonElement.innerText = config.messages.buttons.download;
        downloadButtonElement.href = blob;
        downloadButtonElement.download = config.profilePictureName;
        mainElement.appendChild(downloadButtonElement);
        
        // create recreate button and remove filechooser
        mainElement.removeChild(fileUploadElement);

        let renewFormElement = document.createElement('button');
        renewFormElement.innerText = config.messages.buttons.newImage;
        renewFormElement.addEventListener('click', function(){
          generateElements();
        });
        mainElement.appendChild(renewFormElement);
      });
    }
  });
}
