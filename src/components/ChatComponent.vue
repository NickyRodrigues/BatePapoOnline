<template>
    <div class="q-pa-md row justify-center"> 
        <div style="width: 100%; max-width: 400px"> 
        <div style="width: 100%;" v-for="(message, index) in messages" :key="index">
            <q-chat-message
            :text="[message.body]"
            sent
            :name="message.name"
            :stamp="message.date"
            v-if="message.name == userActual"
            />
            <q-chat-message v-else
            :text="[message.body]"
            :name="message.name"
            :stamp="message.date"
            />
            </div>
        </div>
    </div>
  </template>
  <style>
  </style>
  <script>
  export default {
    name: 'ChatComponent',
    props: {
      userActual: String,
      messages: Array,
    }
  }
  </script>
  