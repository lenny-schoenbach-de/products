//Define all variables
var utilityFunctions, submitCallback, flowCallback, phoneValidation, surveyOptions, cf, hubspotCallback, url, style;

//Initiate variables
utilityFunctions = {

  getCookie: function (name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : undefined;
  },
  openFullscreen: function (elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  },
  closeFullscreen: function () {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  },
  isCalendlyEvent: function (e) {

    return e.data.event && e.data.event.indexOf("calendly") === 0;

  }

};
hubspotCallback = function (callback) {

    //Define all variables
    var appscriptUri, formData, appscriptPayload;

    //Initiate variables
    appscriptUri = callback.redirectUri;
    formData = cf.getFormData(true);
    
    //Call endpoint
    $.ajax({
      crossDomain: true,
      url: appscriptUri + "?callback=startRedirectFlow&email=" + formData.email + "&hubspot_form_id=" + chatSettings.form.hubspotFormId,
      method: "GET",
      dataType: "jsonp"
    });

};
submitCallback = function () {

    //Define all variables
    var trackingCookies, dataLayer, formData, hubspotUri, hubspotPayload, hubspotFields, hubspotContext;

    //Intiate variables
    trackingCookies = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_placement", "landingpage", "referrer"];
    dataLayer = window.dataLayer || [];
    formData = cf.getFormData(true);
    hubspotUri = "https://api.hsforms.com/submissions/v3/integration/submit/";
    hubspotPayload = {};
    hubspotFields = [];
    hubspotContext = {};

    //Track Submitted a survey
    dataLayer.push({

      event: "Submitted a form",
      form_id: chatSettings.form.hubspotFormId,
      form_type: "chat",
      form_name: chatSettings.form.hubspotFormName

    });

    //Create hubspotUri
    hubspotUri += chatSettings.form.hubspotAccountId + "/" + chatSettings.form.hubspotFormId;

    //Add tracking cookies to formData
    trackingCookies.forEach(function (cookie) {

      //Check if cookie is set
      if (utilityFunctions.getCookie(cookie)) {

        //Update formData
        formData["tracking_" + cookie] = utilityFunctions.getCookie(cookie);

      }

    });

    //Create hubspotFields
    Object.keys(formData).forEach(function (response) {

      //Add to payload
      hubspotFields.push({

        name: response,
        value: Array.isArray(formData[response]) ? formData[response].join(";") : formData[response]

      });

    });

    //Create hubspotContext
    hubspotContext["pageName"] = document.title;
    hubspotContext["pageUri"] = window.location.href.split("?")[0];

    //Add tracking data
    if (utilityFunctions.getCookie("hubspotutk")) {

      hubspotContext["hutk"] = utilityFunctions.getCookie("hubspotutk");

    }

    //Fill hubspotPayload
    hubspotPayload["context"] = hubspotContext;
    hubspotPayload["fields"] = hubspotFields;

    //Call Hubspot API
    $.ajax({
      url : hubspotUri,
      type : 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json' 
      },
      data : JSON.stringify(hubspotPayload),
      dataType: 'json',
      success : hubspotCallback,
      error : function (request, error) {
        console.log("Request: "+JSON.stringify(request));
      }
    });

};
flowCallback = function(dto, success, error) {

  //Define all variables
  var dataLayer, stepName, stepText, stepValue;

  //Initiate variables
  dataLayer = window.dataLayer || [];
  stepName = dto.tag.name;
  stepText = dto.text;
  stepValue = dto.tag["_values"] || stepText;
  stepValue = stepValue.length > 1 ? stepValue : stepValue[0];

  //Track Filled a form
  dataLayer.push({

    event: "Filled a form",
    form_field_number: cf.flowManager.getStep() + 1,
    form_field_name: stepName,
    form_field_value: stepValue,
    form_field_text: stepText,
    form_id: chatSettings.form.hubspotFormId,
    form_type: "chat",
    form_name: chatSettings.form.hubspotFormName

  });

  //Validate checkbox input
  if (dto.controlElements) {
    if (dto.controlElements[0].type === "CheckboxButton") {

      if (stepValue === undefined || stepValue.length < 1) {

        return error();

      } 

    }
  }

  //Initiate fullscreen
  if (stepName === "flow_start") {

    //Request fullscreen
    utilityFunctions.openFullscreen(document.getElementById(chatSettings.chat.context));

  }

  return success();

};
phoneValidation = function (dto, success, error) {

  return /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{7,15})$/.test(dto.text) ? success() : error();

};
url = new URL(window.location.href);
style = document.documentElement.style;

//Prefill input fields
chatSettings.chat.flow.forEach(function (question) {

  if (question.tag === "input") {

    //Check url && cookie
    question["value"] = url.searchParams.get(question.id) || utilityFunctions.getCookie(question.id) || "";

  }

});

//Push last message
chatSettings.chat.flow.push({
  "tag": "cf-robot-message",
  "cf-questions": chatSettings.chat.text.submissionPending + "&&<i class=\"fa fa-spinner fa-spin\"></i>"
});

//Initiate surveyOptions
surveyOptions = {
  options: {
    theme: "purple",
    preventAutoStart: true,
    preventAutoAppend: true,
    preventAutoFocus: true,
    showProgressBar: true,
    loadExternalStyleSheet: false,
    dictionaryData: {
      "entry-not-found": "Der Eintrag konnte nicht gefunden werden",
      "input-placeholder": "Schreib' hier deine Antwort rein",
      "input-placeholder-required": "Beantworte bitte die Frage",
      "input-placeholder-error": "Deine Eingabe ist leider nicht korrekt",
      "input-placeholder-file-error": "Datei-Upload fehlgeschlagen ...",
      "input-placeholder-file-size-error": "Dateigröße zu groß ...",
      "input-no-filter": "Es gibt keine Ergebnisse für \"{input-value}\"",
      "user-reponse-and": " und ",
      "user-reponse-missing": "Die Eingabe fehlt"
    },
    flowStepCallback: flowCallback,
    submitCallback: submitCallback,
    robotImage: chatSettings.chat.robotImage,
    userImage: chatSettings.chat.userImage
  },
  tags: chatSettings.chat.flow
};

//Load cf-library
$.ajax({
  url: "https://cdn.jsdelivr.net/gh/space10-community/conversational-form@latest/dist/conversational-form.min.js",
  dataType: "script",
  success: function (data, textStatus, jqxhr) {

    //Create css variables
    Object.keys(chatSettings.style).forEach(function (key) {

      style.setProperty("--" + key, chatSettings.style[key]);

    });

    //Initiate chat
    cf = window.cf.ConversationalForm.startTheConversation(surveyOptions);

    //Append chatBot to DOM
    $("#" + chatSettings.chat.context).append(cf.el);

    //Append Gradient
    $(".conversational-form-inner").append("<div class='gradientWrapper'><div class='gradientDiv'></div></div>");

    //Relocate input
    $("cf-input").appendTo( $(".gradientWrapper") );

    //Adjust progress Icon
    var progressIcon = document.querySelector(".cf-icon-progress");
    progressIcon.style.backgroundImage = getComputedStyle(progressIcon).backgroundImage.replace(/fill='%23.{3,6}'/, "fill='%23" + chatSettings.style.primaryContrastColor.replace("#", "") + "'");

    //Start chatbot
    cf.start();

  }
});

//Load fontAwesome Styles
$("head").append($("<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' type='text/css' />"));

//Define redirectFlow
function startRedirectFlow (callback) {

  //Define all variables
  var allChats, lastChat, lastResponse;

  //Initiate variables
  allChats = document.querySelectorAll("cf-chat-response");
  lastChat = allChats[allChats.length - 1];

  //Animate last Chat
  $(lastChat).animate({ opacity: 0 }, {

    complete: function() {

      //Replace last response with success message
      lastResponse = document.querySelectorAll("cf-chat-response p[class=show]");
      lastResponse = lastResponse[lastResponse.length - 1];
      lastResponse.innerHTML = chatSettings.chat.text.submissionSuccess;

    }

  }).animate({ opacity: 1 }, {

    complete: function() {

      //Start redirectFlow
      if (callback.redirectUri.indexOf("calendly.com") !== -1) {

        //Define all variables
        var calendlyEvent, utmTracking, prefillInfo, calendlyTrackingEvent, calendlyEventLookup, dataLayer;

        //Initiate variables
        calendlyEvent = {

          url: "",
          prefill: {},
          utm: {}

        };
        calendlyEventLookup = {

          "calendly.event_type_viewed" : "Viewed a meeting page",
          "calendly.date_and_time_selected" : "Selected a date and time"

        };
        calendlyTrackingEvent = {};
        dataLayer = window.dataLayer || [];

        //Load calendly js
        $.ajax({
          url: "https://assets.calendly.com/assets/external/widget.js",
          dataType: "script"
        });

        //Load calendly style
        $("head").append($("<link rel='stylesheet' href='https://assets.calendly.com/assets/external/widget.css' type='text/css' />"));

        //Identify user
        dataLayer.push({

          event: "Identify user",
          user_id: callback.hubspot_vid_id,
          user_email: callback.email

        });

        //Append CTA Button
        $("#cf-context").append('<div id="buttonWrapper" style="display:none;"><div class="ctaButton" id="ctaButton">' + chatSettings.chat.text.calendlyButton + '</div></div>');

        //Explain what is going to happen next
        cf.addRobotChatResponse(chatSettings.chat.text.calendlyExplanation);

        //Set calendly URL
        calendlyEvent.url = callback.redirectUri.split("?")[0] +
          "?primary_color=" + chatSettings.style.primaryColor.replace("#", "") +
          "&text_color=" + chatSettings.style.headingColor.replace("#", "");

        //Add UTM Parameters
        ["utm_source", "utm_medium", "utm_term", "utm_content", "utm_campaign"].forEach( function (utmParameter) {

          if (url.searchParams.get(utmParameter)) {

            //Add to calendly event
            calendlyEvent.utm[utmParameter.split("_")[0] + 
                              utmParameter.split("_")[1].charAt(0).toUpperCase() + 
                              utmParameter.split("_")[1].slice(1)] = url.searchParams.get(utmParameter);

            //Add to calendlyTracking
            calendlyTrackingEvent["meeting_" + utmParameter] = url.searchParams.get(utmParameter);

          }

        });

        //Add Prefill Information
        calendlyEvent.prefill["email"] = callback.email;
        calendlyEvent.prefill["name"] = callback.full_name;

        //Initiate the calendlyTrackingEvent
        calendlyTrackingEvent["meeting_url"] = calendlyEvent.url;
        calendlyTrackingEvent["meeting_url_pretty"] = calendlyEvent.url.split("?")[0];
        calendlyTrackingEvent["meeting_prefill"] = [];

        //Check which fields have been prefilled and add them to the trackingEvent
        Object.keys(calendlyEvent.prefill).forEach (function (prefillParameter) {

          calendlyTrackingEvent.meeting_prefill.push(prefillParameter.toLowerCase());

        });

        //Join the preFill Array
        calendlyTrackingEvent.meeting_prefill = calendlyTrackingEvent.meeting_prefill.join(";");

        //Check if eventInfo is hidden
        calendlyTrackingEvent["meeting_info_is_hidden"] = calendlyEvent.url.indexOf("hide_event_type_details") !== -1 ? true : false;

        //Check if the event is being rescheduled
        calendlyTrackingEvent["meeting_is_reschedule"] = calendlyEvent.url.indexOf("reschedulings") !== -1? true: false;

        //Add Event Owner & Event Type Info
        calendlyTrackingEvent["meeting_owner_path"] = calendlyTrackingEvent.meeting_url_pretty.replace("https://", "").split("/")[1];
        calendlyTrackingEvent["meeting_type_path"] = calendlyTrackingEvent.meeting_url_pretty.replace("https://", "").split("/")[2];

        //Listen to browser Message
        window.addEventListener("message", function(e) {

          if (utilityFunctions.isCalendlyEvent(e) && calendlyEventLookup[e.data.event]) {

            var gtmEvent = JSON.parse(JSON.stringify(calendlyTrackingEvent));
            gtmEvent["event"] = calendlyEventLookup[e.data.event];
            dataLayer.push(gtmEvent);

          }

        }); 

        //Add calendly eventListener and fadeIn the button
        $("#ctaButton").on("click", function () {

          if (document.fullscreen) {

            $("#conversational-form, #buttonWrapper").fadeOut(400, function () {

              utilityFunctions.closeFullscreen();

            }).fadeIn(400, function () {

              setTimeout(function () {

                //Initiate the Calendly Popup
                Calendly.initPopupWidget(calendlyEvent);

                //Add the embedType to the eventTracking
                calendlyTrackingEvent["meeting_embed_type"] = calendlyEvent.embedType;

              }, 200);

            });

          } else {

            //Initiate the Calendly Popup
            Calendly.initPopupWidget(calendlyEvent);

            //Add the embedType to the eventTracking
            calendlyTrackingEvent["meeting_embed_type"] = calendlyEvent.embedType;

          }

        });

        //Let the button fadeIn again
        setTimeout(function () {

          $("#buttonWrapper").css({
            bottom: -80
          }).show().css({
            bottom: 0
          });

        }, 1000);

      } else {

        //Define all variables
        var redirectUri;

        //Initiate variables
        redirectUri = callback.redirectUri;

        //Explain what is going to happen next
        cf.addRobotChatResponse(chatSettings.chat.text.redirectExplanation);

        //Create redirect Uri
        redirectUri += "?hubspot_vid_id=" + callback.hubspot_vid_id + "&email=" + callback.email;

        //Redirect user
        setTimeout(function () {

          window.location.replace(redirectUri)

        }, 10000);

      }

    }

  });

}
