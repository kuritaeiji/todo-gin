<template>
  <v-container>
    <v-row justify="center" class="pt-100">
      <v-card flat width="80%" max-width="400" class="pa-5">
        <v-card-title class="justify-center font-weight-bold mb-3">
          {{ title }}
        </v-card-title>

        <validation />
        <slot />
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>
