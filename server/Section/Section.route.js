const express = require('express');
const sectionRoutes = express.Router();
const jwt = require('jsonwebtoken')

let Section = require('./Section.model');
let User = require('../User/User.model');
let Course = require('../Course/Course.model');

function verifyToken (req, res, next) {
  const bearerHeader = req.headers['authorization']

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]
    req.token = bearerToken
    next()
  } else {
    res.sendStatus(401)
  }
}

sectionRoutes.route('/add').post(function (req, res) {
  let section = new Section(req.body.section);
  section.save()
    .then(() => {
      res.status(200).json(section);
    })
    .catch(() => {
      res.status(400).send("unable to save section to database");
  });
});

sectionRoutes.route('/').get(function (req, res) {
    Section.find(function(err, sections){
    if(err){
      res.json(err);
    }
    else {
      res.json(sections);
    }
  });
});

sectionRoutes.route('/edit/:id').get(function (req, res) {
  let id = req.params.id;
  Section.findById(id, function (err, section){
      if(err) {
        console.log(err);
        res.json(err);
      }else{
        res.json(section);
      }
  });
});

sectionRoutes.route('/update/:id').post(function (req, res) {
  let id = req.params.id;
  let updated_section = req.body.updated_section;
  Section.findByIdAndUpdate(id, 
    {
      course: updated_section.course,
      number: updated_section.number,
      students: updated_section.students,
      teaching_assistants: updated_section.teaching_assistants,
      events: updated_section.events
    },
    function(err, section) {
      if (!section)
        res.status(404).send("section not found");
      res.json(section);    
    }
  );
});

sectionRoutes.route('/delete/:id').delete(function (req, res) {
    Section.findByIdAndRemove({_id: req.params.id}, function(err){
        if(err) res.json(err);
        else res.json('Successfully removed');
    });
});

sectionRoutes.route('/getInstructor/:id').get(function (req, res) {
  let id = req.params.id;
  Section.findById(id, function (err, section){
      if(err) {
        res.json(err);
      }
      let course_id = section.course;
      Course.findById(course_id, function(error, course){
        if(error)
          res.json(error);
        let instructor_id = course.instructor;
        User.findById(instructor_id, function(error, instructor){
          if(error)
            res.json(error);
          res.json(instructor);
        });
      });
  });
});

sectionRoutes.route('/getCourse/:id').get(function (req, res) {
  let id = req.params.id;
  Section.findById(id, function (err, section){
    if(err) {
      res.json(err);
    }
    let course_id = section.course;
    Course.findById(course_id, function(error, course){
      if(error)
        res.json(error);
      res.json(course);
    });
  });
});

sectionRoutes.route('/getStudents/:id').get(function (req, res) {
  let id = req.params.id;
  Section.findById(id, function (err, section){
    if(err) {
      res.json(err);
    }
    let student_ids = section.students;
    let students = [];
    let num_iterations = 0;
    console.log("student_ids: " + student_ids);
    student_ids.forEach(student_id => {
      User.findById(student_id, function(err, student) {
        if(err)
          res.json(err);
        students.push(student);
        num_iterations++;
        if(num_iterations === student_ids.length)
          res.json(students);
      });
    });
  });
});

sectionRoutes.get('/get_with_courses_for_student/:user_id', verifyToken, (req, res) => {
  let user_id = req.params.user_id
  jwt.verify(req.token, 'the_secret_key', err => {
    if(err) {
      res.sendStatus(401).send("Unauthorized access")
    } else {

      /*
      user_sections = []
      Section.find((error, sections) => {
        sections.forEach((section) => {
          section.students.forEach((student) => {
            if(student._id == user_id)
              user_sections.push(section)
          })
        })
        let counter = 0
        user_sections.forEach((user_section) => {
          Course.findById(user_section.course, function (course_error, course){
            if(course_error) 
              res.json(course_error);
            else 
              user_section.course = course
            counter++
            if(counter === user_sections.length)
              res.json(user_sections)
          })
        })
      })
      */

      // Find all sections such that the student is in the array, students, in the section.
      // Then, find the courses that correspond to those sections
      Section.find(
        
        // (1) Find the sections such that the student array of the section contains
        //  the user id.
        {students: { '$eq': user_id } }, (err, sections) => {

        // Return error if mongo throws an error
        if (err || sections == null) {
          res.json({
            success: false,
            error: "Problem finding sections"
          })
        }

        // Find the courses that associate with the sections
        else {

          let course_promises = []
          let user_sections = []
          sections.forEach(_section_ => {

            // (2) For each section, query to find the course that is associated with
            // the section
            user_sections.push(_section_)
            course_promises.push(new Promise((resolve, reject) => {

              Course.findById(_section_.course, (course_error, section_course) => {
                if (course_error || section_course == null) {
                  resolve(null)
                }
                else {
                  resolve(section_course)
                }
              })

            }) )

          })

          // course_promises contains all the async course queries that we need to return.
          // Wait for the async processes to complete then return
          Promise.all(course_promises).then(_courses_ => {

            // attach the course to the section data
            _courses_.forEach((course_, i) => {

              user_sections[i].course = course_
            })

            // filter out the null results (sections with courses that resolved null)
            let final_sections = user_sections.filter(section_ => section_.course != null)

            res.json(final_sections)

          })

        }

      })

    }
  })
})

sectionRoutes.get('/get_with_course/:section_id', verifyToken, (req, res) => {
  let section_id = req.params.section_id
  jwt.verify(req.token, 'the_secret_key', err => {
    if(err) {
      res.sendStatus(401).send("Unauthorized access")
    } else {

      Section.findById(section_id, function (err, section){
        if(err) {
          res.json(err);
        }else {
          Course.findById(section.course, function(error, course) {
            if(error) {
              res.json(error)
            } else {
              section.course = course
              res.json(section)
            }
          })
        }
      });
    }
  })
})

sectionRoutes.get('/get_for_course/:course_id', verifyToken, (req, res) => {
  let course_id = req.params.course_id
  jwt.verify(req.token, 'the_secret_key', err => {
    if(err) {
      res.sendStatus(401).send("Unauthorized access")
    } else {
      Section.find((error, sections) => {
        if(error) {
          res.json(error)
        } else {
          let course_sections = []
          sections.forEach(section => {
            if(section.course == course_id)
              course_sections.push(section)
          })
          res.json(course_sections)
        }
      })
    }
  })
})

module.exports = sectionRoutes;