class Generator {
	constructor(DOMNode) {
		// create canvas
		this.renderCanvas = document.createElement('canvas');
		
		this.renderLayers = [];
		this.userSelectedImages = [];
		
		this.DOMNode = DOMNode;
		this.notRenderedImages = 0;
	}
	
	preloadImage(layer) {
		if(layer.src && layer.src != 'user-select') {
			this.notRenderedImages++;
			let image = new Image();
			image.src = layer.src;
			image.style.display = 'None';
			this.DOMNode.appendChild(image);
			layer.image = image;
			
			image.addEventListener('load', function() {
				this.notRenderedImages--;
				console.log("Image ready");
			});
		}
	}
	
	fromLayers(layers) {
		layers.forEach(layer => {
			this.renderLayers.push(layer);
			this.preloadImage(layer);
		});
	}
	
	addLayer(layer) {
		this.renderLayer.push(layer);
		this.preloadImage(layer);
	}
	
	addUserSelectedImage(src) {
		this.userSelectedImages.push(src);
	}
	
	render() {
		let usedUserImages = 0;
		let renderContext;
		this.renderLayers.forEach((layer, index) => {
			if(index == 0) {
				this.renderCanvas.width = layer.size && layer.size.width ? layer.size.width : Generator.defaults.size.width;
				this.renderCanvas.height = layer.size && layer.size.height ? layer.size.height : Generator.defaults.size.height;
				
				renderContext = this.renderCanvas.getContext('2d');
			}
			
			let render = {
				offset: {
					top: (layer.offset && layer.offset.top) ? layer.offset.top : 0,
					left: (layer.offset && layer.offset.left) ? layer.offset.left : 0
				},
				size: {
					width: (layer.size && layer.size.width) ? layer.size.width : null,
					height: (layer.size && layer.size.height) ? layer.size.height : null
				}
			}
			
			if(layer.color) {
				renderContext.beginPath();
				renderContext.rect(render.offset.left, render.offset.top, render.size.width, render.size.height);
				renderContext.fillStyle = layer.color;
				renderContext.fill();
			}
			
			if(layer.src) {
				let image = new Image();
				if(layer.image) {
					image = layer.image;
				} else {
					image.src = this.userSelectedImages[usedUserImages];
					image.style.display = 'None';
					this.DOMNode.appendChild(image);
					usedUserImages++;
				}
				if((render.size.width == null) || (render.size.height == null)) {
					render.size.width = image.width;
					render.size.height = image.height;
				}
				
				let scale;
				if(layer.scale) {
					if(layer.scale.fixed) {
						scale = layer.scale.factor ? layer.scale.factor : 1;
					} else {
						const scale_width = layer.size.width  / image.width;
						const scale_height = layer.size.height / image.height;
      	
						scale = Math.min(scale_width, scale_height);
						
						render.offset.left += (render.size.width - (image.width * scale)) / 2 // width allignment
						render.offset.top += (render.size.height - (image.height * scale)) / 2 // height allignment
					}
				}
				renderContext.drawImage(image, render.offset.left, render.offset.top, image.width * scale, image.height * scale);
			}
			
			if(layer.text) {
				renderContext.font = layer.text.font;
				renderContext.fillStyle = layer.text.color;
				renderContext.fillText(layer.text.content ? layer.text.content : "", render.offset.left, render.offset.top)
			}
		});
		
		return this.renderCanvas.toDataURL();
	}
}
