let parser = document.createElement("a");
parser.href = document.location.href;
if(parser.hostname === "scratch.mit.edu" && parser.pathname.startsWith("/projects/")) {
    let projectID = parser.pathname.replace(/\D/g,'');
    let script = document.createElement('script');
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
    script.type = 'text/javascript';
    script.onload = customThumbnailMain;
    document.getElementsByTagName('head')[0].appendChild(script);
} else {
    alert("Please click the bookmark on a Scratch project");
}

function customThumbnailMain() {
    function snackBarCSS() {
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "style.css";
        document.head.appendChild(link);
    }

    function error() {
        if(String(err).includes("parameter 1 is not of type 'Blob'.")) {
            document.getElementById("snackbar").innerHTML = 'Error - please upload a downloaded file,<br> not an image from another website.<br><a id="selectThumbnailFile">Select an image</a><br><a onclick="close();">Close</a>';
        } else {
            document.getElementById("snackbar").innerHTML = 'Error - try a smaller image.<br><a id="selectThumbnailFile">Select an image</a><br><a onclick="close();">Close</a>';
        }
        document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
    }

    function getCookie(name) {
        let value = "; " + document.cookie;
        let parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    
    function close() {
        document.getElementById('snackbar').className='';
    }

    function upload(fileLocation) {
        document.getElementById("snackbar").innerHTML = "Reading file...";

        let reader1 = new FileReader();

        reader1.onload = function (e) {
            uploadedImage = e.target.result;
        };
        try{reader1.readAsDataURL(filelocation);}catch(err){error(err);return;}

        let reader = new FileReader();
        reader.onload = function(e2){
            $.ajax({
                type: "POST",
                url: "/internalapi/project/thumbnail/" + projectID + "/set/",
                data: e2.target.result,
                headers: {
                    "X-csrftoken": getCookie("scratchcsrftoken"),
                },
                contentType: "",
                processData: false,
                xhr: function() {
                    var xhr = $.ajaxSettings.xhr();
                    xhr.upload.onprogress = function(e) {
                        if(!document.getElementById("snackbar").innerHTML.includes("Error")){
                            var progress = Math.floor(e.loaded / e.total *100) + '%';
                            document.getElementById("snackbar").innerHTML = "Uploading file " + progress;
                        }
                    };
                    return xhr;
                },
                success: function(msg) {
                    document.getElementById("snackbar").innerHTML = 'The thumbnail was successfully changed.<br><img src="'+uploadedImage+'" height="108" width="144" style="background-color:white;"><br><a id="selectThumbnailFile">Select another image</a><br><a onclick="close();">Close</a>';
                    document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
                },
                error: function() {
                    error();}
            });
        };
        reader.readAsArrayBuffer(filelocation);
    }

    let favicon = document.createElement("link");
    favicon.rel = "shortcut icon";
    favicon.href = "./favicon.ico";
    document.head.appendChild(favicon);
    
    snackBarCSS();
    
    let snackbar = document.createElement("div");
    snackbar.id = "snackbar";
    document.body.appendChild(snackbar);
    document.getElementById("snackbar").innerHTML = '<div id="header">Custom Thumbnail</div><a id="selectThumbnailFile">Select an image</a> or drag and drop anywhere on this page.<br><a onclick="close();">Close</a>';
    document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
    document.getElementById("snackbar").className = "show";

    if(!document.getElementById("uploadthumbnail")) {
        var file = document.createElement("input");
        file.id = "uploadthumbnail";
        file.setAttribute("type", "file");
        file.setAttribute("accept", "image/*");
        document.body.appendChild(file);
        document.getElementById("uploadthumbnail").onchange = function() {
            if(document.getElementById('uploadthumbnail').files[0]) {
                upload(document.getElementById('uploadthumbnail').files[0]);
            }
        };
    } else {
        document.getElementById("uploadthumbnail").click();
    }

    if(!document.getElementById("uploadthumbnaildrag")){
        let dragloaded = document.createElement("span");
        dragloaded.id = "uploadthumbnaildrag";
        document.body.appendChild(dragloaded);

        let dropper = $(document);
        dropper.on("dragover", function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = "copy";
        });
        dropper.on("drop", function(e) {
            e.stopPropagation();
            e.preventDefault();
            upload(e.originalEvent.dataTransfer.items[0].getAsFile());
        });
    } // If drag and drop loader wasn't put before
}
