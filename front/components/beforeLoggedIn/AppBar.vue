<template>
  <app-bar>
    <template #btns>
      <ui-app-bar-btn
        v-for="btn in btns"
        :key="`${btn.name}-btn`"
        :to="btn.to"
      >
        {{ $t(`page.${btn.name}`) }}
      </ui-app-bar-btn>
    </template>
  </app-bar>
</template>

<script>
export default {
  data () {
    return {
      btns: [
        { name: 'login', to: '/login' },
        { name: 'signup', to: '/signup' }
      ]
    }
  }
}
</script>
