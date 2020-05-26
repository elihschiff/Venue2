<template>

  <div v-if="data_loaded">
    <div v-if="lecture_data.length == 0" :style="{textAlign: 'center'}">No upcoming lectures.</div>
    <div v-else :style="{margin: '0 40px'}">

      <!-- Loop through each lecture_data -->
      <router-link v-for="lecture in lecture_data" :key="lecture._id" :to="{name: 'lecture_info', params: { lecture_id: lecture._id }}">
        <!-- <div class="course-info-upcoming-lecture-pill">
          <div class="background-pill"></div>
          <div class="foreground-pill">
            <div class="lecture-title">{{ lecture.title }}</div>
            <div class="lecture-date">{{ getDate( lecture.start_time ) }}</div>
          </div>
        </div> -->
        <div :class="'course-info-upcoming-lecture-pill inline-block ' + (mobileMode ? 'mobile' : '') ">
          <div class="date-area inline-block">
            <div class="date-month">{{ getMonth(lecture.start_time) }}</div>
            <div class="date-day">{{ getDay(lecture.start_time) }}</div>
          </div>
          <div class="name-area inline-block">
            {{ shortenString(lecture.title, mobileMode ? 22 : 24) }}
          </div>
        </div>

      </router-link>
    </div>
  </div>
  <div v-else :style="{textAlign: 'center'}"><SquareLoader /></div>

</template>
<script>

  import SquareLoader from '@/components/Loaders/SquareLoader.vue'
  import LectureAPI from '@/services/LectureAPI.js'
  import moment from 'moment'

  export default {
    name: 'UpcomingLecturesList',
    components: {
      SquareLoader
    },
    props: {
      mobileMode: Boolean,
      section_id: String,
      selected_section: String
    },
    data () {
      return {
        lecture_data: Array,
        data_loaded: Boolean,
        STATIC_MONTHS: Array
      }
    },
    created () {
      this.STATIC_MONTHS = ['Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      this.data_loaded = false
      if (this.section_id != undefined) {
        // load the section info directly
        this.getUpcomingLectures(this.section_id)
      }
      else if (this.selected_section != undefined) {
        // load section info for the selected section
        this.getUpcomingLectures(this.selected_section)
      }
    },
    methods: {
      getMonth (date_string) {
        let date_ = new Date(date_string)
        if (isNaN(+date_)) return ' '

        return this.STATIC_MONTHS[ date_.getMonth () ]
      },
      getDay (date_string) {
        let date_ = new Date(date_string)
        if (isNaN(+date_)) return ' '

        return date_.getDay ()
      },
      shortenString (string, max_length) {
        if (string.length < max_length) {
          return string
        }
        return string.substring(0, max_length - 3) + "..."
      },
      getDate (date_string) {
        return moment(date_string).fromNow()
      },
      getUpcomingLectures (section_id) {

        LectureAPI.getLecturesForSection(section_id, "upcoming")
        .catch(err => {
          console.log(`getLecturesForSection () error`)
          console.log(err)
        })
        .then(response => {

          this.data_loaded = true
          this.lecture_data = response.data
        })
      }
    }
  }

</script>
