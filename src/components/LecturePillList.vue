<template>

  <div :style="{marginTop: '20px'}" v-if="lectures != null && lectures.length > 0">
    <div class="inline-block label">{{ label }}</div>
    <div class="inline-block lecture-pill-holder">
      <router-link v-for="lecture in lectures" :to="{name: 'lecture_info', params: { lecture_id: lecture._id }}">
        <LecturePill
          :name="lecture.title" middle=""
          :right="getTime(lecture.start_time == undefined ? lecture.playback_submission_end_time : lecture.end_time)"
          :color="getColorForLecture(lecture)" />
        </router-link>
      <!-- <LecturePill name="Test Name" middle="75%" right="2d 5h" color="blue" />
      <LecturePill name="Test Name" middle="75%" right="2d 5h" color="green" />
      <LecturePill name="Test Name" middle="75%" right="2d 5h" color="yellow" /> -->
    </div>
  </div>

</template>
<script>

  import LecturePill from '@/components/LecturePill.vue'
  import moment from 'moment'

  export default {
    name: 'LecturePillList',
    components: {
      LecturePill
    },
    props: {
      label: String,
      lectures: Array
    },
    methods: {
      getColorForLecture (lecture) {
        // if time < submission_start, return yellow
        // if time > submission_start && time < submission_end, return green
        // else return grey
        let current_time = new Date ()
        let start = new Date(lecture.hasOwnProperty('submission_start_time') ? lecture.submission_start_time : null)
        let end = new Date(lecture.hasOwnProperty('submission_end_time') ? lecture.submission_end_time : null)

        if (isNaN(+start) || isNaN(+end) || isNaN(+current_time)) return 'grey'
        if (current_time < start) return 'yellow'
        else if (current_time >= start && current_time < end) return 'green'
        return 'grey'
      },
      getTime (time_string) {
        return moment(time_string).fromNow(true)
      }
    }
  }

</script>
