<template>
  <div id="edit-section">
    <h2>Edit Section</h2>
    <form @submit.prevent="updateSection">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>course:</label>
            <input type="text" class="form-control" v-model="course.name" readonly>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>instructors:</label>
            <input v-for="(instructor,i) in instructors" :key="i" class="form-control" :value="instructor.first_name + ' ' + instructor.last_name"/>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>section's name:</label>
            <input type="text" class="form-control" v-model="section.name">
          </div>
        </div>
      </div>
    </form>

    <h4>Section Students</h4>
    <table class="table table-hover">
        <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>User ID</th>
        </tr>
        </thead>
        <tbody>
            <tr v-for="student in students" :key="student._id">
              <td>{{ student.first_name }}</td>
              <td>{{ student.last_name }}</td>
              <td>{{ student.user_id }}</td>
              <!-- <td><button class="btn btn-danger" @click.prevent="removeStudent(student)">Remove</button></td> -->
              <!-- <td v-if="is_section_view"><button class="btn btn-secondary" @click.prevent="$emit('select-student', student)">Select</button></td> -->
            </tr>
        </tbody>
    </table>

    <h4>Section TAs</h4>
    <table class="table table-hover">
        <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>User ID</th>
        </tr>
        </thead>
        <tbody>
            <tr v-for="ta in tas" :key="ta._id">
              <td>{{ ta.first_name }}</td>
              <td>{{ ta.last_name }}</td>
              <td>{{ ta.user_id }}</td>
              <!-- <td><button class="btn btn-danger" @click.prevent="removeTA(ta)">Remove</button></td> -->
              <!-- <td v-if="is_section_view"><button class="btn btn-secondary" @click.prevent="$emit('select-student', student)">Select</button></td> -->
            </tr>
        </tbody>
    </table>

    <label>Add students by email</label>
    <input type="text" v-model="students_to_add"/>
    <button @click="addStudentsToSection()">Update</button>
    <br/>
    <label>Add ta's by email</label>
    <input type="text" v-model="tas_to_add"/>
    <button @click="addTasToSection()">Update</button>

    <div class="form-group">
      <button class="btn btn-primary">Update</button>
    </div>

  </div>
</template>

<script>
  import SectionAPI from '@/services/SectionAPI.js';
  import Courses from '@/components/admin/Course/Courses';
  import Instructors from '@/components/admin/User/Instructors';
  import Students from '@/components/admin/User/Students';

  export default {
    name: 'AdminEditSection',
    components: {
      Courses,
      Instructors,
      Students
    },
    data(){
      return {
        section: {},
        course: {},
        instructors: [],
        students: [],
        tas: [],
        students_to_add: [],
        tas_to_add: []
      }
    },
    created() {
      this.getCurrentSection()
    },
    methods: {
      //TODO: Change to getSection
      async getCurrentSection(){
        let section_id = this.$route.params.id
        const response = await SectionAPI.getSection(section_id)
        this.section = response.data
        this.getCurrentSectionInstructor()
        this.getCurrentSectionCourse()
        this.getCurrentSectionStudents()
        this.getCurrentSectionTAs()
      },
      async getCurrentSectionInstructor(){
        const response = await SectionAPI.getInstructors(this.section._id)
        this.instructors = response.data
      },
      async getCurrentSectionCourse(){
        const response = await SectionAPI.getCourse(this.section._id)
        this.course = response.data
      },
      async getCurrentSectionStudents(){
        const response = await SectionAPI.getStudents(this.section._id)
        this.students = response.data
      },
      async getCurrentSectionTAs(){
        const response = await SectionAPI.getTeachingAssistants(this.section._id)
        this.tas = response.data
      },
      addStudent(student){
        if(!this.students.includes(student))
          this.students.push(student)
      },
      removeStudent(student){
        this.students.splice(this.students.indexOf(student),1)
        this.section.students = this.students
        SectionAPI.updateSection(this.$route.params.id, this.section)
      },
      removeTA(ta){
        this.tas.splice(this.tas.indexOf(ta),1)
        this.section.teaching_assistants = this.tas
        SectionAPI.updateSection(this.$route.params.id, this.section)
      },
      async updateSection() {
        let section_id = this.$route.params.id
        this.section.course = this.course
        this.section.students = this.students
        const response = await SectionAPI.updateSection(section_id, this.section)
        this.$router.push({name: 'admin_sections'})
      },
      addStudentsToSection() {
        let studs = this.students_to_add.split(',')
        SectionAPI.addStudents(this.section._id,studs).then(res => {
          location.reload()
        })
      },
      addTasToSection() {
        let tas = this.tas_to_add.split(',')
        SectionAPI.addTAs(this.section._id,tas).then(res => {
          location.reload()
        })
      }
    }
  }
</script>

<style scoped>
#edit-section {
  padding: 2rem;
}
</style>