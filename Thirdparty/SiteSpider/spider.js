/**
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Find all links and frames on this page.
 * @return {Array<string>} List of all urls.
 */

function get_urls() {
    var urls = [];
    // Copy the link nodelist into an array.
    var a = document.getElementsByTagName('A');
    for (var idx= 0; idx < a.length; ++idx){
        urls.push(a[idx].href);
    }
    // Finding frame URLs using window.frames doesn't work since
    // the framed windows haven't been loaded yet.
    if (window.frames.length) {
        var frames = document.getElementsByTagName('FRAME');
        for (var frame, x = 0; frame = frames[x]; x++) {
            urls.push(frame.src);
        }
        var iframes = document.getElementsByTagName('IFRAME');
        for (var frame, x = 0; frame = iframes[x]; x++) {
            urls.push(frame.src);
        }
    }

    /**
    My implementation! 
    Adding all urls found on the open site, and
    adds them to the Mongolab DB. 

    DOES WORK, BUT NO CONTROL OF DUPLICATES!!!
    **/
    /**
    for(var tempUrl in urls){
        var spiderurls = '{"spiderurl":' + '"' + urls[tempUrl] + '"' + '}';
        var xhr = new XMLHttpRequest();    
            xhr.open("POST", "https://api.mongolab.com/api/1/databases/testbase/collections/spiderurls?apiKey=2P7QlEw29SmcG6BrJ5TZJZZT-eQmd64s");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(spiderurls);
    }
    **/        
    
    for(var tempUrl in urls){
        postToDb(urls[tempUrl]);
    }

    return urls;
}

function postToDb(object){
    /**
    My implementation trying to add the entire array! DOESN'T WORK DOH!
    **/
    //alert("TempUrl: " + urls[tempUrl]);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", 'https://api.mongolab.com/api/1/databases/testbase/collections/spiderurls?q={"spider.url":"' + object + '"}&apiKey=2P7QlEw29SmcG6BrJ5TZJZZT-eQmd64s');
    xhr.onload = function(){
        var response = JSON.parse(xhr.responseText);
        if(response.length === 0){
            var jsonObject = '{"spider":' + '{"url" : "' + object + '", "weight" : 1}}';
            console.log("PostToDB: " + jsonObject);
            
            var xhrPost = new XMLHttpRequest();
            xhrPost.open("POST", "https://api.mongolab.com/api/1/databases/testbase/collections/spiderurls?apiKey=2P7QlEw29SmcG6BrJ5TZJZZT-eQmd64s");
            xhrPost.setRequestHeader("Content-Type", "application/json");
            xhrPost.send(jsonObject);
        } else {
            //Continue here! Code above works fine exept for the alert! Does not work without alert!!!.. 
            //Now you need to update weight for spiderurls if it already exists!!!!!!!!!!!!!!
            //alert("Antal objekt i DB: " + response.length);
                    
            for(var i = 0; i < response.length; i++){ 
                var newWeight = response[i].spider.weight + 1;
                var tempobject = response[i].spider.url;
                //alert(jsonObject);
                var jsonObject = '{"spider":' + '{"url" : "' + tempobject + '", "weight" :' + newWeight + '}}';
                console.log("Update DB: " + jsonObject);
                
                var xhrPut = new XMLHttpRequest();
                xhrPut.open("PUT", 'https://api.mongolab.com/api/1/databases/testbase/collections/spiderurls?q={"spider.url":"' + tempobject + '"}&apiKey=2P7QlEw29SmcG6BrJ5TZJZZT-eQmd64s');
                xhrPut.setRequestHeader("Content-Type", "application/json");
                xhrPut.send(jsonObject);                
            }
        }
    }
    xhr.send();
}


function get_inline() {
    var urls = [];
    // CSS and favicons.
    var links = document.getElementsByTagName('LINK');
    for (var link, x = 0; link = links[x]; x++) {
        if (link.href) {
            urls.push(link.href);
        }
    }
    // Images
    var imgs = document.getElementsByTagName('IMG');
    for (var img, x = 0; img = imgs[x]; x++) {
        if (img.src) {
            urls.push(img.src);
        }
    }
    return urls;
}
function get_scripts() {
    var urls = [];
    // Scripts
    var scripts = document.getElementsByTagName('SCRIPT');
    for (var script, x = 0; script = scripts[x]; x++) {
        if (script.src) {
            urls.push(script.src);
        }
    }
    // Embed
    var embeds = document.getElementsByTagName('EMBED');
    for (var embed, x = 0; embed = embeds[x]; x++) {
        if (embed.src) {
            urls.push(embed.src);
        }
    }
    return urls;
}
window.attemptedLoads = 0;

function finish(){
    if((!document || document.readyState !='complete') && window.attemptedLoads<6) {
        window.clearTimeout(window.pageLoaderPid);
        window.pageLoaderPid = window.setTimeout( finish, 500 );
        window.attemptedLoads++;
        return;
    }
    chrome.runtime.sendMessage({
        links: get_urls(),
        inline: get_inline(),
        scripts:get_scripts(),
        url:document.location.href
    });
}

window.pageLoaderPid = window.setTimeout( finish, 500 );
