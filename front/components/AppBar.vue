<template>
  <v-app-bar app absolute flat color="white">
    <v-toolbar-title class="font-weight-bold">
      <nuxt-link to="/" class="text-decoration-none black--text">
        {{ $t('appTitle') }}
      </nuxt-link>
    </v-toolbar-title>

    <v-spacer />

    <slot name="btns" />
  </v-app-bar>
</template>
