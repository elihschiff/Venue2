<template>

  <div :style="{marginTop: '20px'}" v-if="lectures != null && lectures.length > 0">
    <div class="inline-block label">{{ label }}</div>
    <div class="inline-block lecture-pill-holder">
      <router-link v-for="(lecture,i) in lectures" :to="{name: 'lecture_info', params: { lecture_id: lecture._id }}" :key="i">
        <LecturePill
          :name="lecture.title" middle=""
          :right="getTime(lecture.start_time == undefined ? lecture.playback_submission_end_time : lecture.end_time)"
          color="green" />
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
      getTime (time_string) {
        return moment(time_string).fromNow(true)
      }
    }
  }

</script>
