(function ($, window, document, undefined) {
  $.fn.audioPlayerUtils = function (options) {
    var base = $(this);

    base.init = function () {
      base.audioContainer();
    };

    // HTML init
    base.audioContainer = function () {
      audioPlayer = $("<div></div>").appendTo("body");
      audioPlayer.prop("class", "audioPlayer");

      playBtn = $("<a></a>").appendTo(audioPlayer);
      playBtn.prop("id", "playBtn");

      play = $("<i></i>").appendTo(playBtn);
      play.prop("class", "fa fa-play playing");
      $(".playing").css({ "aria-hidden": "true", color: "#fff" });

      pause = $("<i></i>").appendTo(playBtn);
      pause.prop("class", "fa fa-pause pausing");
      $(".pausing").css({
        "aria-hidden": "true",
        color: "#4050ab",
        display: "none",
      });

      startTime = $("<div></div>").appendTo(audioPlayer);
      startTime.prop("class", "startTime");
      startTime.html("00:00");

      mainBar = $("<div></div>").appendTo(audioPlayer);
      mainBar.prop("id", "mainBar");

      progressBar__timeline = $("<div></div>").appendTo(mainBar);
      progressBar__timeline.prop("id", "progressBar__timeline");
      $("#progressBar__timeline").append("<div id='play-head'></div>");

      endTime = $("<div></div>").appendTo(audioPlayer);
      endTime.prop("class", "endTime");
      endTime.html("00:00");

      volumeBtn = $("<a></a>").appendTo(audioPlayer);
      volumeBtn.prop("id", "volumeBtn");

      mute = $("<i></i>").appendTo(volumeBtn);
      mute.prop("class", "fa fa-volume-up volume");
      $(".volume").css({
        "aria-hidden": "true",
        color: "#4050ab",
      });

      unmute = $("<i></i>").appendTo(volumeBtn);
      unmute.prop("class", "fa fa-volume-off muting");
      $(".muting").css({
        "aria-hidden": "true",
        color: "#fd4f1a",
        display: "none",
      });
    };
    base.init();

    var isPlaying = false;
    var audioPlayer, onPlayHead, playerId, mainbar, playHead, timelineWidth;

    $(document).ready(function () {
      playController();
      muteController();
      headBall();
    });

    // Play & Pause Controller
    function playController() {
      audioPlayer = document.getElementById("audioSource");
      audioPlayer.addEventListener("timeupdate", calculateTime);
      $("#playBtn").bind("click", function (event) {
        if (isPlaying) {
          console.log(" pas play");
          $(".playing").show();
          $("#audioSource")[0].pause();
          $(".pausing").hide();
        } else {
          $("#audioSource")[0].play();
          console.log(" play");
          $(".playing").hide();
          $(".pausing").show();
        }

        isPlaying = !isPlaying;
      });
    }

    // Mute & Unmute Controller
    function muteController() {
      $("#volumeBtn").bind("click", function (event) {
        if ($("#audioSource")[0].muted) {
          $(".volume").show();
          $(".muting").hide();
        } else {
          $(".volume").hide();
          $(".muting").show();
        }

        $("#audioSource")[0].muted = !$("#audioSource")[0].muted;
      });
    }

    // Calculate the time
    function calculateTime() {
      var width = $("#mainBar").width();
      var length = audioPlayer.duration;
      var current_time = audioPlayer.currentTime;

      var totalLength = calculateTotalValue(length);
      $(".endTime").html(totalLength);

      var currentTime = calculateCurrentValue(current_time);
      $(".startTime").html(currentTime);

      var progressbar = document.getElementById("progressBar__timeline");

      var size = parseInt(
        (audioPlayer.currentTime * width) / audioPlayer.duration
      );
      progressbar.style.width = size + "px";

      var playhead = document.getElementById("play-head");
      playhead.style.marginLeft =
        width * (audioPlayer.currentTime / audioPlayer.duration) + "px";
    }

    function calculateTotalValue(length) {
      var minutes = Math.floor(length / 60);
      var seconds_int = length - minutes * 60;
      if (seconds_int < 10) {
        seconds_int = "0" + seconds_int;
      }
      var seconds_str = seconds_int.toString();
      var seconds = seconds_str.substr(0, 2);
      var time = minutes + ":" + seconds;

      return time;
    }

    function calculateCurrentValue(currentTime) {
      var current_hour = parseInt(currentTime / 3600) % 24,
        current_minute = parseInt(currentTime / 60) % 60,
        current_seconds_long = currentTime % 60,
        current_seconds = current_seconds_long.toFixed(),
        current_time =
          (current_minute < 10 ? "0" + current_minute : current_minute) +
          ":" +
          (current_seconds < 10 ? "0" + current_seconds : current_seconds);

      return current_time;
    }

    // Progress-bar - playhead
    function headBall() {
      onPlayHead = null;
      playerId = null;
      mainbar = document.getElementById("mainBar");
      playHead = document.getElementById("play-head");
      timelineWidth = mainbar.offsetWidth - playHead.offsetHeight;

      mainbar.addEventListener("click", seek);
      playHead.addEventListener("mousedown", drag);
      document.addEventListener("mouseup", mouseUp);
    }

    function seek(event) {
      var player = document.getElementById("audioSource");
      player.currentTime =
        player.duration * clickPercent(event, mainbar, timelineWidth);
    }

    function clickPercent(event, mainbar, timelineWidth) {
      return (event.clientX - getPosition(mainbar)) / timelineWidth;
    }

    function getPosition(el) {
      return el.getBoundingClientRect().left;
    }

    // Drag options
    function drag(e) {
      audioPlayer.addEventListener("timeupdate", calculateTime);

      onPlayHead = $(this).attr("id");
      playerId = $(this).find("audio").attr("id");
      var player = document.getElementById(playerId);
      window.addEventListener("mousemove", dragOpts);
      player.addEventListener("timeupdate", timeUpdate);
    }

    function dragOpts(e) {
      var player = document.getElementById(onPlayHead);
      var progressbar = document.getElementById("progressBar__timeline");
      var newMargLeft = e.clientX - getPosition(mainbar);

      if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
        playHead.style.marginLeft = newMargLeft + "px";
        progressbar.style.width = newMargLeft + "px";
      }
      if (newMargLeft < 0) {
        playHead.style.marginLeft = "0px";
        progressbar.style.width = "0px";
      }
      if (newMargLeft > timelineWidth) {
        playHead.style.marginLeft = timelineWidth + "px";
        progressbar.style.width = timelineWidth + "px";
      }
    }

    // Click on progress-bar
    function mouseUp(e) {
      if (onPlayHead != null) {
        var player = document.getElementById(playerId);
        window.removeEventListener("mousemove", dragOpts);

        player.currentTime =
          player.duration * clickPercent(e, mainbar, timelineWidth);
        audioPlayer.addEventListener("timeupdate", calculateTime);
        player.addEventListener("timeupdate", timeUpdate);
      }
      onPlayHead = null;
    }

    // Time update
    function timeUpdate() {
      var audioSource = document.getElementById(onPlayHead);
      var player = document.getElementById(playerId);
      var playPercent = timelineWidth * (player.currentTime / player.duration);
      audioSource.style.marginLeft = playPercent + "px";

      if (player.currentTime == player.duration) {
        player.pause();
      }
    }
  };
})(jQuery, window, document);
