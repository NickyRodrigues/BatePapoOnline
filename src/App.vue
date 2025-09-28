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
import palavrasProibidasPorIdioma from './palavras-proibidas.js'

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

    // Função de filtro APRIMORADA e MULTILÍNGUE
    function contemPalavraProibida(texto) {
      const textoNormalizado = texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/4|@/g, 'a')
        .replace(/3/g, 'e')
        .replace(/1|!/g, 'i')
        .replace(/0/g, 'o')
        .replace(/\s+/g, '')
        .replace(/(.)\1+/g, '$1');

      // Itera sobre cada idioma no nosso objeto de palavras
      for (const lang in palavrasProibidasPorIdioma) {
        const listaDePalavras = palavrasProibidasPorIdioma[lang];
        
        // Se encontrar uma palavra proibida em qualquer um dos idiomas, retorna true
        if (listaDePalavras.some(palavra => textoNormalizado.includes(palavra))) {
          return true;
        }
      }
      
      // Se não encontrou em nenhum idioma, retorna false
      return false;
    }

    function send() {
      if (message.body.trim() === "") return;

      if (contemPalavraProibida(message.body)) {
        alert("Sua mensagem contém palavras impróprias e não pode ser enviada.");
        return;
      }

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
