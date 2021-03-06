<template>
  <div>
    <show-at breakpoint="large">
      <div class="venue-body-container">

        <!-- Title -->
        <div class="title">
          <router-link v-if="is_instructor || is_ta" :to="{name: 'new_lecture', params: { course_id: (is_instructor?course._id:$route.params.id) }}" tabindex="-1">
            <div class="inline-block big-button" :style="{float: 'right'}" tabindex="0">Create New Lecture for {{ course.prefix }} {{ course.suffix }}</div>
          </router-link>
        </div>
        <CourseInfoTitle :course="typeof course == typeof {} ? course : {}" class="inline-block" :section_name="section.name" :is_instructor="is_instructor" :is_ta="is_ta"/>


        <!-- Attendance History -->
        <div>
          <div v-if="is_instructor" class="section-select-container float-right">
            <label id="section_select_label">Section(s):</label>
            <select v-model="selected_section" class="form-control" aria-labelledby="section_select_label" @change="onSectionChange">
              <option :value="'all'" selected>All</option>
              <option v-for="(section,i) in sorted_sections" :key="i" :value="section._id">{{section.name}}</option>
            </select>
          </div>
          <div class="courseinfo-legend">Legend:</div>
          <div class="courseinfo-legend live-border">Synchronous</div>
          <div class="courseinfo-legend playback-border">Asynchronous</div>
        </div>
        <InstructorAttendanceHistory
          v-if="(is_instructor || is_ta) && lectures_loaded && sorted_lectures[selected_section]"
          :lectures="sorted_lectures[selected_section].lectures" :timeline="sorted_lectures[selected_section].timeline" :students="selected_section == 'all' ? course_students : sections[selected_section].students" :scores_loaded="scores_loaded"/>
        <StudentAttendanceHistory v-else-if="is_student && lectures_loaded && sorted_lectures[section_id]" :lectures="sorted_lectures[section_id].lectures" :timeline="sorted_lectures[section_id].timeline" :scores_loaded="scores_loaded"/>
        <div v-else-if="!lectures_loaded" :style='{textAlign: "center"}'>
          <SquareLoader />
        </div>
        <div v-else>
          None
        </div>

      </div>
    </show-at>
    <hide-at breakpoint="large">
      <div>
        <!-- Mobile View -->
        <CourseInfoTitle :course="typeof course == typeof {} ? course : {}" class="inline-block" :is_instructor="is_instructor" :is_ta="is_ta" mobileMode />
        <router-link v-if="is_instructor || is_ta" :to="{name: 'new_lecture', params: { course_id: (is_instructor?course._id:$route.params.id) }}" tabindex="-1">
          <div class="inline-block big-button mobile" tabindex="0">Create New Lecture for {{ course.prefix }} {{ course.suffix }}</div>
        </router-link>
        <div class="courseinfo-attendance-listing">
          <div v-if="is_instructor" class="section-select-container mobile float-right">
            <label id="section_select_label">Section(s):</label>
            <select v-model="selected_section" class="form-control" aria-labelledby="section_select_label" @change="onSectionChange">
              <option :value="'all'" selected>All</option>
              <option v-for="(section,i) in sorted_sections" :key="i" :value="section._id">{{section.name}}</option>
            </select>
          </div>
          <div class="courseinfo-legend">Legend:</div>
          <div class="courseinfo-legend live-border">Synchronous</div>
          <div class="courseinfo-legend playback-border">Asynchronous</div>
          <InstructorAttendanceHistory :style='{textAlign: "center"}'
            v-if="(is_instructor || is_ta) && lectures_loaded && sorted_lectures[selected_section] && scores_loaded"
            :lectures="sorted_lectures[selected_section].lectures" :timeline="sorted_lectures[selected_section].timeline" :students="selected_section == 'all' ? course_students : sections[selected_section].students" :scores_loaded="scores_loaded" mobileMode/>
          <StudentAttendanceHistory :style='{textAlign: "center"}' v-else-if="is_student && lectures_loaded && sorted_lectures[section_id] && scores_loaded" :lectures="sorted_lectures[section_id].lectures" :timeline="sorted_lectures[section_id].timeline" :scores_loaded="scores_loaded" mobileMode/>
          <div v-else-if="!lectures_loaded" :style='{textAlign: "center"}'>
            <SquareLoader />
          </div>
          <div v-else>
            None
          </div>
        </div>
      </div>
    </hide-at>

  </div>
</template>

<script>

  import CourseAPI from '@/services/CourseAPI.js';
  import UserAPI from '@/services/UserAPI.js';
  import SectionAPI from '@/services/SectionAPI.js';
  import LectureAPI from '@/services/LectureAPI.js';
  import LectureSubmissionAPI from '@/services/LectureSubmissionAPI.js'
  import {getLiveLectures,getRecentLectures,getUpcomingLectures,getActivePlaybackLectures,getPastLectures} from '@/services/GlobalFunctions.js'

  import {showAt, hideAt} from 'vue-breakpoints';
  import CourseInfoTitle from '@/components/CourseInfoTitle.vue'
  import EventHistoryList from '@/components/EventHistoryList.vue';
  import InstructorAttendanceHistory from '@/components/InstructorAttendanceHistory.vue'
  import StudentAttendanceHistory from '@/components/StudentAttendanceHistory.vue'
  import LecturePillList from '@/components/LecturePillList.vue'
  import UpcomingLecturesList from '@/components/UpcomingLecturesList.vue'

  import SquareLoader from '@/components/Loaders/SquareLoader.vue'

  import '@/assets/css/venue-core.css'
  import '@/assets/icon-font.css'

export default {
  name: 'CourseInfo',
  props: {
  },
  computed: {
  },
  components: {
    EventHistoryList,
    showAt,
    hideAt,
    CourseInfoTitle,
    StudentAttendanceHistory,
    InstructorAttendanceHistory,
    LecturePillList,
    UpcomingLecturesList,
    SquareLoader
  },
  data(){
    return {
      course: {},
      section: {},
      all_lectures: [],
      upcoming_lectures: [],
      live_lectures: [],
      past_lectures: [],
      playback_lectures: [],
      course_students: [],
      subview_section_id: 0,
      sections: Object,
      sorted_sections: [],
      selected_section: "all",
      sorted_lectures: {},
      lectures_loaded: false,
      scores_loaded: false,
      is_instructor: false,
      is_ta: false,
      is_student: false
    }
  },
  created() {
    // when the component is created/loaded
    this.getCurrentUser()
    this.section_id = null

    if (this.is_instructor) {
      this.course_id = this.$route.params.id
      this.getAllSections()
      this.getStudentsForCourse()
      this.getCourse()
    } else {
      this.section_id = this.$route.params.id
      this.getSectionWithCourse()
    }
  },
  methods: {
    async getAllSections () {
      SectionAPI.getSectionsForCourse(this.course_id)
      .catch(err => { console.log(`Problem getting sections for course ${this.course_id}`); console.log(err);})
      .then(response => {
        response.data.forEach(section_ => {
          this.sections[section_._id] = section_
          this.sorted_sections.push(section_)
        })
        this.sorted_sections.sort((a, b) => (a.name > b.name) ? 1 : -1)
        this.getAllLecturesForCourse()
      })
    },
    async getSectionWithCourse() {
      const response = await SectionAPI.getSectionWithCourse(this.section_id)
      this.sections[response.data._id] = response.data
      this.course = this.sections[response.data._id].course
      this.getAllLecturesForSection()
    },
    async getStudentsForCourse() {
      const response = await UserAPI.getStudentsForCourse(this.course_id)
      this.course_students = response.data
    },
    getCurrentUser() {
      this.current_user = this.$store.state.user.current_user
      this.is_instructor = this.current_user.instructor_courses.includes(this.$route.params.id)
      this.is_ta = this.current_user.ta_sections.includes(this.$route.params.id)
      this.is_student = this.current_user.student_sections.includes(this.$route.params.id)
    },
    parseActivePlaybackLectures(all_lectures) {
      this.playback_lectures = getActivePlaybackLectures(all_lectures)
    },
    parsePastLectures(all_lectures) {
      this.past_lectures = getPastLectures(all_lectures)
    },
    parseLiveLectures(all_lectures) {
      this.live_lectures = getLiveLectures(all_lectures)
    },
    parseUpcomingLectures(all_lectures) {
      this.upcoming_lectures = getUpcomingLectures(all_lectures)
    },
    async getAllLecturesForCourse() {
      LectureAPI.getLecturesForCourse(this.course_id)
      .then(response => {
        this.all_lectures = response.data
        this.all_lectures.sort((a, b) => 
          (a.start_time > b.start_time || a.playback_submission_start_time > b.playback_submission_start_time ||
          a.start_time > b.playback_submission_start_time || a.playback_submission_start_time > b.start_time) ? 1 : -1
        )
        this.parseUpcomingLectures(this.all_lectures)
        this.parseLiveLectures(this.all_lectures)
        this.parsePastLectures(this.all_lectures)
        this.parseActivePlaybackLectures(this.all_lectures)
        this.sortLecturesBySectionAndBuildTimeLine({instructor: true})
      })
    },
    async getAllLecturesForSection() {
      LectureAPI.getLecturesForSection(this.section_id)
      .then(response => {
        this.all_lectures = response.data
        this.all_lectures.sort((a, b) =>
          (a.start_time > b.start_time || a.playback_submission_start_time > b.playback_submission_start_time ||
          a.start_time > b.playback_submission_start_time || a.playback_submission_start_time > b.start_time) ? 1 : -1
        )
        this.parseUpcomingLectures(this.all_lectures)
        this.parseLiveLectures(this.all_lectures)
        this.parsePastLectures(this.all_lectures)
        this.parseActivePlaybackLectures(this.all_lectures)
        this.sortLecturesBySectionAndBuildTimeLine({instructor: false})
      })
    },
    getCourse () {
      CourseAPI.getCourse(this.course_id)
      .then(response => {
        this.course = response.data
      })
      .catch(err => {
        console.log(`Error getting course from course_id`)
      })
    },
    sortLecturesBySectionAndBuildTimeLine(options) {
      let sorted = {}
      sorted["all"] = {}
      sorted["all"].lectures = []
      this.all_lectures.forEach(lect => {
        sorted["all"].lectures.push(lect)
        lect.sections.forEach(sectID => {
          if(undefined != this.sections[sectID]) {
            if(undefined == lect.students) {
              lect.students = [...this.sections[sectID].students]
            } else {
              for(let i=0;i<this.sections[sectID].students.length;i++) {
                if(!lect.students.includes(this.sections[sectID].students[i])) {
                  lect.students.push(this.sections[sectID].students[i])
                }
              }
            }
          }
          if(undefined == sorted[sectID]) {
            sorted[sectID] = {}
            sorted[sectID].lectures = []
          }
          sorted[sectID].lectures.push(lect)
        })
      })
      Object.keys(sorted).forEach(sectID => {
        sorted[sectID].timeline = {}
        sorted[sectID].lectures.sort((a, b) => (a.start_time > b.start_time) ? 1 : -1)
        for(let i=0;i<sorted[sectID].lectures.length;i++) {
          let lect = sorted[sectID].lectures[i]
          if(undefined == lect.start_time || "Invalid Date" == lect.start_time || null == lect.start_time) {
            lect.start_time = new Date(lect.playback_submission_start_time)
          } else {
            lect.start_time = new Date(lect.start_time)
          }
          let year = lect.start_time.getFullYear()
          let month = lect.start_time.getMonth()
          if(!sorted[sectID].timeline[year]) {
            sorted[sectID].timeline[year] = {}
          }
          if(!sorted[sectID].timeline[year][month]) {
            sorted[sectID].timeline[year][month] = []
          }
          sorted[sectID].timeline[year][month].push(i)
        }
      })
      this.sorted_lectures = sorted
      this.lectures_loaded = true
      if(this.is_instructor || this.is_ta) {
        this.calculateInstructorAttendances()
      } else {
        this.calculateStudentAttendances()
      }
    },
    perc2color(pct) {
      var percentColors = [
        { pct: 0.0, color: { r: 0xd1, g: 0x3e, b: 0x34 } },
        { pct: 0.6, color: { r: 0xd1, g: 0x3e, b: 0x34 } },
        { pct: 0.8, color: { r: 0xb9, g: 0x57, b: 0x26 } },
        // { pct: 0.85, color: { r: 0x82, g: 0x90, b: 0x25 } },
        { pct: 1.0, color: { r: 0x04, g: 0x85, b: 0x2f } }
      ];
      for (var i = 1; i < percentColors.length - 1; i++) {
          if (pct < percentColors[i].pct) {
              break;
          }
      }
      var lower = percentColors[i - 1];
      var upper = percentColors[i];
      var range = upper.pct - lower.pct;
      var rangePct = (pct - lower.pct) / range;
      var pctLower = 1 - rangePct;
      var pctUpper = rangePct;
      var color = {
          r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
          g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
          b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
      };
      if(pct == 1.0) {
        return 'linear-gradient(90deg, rgba(62,73,202,1) 0%, rgba(143,62,202,1) 20%, rgba(209,62,52,1) 40%, rgba(176,95,22,1) 70%, rgba(4,133,47,1) 100%)'
      }
      return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    },
    calculateInstructorAttendances() {
      let promise_tracker = []
      this.all_lectures.forEach(lecture_ => {
        promise_tracker.push(
          LectureSubmissionAPI.getLectureSubmissionsForLecture(lecture_._id)
          .catch(err => { console.log('error retrieving lecture submissions for lecture ' + lecture_._id); console.log(err); })
          .then(response => {
            let submissions = response.data == undefined ? [] : response.data
            let students = lecture_.students
            let running_total = 0
            students.forEach(stud => {
              submissions.forEach(submission => {
                if(submission.submitter._id == stud) {
                  if(submission.live_percent) {
                    if(submission.video_percent) {
                      running_total += Math.max(
                        submission.live_percent * 100,
                        submission.video_percent * 100
                      )
                    } else {
                      running_total += submission.live_percent * 100
                    }
                  } else if(submission.video_percent) {
                    running_total += submission.video_percent * 100
                  }
                }
              })
            })
            lecture_.percentage = running_total / students.length
            // lecture_.color = this.getHTMLClassByAttendance(lecture_.percentage)
            lecture_.color = this.perc2color(lecture_.percentage / 100)
          })
        )
      })
      Promise.all(promise_tracker)
      .then(res => {
        this.scores_loaded = true
      })
    },
    calculateStudentAttendances() {
      if(this.sorted_lectures[this.section_id]) {
        let promise_tracker = []
        this.sorted_lectures[this.section_id].lectures.forEach(lecture_data => {
          if(this.is_student) {

            promise_tracker.push(
              LectureSubmissionAPI.getOrMake(lecture_data._id, this.current_user._id)
              .catch(err => { console.log(`error retrieving lecture submission for student ${this.current_user._id}`); console.log(err); })
              .then(response => {
                if (response.data == null || response.data == []) {
                  lecture_data.percentage = 0
                } else {
                  let submission = response.data
                  if(submission.live_percent) {
                    if(submission.video_percent) {
                      lecture_data.percentage = Math.max(
                        submission.live_percent * 100,
                        submission.video_percent * 100
                      )
                    } else {
                      lecture_data.percentage = submission.live_percent * 100
                    }
                  } else if(submission.video_percent) {
                    lecture_data.percentage = submission.video_percent * 100
                  } else {
                    lecture_data.percentage = 0
                  }
                  lecture_data.color = this.perc2color(lecture_data.percentage / 100)
                }
              })
            )

          }
        })
        Promise.all(promise_tracker)
        .then(res => {
          this.scores_loaded = true
        })
      }
    },
    onSectionChange() {
      this.$forceUpdate()
    },
    getHTMLClassByAttendance (percent) {
      if (undefined == percent || percent <= 60) return 'bad'
      else if (percent <= 75) return 'medium'
      return 'good'
    }
  }
}
</script>

<style scoped>
  .course-info-container {
    /*border: blue solid;*/
  }

  .course-event-container {
    /*border: green solid;*/
    overflow: hidden;
    padding-left: 6rem;
  }

  .info-section {
    display: inline-block;
    margin-top: 2rem;
    float: left;
  }

  #course-info {
    /*border: black solid;*/
  }

  .course-title {
    border: black solid;
    display: inline-block;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    margin-top: 0.5rem;
  }

  #event-info {
    width: 62%;
  }

  .new-event-btn {
    background-color: white;
    border: #007bff solid;
    color: black;
    border-radius: 5px;
  }

  .active-events-container {
    margin-top: 3rem;
    overflow: hidden;
  }

  .active-event-pill {
    display: inline-block;
    border: green solid;
    width: 18rem;
    border-radius: 3px;
    padding-left: 1rem;
    padding-right: 1rem;
    margin-left: 2rem;
    cursor: pointer;
  }

  .active-event-card-section {
    display: inline-block;
    color: black;
  }

  #active-event-name {
    float: left;
  }

  #active-event-time-remaining {
    float: right;
  }

  .attendance-history-container {
    /*border: blue solid;*/
    /*padding-left: 6rem;*/
    overflow: hidden;
    margin: auto;
    margin-top: 3rem;
    width: 86%;
  }

  .attendance-history-header {
    /*border: red solid;*/
    text-align: left;
  }

  .attendance-history-header-text {
    display: inline-block;
    /*border: purple solid;*/
  }

  .section-selector {
    /*border: orange solid;*/
    display: inline-block;
    margin-left: 1rem;
    text-decoration: underline;
    cursor: pointer;
  }

  .lecture-container {
    border: blue solid;
    width: 10rem;
    height: 3rem;
    border-radius: 5px;
    margin-left: 3rem;
    margin-top: 2rem;
    display: inline-block;
    float: left;
    cursor: pointer;
  }

  .panel {
    height: 100%;
  }

  .section-select-container {
    display: inline-block;
  }

  .section-select-container.mobile {
    margin-top: 1rem;
  }

  .big-button {
    margin: 1rem 2rem;
    margin-right: 0rem;
    margin-bottom: 0rem;
  }

  .big-button.mobile {
    margin: 1rem 2rem;
    margin-bottom: 0rem;
  }
</style>
