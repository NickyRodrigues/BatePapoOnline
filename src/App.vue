<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-input
        outlined
        placeholder="Informe o seu nome para começar"
        v-model="message.name"
        class="q-mt-sm q-pa-sm"
        dense
      />

      <ChatComponent :messages="messages" :userActual="message.name" />

      <q-input
        outlined
        @keyup.enter="send"
        :placeholder="inputPlaceholder"
        v-model="message.body"
        class="q-mt-xl q-pa-sm"
        dense
        :disable="isSendDisabled"
        :loading="isModelLoading || isSending"
      >
        <template v-slot:append>
          <q-icon
            name="send"
            @click="send"
            :class="{ 'cursor-pointer': !isSendDisabled, 'cursor-not-allowed text-grey': isSendDisabled }"
          />
        </template>
      </q-input>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import ChatComponent from './components/ChatComponent.vue';
import Hub from './Hub';
import palavrasProibidas from './palavras-proibidas.js';
import { translateToEnglish } from './translator.js';
import { loadModel, isToxic } from './toxicity-filter.js';

export default {
  name: 'LayoutDefault',

  components: {
    ChatComponent
  },

  setup () {
    const messages = ref([]);
    const message = reactive({ name: '', body: '' });
    const hub = new Hub();
    const isModelLoading = ref(true);
    const isSending = ref(false);
    const isHubConnected = ref(false);

    const isSendDisabled = computed(() => {
      return isModelLoading.value || isSending.value || !message.name.trim() || !isHubConnected.value;
    });

    const inputPlaceholder = computed(() => {
      if (!message.name.trim()) return 'Primeiro, informe o seu nome acima';
      if (isModelLoading.value) return 'Aguarde, a IA está a carregar...';
      if (isSending.value) return 'A analisar a mensagem...';
      if (!isHubConnected.value) return 'A ligar ao servidor...';
      return 'Digite uma mensagem';
    });
    
    // Função de normalização para apanhar variações (c4r@lh0, etc.)
    function normalizarTexto(texto) {
      return texto
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/4|@/g, 'a').replace(/3/g, 'e').replace(/1|!|i/g, 'i')
        .replace(/0|o/g, 'o').replace(/5|\$/g, 's').replace(/7/g, 't')
        .replace(/[^a-z]/g, '');
    }

    function contemPalavraProibida(texto) {
      const textoNormalizado = normalizarTexto(texto);
      if (palavrasProibidas.pt_direto && palavrasProibidas.pt_direto.some(palavra => textoNormalizado.includes(palavra))) {
        return true;
      }
      return false;
    }

    async function send() {
      if (message.body.trim() === "" || isSendDisabled.value) return;

      isSending.value = true;

      if (contemPalavraProibida(message.body)) {
        alert("A sua mensagem contém palavras impróprias e não pode ser enviada.");
        isSending.value = false;
        return;
      }

      const translatedMessage = await translateToEnglish(message.body);

      if (await isToxic(translatedMessage)) {
        alert("A sua mensagem foi considerada ofensiva pela moderação e não pode ser enviada.");
        isSending.value = false;
        return;
      }

      hub.connection.invoke("SendMessage", message);
      message.body = "";
      isSending.value = false;
    }

    onMounted(() => {
      loadModel().then(() => { isModelLoading.value = false; });
      hub.connection.start()
      .then(() => {
        isHubConnected.value = true;
        console.log("Ligado ao Hub");
        hub.connection.on("ReceivedMessage", (msg) => { messages.value.push(msg); });
      })
      .catch((e) => console.error("Falha na ligação com o Hub", e));
    });
    
    return { send, messages, message, isModelLoading, isSending, isSendDisabled, inputPlaceholder }
  }
}
</script>