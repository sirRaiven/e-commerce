<template>
  <v-app>
    <!-- Navigation Bar -->
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title class="font-weight-bold">
        Simple E-Commerce
      </v-app-bar-title>

      <v-spacer />

      <v-btn to="/" variant="text"> Products </v-btn>

      <v-btn to="/pos" variant="text"> POS </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <v-container class="py-5">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup></script>

<style></style>
