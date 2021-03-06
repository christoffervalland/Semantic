var enableMicrodata = null;
window.addEventListener("load",function() {
   enableMicrodata = document.getElementById("microdata");
   enableInjection = document.getElementById("injection");
   var microdataEnabled = localStorage["microdata.enabled"];
   if (microdataEnabled === undefined || microdataEnabled == "false") {
      enableMicrodata.checked = false;
   } else if (microdataEnabled == "true") {
      enableMicrodata.checked = true;
   }
   var injectionEnabled = localStorage["injection.enabled"];
   if (injectionEnabled == "false") {
      enableInjection.checked = false;
   } else if (injectionEnabled === undefined || injectionEnabled == "true") {
      enableInjection.checked = true;
   }
   document.getElementById("save").onclick = function() {
      localStorage["microdata.enabled"] = enableMicrodata.checked ? "true" : "false";
      localStorage["injection.enabled"] = enableInjection.checked ? "true" : "false";
   }   
   document.getElementById("clearChrome").onclick = function(){
      if(confirm('Are you sure you want to remove all data form Chrome Storage?')){
         chrome.storage.sync.clear(function(){
            alert("Chrome Storage cleared.");
         });  
      } else {

      }
   }
},false);