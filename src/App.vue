<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-input
        outlined
        placeholder="Informe seu nome"
        v-model="message.name"
        class="q-mt-sm q-pa-sm"
        dense
        >
      </q-input>

      <ChatComponent :messages="messages" :userActual="message.name" />

      <q-input
        outlined
        @keyup.enter="send"
        placeholder="Digite uma mensagem"
        v-model="message.body"
        class="q-mt-xl q-pa-sm"
        dense
      >

          <template v-slot:append>
            <q-icon size="sm" name="search"/>
          </template>
      </q-input>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import ChatComponent from './components/ChatComponent.vue'
import Hub from './Hub'

export default {
  name: 'LayoutDefault',

  components: {
    ChatComponent
  },

  setup () {
    let messages = ref([]);
    let message = reactive({
      name: '',
      body: ''
    });
    let hub = new Hub();

    function send() {
      if (message.body == "") return;
      hub.connection.invoke("SendMessage", message);
      message.body = "";
    }

    onMounted(() => {
      hub.connection.start()
      .then(() => {
        console.log("Connected");
        hub.connection.on("ReceivedMessage", (msg) => {
          console.log(msg);
          messages.value.push(msg);
        });
      })
      .catch((e) => console.log("Connection failed", e));
    });
    
    return {
      send,
      messages,
      message
    }
  }
}
</script>
