$(document).ready(function() {
   hide_extra();

   $('#audioFile').change(function() {
    hide_extra();
    $('#upload-button').show();
   });
});

//const SERVER_API = 'http://localhost:8880';  // localhost
//const SERVER_API = 'http://localhost:8000';  // Docker
const SERVER_API = 'https://api.prepisreci.cz:8080';  // GCloud

function hide_extra() {
   $('#transcript-short').hide();
   $('#full-transcript-form').hide();  // comment this
   $('#transcript-full').hide();
   $('#upload-spinner').hide();
   $('#invalid-email').hide();
   $('#invalid-gdpr').hide();
   $('#upload-spinner').hide();
   $('#finish-spinner').hide();
}


function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

async function uploadFile() {
    let formData = new FormData();
    //const lang = $("#languageSelect").find(":selected").val();
    //console.log(lang);
    formData.append("file", audioFile.files[0]);
    //formData.append("language", lang);

    let headers = new Headers();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');

    //headers.append('Authorization', 'Basic ' + base64.encode(username + ":" +  password));
    headers.append('Origin', SERVER_API);
    //headers.append('Access-Control-Allow-Origin', '*');

    $('#upload-spinner').show();
    $('#upload-button').hide();

    var res = await fetch(SERVER_API + '/uploadfile', {
        //mode: 'no-cors',
        //credentials: 'include',
        method: 'POST',
        //headers: headers,
        body: formData
    });
    $('#upload-spinner').hide();

    var json = await res.json();
    var fileId = json['id'];
    var text = json['text'];
    var totalSeconds = json['total_seconds'];
    var totalMinutes = json['total_minutes'];
    var totalPrice = json['total_price'];
    window.localStorage.setItem('fileId', fileId);

    /*$("#transcription").text(json.text);
    $("#transcript-download").click(function() {
        const text = $("#transcription").text();
        download('prepis.txt', text);
    });
    $("#transcript-copy").click(function() {
        const text = $("#transcription").text();
        navigator.clipboard.writeText(text);
    });
    $('#transcript-short').show();
    $('#transcript-full').hide();

    if (totalSeconds < 30) {
       $('#full-transcript-form').hide();
    }
    else */{
       $('#transcript-full-button').text('Spustit přepis audio nahrávky [' + totalPrice + ' Kč]');
       $('#full-transcript-form').show();
    }
}

function validateEmail(mail)
{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
        return (true)
    else
        return (false)
}

async function checkout() {
    $('#invalid-email').hide();
    $('#invalid-gdpr').hide();
    const email = $("#email").val();
    const checked = $("#GDPRCheckbox").prop('checked');
    const validEmail = validateEmail(email);
    const id = window.localStorage.getItem('fileId');
    if (id == null || id === undefined || id == 'undefined') {
        alert('Nastala chyba, načtěte stránku znovu.');
        return;
    }
    if (!validEmail) {
        $('#invalid-email').show();
        return;
    }
    if (!checked) {
        $('#invalid-gdpr').show();
        return;
    }

    
    let formData = new FormData();
    formData.append("id", id);
    formData.append("email", email);

    let headers = new Headers();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');

    headers.append('Origin', SERVER_API);

    $('#finish-spinner').show();
    $('#transcript-full-button').hide();

    var res = await fetch(SERVER_API + '/checkout', {
        method: 'POST',
        body: formData
    });
    $('#finish-spinner').hide();
    var json = await res.json();
    const success = json['success'];
    if (success) {
        redirect_url = json['redirect_url'];
        window.location.replace(redirect_url);
    }
    else {
        alert('Chyba: ' + json['error']);
    }

}


