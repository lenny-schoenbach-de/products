var utilityFunctions,submitCallback,flowCallback,phoneValidation,surveyOptions,cf,hubspotCallback,url,style;function startRedirectFlow(e){var t,n,i;n=(t=document.querySelectorAll("cf-chat-response"))[t.length-1],$(n).animate({opacity:0},{complete:function(){(i=(i=document.querySelectorAll("cf-chat-response p[class=show]"))[i.length-1]).innerHTML=chatSettings.chat.text.submissionSuccess}}).animate({opacity:1},{complete:function(){var t,n,i,a,o;-1!==e.redirectUri.indexOf("calendly.com")?(t={url:"",prefill:{},utm:{}},i={"calendly.event_type_viewed":"Viewed a meeting page","calendly.date_and_time_selected":"Selected a date and time"},n={},a=window.dataLayer||[],$.ajax({url:"https://assets.calendly.com/assets/external/widget.js",dataType:"script"}),$("head").append($("<link rel='stylesheet' href='https://assets.calendly.com/assets/external/widget.css' type='text/css' />")),a.push({event:"Identify user",user_id:e.hubspot_vid_id,user_email:e.email}),$("#cf-context").append('<div id="buttonWrapper" style="display:none;"><div class="ctaButton" id="ctaButton">'+chatSettings.chat.text.calendlyButton+"</div></div>"),cf.addRobotChatResponse(chatSettings.chat.text.calendlyExplanation),t.url=e.redirectUri.split("?")[0]+"?primary_color="+chatSettings.style.primaryColor.replace("#","")+"&text_color="+chatSettings.style.headingColor.replace("#",""),["utm_source","utm_medium","utm_term","utm_content","utm_campaign"].forEach(function(e){url.searchParams.get(e)&&(t.utm[e.split("_")[0]+e.split("_")[1].charAt(0).toUpperCase()+e.split("_")[1].slice(1)]=url.searchParams.get(e),n["meeting_"+e]=url.searchParams.get(e))}),t.prefill.email=e.email,t.prefill.name=e.full_name,n.meeting_url=t.url,n.meeting_url_pretty=t.url.split("?")[0],n.meeting_prefill=[],Object.keys(t.prefill).forEach(function(e){n.meeting_prefill.push(e.toLowerCase())}),n.meeting_prefill=n.meeting_prefill.join(";"),n.meeting_info_is_hidden=-1!==t.url.indexOf("hide_event_type_details"),n.meeting_is_reschedule=-1!==t.url.indexOf("reschedulings"),n.meeting_owner_path=n.meeting_url_pretty.replace("https://","").split("/")[1],n.meeting_type_path=n.meeting_url_pretty.replace("https://","").split("/")[2],window.addEventListener("message",function(e){if(utilityFunctions.isCalendlyEvent(e)&&i[e.data.event]){var t=JSON.parse(JSON.stringify(n));t.event=i[e.data.event],a.push(t)}}),$("#ctaButton").on("click",function(){document.fullscreen?$("#conversational-form, #buttonWrapper").fadeOut(400,function(){utilityFunctions.closeFullscreen()}).fadeIn(400,function(){setTimeout(function(){Calendly.initPopupWidget(t),n.meeting_embed_type=t.embedType},200)}):(Calendly.initPopupWidget(t),n.meeting_embed_type=t.embedType)}),setTimeout(function(){$("#buttonWrapper").css({bottom:-80}).show().css({bottom:0})},1e3)):(o=e.redirectUri,cf.addRobotChatResponse(chatSettings.chat.text.redirectExplanation),o+="?hubspot_vid_id="+e.hubspot_vid_id+"&email="+e.email,setTimeout(function(){window.location.replace(o)},3500))}})}utilityFunctions={getCookie:function(e){var t=document.cookie.match("(^|;) ?"+e+"=([^;]*)(;|$)");return t?t[2]:void 0},openFullscreen:function(e){e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen&&e.msRequestFullscreen()},closeFullscreen:function(){document.exitFullscreen?document.exitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen?document.webkitExitFullscreen():document.msExitFullscreen&&document.msExitFullscreen()},isCalendlyEvent:function(e){return e.data.event&&0===e.data.event.indexOf("calendly")},deleteCookie:function(e){var t=new Date;t.setTime(t.getTime()+-864e5);var n="expires="+t.toUTCString(),i=window.location.hostname,a=i.split(".");i=3===a.length?a[1]+"."+a[2]:a.join("."),document.cookie=e+"=;"+n+";path=/; domain=."+i}},hubspotCallback=function(e){var t,n,i;t=e.redirectUri,n=cf.getFormData(!0),i={},Object.keys(n).forEach(function(e){i[e]=Array.isArray(n[e])?n[e].join(";"):n[e]}),$.ajax({crossDomain:!0,url:t+"?callback=startRedirectFlow&payload="+JSON.stringify(i),method:"GET",dataType:"jsonp"})},submitCallback=function(){var e,t,n,i,a,o,r;e=["utm_source","utm_medium","utm_campaign","utm_term","utm_placement","landingpage","referrer"],t=window.dataLayer||[],n=cf.getFormData(!0),i="https://api.hsforms.com/submissions/v3/integration/submit/",a={},o=[],r={},t.push({event:"Submitted a form",form_id:chatSettings.form.hubspotFormId,form_type:"chat",form_name:chatSettings.form.hubspotFormName}),i+=chatSettings.form.hubspotAccountId+"/"+chatSettings.form.hubspotFormId,void 0===utilityFunctions.getCookie("identity")&&e.forEach(function(e){utilityFunctions.getCookie(e)&&(n["tracking_"+e]=utilityFunctions.getCookie(e),utilityFunctions.deleteCookie(e))}),Object.keys(n).forEach(function(e){o.push({name:e,value:Array.isArray(n[e])?n[e].join(";"):n[e]})}),r.pageName=document.title,r.pageUri=window.location.href.split("?")[0],utilityFunctions.getCookie("hubspotutk")&&(r.hutk=utilityFunctions.getCookie("hubspotutk")),a.context=r,a.fields=o,$.ajax({url:i,type:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},data:JSON.stringify(a),dataType:"json",success:hubspotCallback,error:function(e,t){console.log("Request: "+JSON.stringify(e))}})},flowCallback=function(e,t,n){var i,a,o,r;return i=window.dataLayer||[],a=e.tag.name,o=e.text,r=(r=e.tag._values||o).length>1?r:r[0],i.push({event:"Filled a form",form_field_number:cf.flowManager.getStep()+1,form_field_name:a,form_field_value:r,form_field_text:o,form_id:chatSettings.form.hubspotFormId,form_type:"chat",form_name:chatSettings.form.hubspotFormName}),e.controlElements&&"CheckboxButton"===e.controlElements[0].type&&(void 0===r||r.length<1)?n():("flow_start"===a&&utilityFunctions.openFullscreen(document.getElementById(chatSettings.chat.context)),t())},phoneValidation=function(e,t,n){return/^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{9,12})$/.test(e.text)?t():n()},url=new URL(window.location.href),style=document.documentElement.style,chatSettings.chat.flow.forEach(function(e){"input"===e.tag&&(e.value=url.searchParams.get(e.id)||utilityFunctions.getCookie(e.id)||"")}),chatSettings.chat.flow.push({tag:"cf-robot-message","cf-questions":chatSettings.chat.text.submissionPending+'&&<i class="fa fa-spinner fa-spin"></i>'}),surveyOptions={options:{theme:"purple",preventAutoStart:!0,preventAutoAppend:!0,preventAutoFocus:!0,showProgressBar:!0,loadExternalStyleSheet:!1,dictionaryData:{"entry-not-found":"Der Eintrag konnte nicht gefunden werden","input-placeholder":"Schreib' hier deine Antwort rein","input-placeholder-required":"Beantworte bitte die Frage","input-placeholder-error":"Deine Eingabe ist leider nicht korrekt","input-placeholder-file-error":"Datei-Upload fehlgeschlagen ...","input-placeholder-file-size-error":"Dateigröße zu groß ...","input-no-filter":'Es gibt keine Ergebnisse für "{input-value}"',"user-reponse-and":" und ","user-reponse-missing":"Die Eingabe fehlt"},flowStepCallback:flowCallback,submitCallback:submitCallback,robotImage:chatSettings.chat.robotImage,userImage:chatSettings.chat.userImage},tags:chatSettings.chat.flow},$.ajax({url:"https://cdn.jsdelivr.net/gh/space10-community/conversational-form@latest/dist/conversational-form.min.js",dataType:"script",success:function(e,t,n){Object.keys(chatSettings.style).forEach(function(e){style.setProperty("--"+e,chatSettings.style[e])}),cf=window.cf.ConversationalForm.startTheConversation(surveyOptions),$("#"+chatSettings.chat.context).append(cf.el),$(".conversational-form-inner").append("<div class='gradientWrapper'><div class='gradientDiv'></div></div>"),$("cf-input").appendTo($(".gradientWrapper"));var i=document.querySelector(".cf-icon-progress");i.style.backgroundImage=getComputedStyle(i).backgroundImage.replace(/fill='%23.{3,6}'/,"fill='%23"+chatSettings.style.primaryContrastColor.replace("#","")+"'"),cf.start()}}),$("head").append($("<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' type='text/css' />"));
