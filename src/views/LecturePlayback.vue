<template>
  <div id="lecture_playback">
    <video id="video_player" class="video-js vjs-big-play-centered" controls></video>
		<div id="polls" class="hide">
			<!--Poll Modals Start-->
			<div v-for="(poll,i) in polls" :key="i" class="poll hide" :id="'poll'+(i+1)">
				<div class="row question">
					Question {{(i+1)}}: {{poll.question}}
				</div>
				<div v-for="(possible_answer,j) in poll.possible_answers" :key="j" class="row question">
					{{(j+1)}}: {{possible_answer}} <input type="checkbox" :id="'student_answer_'+(i+1)+'_'+(j+1)"/>
				</div>
				<button :id="'answer_btn_'+(i+1)" @click="answerPoll(i)">Submit</button>
			</div>
			<!--Poll Modals End-->
		</div>
  </div>
</template>

<script>
import videojs from 'video.js';
import axios from 'axios';
import fs from 'fs';
import LectureAPI from "../services/LectureAPI";
import LecturePollAPI from '../services/LecturePollAPI';
import LectureSubmissionAPI from '../services/LectureSubmissionAPI';

export default {
	name: 'LecturePlayback',
	props: {
	},
	computed: {
	},
	components: {
	},
	data(){
		return {
			lecture: {},
			vjs: null,
			prevTime: 0,
			currentUser: null,
			lectureSubmission: null,
			polls: []
		}
	},
	created() {
	},
	mounted() {
		LectureAPI.getLecture(this.$route.params.id)
			.then(res => {
				this.lecture = res.data;
				let self = this
				videojs("video_player", {}, function() {
					self.vjs = this
					this.src('http://localhost:9000/videos/sample/sample.mp4')
					this.load()

					let vid = this;

					self.currentUser = self.$store.state.user.current_user

					LectureSubmissionAPI.getOrMake(self.lecture._id,self.currentUser._id)
						.then(res => {
							self.lectureSubmission = res.data
							LecturePollAPI.getByLecture(self.lecture._id)
								.then(resp => {
									self.polls = resp.data
									console.log(self.polls)
									vid.on('timeupdate', function () {
										let currTime = vid.currentTime()
										for (let i = 0; i < self.polls.length; i++) {
											if (currTime > self.polls[i].timestamp) {
												if(undefined == self.lectureSubmission.student_poll_answers[i] || self.lectureSubmission.student_poll_answers[i].length == 0) {
													//THERE IS NO ANSWER FROM THE STUDENT YET
													vid.currentTime(self.polls[i].timestamp)
													vid.pause()
													self.startPoll(i)
												} else {

												}
											}
										}
										console.log(currTime)
										if(currTime - self.prevTime < 0.5) {
											//Considered NOT a jump, video is playing normally
											if(self.lectureSubmission.video_progress < currTime) {
												self.lectureSubmission.video_progress = currTime
											}
										} else {
											//Considered a jump forward
											if(currTime > self.lectureSubmission.video_progress) {
												vid.currentTime(self.prevTime)
											}
										}
										self.prevTime = vid.currentTime()
									})
									vid.on('ended', function() {
										LectureSubmissionAPI.update(self.lectureSubmission)
									});
								})
						})
					
					//TODO handle updating the submission where needed
				})
			})
	},
	beforeDestroy() {
	},
	methods: {
		startPoll(i) {
			let modal = document.getElementById("polls")
			modal.classList.remove("hide")
			let poll = document.getElementById("poll"+(i+1))
			poll.classList.remove("hide")
		},
		answerPoll(i) {
			let student_answers = []
			for(let j=0;j<this.polls[i].possible_answers.length;j++) {
				student_answers.push(document.getElementById('student_answer_'+(i+1)+'_'+(j+1)).checked)
			}
			if(undefined == this.lectureSubmission.student_poll_answers[i]) {
				this.lectureSubmission.student_poll_answers.push(student_answers)
			} else {
				this.lectureSubmission.student_poll_answers[i] = student_answers
			}

			LectureSubmissionAPI.update(this.lectureSubmission)

			let modal = document.getElementById("polls")
			modal.classList.add("hide")
			let poll = document.getElementById("poll"+(i+1))
			poll.classList.add("hide")
		}
	}
}
</script>

<style scoped>
#video_player {
	width: 100%;
	height: 100%;
}
.vjs-tech {
	position:unset;
}
.hide {
	display: none;
}
#polls {
	position: absolute;
	top: 25%;
	bottom: 25%;
	left: 25%;
	right: 25%;
	background: white;
	z-index: 999;
	padding: 20px;
}
</style>