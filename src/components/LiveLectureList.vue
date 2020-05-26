<template>
  <div :class="'dashboard-section-modal ' + (mobileMode ? 'is-mobile':'')">
    <div class="title">Live</div>
    <div class="center-fill-section" v-if="!loaded">
      <SquareLoader />
    </div>
    <div class="center-fill-section" v-else-if="live_lectures == null || live_lectures.length == 0">
      No live lectures.
    </div>
    <div v-else :class="'sub-section ' + (mobileMode ? 'is-mobile':'')">
      <router-link v-for="lecture in live_lectures" :to="{name: 'lecture_info', params: { lecture_id: lecture._id }}" >
        <LectureCard
          :courseName="lecture.sections[0].course.name"
          :courseDept="lecture.sections[0].course.dept"
          :courseNumber="lecture.sections[0].course.course_number"
          :eventLabel="lecture.title"
          :status="getLectureStatus(lecture)"
          :timeFromNow="lecture.end_time"
         />
      </router-link>
    </div>
  </div>
</template>
<script>
  import EventInfoPill from '@/components/EventInfoPill.vue'
  import SquareLoader from '@/components/Loaders/SquareLoader.vue'
  import LectureCard from '@/components/LectureCard.vue'

  import moment from 'moment'

  export default {
    name: 'LiveCourses',
    components: {
      EventInfoPill,
      SquareLoader,
      LectureCard
    },
    props: {
      mobileMode: Boolean,
      live_lectures: Array,
      colorCallback: Function,
      loaded: Boolean
    },
    data () {
      return {}
    },
    created () {

    },
    methods: {
      getLectureStatus (lecture) {
        // pending, ongoing, or ended
        // if current time < submission_start_time, then return pending
        // else if current time > submission_start_time and current time < submission_end_time,
        //  return ongoing
        // otherwise, return ended

        let current_time = new Date ()
        let start = new Date (lecture.hasOwnProperty('submission_start_time') ? lecture.submission_start_time : null)
        let end = new Date (lecture.hasOwnProperty('submission_end_time') ? lecture.submission_end_time : null)

        // console.log(`lecture name: ${lecture.title}`)
        // console.log(`isNaN ? ${isNaN(+current_time) || isNaN(+start) || isNaN(+end)}`)
        // console.log(`isPending ? ${current_time < start}`)
        // console.log(current_time)
        // console.log(start)
        // console.log(`isOngoing ? ${current_time >= start && current_time < end}`)

        if (isNaN(+current_time) || isNaN(+start) || isNaN(+end)) return 'ended'
        if (current_time < start) return 'pending'
        else if (current_time >= start && current_time < end) return 'ongoing'
        return 'ended'

      },
      getTimeUntil (time_string) {
        return moment(time_string).fromNow()
      },
      getCourseName (data_) {
        if (data_ == null || data_ == undefined || !data_.hasOwnProperty('course_info')) return '-----'
        return data_.course_info.name
      },
      getCourseTitle (data_) {
        if (data_ == null || data_ == undefined || !data_.hasOwnProperty('course_info')) return '-----'
        return data_.course_info.dept + ' ' + data_.course_info.course_number
      }
    }
  }

</script>
