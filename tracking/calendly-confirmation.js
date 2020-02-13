//Define all variables
var url, eventObject, eventPropertyLookup, query, dataLayer;

//Initiate variables
url = new URL(window.location.href);
query = url.search;
dataLayer = window.dataLayer || [];

//Check if meeting has been scheduled
if (url.searchParams.get("invitee_email")) {

  //Initiate Tracking
  eventObject = {
    event: "Scheduled a meeting"
  };
  eventPropertyLookup = {
    answer_1: "invitee_answer_1",
    text_reminder_number: "invitee_text_reminder",
    assigned_to: "meeting_owner",
    event_end_time: "meeting_end_date",
    event_start_time: "meeting_start_date",
    event_type_name: "meeting_name",
    event_type_uuid: "meeting_id",
    invitee_email: "invitee_email",
    invitee_first_name: "invitee_first_name",
    invitee_last_name: "invitee_last_name",
    invitee_name: "invitee_name",
    invitee_uuid: "invitee_id"
  };

  //Iterate through query to create eventProperties 
  query.split("&").forEach(function (parameter) {

    if (eventPropertyLookup[parameter.split("=")[0]]) {

      eventObject[eventPropertyLookup[parameter.split("=")[0]]] = url.searchParams.get(parameter.split("=")[0]);

    }

  });

  //Push the event into the dataLayer
  dataLayer.push(eventObject);

}
