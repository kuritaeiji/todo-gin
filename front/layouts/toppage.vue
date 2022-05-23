<template>
  <v-app :style="{ backgroundColor: '#F5F5F5' }">
    <before-logged-in-app-bar />
    <v-main>
      <flash />
      <v-container>
        <v-row justify="center" class="pt-100">
          <v-card-title class="text-h2 font-weight-bold mb-5">
            {{ $t('appTitle') }}
          </v-card-title>

          <v-card-text class="text-center text-h6">
            {{ $t('appTitle') }}は、Todoリストを作成できるwebアプリです。
          </v-card-text>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
