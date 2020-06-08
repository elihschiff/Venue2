<template>
  <div>
    <!-- TODO: Check if student submitted already -->
    <div v-if="qr_scanning_window_open">
      <button @click="closeQRScanningWindow" id="exit_preview_btn">X</button>
      <qrcode-stream id="video_preview" @decode="checkForQRMatch"></qrcode-stream>
    </div>
    <div id="table-header">
      <h2>Attendance</h2>
      <button v-if="lecture.lecture_status === 'is_live' && lecture.checkin_window_status === 'open'" @click="showQRScanningWindow" class="header-btn">Scan QR</button>
      <router-link v-else-if="lecture.lecture_status === 'is_active_playback'" :to="{name: 'lecture_playback', params: { lecture_id: lecture._id }}">
        <button>Watch Playback</button>
      </router-link>
    </div>
    <LectureAttendanceTable :is_instructor="false" :lecture="lecture" :live_submissions="live_submissions" :playback_submissions="playback_submissions" :absent="absent" />
  </div>
</template>


<script>
  import QRCode from "qrcode";
  import { QrcodeStream } from 'vue-qrcode-reader'
  import LectureSubmissionAPI from '@/services/LectureSubmissionAPI.js';
  import LectureAttendanceTable from "@/components/LectureAttendanceTable.vue";

  export default {
    name: 'StudentLectureAttendanceContainer',
    props: {
      lecture: Object,
      live_submissions: Array,
      playback_submissions: Array,
      absent: Array
    },
    components: {
      QrcodeStream,
      LectureAttendanceTable
    },
    data(){
      return {
        qr_scanning_window_open: false
      }
    },
    created() {
      console.log("In student lecture attendance table. Lecture:",this.lecture)
    },
    methods: {
      showQRScanningWindow() {
        this.qr_scanning_window_open = true
      },
      closeQRScanningWindow() {
        this.qr_scanning_window_open = false
      },
      checkForQRMatch(scanned_str) {
        if(this.lecture.current_checkin.code === scanned_str){
          console.log("Scanned Correct Code. Creating Live Submission")
          this.createLiveSubmission()
          this.closeQRScanningWindow()
        } else {
          alert("Scanned incorrect code!")
        }
      },
      async createLiveSubmission() {
        let lecture_submission = {
          lecture: this.lecture,
          submitter: this.$store.state.user.current_user,
          is_live_submission: true,
          live_submission_time: new Date()
        }
        console.log("Adding submission: ",lecture_submission)
        const response = await LectureSubmissionAPI.addLectureSubmission(lecture_submission)
        // this.addStudentLectureSubmission(lecture_submission)
        alert("Live Submission Recorded")
        console.log("Created Lecture Submission")
      },
    }
  }
</script>

<style scoped>
  #table-header {
    position: relative;
    top: 3rem;
    bottom: 0;
    text-align: left;
    padding-left: 5rem;
    padding-right: 5rem;
  }

  #table-header h2 {
    display: inline-block;
  }

  .header-btn {
    display: inline-block;
    margin-left: 2rem;
  }

  .show-qr-btn {
    margin-left: 2rem;
  }

  .tab_btn h5 {
    color: gray;
  }

  .tab_btn.selected_tab {
    color: blue;
    border-bottom: .2rem solid blue;
  }

  .tab_btn.selected_tab h5 {
    color: blue;
  }

  .tab_section {
    margin-top: 3rem;
    margin-left: 6rem;
    overflow-y: auto;
    height: 17rem;
    padding-bottom: 3rem;
  }

  .namecard-edging {
    display: inline-block;
    border-radius: .25rem;
    width: 12rem;
    height: 4rem;
    margin-right: 1rem;
    margin-bottom: 1rem;
  }

  .namecard-edging.live-color {
    background: green;
  }

  .namecard-edging.playback-color {
    background: blueviolet;
  }

  .namecard-edging.absent-color {
    background: red;
  }

  .namecard {
    position: relative;
    background: white;
    text-align: center;
    border-radius: .25rem;
    top: 0.5rem;
    margin-left: 0.5rem;
    width: 11rem;
    height: 4rem;
    box-shadow: 0 5px 10px -1px gray;
    padding-top: 0.5rem;
    z-index: 100;
  }

  .hidden {
    display: none;
  }

</style>