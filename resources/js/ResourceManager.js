function ResourceManager() {

     var txtResources = [];
     var imgResources = [];
     var promises = [];

     this.addTxtResourceToLoad = function(resource) {
          txtResources.push(resource);
     }

     this.addImgResourceToLoad = function(resource) {
          imgResources.push(resource);
     }

     // Load all the resources
     this.loadAllResources = function(callback) {
          // Load all the text resources
          txtResources.forEach(function(r) {
               promises.push(
                    new Promise(function(resolve, reject) {
                         var req = new XMLHttpRequest();
                         req.open('GET', r.url);
                         req.onload = function() {
                              if (req.status == 200) {
                                   r.content = req.responseText;
                                   resolve();
                              }
                              else {
                                   reject();
                              }
                         };
                         req.send();
                    })
               );
          });
          // Load all the img resources
          imgResources.forEach(function(r) {
               promises.push(
                    new Promise(function(resolve, reject) {
                         r.content = new Image();
                         r.content.onload = function() {
                              resolve();
                         }
                         r.content.onerror = function() {
                              reject();
                         }
                         r.content.src = r.url;
                    })
               );
          });
          // Fire a callback when all resources are loaded
          Promise.all(promises).then(function() {
               callback();
          });
     }

}
