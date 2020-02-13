//Define all variables
var dataLayer;

//Initiate variabels
dataLayer = window.dataLayer || [];
window._wq = window._wq || [];

//Load video
$("#wistiaScript").attr("src", "https://fast.wistia.com/embed/medias/" + videoId + ".jsonp");

//Embed video
$("#wistiaEmbed").addClass("wistia_async_" + videoId);

//Track video
_wq.push({

  id: videoId,
  onHasData: function (newVideo) {

    //Track watch interaction
    newVideo.bind("end", function() {

      trackVideoInteraction("Watched a video");

    });

    //Track pause interaction
    newVideo.bind("pause", function() {

      trackVideoInteraction("Paused a video");

    });

    //Track watch interaction
    newVideo.bind("percentwatchedchanged", function (percent, lastPercent) {

      if (percent >= 0.25 && lastPercent < 0.25) {

        trackVideoInteraction("Watched a video");

      } else if (percent >= 0.5 && lastPercent < 0.5) {

        trackVideoInteraction("Watched a video");

      } else if (percent >= 0.75 && lastPercent < 0.75) {

        trackVideoInteraction("Watched a video");

      }

    });

    //Track play interaction
    newVideo.bind("play", function () {

      trackVideoInteraction("Played a video");

    });

    function trackVideoInteraction (eventName) {

      dataLayer.push({

        event: eventName,
        video_name: newVideo.name(),
        video_id: newVideo.hashedId(),
        video_duration: parseInt(newVideo.duration().toFixed()) * 1000,
        video_percent_watched: parseInt(newVideo.percentWatched()*100),
        video_seconds_watched: newVideo.secondsWatched(),
        video_state: newVideo.state(),
        video_time: parseInt(newVideo.time().toFixed()) * 1000,
        video_mute: newVideo.isMuted()

      });

    }

  }

});
