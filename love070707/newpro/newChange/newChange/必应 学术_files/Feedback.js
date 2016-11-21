$(window).ready(function () {        
    AutomaticalIframeHeight();
    SetPlaceHolder();
});

function normal(id, times) {
    var obj = $("#" + id);
    obj.css("background-color", "#FFF");
    if (times < 0) {
        return;
    }
    times = times - 1;
    setTimeout("error('" + id + "'," + times + ")", 150);
}

function error(id, times) {
    var obj = $("#" + id);
    obj.css("background-color", "#F6CECE");
    times = times - 1;
    setTimeout("normal('" + id + "'," + times + ")", 150);
}

function AddFeedback() {
    try {
        var commentText = $.trim($("#cmttext").val());

        var msid = $.trim($("#msid").val());
        var email = $.trim($("#email").val());
        var contact = $.trim((msid != "" && email != "") ? (msid + " | " + email) : (msid != "" ? msid : (email != "" ? email : "")));
        $("#contact").val(contact);

        if (commentText == "") {
            error("cmttext", 1);
            return;
        }

        if (email == "") {
            error("email", 1);
            return;
        }

        if (commentText != "") {
            $("#academicfeedbackform").submit();

            var height = ($("#academicfeedback").position().top + 30) + "px";
            $("#alertmodal .modal-body div").html("<span style='padding-right:10px;'>感谢反馈, 亲的支持是我们持续改进的动力。</span>");
            $("#alertmodal .modal-dialog").css({ "margin-top": height });
            $("#alertmodal").modal("show");

            $("#cmttext").val("");
        } else {
            $("#cmttext").attr("placeholder", "");
        }
    } catch (e) {
    }
}

function AddNewImage(fileList) {
    if (!imageValidation(fileList)) {
        return;
    }

    setImagePreviews(fileList);
}

function setImagePreviews(fileList) {
    var fileNames = "";
    for (var i = 0; i < fileList.length; i++) {
        $("#clippicpreview>div").eq(i).show();
        var previewid = "clippicpreview" + (i + 1);
        var picpreview = document.getElementById(previewid);
        picpreview.innerHTML = "";
        var imgid = "previewImage" + i;
        picpreview.innerHTML += "<img id='" + imgid + "' />";
        var imgObjPreview = document.getElementById(imgid);
        var width = "62px", height = "54px";

        imgObjPreview.style.display = 'block';
        imgObjPreview.style.width = width;
        imgObjPreview.style.height = height;

        imgObjPreview.src = window.URL.createObjectURL(fileList[i]);

        $("#" + previewid).siblings("input").val(fileList[i].name);
        fileNames += fileList[i].name + "|";
        $("#hiddenImageName").val(fileNames);
    }
    $("#clippicpreview").show();
    return true;
}

function imageValidation(fileList) {
    if (!fileList) {
        alert("当前浏览器无法支持图片上传功能，请尝试其它浏览器");
        return false;
    }

    if (fileList.length == 0) {
        resetimgpreview();
        return false;
    }

    if (fileList.length > 1 || fileList[0].size > 3145728 || fileList[0].type.slice(0, 6) != "image/") {
        alert("请选择一张截图上传（小于3M）");
        return false;
    }

    return true;
}

function deleteimg(previewid) {
    resetimgpreview();
    //For support upload multiple files
    //// hide preview image
    //$("#" + previewid).parent().hide();
    //if ($("#clippicpreview>div:visible").length == 0) {
    //    resetimgpreview();
    //}

    //// remove from image list
    //var imageToDelete = $("#" + previewid).siblings("input").val();
    //var currentNames = $("#hiddenImageName").val().split("|");
    //currentNames.splice(currentNames.indexOf(imageToDelete), 1);
    //$("#hiddenImageName").val(currentNames.join("|"));

    //set preview image to default
    $("#" + previewid + ">img").attr("src", "/images/academic/uploadbkg.jpg");

    return;
}

function resetimgpreview() {
    $("#clippicpreview>div").hide();
    $("#clippicpreview").hide();
    $("#clippicpreview img").attr("src", "/images/academic/uploadbkg.jpg");
    $("#clippicpreview").val("");
    $("#hiddenImageName").val("");

    var control = $("#uploadImage");
    control.replaceWith(control = control.clone(true));
}

//
// Automatically adapt the iframe height
//
function AutomaticalIframeHeight() {
    var minHeight = 268;
    var innerPageHeight = 0;
    var appIframeId = null;

    // Get iframe id
    var iframeIdMsg = location.href.split('&iframeId=');
    if (iframeIdMsg.length == 2) {
        appIframeId = iframeIdMsg[1].split('&')[0];
    }

    var dt = setInterval(function () {
        // Get iframe height
        var IE = !!window.attachEvent;
        var compatBody = document.compatMode == "BackCompat" ? document : document.documentElement;
        var elementheight = document.documentElement ? document.documentElement.offsetHeight : 0;
        var bodyheight = document.body ? document.body.offsetHeight : 0;
        var compatheight = compatBody ? compatBody.offsetHeight : 0;
        var currentPageHeight = IE ? bodyheight || compatheight : Math.max(elementheight, bodyheight, compatheight);
        currentPageHeight = currentPageHeight < minHeight ? minHeight : currentPageHeight;

        // Send iframe height to Bing UX server
        if (currentPageHeight != innerPageHeight && currentPageHeight > 0) {
            innerPageHeight = currentPageHeight;
            if (innerPageHeight > 0 && null != appIframeId && null != parent) {
                var msg = [];
                msg.push(innerPageHeight);
                msg.push(appIframeId);
                var prefix = "AdjustIFrameHeight###";
                var content = prefix + msg.join("&");
                parent.postMessage(content, "*");
            }
        }
    }, 200);
}

function SetPlaceHolder() {
    if (isSupportPlaceholder()) {        
        return;
    }

    bindPlaceholderEvent($("#cmttext"), $("#comment_placeholder"));
    bindPlaceholderEvent($("#email"), $("#contact_placeholder"));
}

function bindPlaceholderEvent(inputElem, corElem) {
    corElem.show();

    inputElem.bind("keydown", function () {
        corElem.hide();
    });

    corElem.bind("click", function () {
        inputElem.focus();
    });

    inputElem.bind("keyup", function () {
        if (!inputElem.val()) {
            corElem.show();
        }
    });
}

function isSupportPlaceholder() {
    var test = document.createElement("input");
    return ("placeholder" in test);
}
