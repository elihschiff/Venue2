<template>

  <div :class="'lecture-pill-min ' + color">
    <div class="left">{{ name }}</div>
    <div class="middle">{{ middle }}</div>
    <div class="right">{{ color == 'grey' ? 'ended' : right }}</div>
  </div>

</template>
<script>

export default {
  name: 'LecturePill',
  props: {
    name: String,
    middle: String,
    right: String,
    color: String
  }
}

</script>
